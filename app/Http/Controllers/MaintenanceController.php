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
                ->with('error', 'Error al cargar el formulario de creación.');
        }
    }

    public function store(StoreMaintenanceRequest $request)
    {
        try {
            DB::beginTransaction();

            $maintenance = Maintenance::create($request->validated());

            DB::commit();

            return redirect()->route('maintenances.edit', $maintenance)
                ->with('success', 'Mantenimiento creado exitosamente. Ahora puedes agregar repuestos, cuadrilla y archivos.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Error al crear el mantenimiento: ' . $e->getMessage());
        }
    }

    public function show(Maintenance $maintenance)
    {
        try {
            // Cargar todas las relaciones necesarias
            $maintenance->load([
                'client:id,name,email,phone',
                'equipment:id,description,asset_tag,brand,model,serial_number,category,location',
                'equipment.client:id,name',
                'spareParts' => function ($query) {
                    $query->select('spare_parts.id', 'name', 'sku', 'sale_price', 'unit_measure');
                },
                'images',
                'documents',
                'crew' => function ($query) {
                    $query->select('users.id', 'name', 'email', 'employee_id', 'career');
                }
            ]);

            // Formatear la cuadrilla con información del pivote
            $formattedCrew = $maintenance->crew->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'employee_id' => $user->employee_id,
                    'career' => $user->career,
                    'is_leader' => (bool) $user->pivot->is_leader
                ];
            });

            return Inertia::render('Maintenances/Show', [
                'maintenance' => array_merge($maintenance->toArray(), [
                    'crew' => $formattedCrew
                ])
            ]);
        } catch (\Exception $e) {
            return redirect()->route('maintenances.index')
                ->with('error', 'Error al cargar los detalles del mantenimiento.');
        }
    }

    public function edit(Maintenance $maintenance)
    {
        try {
            $maintenance->load(['spareParts', 'images', 'documents', 'crew']);

            $clients = User::whereHas('roles', function($q) {
                $q->where('name', 'Client');
            })->get(['id', 'name']);

            $equipment = Equipment::with('client:id,name')->get(['id', 'description', 'asset_tag', 'client_id']);
            $spareParts = SparePart::all(['id', 'name', 'sku', 'sale_price', 'stock']);

            // Obtener todos los técnicos disponibles
            $technicians = User::whereHas('roles', function($q) {
                $q->where('name', 'Employee');
            })->get(['id', 'name', 'email', 'employee_id']);

            // Formatear la cuadrilla asignada con el pivote
            $assignedCrew = $maintenance->crew->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'employee_id' => $user->employee_id,
                    'is_leader' => (bool) $user->pivot->is_leader
                ];
            });

            return Inertia::render('Maintenances/Edit', [
                'maintenance' => $maintenance,
                'clients' => $clients,
                'equipment' => $equipment,
                'spareParts' => $spareParts,
                'technicians' => $technicians,
                'assignedCrew' => $assignedCrew
            ]);
        } catch (\Exception $e) {
            return redirect()->route('maintenances.index')
                ->with('error', 'Error al cargar el formulario de edición.');
        }
    }

    public function update(UpdateMaintenanceRequest $request, Maintenance $maintenance)
    {
        try {
            DB::beginTransaction();

            $maintenance->update($request->validated());

            DB::commit();
            
            return redirect()->route('maintenances.index')
                ->with('success', 'Mantenimiento actualizado exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Error al actualizar el mantenimiento: ' . $e->getMessage());
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
                ->with('success', 'Mantenimiento eliminado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('maintenances.index')
                ->with('error', 'Error al eliminar el mantenimiento.');
        }
    }

    /**
     * Agregar un repuesto al mantenimiento
     * Solo disponible en modo edición
     */
    public function attachSparePart(Request $request, Maintenance $maintenance)
    {
        try {
            $validated = $request->validate([
                'spare_part_id' => 'required|exists:spare_parts,id',
                'quantity' => 'required|integer|min:1',
                'observations' => 'nullable|string|max:500'
            ]);

            // Verificar si el repuesto ya está asociado
            if ($maintenance->spareParts()->where('spare_part_id', $validated['spare_part_id'])->exists()) {
                return response()->json([
                    'message' => 'Este repuesto ya está asociado al mantenimiento.'
                ], 422);
            }

            // Attach del repuesto con datos pivot
            $maintenance->spareParts()->attach($validated['spare_part_id'], [
                'quantity' => $validated['quantity'],
                'observations' => $validated['observations'] ?? null
            ]);

            // Recargar la relación con los datos pivot
            $maintenance->load('spareParts');

            // Obtener el repuesto recién agregado con su información pivot
            $addedSparePart = $maintenance->spareParts()
                ->where('spare_part_id', $validated['spare_part_id'])
                ->first();

            return response()->json([
                'message' => 'Repuesto agregado exitosamente.',
                'spare_part' => $addedSparePart
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al agregar el repuesto: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un repuesto del mantenimiento
     * Solo elimina la relación, no el repuesto ni el mantenimiento
     */
    public function detachSparePart(Maintenance $maintenance, SparePart $sparePart)
    {
        try {
            // Verificar si el repuesto está asociado
            if (!$maintenance->spareParts()->where('spare_part_id', $sparePart->id)->exists()) {
                return response()->json([
                    'message' => 'El repuesto no está asociado a este mantenimiento.'
                ], 404);
            }

            // Detach del repuesto (solo elimina la relación pivot)
            $maintenance->spareParts()->detach($sparePart->id);

            return response()->json([
                'message' => 'Repuesto eliminado del mantenimiento exitosamente.'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al eliminar el repuesto: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar la cantidad/observaciones de un repuesto asociado
     */
    public function updateSparePart(Request $request, Maintenance $maintenance, SparePart $sparePart)
    {
        try {
            $validated = $request->validate([
                'quantity' => 'required|integer|min:1',
                'observations' => 'nullable|string|max:500'
            ]);

            // Verificar si el repuesto está asociado
            if (!$maintenance->spareParts()->where('spare_part_id', $sparePart->id)->exists()) {
                return response()->json([
                    'message' => 'El repuesto no está asociado a este mantenimiento.'
                ], 404);
            }

            // Actualizar los datos pivot
            $maintenance->spareParts()->updateExistingPivot($sparePart->id, [
                'quantity' => $validated['quantity'],
                'observations' => $validated['observations'] ?? null
            ]);

            return response()->json([
                'message' => 'Repuesto actualizado exitosamente.'
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar el repuesto: ' . $e->getMessage()
            ], 500);
        }
    }
}