<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Laravel\Sanctum\HasApiTokens;

/**
 * Modelo de Usuario
 * 
 * Maneja la información de usuarios del sistema incluyendo:
 * - Datos personales (nombre, email, teléfono)
 * - Tipo de usuario (particular, corporativo, extranjero)
 * - Documento de identidad (DNI, RTN, Pasaporte)
 * - Dirección
 * - Roles y permisos mediante Spatie
 */
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles, HasApiTokens;

    /**
     * Atributos que se pueden asignar masivamente
     * 
     * @var list<string>
     */
    protected $fillable = [
        'name',                 // Nombre completo del usuario
        'email',               // Correo electrónico (opcional)
        'phone',               // Número de teléfono
        'tipo',                // Tipo: particular, corporativo, extranjero
        'rtn_dni_passport',    // Documento: DNI (13), RTN (14), Pasaporte (6-12)
        'address',             // Dirección completa
        'career',              // Carrera del técnico (nullable)
        'employee_id',         // ID de empleado del técnico (nullable, unique)
        'password',            // Contraseña encriptada
    ];

    /**
     * Atributos que deben ocultarse en la serialización
     * 
     * @var list<string>
     */
    protected $hidden = [
        'password',        // Contraseña nunca debe ser visible
        'remember_token',  // Token de "recordarme" nunca debe ser visible
    ];

    /**
     * Configuración de casting de atributos
     * 
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',  // Fecha de verificación de email
            'password' => 'hashed',             // Contraseña siempre encriptada
            'tipo' => 'string',                 // Tipo de usuario como string
        ];
    }
}
