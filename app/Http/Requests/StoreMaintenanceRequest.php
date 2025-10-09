<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMaintenanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'description' => 'required|string|max:65535',
            'client_id' => 'required|exists:users,id',
            'equipment_id' => 'required|exists:equipment,id',
            'priority' => 'required|in:red,orange,yellow,green',
            'type' => 'required|in:preventive,corrective',
            'status' => 'required|in:pending,in_progress,completed,rescheduled,cancelled',
            'cost' => 'nullable|numeric|min:0',
            
            'spare_parts' => 'nullable|array',
            'spare_parts.*.id' => 'required|exists:spare_parts,id',
            'spare_parts.*.quantity' => 'required|integer|min:1',
            'spare_parts.*.observations' => 'nullable|string|max:255',
            
            'images' => 'nullable|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            
            'documents' => 'nullable|array|max:10',
            'documents.*' => 'file|mimes:pdf,doc,docx,txt|max:5120'
        ];
    }
}