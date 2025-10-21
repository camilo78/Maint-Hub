<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Factura extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'cai_autorizacion_id',
        'numero_factura',
        'numero_correlativo',
        'cai',
        'cliente_id',
        'cliente_rtn',
        'cliente_nombre',
        'cliente_direccion',
        'cliente_telefono',
        'cliente_email',
        'mantenimiento_id',
        'orden_trabajo_id',
        'fecha_emision',
        'fecha_limite_emision',
        'tipo_pago',
        'dias_credito',
        'subtotal_gravado_15',
        'subtotal_gravado_18',
        'subtotal_exento',
        'subtotal',
        'isv_15',
        'isv_18',
        'isv_total',
        'total_a_pagar',
        'exenta',
        'orden_compra_exenta',
        'constancia_exoneracion',
        'estado',
        'motivo_anulacion',
        'anulada_por',
        'anulada_at',
        'emitida_por',
        'impresa',
        'impresa_at',
    ];

    protected $casts = [
        'fecha_emision' => 'datetime',
        'fecha_limite_emision' => 'date',
        'subtotal_gravado_15' => 'decimal:2',
        'subtotal_gravado_18' => 'decimal:2',
        'subtotal_exento' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'isv_15' => 'decimal:2',
        'isv_18' => 'decimal:2',
        'isv_total' => 'decimal:2',
        'total_a_pagar' => 'decimal:2',
        'exenta' => 'boolean',
        'impresa' => 'boolean',
        'impresa_at' => 'datetime',
        'anulada_at' => 'datetime',
    ];

    // Relaciones
    public function caiAutorizacion()
    {
        return $this->belongsTo(CaiAutorizacion::class);
    }

    public function detalles()
    {
        return $this->hasMany(DetalleFactura::class)->orderBy('numero_linea');
    }

    public function cliente()
    {
        return $this->belongsTo(User::class, 'cliente_id');
    }

    public function mantenimiento()
    {
        return $this->belongsTo(Maintenance::class, 'mantenimiento_id');
    }

    public function emisor()
    {
        return $this->belongsTo(User::class, 'emitida_por');
    }

    public function anulador()
    {
        return $this->belongsTo(User::class, 'anulada_por');
    }

    public function logs()
    {
        return $this->hasMany(LogFacturacion::class);
    }

    // Scopes
    public function scopeVigentes($query)
    {
        return $query->where('estado', 'VIGENTE');
    }

    public function scopeAnuladas($query)
    {
        return $query->where('estado', 'ANULADA');
    }

    public function scopePorFecha($query, $desde, $hasta)
    {
        return $query->whereBetween('fecha_emision', [$desde, $hasta]);
    }

    public function scopeFiltros($query, $filtros)
    {
        return $query
            ->when($filtros['numero_factura'] ?? null, function ($query, $numero) {
                $query->where('numero_factura', 'like', "%{$numero}%");
            })
            ->when($filtros['cliente_rtn'] ?? null, function ($query, $rtn) {
                $query->where('cliente_rtn', 'like', "%{$rtn}%");
            })
            ->when($filtros['fecha_desde'] ?? null, function ($query, $fecha) {
                $query->whereDate('fecha_emision', '>=', $fecha);
            })
            ->when($filtros['fecha_hasta'] ?? null, function ($query, $fecha) {
                $query->whereDate('fecha_emision', '<=', $fecha);
            })
            ->when($filtros['estado'] ?? null, function ($query, $estado) {
                $query->where('estado', $estado);
            });
    }

    // Métodos de negocio
    public function anular($motivo, $usuarioId)
    {
        if ($this->estado !== 'VIGENTE') {
            throw new \Exception('Solo se pueden anular facturas vigentes');
        }

        $this->update([
            'estado' => 'ANULADA',
            'motivo_anulacion' => $motivo,
            'anulada_por' => $usuarioId,
            'anulada_at' => now(),
        ]);

        return $this;
    }

    public function marcarImpresa()
    {
        if (!$this->impresa) {
            $this->update([
                'impresa' => true,
                'impresa_at' => now(),
            ]);
        }

        return $this;
    }

    // Accessors
    public function getEsAnulableAttribute()
    {
        return $this->estado === 'VIGENTE';
    }

    public function getTotalEnLetrasAttribute()
    {
        return $this->numeroALetras($this->total_a_pagar);
    }

    // Convertir número a letras (español)
    private function numeroALetras($numero)
    {
        $formatter = new \NumberFormatter('es', \NumberFormatter::SPELLOUT);
        $entero = floor($numero);
        $decimal = round(($numero - $entero) * 100);

        return strtoupper($formatter->format($entero)) . ' LEMPIRAS CON ' . $decimal . '/100';
    }
}
