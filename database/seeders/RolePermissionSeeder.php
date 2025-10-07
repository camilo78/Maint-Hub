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
        $user = User::where('name', 'Super Admin')->first();
        if ($user) {
            $this->command->info('Asignando rol Superadmin al usuario Super Admin...');
            $user->assignRole($roles['superadmin']);
        }

        // Asignar roles aleatorios a otros usuarios existentes
        $this->command->info('Asignando roles aleatorios a otros usuarios...');
        $availableRoles = ['Admin', 'Client']; // Excluir Superadmin de asignación aleatoria
        $users = User::all();
        
        foreach ($users as $user) {
            if (!$user->hasRole('Superadmin')) {
                // Obtener un rol aleatorio de los roles disponibles
                $randomRole = $availableRoles[array_rand($availableRoles)];
                $user->assignRole($randomRole);
            }
        }

        $this->command->info('¡Roles y Permisos creados exitosamente!');
    }
}
