<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Equipment extends Model
{
    use HasFactory;

    protected $table = 'equipment';

    protected $fillable = [
        'client_id',
        'asset_tag',
        'category',
        'description',
        'brand',
        'model',
        'serial_number',
        'location',
        'status',
        'installation_date',
        'warranty_expires_on',
        'notes',
        'specifications',
    ];

    protected $casts = [
        'installation_date' => 'date',
        'warranty_expires_on' => 'date',
        'specifications' => 'array',
    ];

    // --- RELACIONES ---
    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    // --- ACCESSORS ---
    public function isUnderWarranty()
    {
        return $this->warranty_expires_on && $this->warranty_expires_on->isFuture();
    }

    // --- MÉTODOS ESTÁTICOS ---
    public static function generateAssetTag($clientId)
    {
        $client = User::find($clientId);
        if (!$client) return null;
        
        // Obtener iniciales del nombre completo
        $nameParts = explode(' ', trim($client->name));
        $initials = '';
        foreach ($nameParts as $part) {
            if (!empty($part)) {
                $initials .= strtoupper(substr($part, 0, 1));
            }
        }
        
        // Obtener el siguiente correlativo para este cliente
        $lastEquipment = self::where('client_id', $clientId)
            ->where('asset_tag', 'like', $initials . '%')
            ->orderBy('asset_tag', 'desc')
            ->first();
        
        $nextNumber = 1;
        if ($lastEquipment && $lastEquipment->asset_tag) {
            // Extraer el número del último asset_tag
            $lastNumber = (int) substr($lastEquipment->asset_tag, strlen($initials));
            $nextNumber = $lastNumber + 1;
        }
        
        return $initials . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }

    public function getStatusBadgeAttribute()
    {
        return match($this->status) {
            'buen_estado' => 'success',
            'mal_estado' => 'destructive',
            'mantenimiento' => 'warning',
            default => 'secondary'
        };
    }
}