<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;

/**
 * Seeder de Usuarios
 * 
 * Crea usuarios iniciales del sistema:
 * - 1 Superadmin (acceso total)
 * - 1 Admin (acceso administrativo)
 * - 1 Usuario regular (acceso básico)
 * - 50 usuarios adicionales con roles aleatorios
 */
class UsersSeeder extends Seeder
{
    /**
     * Ejecutar el seeding de usuarios
     *
     * @return void
     */
    public function run()
    {
        // Crear usuario Superadmin (acceso total al sistema)
        $superAdmin = User::factory()->create([
            'name' => 'Camilo Alvarado',                    // Nombre del superadmin
            'email' => 'camilo.alvarado0501@gmail.com',      // Email para login
            'phone' => '+504 9999-9999',                     // Teléfono de contacto
            'tipo' => 'particular',                          // Tipo de usuario
            'rtn_dni_passport' => '0501199912345',           // DNI (13 dígitos)
            'address' => 'Tegucigalpa, Honduras',            // Dirección
            'password' => bcrypt('milogaqw12'),              // Contraseña encriptada
        ]);

        // Crear usuario Admin (acceso administrativo limitado)
        $admin = User::factory()->create([
            'name' => 'Carlos Fonseca',                      // Nombre del admin
            'email' => 'admin@example.com',                  // Email para login
            'phone' => '+504 8888-8888',                     // Teléfono de contacto
            'tipo' => 'corporativo',                         // Tipo corporativo
            'rtn_dni_passport' => '08011999123456',          // RTN (14 dígitos)
            'address' => 'San Pedro Sula, Honduras',         // Dirección
            'password' => bcrypt('admin'),                   // Contraseña encriptada
        ]);

        // Crear usuario regular (acceso básico)
        $user = User::factory()->create([
            'name' => 'Luis Elvir Godoy',                    // Nombre del usuario
            'email' => 'user@example.com',                   // Email para login
            'phone' => '+504 7777-7777',                     // Teléfono de contacto
            'tipo' => 'particular',                          // Tipo particular
            'rtn_dni_passport' => '0801199987654',           // DNI (13 dígitos)
            'address' => 'La Ceiba, Honduras',               // Dirección
            'password' => bcrypt('user'),                    // Contraseña encriptada
        ]);
        
        // Asignar roles a los usuarios principales
        $superAdmin->assignRole('Superadmin');  // Rol con todos los permisos
        $admin->assignRole('Admin');            // Rol administrativo
        $user->assignRole('Client');            // Rol de cliente básico
        
        // Crear 50 usuarios adicionales con datos aleatorios y roles automáticos
        User::factory()->count(50)->create();
        
        // Mostrar mensajes de confirmación en consola
        $this->command->info('Users table seeded with 52 users!');
        $this->command->info('Roles assigned to default users!');
    }
}