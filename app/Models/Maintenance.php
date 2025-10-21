<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

/**
 * Modelo Maintenance
 *
 * Gestiona los mantenimientos realizados a los equipos de los clientes.
 * Incluye información sobre prioridad, tipo, estado, costos y relaciones
 * con repuestos, imágenes y documentos.
 */
class Maintenance extends Model
{
    use HasFactory;

    // Constantes para prioridades
    public const PRIORITY_RED = 'red';
    public const PRIORITY_ORANGE = 'orange';
    public const PRIORITY_YELLOW = 'yellow';
    public const PRIORITY_GREEN = 'green';

    // Constantes para tipos
    public const TYPE_PREVENTIVE = 'preventive';
    public const TYPE_CORRECTIVE = 'corrective';

    // Constantes para estados
    public const STATUS_PENDING = 'pending';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_RESCHEDULED = 'rescheduled';
    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'description',
        'client_id',
        'equipment_id',
        'priority',
        'type',
        'status',
        'cost'
    ];

    protected $casts = [
        'priority' => 'string',
        'type' => 'string',
        'status' => 'string',
        'cost' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $with = ['client', 'equipment'];

    // ========== RELACIONES ==========

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    public function spareParts(): BelongsToMany
    {
        return $this->belongsToMany(SparePart::class)
            ->withPivot('quantity', 'observations')
            ->withTimestamps();
    }

    public function images(): HasMany
    {
        return $this->hasMany(MaintenanceImage::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(MaintenanceDocument::class);
    }

    public function crew(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'maintenance_user')
            ->withPivot('is_leader')
            ->withTimestamps();
    }

    public function factura(): HasMany
    {
        return $this->hasMany(Factura::class, 'mantenimiento_id');
    }

    // ========== ACCESSORS ==========

    /**
     * Obtener el color de fondo de la prioridad
     */
    public function getPriorityColorAttribute(): string
    {
        return match($this->priority) {
            self::PRIORITY_RED => 'bg-red-500',
            self::PRIORITY_ORANGE => 'bg-orange-500',
            self::PRIORITY_YELLOW => 'bg-yellow-500',
            self::PRIORITY_GREEN => 'bg-green-500',
            default => 'bg-gray-500'
        };
    }

    /**
     * Obtener el color del texto de la prioridad
     */
    public function getPriorityTextColorAttribute(): string
    {
        return match($this->priority) {
            self::PRIORITY_RED => 'text-red-700',
            self::PRIORITY_ORANGE => 'text-orange-700',
            self::PRIORITY_YELLOW => 'text-yellow-700',
            self::PRIORITY_GREEN => 'text-green-700',
            default => 'text-gray-700'
        };
    }

    /**
     * Obtener el color del badge del estado
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            self::STATUS_PENDING => 'bg-yellow-100 text-yellow-800',
            self::STATUS_IN_PROGRESS => 'bg-blue-100 text-blue-800',
            self::STATUS_COMPLETED => 'bg-green-100 text-green-800',
            self::STATUS_RESCHEDULED => 'bg-purple-100 text-purple-800',
            self::STATUS_CANCELLED => 'bg-red-100 text-red-800',
            default => 'bg-gray-100 text-gray-800'
        };
    }

    /**
     * Calcular el costo total incluyendo repuestos
     */
    public function getTotalCostAttribute(): float
    {
        $sparePartsCost = $this->spareParts->sum(function ($sparePart) {
            return ($sparePart->sale_price ?? 0) * ($sparePart->pivot->quantity ?? 0);
        });

        return (float)$this->cost + $sparePartsCost;
    }

    /**
     * Obtener el costo total de repuestos
     */
    public function getSparePartsCostAttribute(): float
    {
        return $this->spareParts->sum(function ($sparePart) {
            return ($sparePart->sale_price ?? 0) * ($sparePart->pivot->quantity ?? 0);
        });
    }

    /**
     * Verificar si tiene imágenes
     */
    public function getHasImagesAttribute(): bool
    {
        return $this->images()->exists();
    }

    /**
     * Verificar si tiene documentos
     */
    public function getHasDocumentsAttribute(): bool
    {
        return $this->documents()->exists();
    }

    /**
     * Obtener el conteo de imágenes
     */
    public function getImagesCountAttribute(): int
    {
        return $this->images()->count();
    }

    /**
     * Obtener el conteo de documentos
     */
    public function getDocumentsCountAttribute(): int
    {
        return $this->documents()->count();
    }

    /**
     * Obtener el líder de la cuadrilla
     */
    public function getLeaderAttribute(): ?User
    {
        return $this->crew()->wherePivot('is_leader', true)->first();
    }

    /**
     * Verificar si tiene un líder asignado
     */
    public function getHasLeaderAttribute(): bool
    {
        return $this->crew()->wherePivot('is_leader', true)->exists();
    }

    /**
     * Obtener el conteo de miembros de la cuadrilla
     */
    public function getCrewCountAttribute(): int
    {
        return $this->crew()->count();
    }

    /**
     * Verificar si el mantenimiento está completo
     */
    public function getIsCompletedAttribute(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Verificar si el mantenimiento está en progreso
     */
    public function getIsInProgressAttribute(): bool
    {
        return $this->status === self::STATUS_IN_PROGRESS;
    }

    /**
     * Verificar si el mantenimiento está pendiente
     */
    public function getIsPendingAttribute(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Verificar si el mantenimiento es facturable
     */
    public function getIsFacturableAttribute(): bool
    {
        return $this->status === self::STATUS_COMPLETED && !$this->factura()->exists();
    }

    /**
     * Verificar si el mantenimiento ya fue facturado
     */
    public function getIsFacturadoAttribute(): bool
    {
        return $this->factura()->exists();
    }

    // ========== SCOPES ==========

    /**
     * Filtrar por prioridad
     */
    public function scopeByPriority(Builder $query, string $priority): Builder
    {
        return $query->where('priority', $priority);
    }

    /**
     * Filtrar por tipo
     */
    public function scopeByType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }

    /**
     * Filtrar por estado
     */
    public function scopeByStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    /**
     * Filtrar por cliente
     */
    public function scopeByClient(Builder $query, int $clientId): Builder
    {
        return $query->where('client_id', $clientId);
    }

    /**
     * Filtrar por equipo
     */
    public function scopeByEquipment(Builder $query, int $equipmentId): Builder
    {
        return $query->where('equipment_id', $equipmentId);
    }

    /**
     * Filtrar mantenimientos pendientes
     */
    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Filtrar mantenimientos en progreso
     */
    public function scopeInProgress(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_IN_PROGRESS);
    }

    /**
     * Filtrar mantenimientos completados
     */
    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    /**
     * Filtrar mantenimientos activos (pendientes o en progreso)
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->whereIn('status', [self::STATUS_PENDING, self::STATUS_IN_PROGRESS]);
    }

    /**
     * Filtrar por prioridad alta (rojo y naranja)
     */
    public function scopeHighPriority(Builder $query): Builder
    {
        return $query->whereIn('priority', [self::PRIORITY_RED, self::PRIORITY_ORANGE]);
    }

    /**
     * Ordenar por prioridad (rojo > naranja > amarillo > verde)
     */
    public function scopeOrderByPriority(Builder $query): Builder
    {
        return $query->orderByRaw("
            CASE priority
                WHEN 'red' THEN 1
                WHEN 'orange' THEN 2
                WHEN 'yellow' THEN 3
                WHEN 'green' THEN 4
                ELSE 5
            END
        ");
    }

    /**
     * Filtrar mantenimientos facturables (completados sin factura)
     */
    public function scopeFacturables(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_COMPLETED)
            ->whereDoesntHave('factura');
    }

    /**
     * Filtrar mantenimientos ya facturados
     */
    public function scopeFacturados(Builder $query): Builder
    {
        return $query->whereHas('factura');
    }

    // ========== MÉTODOS ÚTILES ==========

    /**
     * Obtener todas las prioridades disponibles
     */
    public static function getPriorities(): array
    {
        return [
            self::PRIORITY_GREEN,
            self::PRIORITY_YELLOW,
            self::PRIORITY_ORANGE,
            self::PRIORITY_RED
        ];
    }

    /**
     * Obtener todos los tipos disponibles
     */
    public static function getTypes(): array
    {
        return [
            self::TYPE_PREVENTIVE,
            self::TYPE_CORRECTIVE
        ];
    }

    /**
     * Obtener todos los estados disponibles
     */
    public static function getStatuses(): array
    {
        return [
            self::STATUS_PENDING,
            self::STATUS_IN_PROGRESS,
            self::STATUS_COMPLETED,
            self::STATUS_RESCHEDULED,
            self::STATUS_CANCELLED
        ];
    }
}