<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LogFacturacion extends Model
{
    const UPDATED_AT = null; // Solo usa created_at

    protected $table = 'logs_facturacion';

    protected $fillable = [
        'factura_id',
        'usuario_id',
        'accion',
        'descripcion',
        'datos_anteriores',
        'datos_nuevos',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'datos_anteriores' => 'array',
        'datos_nuevos' => 'array',
        'created_at' => 'datetime',
    ];

    // Relaciones
    public function factura()
    {
        return $this->belongsTo(Factura::class);
    }

    public function usuario()
    {
        return $this->belongsTo(User::class);
    }

    // Método estático para registrar logs fácilmente
    public static function registrar($facturaId, $usuarioId, $accion, $descripcion, $datosAnteriores = null, $datosNuevos = null)
    {
        return self::create([
            'factura_id' => $facturaId,
            'usuario_id' => $usuarioId,
            'accion' => $accion,
            'descripcion' => $descripcion,
            'datos_anteriores' => $datosAnteriores,
            'datos_nuevos' => $datosNuevos,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
