<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesService
{
    public function __construct(private readonly PermissionService $permissionService)
    {
    }

    public function getAllRoles()
    {
        return Role::all();
    }

    public function getRolesDropdown(): array
    {
        return Role::pluck('name', 'id')->toArray();
    }

    public function getPaginatedRoles(string $search = null, int $perPage = 10): LengthAwarePaginator
    {
        $query = Role::query()->with('permissions');

        if ($search) {
            $query->where('name', 'like', '%' . $search . '%');
        }

        return $query->paginate($perPage);
    }

    
    public function roleHasPermissions(Role $role, $permissions): bool
    {
        foreach ($permissions as $permission) {
            if (!$role->hasPermissionTo($permission->name)) {
                return false;
            }
        }

        return true;
    }

    public function createRole(string $name, array $permissions = []): Role
    {
        $role = Role::create(['name' => $name, 'guard_name' => 'web']);

        // Siempre sincronizar permisos, incluso si el array está vacío
        $role->syncPermissions($permissions);

        return $role;
    }

    public function findRoleById(int $id): ?Role
    {
        return Role::findById($id);
    }

    public function getRolesByIds(array $roleIds, string $guard): Collection
    {
        return Role::whereIn('id', $roleIds)->where('guard_name', $guard)->get();
    }

    public function updateRole(Role $role, string $name, array $permissions = []): Role
    {
        $role->name = $name;
        $role->save();

        // Siempre sincronizar permisos, incluso si el array está vacío
        $role->syncPermissions($permissions);

        return $role;
    }

    public function deleteRole(Role $role): bool
    {
        return $role->delete();
    }

    /**
     * Contar usuarios en un rol específico
     * 
     * @param Role|string $role
     * @return int
     */
    public function countUsersInRole($role): int
    {
        if (is_string($role)) {
            $role = Role::where('name', $role)->first();
            if (!$role) {
                return 0;
            }
        }

        return $role->users->count();
    }

    /**
     * Obtener roles con conteo de usuarios
     * 
     * @param string|null $search
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getPaginatedRolesWithUserCount(string $search = null, int $perPage = 10): LengthAwarePaginator
    {
        $query = Role::query()->with('permissions')->withCount('users');

        if ($search) {
            $query->where('name', 'like', '%' . $search . '%');
        }

        // Excluir Admin y Superadmin a menos que el usuario actual sea Superadmin
        if (!auth()->user()->hasRole('Superadmin')) {
            $query->whereNotIn('name', ['Admin', 'Superadmin']);
        }

        // El conteo de usuarios ya viene en la propiedad 'users_count' gracias a withCount()
        return $query->paginate($perPage);
    }

    /**
     * Crear roles predefinidos con sus permisos
     * 
     * @return array
     */
    public function createPredefinedRoles(): array
    {
        $roles = [];

        // 1. Rol Superadmin - tiene todos los permisos
        $allPermissionNames = $this->permissionService->getAllPermissions();
        $roles['superadmin'] = $this->createRole('Superadmin', $allPermissionNames);

        // 2. Rol Admin - tiene casi todos los permisos excepto algunos críticos
        $adminPermissions = $allPermissionNames;
        $adminExcludedPermissions = [
            'user.delete', // No puede eliminar usuarios
        ];

        $adminPermissions = array_diff($adminPermissions, $adminExcludedPermissions);
        $roles['admin'] = $this->createRole('Admin', $adminPermissions);

        // 3. Rol Client - rol básico de cliente
        $clientPermissions = [
            'dashboard.view',
            'profile.view',
            'profile.edit',
            'profile.update',
        ];

        $roles['client'] = $this->createRole('Client', $clientPermissions);

        // 4. Rol Employee - rol para empleados
        $employeePermissions = [
            'dashboard.view',
            'profile.view',
            'profile.edit',
            'profile.update',
            // Permisos adicionales para empleados se definirán después
        ];

        $roles['employee'] = $this->createRole('Employee', $employeePermissions);

        return $roles;
    }

    /**
     * Obtener permisos de un rol predefinido específico
     * 
     * @param string $roleName
     * @return array
     */
    public function getPredefinedRolePermissions(string $roleName): array
    {
        $roleName = strtolower($roleName);

        switch ($roleName) {
            case 'superadmin':
                // Todos los permisos
                return $this->permissionService->getAllPermissions();

            case 'admin':
                // Todos excepto algunos permisos críticos
                $adminExcludedPermissions = ['user.delete'];
                $allPermissionNames = $this->permissionService->getAllPermissions();
                return array_diff($allPermissionNames, $adminExcludedPermissions);

            case 'client':
                return [
                    'dashboard.view',
                    'profile.view',
                    'profile.edit',
                    'profile.update',
                ];

            case 'employee':
                return [
                    'dashboard.view',
                    'profile.view',
                    'profile.edit',
                    'profile.update',
                    // Permisos adicionales para empleados
                ];

            default:
                return [
                    'dashboard.view',
                    'profile.view',
                    'profile.edit',
                    'profile.update',
                ];
        }
    }
}
