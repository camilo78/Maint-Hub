<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\User;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Rule;

class UpdateEmployeeRequest extends FormRequest
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
            'email' => ['nullable', 'string', 'lowercase', 'email', 'max:255',  Rule::unique(User::class)->ignore(
                $this->route('employee') instanceof User ? $this->route('employee')->id : $this->route('employee')
            ),],
            'phone' => ['required', 'string', 'max:20'],
            'tipo' => ['required', 'in:particular,corporativo,extranjero'],
            'rtn_dni_passport' => [
                'required', 
                'string',
                Rule::unique('users', 'rtn_dni_passport')->ignore(
                    $this->route('employee') instanceof User ? $this->route('employee')->id : $this->route('employee')
                ),
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
            'career' => ['required', 'string', 'max:255'],
            'employee_id' => ['required', 'string', 'max:50', Rule::unique('users', 'employee_id')->ignore(
                $this->route('employee') instanceof User ? $this->route('employee')->id : $this->route('employee')
            )],
            'password' => ['nullable', Password::defaults()],
            'permissionIds' => ['nullable', 'array'],
            'permissionIds.*' => ['integer', 'exists:permissions,id']
        ];
    }
}