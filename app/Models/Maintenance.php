<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Maintenance extends Model
{
    use HasFactory;

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
        'cost' => 'decimal:2'
    ];

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

    public function getPriorityColorAttribute(): string
    {
        return match($this->priority) {
            'red' => 'bg-red-500',
            'orange' => 'bg-orange-500',
            'yellow' => 'bg-yellow-500',
            'green' => 'bg-green-500',
            default => 'bg-gray-500'
        };
    }
}