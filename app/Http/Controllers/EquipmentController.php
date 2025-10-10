<?php

namespace App\Http\Controllers;

use App\Models\Equipment;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EquipmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Equipment::with('client')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('brand', 'like', "%{$search}%")
                      ->orWhere('model', 'like', "%{$search}%")
                      ->orWhere('serial_number', 'like', "%{$search}%")
                      ->orWhere('category', 'like', "%{$search}%")
                      ->orWhereHas('client', function ($clientQuery) use ($search) {
                          $clientQuery->where('name', 'like', "%{$search}%");
                      });
                });
            })
            ->when($request->category, function ($query, $category) {
                $query->where('category', $category);
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $categories = Equipment::distinct()->pluck('category')->filter();
        $clients = User::role('client')->select('id', 'name')->get();

        return Inertia::render('equipment/index', [
            'equipment' => $query,
            'categories' => $categories,
            'clients' => $clients,
            'search' => $request->search,
            'category' => $request->category,
            'status' => $request->status,
        ]);
    }

    public function create()
    {
        $categories = Equipment::distinct()->pluck('category')->filter();
        $descriptions = Equipment::distinct()->pluck('description')->filter();
        $clients = User::role('client')->select('id', 'name')->get();

        return Inertia::render('equipment/create', [
            'categories' => $categories,
            'descriptions' => $descriptions,
            'clients' => $clients,
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'client_id' => 'required|exists:users,id',
                'category' => 'required|string|max:255',
                'description' => 'nullable|string|max:255',
                'brand' => 'nullable|string|max:255',
                'model' => 'nullable|string|max:255',
                'serial_number' => 'nullable|string|max:255',
                'asset_tag' => 'nullable|string|max:255|unique:equipment,asset_tag',
                'location' => 'required|string|max:255',
                'status' => 'required|in:buen_estado,mal_estado,mantenimiento',
                'installation_date' => 'nullable|date',
                'warranty_expires_on' => 'nullable|date',
                'notes' => 'nullable|string',
                'from_client' => 'nullable|string',
                'specifications' => 'nullable|array',
            ]);

            // Generar asset_tag automáticamente
            $validated['asset_tag'] = Equipment::generateAssetTag($validated['client_id']);
            
            Equipment::create($validated);

            return redirect()->route('equipment.index')->with('success', 'Equipo creado exitosamente');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            \Log::error('Error creating equipment: ' . $e->getMessage(), [
                'data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);
            return back()->withErrors(['general' => 'Error al crear el equipo: ' . $e->getMessage()])->withInput();
        }
    }

    public function edit(Equipment $equipment)
    {
        $equipment->load('client');
        $categories = Equipment::distinct()->pluck('category')->filter();
        $descriptions = Equipment::distinct()->pluck('description')->filter();
        $clients = User::role('client')->select('id', 'name')->get();

        return Inertia::render('equipment/edit', [
            'equipment' => $equipment,
            'categories' => $categories,
            'descriptions' => $descriptions,
            'clients' => $clients,
        ]);
    }

    public function update(Request $request, Equipment $equipment)
    {
        try {
            $validated = $request->validate([
                'client_id' => 'required|exists:users,id',
                'category' => 'required|string|max:255',
                'description' => 'nullable|string|max:255',
                'brand' => 'nullable|string|max:255',
                'model' => 'nullable|string|max:255',
                'serial_number' => 'nullable|string|max:255',
                'asset_tag' => 'nullable|string|max:255|unique:equipment,asset_tag,' . $equipment->id,
                'location' => 'required|string|max:255',
                'status' => 'required|in:buen_estado,mal_estado,mantenimiento',
                'installation_date' => 'nullable|date',
                'warranty_expires_on' => 'nullable|date',
                'notes' => 'nullable|string',
                'specifications' => 'nullable|array',
                'from_client' => 'nullable|string',
            ]);

            // No regenerar asset_tag en edición, mantener el existente
            if (empty($validated['asset_tag'])) {
                $validated['asset_tag'] = $equipment->asset_tag;
            }
            
            $equipment->update($validated);

            return redirect()->route('equipment.index')->with('success', 'Equipo actualizado exitosamente');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            \Log::error('Error updating equipment: ' . $e->getMessage());
            return back()->withErrors(['general' => 'Error al actualizar el equipo: ' . $e->getMessage()])->withInput();
        }
    }

    public function show(Equipment $equipment)
    {
        $equipment->load('client');
        
        return Inertia::render('equipment/show', [
            'equipment' => $equipment
        ]);
    }

    public function destroy(Equipment $equipment)
    {
        $equipment->delete();

        return redirect()->back()->with('success', 'Equipo eliminado exitosamente');
    }
}