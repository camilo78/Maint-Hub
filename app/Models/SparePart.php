<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
        'location',
    ];

    protected $casts = [
        'stock' => 'integer',
        'minimum_stock' => 'integer',
        'cost_price' => 'decimal:2',
        'sale_price' => 'decimal:2',
    ];

    public function maintenances()
    {
        return $this->belongsToMany(Maintenance::class, 'maintenance_spare_part')
                    ->withPivot('quantity', 'observations')
                    ->withTimestamps();
    }
}