<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class CaiAutorizacion extends Model
{
    use SoftDeletes;

    protected $table = 'cai_autorizaciones';

    protected $fillable = [
        'rtn_emisor',
        'nombre_comercial',
        'punto_emision',
        'tipo_documento',
        'cai',
        'prefijo',
        'rango_inicial',
        'rango_final',
        'ultimo_correlativo_usado',
        'fecha_limite_emision',
        'estado',
        'constancia_registro',
    ];

    protected $casts = [
        'rango_inicial' => 'integer',
        'rango_final' => 'integer',
        'ultimo_correlativo_usado' => 'integer',
        'fecha_limite_emision' => 'date',
    ];

    protected $appends = [
        'rango_disponible',
        'esta_vencido',
        'esta_agotado',
    ];

    // Relaciones
    public function facturas()
    {
        return $this->hasMany(Factura::class);
    }

    // Accessors
    public function getRangoDisponibleAttribute()
    {
        return $this->rango_final - $this->ultimo_correlativo_usado;
    }

    public function getEstaVencidoAttribute()
    {
        return Carbon::today()->greaterThan($this->fecha_limite_emision);
    }

    public function getEstaAgotadoAttribute()
    {
        return $this->ultimo_correlativo_usado >= $this->rango_final;
    }

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('estado', 'ACTIVO')
                    ->where('fecha_limite_emision', '>=', Carbon::today())
                    ->whereRaw('ultimo_correlativo_usado < rango_final');
    }

    public function scopePorTipoDocumento($query, $tipo)
    {
        return $query->where('tipo_documento', $tipo);
    }

    // Métodos de negocio
    public function obtenerSiguienteCorrelativo()
    {
        $this->increment('ultimo_correlativo_usado');
        $this->refresh();

        // Verificar si se agotó el rango
        if ($this->ultimo_correlativo_usado >= $this->rango_final) {
            $this->update(['estado' => 'AGOTADO']);
        }

        return $this->ultimo_correlativo_usado;
    }

    public function generarNumeroFactura($correlativo)
    {
        return sprintf('%s-%08d', $this->prefijo, $correlativo);
    }

    // Verificar y actualizar estado del CAI
    public function verificarEstado()
    {
        if ($this->esta_vencido && $this->estado !== 'VENCIDO') {
            $this->update(['estado' => 'VENCIDO']);
        }

        if ($this->esta_agotado && $this->estado !== 'AGOTADO') {
            $this->update(['estado' => 'AGOTADO']);
        }

        return $this->estado;
    }
}
