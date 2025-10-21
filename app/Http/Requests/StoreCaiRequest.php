<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCaiRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Se debe validar con policies según el caso
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'rtn_emisor' => [
                'required',
                'string',
                'regex:/^\d{4}-\d{4}-\d{6}$/', // Formato: 0000-0000-000000 (14 dígitos)
            ],
            'nombre_comercial' => 'required|string|max:255',
            'punto_emision' => 'required|string|size:3|regex:/^\d{3}$/', // Formato: 001, 002, etc.
            'tipo_documento' => 'required|in:FACTURA,NOTA_CREDITO,NOTA_DEBITO',
            'cai' => [
                'required',
                'string',
                'min:37',
                'max:50',
                'regex:/^[A-Z0-9]+$/', // Solo alfanuméricos en mayúscula
                Rule::unique('cai_autorizaciones', 'cai')->whereNull('deleted_at'),
            ],
            'prefijo' => 'required|string|max:10', // Ej: FAC-001-001
            'rango_inicial' => 'required|integer|min:1',
            'rango_final' => 'required|integer|min:1|gt:rango_inicial', // Debe ser mayor que rango_inicial
            'fecha_limite_emision' => 'required|date|after:today',
            'constancia_registro' => 'nullable|string|max:50',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'rtn_emisor.required' => 'El RTN del emisor es obligatorio',
            'rtn_emisor.regex' => 'El RTN debe tener el formato: 0000-0000-000000 (14 dígitos)',
            'nombre_comercial.required' => 'El nombre comercial es obligatorio',
            'punto_emision.required' => 'El punto de emisión es obligatorio',
            'punto_emision.size' => 'El punto de emisión debe tener 3 dígitos (Ej: 001)',
            'tipo_documento.required' => 'Debe seleccionar el tipo de documento',
            'cai.required' => 'El número CAI es obligatorio',
            'cai.regex' => 'El CAI solo debe contener letras mayúsculas y números',
            'cai.unique' => 'Este número CAI ya está registrado',
            'prefijo.required' => 'El prefijo es obligatorio',
            'rango_inicial.required' => 'El rango inicial es obligatorio',
            'rango_final.required' => 'El rango final es obligatorio',
            'rango_final.gt' => 'El rango final debe ser mayor que el rango inicial',
            'fecha_limite_emision.required' => 'La fecha límite de emisión es obligatoria',
            'fecha_limite_emision.after' => 'La fecha límite debe ser posterior a hoy',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Limpiar y formatear el RTN (14 dígitos: 0000-0000-000000)
        if ($this->has('rtn_emisor')) {
            $rtn = preg_replace('/[^0-9]/', '', $this->rtn_emisor);
            if (strlen($rtn) === 14) {
                $this->merge([
                    'rtn_emisor' => substr($rtn, 0, 4) . '-' . substr($rtn, 4, 4) . '-' . substr($rtn, 8, 6),
                ]);
            }
        }

        // Limpiar y formatear el CAI (solo mayúsculas y números)
        if ($this->has('cai')) {
            $this->merge([
                'cai' => strtoupper(preg_replace('/[^A-Z0-9]/', '', $this->cai)),
            ]);
        }

        // Formatear punto de emisión con ceros a la izquierda
        if ($this->has('punto_emision')) {
            $this->merge([
                'punto_emision' => str_pad(preg_replace('/[^0-9]/', '', $this->punto_emision), 3, '0', STR_PAD_LEFT),
            ]);
        }
    }
}
