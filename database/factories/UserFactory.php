<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

/**
 * Factory para generar usuarios de prueba
 * 
 * Genera usuarios con datos realistas incluyendo:
 * - Tipos de usuario válidos (particular, corporativo, extranjero)
 * - Documentos con formato correcto según el tipo
 * - Asignación automática de roles
 * 
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * Contraseña por defecto para todos los usuarios generados
     */
    protected static ?string $password;

    /**
     * Definir el estado por defecto del modelo
     * 
     * Genera datos aleatorios pero realistas para cada usuario
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Seleccionar tipo de usuario aleatoriamente
        $tipo = fake()->randomElement(['particular', 'corporativo', 'extranjero']);
        
        // Generar documento según el tipo de usuario
        $documento = match($tipo) {
            'corporativo' => fake()->numerify('##############'), // RTN 14 dígitos
            'particular' => fake()->numerify('#############'),  // DNI 13 dígitos
            'extranjero' => fake()->regexify('[A-Z]{2}[0-9]{7}'), // Pasaporte formato AA1234567
        };
        
        return [
            'name' => fake()->name(),                                    // Nombre completo aleatorio
            'email' => fake()->optional()->safeEmail(),                 // Email opcional
            'phone' => fake()->phoneNumber(),                           // Número de teléfono
            'tipo' => $tipo,                                            // Tipo de usuario
            'rtn_dni_passport' => $documento,                           // Documento generado
            'address' => fake()->address(),                             // Dirección completa
            'career' => null,                                           // Carrera (se asigna después si es técnico)
            'employee_id' => null,                                      // ID empleado (se asigna después si es técnico)
            'email_verified_at' => now(),                               // Email verificado por defecto
            'password' => static::$password ??= Hash::make('password'), // Contraseña encriptada
            'remember_token' => Str::random(10),                        // Token de recordar sesión
        ];
    }

    /**
     * Configurar el factory para asignar roles automáticamente
     * 
     * Después de crear cada usuario, le asigna un rol aleatorio
     * (excluyendo Superadmin y Admin para usuarios de prueba)
     */
    public function configure()
    {
        return $this->afterCreating(function ($user) {
            // Roles disponibles para usuarios generados
            $availableRoles = ['Client', 'Employee'];
            $randomRole = fake()->randomElement($availableRoles);
            
            // Si es empleado, agregar datos adicionales
            if ($randomRole === 'Employee') {
                $user->career = fake()->randomElement([
                    'Ingeniería Mecánica',
                    'Refrigeración y Aire Acondicionado', 
                    'Ingeniería Eléctrica',
                    'Técnico en HVAC',
                    'Ingeniería Industrial'
                ]);
                $user->employee_id = 'EMP' . str_pad(fake()->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT);
                $user->save();
            }
            
            // Asignar rol al usuario
            $user->assignRole($randomRole);
        });
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
