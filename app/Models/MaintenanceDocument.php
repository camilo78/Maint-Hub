<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

/**
 * Modelo MaintenanceDocument
 *
 * Almacena los documentos asociados a un mantenimiento.
 * Al eliminar el registro, automáticamente elimina el archivo físico del storage.
 */
class MaintenanceDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'maintenance_id',
        'path',
        'original_name',
        'size',
        'mime_type'
    ];

    protected $casts = [
        'size' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Boot del modelo para eventos
     */
    protected static function boot()
    {
        parent::boot();

        // Al eliminar el registro, eliminar el archivo físico
        static::deleting(function ($document) {
            if ($document->path && Storage::disk('public')->exists($document->path)) {
                Storage::disk('public')->delete($document->path);
            }
        });
    }

    public function maintenance(): BelongsTo
    {
        return $this->belongsTo(Maintenance::class);
    }

    /**
     * Obtener la URL pública del documento
     */
    public function getUrlAttribute(): ?string
    {
        if (!$this->path) {
            return null;
        }

        return Storage::url($this->path);
    }

    /**
     * Verificar si el archivo existe físicamente
     */
    public function exists(): bool
    {
        return $this->path && Storage::disk('public')->exists($this->path);
    }

    /**
     * Obtener la extensión del archivo
     */
    public function getExtensionAttribute(): ?string
    {
        if (!$this->mime_type) {
            return null;
        }

        $parts = explode('/', $this->mime_type);
        return strtoupper(end($parts));
    }

    /**
     * Verificar si es un PDF
     */
    public function isPdf(): bool
    {
        return $this->mime_type === 'application/pdf';
    }

    /**
     * Verificar si es un documento de Office
     */
    public function isOfficeDocument(): bool
    {
        $officeTypes = [
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        return in_array($this->mime_type, $officeTypes);
    }

    /**
     * Formatear el tamaño del archivo
     */
    public function getFormattedSizeAttribute(): string
    {
        $bytes = $this->size;
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        } elseif ($bytes > 1) {
            return $bytes . ' bytes';
        } elseif ($bytes == 1) {
            return '1 byte';
        } else {
            return '0 bytes';
        }
    }
}