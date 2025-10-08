<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use App\Services\PermissionService;
use App\Services\RolesService;
use Illuminate\Database\Seeder;

/**
 * Clase RolePermissionSeeder.
 * 
 * Seeder para crear roles y permisos predefinidos del sistema.
 * Asigna roles automáticamente a usuarios existentes.
 *
 * @see https://spatie.be/docs/laravel-permission/v5/basic-usage/multiple-guards
 */
class RolePermissionSeeder extends Seeder
{
    public function __construct(
        private readonly PermissionService $permissionService,
        private readonly RolesService $rolesService
    ) {
    }

    /**
     * Ejecutar el seeder de la base de datos.
     * 
     * Crea todos los permisos, roles predefinidos y asigna roles a usuarios.
     *
     * @return void
     */
    public function run()
    {
        // Crear todos los permisos del sistema
        $this->command->info('Creando permisos...');
        $this->permissionService->createPermissions();

        // Crear roles predefinidos con sus permisos correspondientes
        $this->command->info('Creando roles predefinidos...');
        $roles = $this->rolesService->createPredefinedRoles();

        // Asignar rol de superadmin al usuario Super Admin si existe
        // Nota: El UsersSeeder ya asigna el rol al superadmin 'Camilo Alvarado'.
        // Esta lógica podría ser redundante o buscar un usuario que no existe.
        $user = User::where('email', 'camilo.alvarado0501@gmail.com')->first();
        if ($user) {
            $this->command->info('Asignando rol Superadmin al usuario Super Admin...');
            $user->assignRole($roles['superadmin']);
        }

        $this->command->info('¡Roles y Permisos creados exitosamente! Los usuarios de prueba tienen roles asignados por su Factory.');
    }
}
