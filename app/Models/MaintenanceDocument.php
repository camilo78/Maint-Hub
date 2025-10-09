<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'maintenance_id',
        'path',
        'original_name'
    ];

    public function maintenance(): BelongsTo
    {
        return $this->belongsTo(Maintenance::class);
    }
}