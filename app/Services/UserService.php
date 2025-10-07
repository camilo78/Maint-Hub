<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

/**
 * Servicio de Usuarios
 * 
 * Contiene toda la lógica de negocio relacionada con usuarios:
 * - Operaciones CRUD con validaciones de negocio
 * - Gestión de roles y permisos
 * - Búsquedas y filtros
 * - Validaciones de seguridad
 */
class UserService
{
    /**
     * Constructor - Inyección de servicios dependientes
     * 
     * @param PermissionService $permissionService - Servicio de permisos
     * @param RolesService $roleService - Servicio de roles
     */
    public function __construct(private readonly PermissionService $permissionService,
                                private readonly RolesService $roleService)
    {

    }
    public function getUsers(): LengthAwarePaginator
    {
        $query = User::query();
        $search = request()->input('search');

        if ($search) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%");
        }

        $role = request()->input('role');
        if ($role) {
            $query->whereHas('roles', function ($q) use ($role) {
                $q->where('name', $role);
            });
        }

        return $query->latest()->paginate(config('settings.default_pagination') ?? 10);
    }

    public function getUserById(int $id): ?User
    {
        return User::findOrFail($id);
    }

    /**
     * Obtener usuarios paginados con filtros (excluyendo técnicos)
     * 
     * @param string|null $search - Término de búsqueda (nombre, email, teléfono, documento)
     * @param string|null $roleId - ID del rol para filtrar
     * @param int $perPage - Número de usuarios por página
     * @return LengthAwarePaginator
     */
    public function getPaginatedUsers(string $search = null, string $roleId = null, int $perPage = 10): LengthAwarePaginator
    {
        // Iniciar consulta con relaciones cargadas, excluyendo técnicos
        $query = User::query()->with(['roles','permissions'])
            ->whereDoesntHave('roles', function ($q) {
                $q->where('name', 'Technical');
            });

        // Aplicar filtro de búsqueda si existe
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')              // Buscar en nombre
                ->orWhere('email', 'like', '%' . $search . '%')            // Buscar en email
                ->orWhere('phone', 'like', '%' . $search . '%')            // Buscar en teléfono
                ->orWhere('rtn_dni_passport', 'like', '%' . $search . '%'); // Buscar en documento
            });
        }
        
        // Si el usuario actual es Admin, ocultar Superadmins
        $query->when(auth()->user()->hasRole('Admin'), function ($query) {
            $query->whereDoesntHave('roles', function ($q) {
                $q->where('name', 'Superadmin');
            });
        });

        // Aplicar filtro por rol si se especifica
        $query->when($roleId && $roleId !== 'all', function ($query) use ($roleId) {
            $query->whereHas('roles', function ($q) use ($roleId) {
                $q->where('id', $roleId);
            });
        });

        // Retornar resultados paginados manteniendo parámetros de consulta
        return $query->paginate($perPage)->withQueryString();
    }

    /**
     * Obtener técnicos paginados con filtros
     * 
     * @param string|null $search - Término de búsqueda
     * @param int $perPage - Número de técnicos por página
     * @return LengthAwarePaginator
     */
    public function getPaginatedTechnicals(string $search = null, int $perPage = 10): LengthAwarePaginator
    {
        // Iniciar consulta solo con usuarios que tengan rol Technical
        $query = User::query()->with(['roles','permissions'])
            ->whereHas('roles', function ($q) {
                $q->where('name', 'Technical');
            });

        // Aplicar filtro de búsqueda si existe
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                ->orWhere('email', 'like', '%' . $search . '%')
                ->orWhere('phone', 'like', '%' . $search . '%')
                ->orWhere('rtn_dni_passport', 'like', '%' . $search . '%')
                ->orWhere('career', 'like', '%' . $search . '%')
                ->orWhere('employee_id', 'like', '%' . $search . '%');
            });
        }

        // Retornar resultados paginados
        return $query->paginate($perPage)->withQueryString();
    }

     public function createUser(string $name, ?string $email, string $phone, string $tipo, string $rtn_dni_passport, string $address, string $password): User
    {
        $user = User::create([
            'name' => $name, 
            'email' => $email, 
            'phone' => $phone,
            'tipo' => $tipo,
            'rtn_dni_passport' => $rtn_dni_passport,
            'address' => $address,
            'password' => $password
        ]);
        
        return $user;
    }

    /**
     * Crear usuario con roles y permisos
     * 
     * @param string $name - Nombre completo
     * @param string|null $email - Email (opcional)
     * @param string $phone - Teléfono
     * @param string $tipo - Tipo: particular, corporativo, extranjero
     * @param string $rtn_dni_passport - Documento de identidad
     * @param string $address - Dirección
     * @param string $password - Contraseña en texto plano
     * @param array $roleIds - IDs de roles a asignar
     * @param array $permissionIds - IDs de permisos directos a asignar
     * @return User
     * @throws \Exception Si no tiene permisos para asignar roles de admin
     */
    public function createUserWithRolesAndPermissions(
        string $name,
        ?string $email,
        string $phone,
        string $tipo,
        string $rtn_dni_passport,
        string $address,
        string $password,
        array $roleIds = [],
        array $permissionIds = []
    ): User
    {   
        // Obtener roles y permisos por sus IDs
        $roles = $this->roleService->getRolesByIds($roleIds, 'web');
        $permissions = $this->permissionService->getPermissionsByIds($permissionIds, 'web');

        // Validar que solo Superadmin puede asignar roles de Admin o Superadmin
        foreach ($roles as $role) {
            if (in_array($role->name, ['Admin', 'Superadmin']) && !auth()->user()->hasRole('Superadmin')) {
                throw new \Exception('Only superadmin can assign the Admin or Superadmin role.');
            }
        }

        // Crear el usuario con contraseña encriptada
        $user = $this->createUser($name, $email, $phone, $tipo, $rtn_dni_passport, $address, Hash::make($password));
        
        // Asignar roles y permisos
        $user->syncRoles($roles->pluck('name')->toArray());
        $user->syncPermissions($permissions);

        return $user;
    }

    /**
     * Crear técnico con rol Technical automático
     * 
     * @param string $name - Nombre completo
     * @param string|null $email - Email (opcional)
     * @param string $phone - Teléfono
     * @param string $tipo - Tipo de usuario
     * @param string $rtn_dni_passport - Documento de identidad
     * @param string $address - Dirección
     * @param string $career - Carrera del técnico
     * @param string $employee_id - ID de empleado
     * @param string $password - Contraseña
     * @param array $permissionIds - Permisos directos
     * @return User
     */
    public function createTechnicalWithRolesAndPermissions(
        string $name,
        ?string $email,
        string $phone,
        string $tipo,
        string $rtn_dni_passport,
        string $address,
        string $career,
        string $employee_id,
        string $password,
        array $permissionIds = []
    ): User
    {   
        // Obtener permisos por IDs
        $permissions = $this->permissionService->getPermissionsByIds($permissionIds, 'web');

        // Crear el usuario con datos de técnico
        $user = User::create([
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'tipo' => $tipo,
            'rtn_dni_passport' => $rtn_dni_passport,
            'address' => $address,
            'career' => $career,
            'employee_id' => $employee_id,
            'password' => Hash::make($password)
        ]);
        
        // Asignar rol Technical automáticamente
        $user->assignRole('Technical');
        
        // Asignar permisos directos si los hay
        if (!empty($permissions)) {
            $user->syncPermissions($permissions);
        }

        return $user;
    }

    /**
     * Actualizar usuario con roles y permisos
     * 
     * @param User $user - Usuario a actualizar
     * @param string $name - Nuevo nombre
     * @param string|null $email - Nuevo email
     * @param string $phone - Nuevo teléfono
     * @param string $tipo - Nuevo tipo
     * @param string $rtn_dni_passport - Nuevo documento
     * @param string $address - Nueva dirección
     * @param string|null $password - Nueva contraseña (opcional)
     * @param array $roleIds - Nuevos roles a asignar
     * @param array $permissionIds - Nuevos permisos a asignar
     * @return User
     * @throws \Exception Si intenta cambiar su propio rol o asignar roles de admin sin permisos
     */
    public function updateUserWithRolesAndPermissions(
        User $user,
        string $name,
        ?string $email,
        string $phone,
        string $tipo,
        string $rtn_dni_passport,
        string $address,
        ?string $password,
        array $roleIds = [],
        array $permissionIds = []
        ): User 
    {
        // Regla de negocio: No puede cambiar su propio rol a menos que sea Superadmin
        if ($user->id === auth()->id() && !$user->hasRole('Superadmin')) {
            throw new \Exception('You cannot change your own role.');
        }

        // Obtener roles por IDs
        $roles = $this->roleService->getRolesByIds($roleIds, 'web');

        // Validar permisos para asignar roles de Admin/Superadmin
        foreach ($roles as $role) {
            if (in_array($role->name, ['Admin', 'Superadmin']) && !auth()->user()->hasRole('Superadmin')) {
                throw new \Exception('Only superadmin can assign the Admin or Superadmin role.');
            }
        }

        // Actualizar datos básicos del usuario
        $user->name = $name;
        $user->email = $email;
        $user->phone = $phone;
        $user->tipo = $tipo;
        $user->rtn_dni_passport = $rtn_dni_passport;
        $user->address = $address;

        // Actualizar contraseña solo si se proporciona una nueva
        if (!empty($password)) {
            $user->password = Hash::make($password);
        }

        // Guardar cambios en la base de datos
        $user->save();

        // Sincronizar roles
        $user->syncRoles($roles->pluck('name')->toArray());

        // Sincronizar permisos
        $permissions = $this->permissionService->getPermissionsByIds($permissionIds, 'web');
        $user->syncPermissions($permissions);

        return $user;
    }

    /**
     * Actualizar técnico manteniendo rol Technical
     * 
     * @param User $user - Técnico a actualizar
     * @param string $name - Nuevo nombre
     * @param string|null $email - Nuevo email
     * @param string $phone - Nuevo teléfono
     * @param string $tipo - Nuevo tipo
     * @param string $rtn_dni_passport - Nuevo documento
     * @param string $address - Nueva dirección
     * @param string $career - Nueva carrera
     * @param string $employee_id - Nuevo ID de empleado
     * @param string|null $password - Nueva contraseña (opcional)
     * @param array $permissionIds - Nuevos permisos
     * @return User
     */
    public function updateTechnicalWithRolesAndPermissions(
        User $user,
        string $name,
        ?string $email,
        string $phone,
        string $tipo,
        string $rtn_dni_passport,
        string $address,
        string $career,
        string $employee_id,
        ?string $password,
        array $permissionIds = []
        ): User 
    {
        // Actualizar datos del técnico
        $user->name = $name;
        $user->email = $email;
        $user->phone = $phone;
        $user->tipo = $tipo;
        $user->rtn_dni_passport = $rtn_dni_passport;
        $user->address = $address;
        $user->career = $career;
        $user->employee_id = $employee_id;

        // Actualizar contraseña solo si se proporciona
        if (!empty($password)) {
            $user->password = Hash::make($password);
        }

        // Guardar cambios
        $user->save();

        // Mantener rol Technical (no cambiar roles)
        if (!$user->hasRole('Technical')) {
            $user->assignRole('Technical');
        }

        // Sincronizar permisos directos
        $permissions = $this->permissionService->getPermissionsByIds($permissionIds, 'web');
        $user->syncPermissions($permissions);

        return $user;
    }


    /**
     * Eliminar usuario del sistema
     * 
     * @param User $user - Usuario a eliminar
     * @return bool - True si se eliminó correctamente
     * @throws \Exception Si intenta eliminar su propia cuenta o un Superadmin
     */
    public function deleteUser(User $user): bool
    {   
        // Regla de negocio: No puede eliminar su propia cuenta
        if ($user->id == auth()->id()) {
            throw new \Exception('You cannot delete your own account.');
        }
        
        // Regla de negocio: No se puede eliminar un Superadmin
        if ($user->hasRole('Superadmin')) {
            throw new \Exception('Cannot delete this user.');
        }

        // Limpiar roles y permisos antes de eliminar
        $user->syncRoles(); 
        $user->syncPermissions();    

        // Eliminar usuario de la base de datos
        return $user->delete();
    }
}
