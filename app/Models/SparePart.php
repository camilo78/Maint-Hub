<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class SparePart extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'sku',
        'description',
        'brand',
        'part_number',
        'stock',
        'minimum_stock',
        'cost_price',
        'sale_price',
        'unit_measure',
        'location'
    ];

    protected $casts = [
        'cost_price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'stock' => 'integer',
        'minimum_stock' => 'integer'
    ];

    public function maintenances(): BelongsToMany
    {
        return $this->belongsToMany(Maintenance::class)
            ->withPivot('quantity', 'observations')
            ->withTimestamps();
    }
}