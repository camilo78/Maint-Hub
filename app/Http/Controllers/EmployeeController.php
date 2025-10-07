<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $roleFilter = $request->input('role');
        
        $query = User::query()->with(['roles','permissions'])
            ->whereHas('roles', function ($q) {
                $q->where('name', 'Employee');
            });

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                ->orWhere('email', 'like', '%' . $search . '%')
                ->orWhere('phone', 'like', '%' . $search . '%')
                ->orWhere('career', 'like', '%' . $search . '%')
                ->orWhere('employee_id', 'like', '%' . $search . '%');
            });
        }

        if ($roleFilter && $roleFilter !== 'all') {
            $query->whereHas('roles', function ($q) use ($roleFilter) {
                $q->where('id', $roleFilter);
            });
        }

        $employees = $query->paginate(10)->withQueryString();
        $roles = \Spatie\Permission\Models\Role::whereIn('name', ['Superadmin', 'Admin', 'Client'])->get();
        $permissions = \Spatie\Permission\Models\Permission::all();

        return Inertia::render('employees/Index', [
            'employees' => $employees,
            'roles' => $roles,
            'permissions' => $permissions,
            'search' => $search
        ]);
    }

    public function show(User $employee)
    {
        if (!$employee->hasRole('Employee')) {
            abort(404);
        }
        
        $employee->load(['roles', 'permissions']);
        
        return Inertia::render('employees/show', [
            'employee' => $employee
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:users,email',
            'phone' => 'required|string|max:20',
            'tipo' => 'required|in:particular,corporativo,extranjero',
            'rtn_dni_passport' => 'required|string|max:20',
            'address' => 'required|string',
            'career' => 'required|string|max:255',
            'employee_id' => 'required|string|max:50|unique:users,employee_id',
            'password' => 'required|string|min:8',
            'roleIds' => 'array',
            'roleIds.*' => 'exists:roles,id',
            'permissionIds' => 'array',
            'permissionIds.*' => 'exists:permissions,id',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'tipo' => $validated['tipo'],
            'rtn_dni_passport' => $validated['rtn_dni_passport'],
            'address' => $validated['address'],
            'career' => $validated['career'],
            'employee_id' => $validated['employee_id'],
            'password' => bcrypt($validated['password']),
        ]);

        // Asignar rol Employee automáticamente
        $user->assignRole('Employee');
        
        // Asignar roles adicionales seleccionados
        if (!empty($validated['roleIds'])) {
            $additionalRoles = \Spatie\Permission\Models\Role::whereIn('id', $validated['roleIds'])
                ->whereIn('name', ['Superadmin', 'Admin', 'Client'])
                ->get();
            $user->assignRole($additionalRoles);
        }

        if (!empty($validated['permissionIds'])) {
            $permissions = \Spatie\Permission\Models\Permission::whereIn('id', $validated['permissionIds'])->get();
            $user->givePermissionTo($permissions);
        }

        return redirect()->back()->with('success', 'Empleado creado exitosamente');
    }

    public function update(Request $request, User $employee)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:users,email,' . $employee->id,
            'phone' => 'required|string|max:20',
            'tipo' => 'required|in:particular,corporativo,extranjero',
            'rtn_dni_passport' => 'required|string|max:20',
            'address' => 'required|string',
            'career' => 'required|string|max:255',
            'employee_id' => 'required|string|max:50|unique:users,employee_id,' . $employee->id,
            'password' => 'nullable|string|min:8',
            'roleIds' => 'array',
            'roleIds.*' => 'exists:roles,id',
            'permissionIds' => 'array',
            'permissionIds.*' => 'exists:permissions,id',
        ]);

        $employee->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'tipo' => $validated['tipo'],
            'rtn_dni_passport' => $validated['rtn_dni_passport'],
            'address' => $validated['address'],
            'career' => $validated['career'],
            'employee_id' => $validated['employee_id'],
        ]);

        if (!empty($validated['password'])) {
            $employee->update(['password' => bcrypt($validated['password'])]);
        }

        // Mantener rol Employee y sincronizar roles adicionales
        $rolesToSync = ['Employee'];
        if (!empty($validated['roleIds'])) {
            $additionalRoles = \Spatie\Permission\Models\Role::whereIn('id', $validated['roleIds'])
                ->whereIn('name', ['Superadmin', 'Admin', 'Client'])
                ->pluck('name')
                ->toArray();
            $rolesToSync = array_merge($rolesToSync, $additionalRoles);
        }
        $employee->syncRoles($rolesToSync);

        $employee->syncPermissions($validated['permissionIds'] ?? []);

        return redirect()->back()->with('success', 'Empleado actualizado exitosamente');
    }

    public function destroy(User $employee)
    {
        try {
            $employee->delete();
            return redirect()->back()->with('success', 'Empleado eliminado exitosamente');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['delete' => 'No se puede eliminar este empleado']);
        }
    }
}