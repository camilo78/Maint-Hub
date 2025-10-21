<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFacturaRequest extends FormRequest
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
            // Cliente (OBLIGATORIO por ley)
            // Acepta DNI (13 dígitos), RTN (14 dígitos) o Pasaporte (alfanumérico 6-12 caracteres)
            'cliente_rtn' => [
                'required',
                'string',
                'min:6',
                'max:20',
            ],
            'cliente_nombre' => 'required|string|max:255',
            'cliente_direccion' => 'nullable|string|max:500',
            'cliente_telefono' => 'nullable|string|max:20',
            'cliente_email' => 'nullable|email|max:100',
            'cliente_id' => 'nullable|exists:users,id',

            // Referencias
            'mantenimiento_id' => 'nullable|exists:maintenances,id',
            'orden_trabajo_id' => 'nullable|integer',

            // Tipo de pago
            'tipo_pago' => 'required|in:CONTADO,CREDITO,TARJETA,TRANSFERENCIA',
            'dias_credito' => 'nullable|required_if:tipo_pago,CREDITO|integer|min:1|max:365',

            // Factura exenta
            'exenta' => 'nullable|boolean',
            'orden_compra_exenta' => 'nullable|required_if:exenta,true|string|max:50',
            'constancia_exoneracion' => 'nullable|string|max:50',

            // Detalles de la factura (al menos una línea)
            'detalles' => 'required|array|min:1',
            'detalles.*.producto_servicio_id' => 'nullable|integer',
            'detalles.*.codigo_producto' => 'nullable|string|max:50',
            'detalles.*.descripcion' => 'required|string|max:500',
            'detalles.*.cantidad' => 'required|numeric|min:0.01|max:999999.99',
            'detalles.*.unidad_medida' => 'nullable|string|max:20',
            'detalles.*.precio_unitario' => 'required|numeric|min:0|max:999999999.99',
            'detalles.*.tipo_gravamen' => 'required|in:GRAVADO_15,GRAVADO_18,EXENTO',
            'detalles.*.descuento_porcentaje' => 'nullable|numeric|min:0|max:100',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'cliente_rtn.required' => 'El documento del cliente es obligatorio (DNI, RTN o Pasaporte)',
            'cliente_rtn.min' => 'El documento debe tener al menos 6 caracteres',
            'cliente_rtn.max' => 'El documento no puede exceder 20 caracteres',
            'cliente_nombre.required' => 'El nombre del cliente es obligatorio',
            'tipo_pago.required' => 'Debe seleccionar un tipo de pago',
            'dias_credito.required_if' => 'Debe especificar los días de crédito',
            'orden_compra_exenta.required_if' => 'La orden de compra exenta es obligatoria para facturas exentas',
            'detalles.required' => 'Debe agregar al menos una línea de detalle',
            'detalles.*.descripcion.required' => 'La descripción es obligatoria en todas las líneas',
            'detalles.*.cantidad.required' => 'La cantidad es obligatoria',
            'detalles.*.cantidad.min' => 'La cantidad debe ser mayor a 0',
            'detalles.*.precio_unitario.required' => 'El precio unitario es obligatorio',
            'detalles.*.tipo_gravamen.required' => 'Debe seleccionar el tipo de gravamen',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Limpiar y normalizar el documento del cliente (DNI, RTN o Pasaporte)
        if ($this->has('cliente_rtn')) {
            $this->merge([
                'cliente_rtn' => strtoupper(trim($this->cliente_rtn)),
            ]);
        }

        // Asegurar que exenta sea boolean
        if ($this->has('exenta')) {
            $this->merge([
                'exenta' => filter_var($this->exenta, FILTER_VALIDATE_BOOLEAN),
            ]);
        }
    }
}
