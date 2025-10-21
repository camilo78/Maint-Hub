<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleFactura extends Model
{
    protected $fillable = [
        'factura_id',
        'numero_linea',
        'producto_servicio_id',
        'codigo_producto',
        'descripcion',
        'cantidad',
        'unidad_medida',
        'precio_unitario',
        'tipo_gravamen',
        'tasa_isv',
        'descuento_porcentaje',
        'descuento_monto',
        'subtotal_linea',
        'isv_linea',
        'total_linea',
    ];

    protected $casts = [
        'cantidad' => 'decimal:2',
        'precio_unitario' => 'decimal:2',
        'tasa_isv' => 'decimal:2',
        'descuento_porcentaje' => 'decimal:2',
        'descuento_monto' => 'decimal:2',
        'subtotal_linea' => 'decimal:2',
        'isv_linea' => 'decimal:2',
        'total_linea' => 'decimal:2',
    ];

    // Relaciones
    public function factura()
    {
        return $this->belongsTo(Factura::class);
    }

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'producto_servicio_id');
    }

    // Métodos de cálculo
    public static function calcularLinea($cantidad, $precioUnitario, $tipoGravamen, $descuentoPorcentaje = 0)
    {
        $subtotal = $cantidad * $precioUnitario;
        $descuentoMonto = $subtotal * ($descuentoPorcentaje / 100);
        $subtotalLinea = $subtotal - $descuentoMonto;

        $tasaIsv = match ($tipoGravamen) {
            'GRAVADO_15' => 15.00,
            'GRAVADO_18' => 18.00,
            default => 0.00,
        };

        $isvLinea = $subtotalLinea * ($tasaIsv / 100);
        $totalLinea = $subtotalLinea + $isvLinea;

        return [
            'subtotal_linea' => round($subtotalLinea, 2),
            'isv_linea' => round($isvLinea, 2),
            'total_linea' => round($totalLinea, 2),
            'tasa_isv' => $tasaIsv,
            'descuento_monto' => round($descuentoMonto, 2),
        ];
    }
}
