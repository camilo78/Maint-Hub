<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMaintenanceRequest;
use App\Http\Requests\UpdateMaintenanceRequest;
use App\Models\Equipment;
use App\Models\Maintenance;
use App\Models\MaintenanceDocument;
use App\Models\MaintenanceImage;
use App\Models\SparePart;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MaintenanceController extends Controller
{
    public function index(Request $request)
    {
        $query = Maintenance::with(['client:id,name', 'equipment:id,description,asset_tag']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('description', 'like', '%' . $search . '%')
                  ->orWhereHas('client', function($q) use ($search) {
                      $q->where('name', 'like', '%' . $search . '%');
                  })
                  ->orWhereHas('equipment', function($q) use ($search) {
                      $q->where('description', 'like', '%' . $search . '%')
                        ->orWhere('asset_tag', 'like', '%' . $search . '%');
                  });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->input('priority'));
        }

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        $maintenances = $query->orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('Maintenances/Index', [
            'maintenances' => $maintenances,
            'filters' => $request->only(['search', 'status', 'priority', 'type'])
        ]);
    }

    public function create()
    {
        try {
            $clients = User::whereHas('roles', function($q) {
                $q->where('name', 'Client');
            })->get(['id', 'name']);

            $equipment = Equipment::with('client:id,name')->get(['id', 'description', 'asset_tag', 'client_id']);
            $spareParts = SparePart::all(['id', 'name', 'sku', 'sale_price', 'stock']);

            return Inertia::render('Maintenances/Create', [
                'clients' => $clients,
                'equipment' => $equipment,
                'spareParts' => $spareParts
            ]);
        } catch (\Exception $e) {
            return redirect()->route('maintenances.index')
                ->with('error', 'Error loading create form.');
        }
    }

    public function store(StoreMaintenanceRequest $request)
    {
        try {
            DB::beginTransaction();
            
            $maintenance = Maintenance::create($request->validated());

            if ($request->has('spare_parts')) {
                $sparePartsData = [];
                foreach ($request->input('spare_parts', []) as $sparePart) {
                    $sparePartsData[$sparePart['id']] = [
                        'quantity' => $sparePart['quantity'],
                        'observations' => $sparePart['observations'] ?? null
                    ];
                }
                $maintenance->spareParts()->attach($sparePartsData);
            }

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $path = $image->store('maintenances/images', 'public');
                    MaintenanceImage::create([
                        'maintenance_id' => $maintenance->id,
                        'path' => $path,
                        'original_name' => $image->getClientOriginalName()
                    ]);
                }
            }

            if ($request->hasFile('documents')) {
                foreach ($request->file('documents') as $document) {
                    $path = $document->store('maintenances/documents', 'public');
                    MaintenanceDocument::create([
                        'maintenance_id' => $maintenance->id,
                        'path' => $path,
                        'original_name' => $document->getClientOriginalName()
                    ]);
                }
            }

            DB::commit();
            
            return redirect()->route('maintenances.index')
                ->with('success', 'Maintenance created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Error creating maintenance: ' . $e->getMessage());
        }
    }

    public function edit(Maintenance $maintenance)
    {
        try {
            $maintenance->load(['spareParts', 'images', 'documents']);

            $clients = User::whereHas('roles', function($q) {
                $q->where('name', 'Client');
            })->get(['id', 'name']);

            $equipment = Equipment::with('client:id,name')->get(['id', 'description', 'asset_tag', 'client_id']);
            $spareParts = SparePart::all(['id', 'name', 'sku', 'sale_price', 'stock']);

            return Inertia::render('Maintenances/Edit', [
                'maintenance' => $maintenance,
                'clients' => $clients,
                'equipment' => $equipment,
                'spareParts' => $spareParts
            ]);
        } catch (\Exception $e) {
            return redirect()->route('maintenances.index')
                ->with('error', 'Error loading edit form.');
        }
    }

    public function update(UpdateMaintenanceRequest $request, Maintenance $maintenance)
    {
        try {
            DB::beginTransaction();
            
            $maintenance->update($request->validated());

            if ($request->has('spare_parts')) {
                $sparePartsData = [];
                foreach ($request->input('spare_parts', []) as $sparePart) {
                    $sparePartsData[$sparePart['id']] = [
                        'quantity' => $sparePart['quantity'],
                        'observations' => $sparePart['observations'] ?? null
                    ];
                }
                $maintenance->spareParts()->sync($sparePartsData);
            } else {
                $maintenance->spareParts()->detach();
            }

            if ($request->has('delete_images')) {
                $imagesToDelete = MaintenanceImage::whereIn('id', $request->input('delete_images'))->get();
                foreach ($imagesToDelete as $image) {
                    Storage::disk('public')->delete($image->path);
                    $image->delete();
                }
            }

            if ($request->has('delete_documents')) {
                $documentsToDelete = MaintenanceDocument::whereIn('id', $request->input('delete_documents'))->get();
                foreach ($documentsToDelete as $document) {
                    Storage::disk('public')->delete($document->path);
                    $document->delete();
                }
            }

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $path = $image->store('maintenances/images', 'public');
                    MaintenanceImage::create([
                        'maintenance_id' => $maintenance->id,
                        'path' => $path,
                        'original_name' => $image->getClientOriginalName()
                    ]);
                }
            }

            if ($request->hasFile('documents')) {
                foreach ($request->file('documents') as $document) {
                    $path = $document->store('maintenances/documents', 'public');
                    MaintenanceDocument::create([
                        'maintenance_id' => $maintenance->id,
                        'path' => $path,
                        'original_name' => $document->getClientOriginalName()
                    ]);
                }
            }

            DB::commit();
            
            return redirect()->route('maintenances.index')
                ->with('success', 'Maintenance updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Error updating maintenance: ' . $e->getMessage());
        }
    }

    public function destroy(Maintenance $maintenance)
    {
        try {
            foreach ($maintenance->images as $image) {
                Storage::disk('public')->delete($image->path);
            }

            foreach ($maintenance->documents as $document) {
                Storage::disk('public')->delete($document->path);
            }

            $maintenance->delete();

            return redirect()->route('maintenances.index')
                ->with('success', 'Maintenance deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->route('maintenances.index')
                ->with('error', 'Error deleting maintenance.');
        }
    }
}