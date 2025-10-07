<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;
use App\Models\User;

class StoreUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'phone' => ['required', 'string', 'max:20'],
            'tipo' => ['required', 'in:particular,corporativo,extranjero'],
            'rtn_dni_passport' => [
                'required', 
                'string',
                function ($attribute, $value, $fail) {
                    $tipo = request('tipo');
                    if ($tipo === 'particular' && strlen($value) !== 13) {
                        $fail('El DNI debe tener exactamente 13 caracteres.');
                    } elseif ($tipo === 'corporativo' && strlen($value) !== 14) {
                        $fail('El RTN debe tener exactamente 14 caracteres.');
                    } elseif ($tipo === 'extranjero' && (strlen($value) < 6 || strlen($value) > 12)) {
                        $fail('El Pasaporte debe tener entre 6 y 12 caracteres.');
                    }
                }
            ],
            'address' => ['required', 'string'],
            'password' => ['required', Password::defaults()],
            'roleIds' => ['required', 'array'],
            'roleIds.*' => ['integer', 'exists:roles,id'],
            'permissionIds' => ['nullable', 'array'],
            'permissionIds.*' => ['integer', 'exists:permissions,id'],
        ];
    }
}
