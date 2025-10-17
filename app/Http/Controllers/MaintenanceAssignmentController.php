<?php

namespace App\Http\Controllers;

use App\Models\Maintenance;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Controlador para manejar la asignación de cuadrilla en tiempo real
 */
class MaintenanceAssignmentController extends Controller
{
    /**
     * Asignar un técnico a un mantenimiento
     * Si es el primero, automáticamente se convierte en líder
     *
     * POST /maintenances/{maintenance}/crew
     */
    public function assignTechnician(Request $request, Maintenance $maintenance)
    {
        try {
            $validated = $request->validate([
                'user_id' => 'required|exists:users,id',
            ]);

            $userId = $validated['user_id'];

            // Verificar que el usuario es un técnico
            $user = User::findOrFail($userId);
            if (!$user->hasRole('Employee')) {
                return response()->json([
                    'message' => 'El usuario seleccionado no es un técnico.'
                ], 422);
            }

            // Verificar si ya está asignado
            if ($maintenance->crew()->where('user_id', $userId)->exists()) {
                return response()->json([
                    'message' => 'Este técnico ya está asignado a este mantenimiento.'
                ], 422);
            }

            // Verificar si ya hay un líder
            $hasLeader = $maintenance->crew()->wherePivot('is_leader', true)->exists();

            // Asignar el técnico (si no hay líder, este será el líder)
            $maintenance->crew()->attach($userId, [
                'is_leader' => !$hasLeader
            ]);

            // Recargar la cuadrilla con datos completos
            $crew = $maintenance->crew()
                ->select('users.id', 'users.name', 'users.email', 'users.employee_id')
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'employee_id' => $user->employee_id,
                        'is_leader' => (bool) $user->pivot->is_leader
                    ];
                });

            return response()->json([
                'message' => 'Técnico asignado exitosamente.',
                'crew' => $crew
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error al asignar técnico:', [
                'maintenance_id' => $maintenance->id,
                'user_id' => $userId ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error al asignar el técnico: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Desasignar un técnico de un mantenimiento
     * Si era el líder, asigna automáticamente otro líder
     *
     * DELETE /maintenances/{maintenance}/crew/{user}
     */
    public function removeTechnician(Maintenance $maintenance, User $user)
    {
        try {
            // Verificar que el técnico está asignado
            if (!$maintenance->crew()->where('user_id', $user->id)->exists()) {
                return response()->json([
                    'message' => 'Este técnico no está asignado a este mantenimiento.'
                ], 404);
            }

            DB::beginTransaction();

            // Verificar si es el líder
            $wasLeader = $maintenance->crew()
                ->where('user_id', $user->id)
                ->wherePivot('is_leader', true)
                ->exists();

            // Desasignar el técnico
            $maintenance->crew()->detach($user->id);

            // Si era el líder, asignar nuevo líder si hay más técnicos
            if ($wasLeader) {
                $remainingCrew = $maintenance->crew()->get();

                if ($remainingCrew->isNotEmpty()) {
                    // Asignar el liderazgo al primer técnico disponible
                    $newLeaderId = $remainingCrew->first()->id;
                    $maintenance->crew()->updateExistingPivot($newLeaderId, [
                        'is_leader' => true
                    ]);
                }
            }

            DB::commit();

            // Recargar la cuadrilla actualizada
            $crew = $maintenance->crew()
                ->select('users.id', 'users.name', 'users.email', 'users.employee_id')
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'employee_id' => $user->employee_id,
                        'is_leader' => (bool) $user->pivot->is_leader
                    ];
                });

            return response()->json([
                'message' => 'Técnico eliminado de la cuadrilla exitosamente.',
                'crew' => $crew
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error al eliminar técnico:', [
                'maintenance_id' => $maintenance->id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error al eliminar el técnico: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cambiar el líder de la cuadrilla
     *
     * POST /maintenances/{maintenance}/crew/leader
     */
    public function changeLeader(Request $request, Maintenance $maintenance)
    {
        try {
            $validated = $request->validate([
                'user_id' => 'required|exists:users,id',
            ]);

            $userId = $validated['user_id'];

            // Verificar que el técnico está asignado
            if (!$maintenance->crew()->where('user_id', $userId)->exists()) {
                return response()->json([
                    'message' => 'Este técnico no está asignado a este mantenimiento.'
                ], 422);
            }

            DB::beginTransaction();

            // Remover el liderazgo de todos
            DB::table('maintenance_user')
                ->where('maintenance_id', $maintenance->id)
                ->update(['is_leader' => false]);

            // Asignar el nuevo líder
            $maintenance->crew()->updateExistingPivot($userId, [
                'is_leader' => true
            ]);

            DB::commit();

            // Recargar la cuadrilla actualizada
            $crew = $maintenance->crew()
                ->select('users.id', 'users.name', 'users.email', 'users.employee_id')
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'employee_id' => $user->employee_id,
                        'is_leader' => (bool) $user->pivot->is_leader
                    ];
                });

            return response()->json([
                'message' => 'Líder de cuadrilla actualizado exitosamente.',
                'crew' => $crew
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Error de validación.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error al cambiar líder:', [
                'maintenance_id' => $maintenance->id,
                'user_id' => $userId ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error al cambiar el líder: ' . $e->getMessage()
            ], 500);
        }
    }
}
