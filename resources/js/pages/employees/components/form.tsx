import React, { useState } from 'react';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronRight } from 'lucide-react';
import es from '@/lang/es';

/**
 * Formulario de Empleados - Completamente Responsivo
 * 
 * Características:
 * - Diseño adaptativo para móvil, tablet y desktop
 * - Validación en tiempo real de documentos
 * - Asignación automática del rol "Employee"
 * - Roles adicionales opcionales (Superadmin, Admin, Client)
 * - Permisos directos expandibles
 * - Traducciones completas ES/EN
 */

interface Props {
    data: {
        name: string;
        email: string;
        phone: string;
        tipo: string;
        rtn_dni_passport: string;
        address: string;
        career: string;
        employee_id: string;
        password: string;
        roleIds: number[];
        permissionIds: number[];
    };
    roles: { id: number; name: string }[];
    permissions: { id: number; name: string }[];
    errors: {
        name?: string;
        email?: string;
        phone?: string;
        tipo?: string;
        rtn_dni_passport?: string;
        address?: string;
        career?: string;
        employee_id?: string;
        password?: string;
        roleIds?: string;
        permissionIds?: string;
    };
    onChange: (field: keyof Props['data'], value: string | number | number[]) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    isEditing?: boolean;
}

export default function EmployeeForm({
    data,
    roles,
    permissions,
    errors,
    onChange,
    onSubmit,
    isEditing = false
}: Props) {
    // Estado para mostrar/ocultar permisos directos
    const [showPermissions, setShowPermissions] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState(false);
    
    // Agrupa permisos por módulo para mejor organización
    const groupedPermissions = permissions.reduce((acc: Record<string, typeof permissions>, perm) => {
        const [group] = perm.name.split('.');
        if (!acc[group]) acc[group] = [];
        acc[group].push(perm);
        return acc;
    }, {});

    // Verifica si todos los permisos de un grupo están seleccionados
    const isGroupChecked = (group: string) =>
        groupedPermissions[group].every((perm) => data.permissionIds.includes(perm.id));

    // Verifica si algunos permisos de un grupo están seleccionados (estado indeterminado)
    const isGroupIndeterminate = (group: string) => {
        const perms = groupedPermissions[group];
        const selected = perms.filter((perm) => data.permissionIds.includes(perm.id));
        return selected.length > 0 && selected.length < perms.length;
    };

    // Maneja selección/deselección de grupos completos de permisos
    const handleToggleGroup = (group: string) => {
        const perms = groupedPermissions[group];
        const allChecked = isGroupChecked(group);
        const newIds = allChecked
            ? data.permissionIds.filter((id) => !perms.some((perm) => perm.id === id))
            : [...new Set([...data.permissionIds, ...perms.map((perm) => perm.id)])];
        onChange('permissionIds', newIds);
    };

    return (
        <form id="employee-form" onSubmit={onSubmit} className="space-y-4 py-2">
            {/* Sección 1: Información Básica - Responsive: 1 col móvil, 2 cols tablet+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Nombre completo */}
                <div className="space-y-1">
                    <Label htmlFor="name">{es['Name'] || 'Nombre'}</Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => onChange('name', e.target.value)}
                        required
                        autoComplete="off"
                        className="w-full"
                    />
                    <InputError message={errors.name} />
                </div>

                {/* Email (opcional) */}
                <div className="space-y-1">
                    <Label htmlFor="email">{es['Email'] || 'Email'}</Label>
                    <Input
                        type="email"
                        id="email"
                        value={data.email}
                        onChange={(e) => onChange('email', e.target.value)}
                        autoComplete="off"
                        className="w-full"
                    />
                    <InputError message={errors.email} />
                </div>
            </div>
            
            {/* Sección 2: Contacto y Documentación - Responsive: 1 col móvil, 2 cols tablet, 3 cols desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Teléfono */}
                <div className="space-y-1">
                    <Label htmlFor="phone">{es['Phone'] || 'Teléfono'}</Label>
                    <Input
                        id="phone"
                        value={data.phone}
                        onChange={(e) => onChange('phone', e.target.value)}
                        required
                        autoComplete="off"
                        className="w-full"
                    />
                    <InputError message={errors.phone} />
                </div>

                {/* Tipo de identificación */}
                <div className="space-y-1">
                    <Label htmlFor="tipo">{es['Type'] || 'Tipo'}</Label>
                    <select
                        id="tipo"
                        value={data.tipo}
                        onChange={(e) => onChange('tipo', e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        required
                    >
                        <option value="">{es['Select Type'] || 'Seleccionar tipo'}</option>
                        <option value="particular">{es['Individual'] || 'Particular'}</option>
                        <option value="corporativo">{es['Corporate'] || 'Corporativo'}</option>
                        <option value="extranjero">{es['Foreign'] || 'Extranjero'}</option>
                    </select>
                    <InputError message={errors.tipo} />
                </div>

                {/* Documento (dinámico según tipo) */}
                <div className="space-y-1">
                    <Label htmlFor="rtn_dni_passport">
                        {data.tipo === 'corporativo' ? (es['RTN'] || 'RTN') + ' (14 dígitos)' : 
                         data.tipo === 'extranjero' ? (es['Passport'] || 'Pasaporte') + ' (6-12 caracteres)' : 
                         (es['DNI'] || 'DNI') + ' (13 dígitos)'}
                    </Label>
                    <Input
                        id="rtn_dni_passport"
                        value={data.rtn_dni_passport}
                        className="w-full"
                        onChange={(e) => {
                            if (data.tipo === 'extranjero') {
                                const value = e.target.value.toUpperCase();
                                if (value.length <= 12) {
                                    onChange('rtn_dni_passport', value);
                                    // Solo auto-llenar contraseña en modo create
                                    if (!isEditing) {
                                        onChange('password', value);
                                    }
                                }
                            } else {
                                const value = e.target.value.replace(/\D/g, '');
                                const maxLength = data.tipo === 'corporativo' ? 14 : 13;
                                if (value.length <= maxLength) {
                                    onChange('rtn_dni_passport', value);
                                    // Solo auto-llenar contraseña en modo create
                                    if (!isEditing) {
                                        onChange('password', value);
                                    }
                                }
                            }
                        }}
                        required
                        autoComplete="off"
                        placeholder={
                            data.tipo === 'corporativo' ? '14 dígitos' : 
                            data.tipo === 'extranjero' ? 'Ej: AB1234567' : 
                            '13 dígitos'
                        }
                        maxLength={
                            data.tipo === 'corporativo' ? 14 : 
                            data.tipo === 'extranjero' ? 12 : 
                            13
                        }
                    />
                    <InputError message={errors.rtn_dni_passport} />
                </div>

                {/* Carrera profesional */}
                <div className="space-y-1">
                    <Label htmlFor="career">{es['Career'] || 'Carrera'}</Label>
                    <Input
                        id="career"
                        value={data.career}
                        onChange={(e) => onChange('career', e.target.value)}
                        required
                        autoComplete="off"
                        placeholder={es['Career Placeholder'] || 'Ej: Ingeniería Mecánica'}
                        className="w-full"
                    />
                    <InputError message={errors.career} />
                </div>

                {/* ID de empleado */}
                <div className="space-y-1">
                    <Label htmlFor="employee_id">{es['Employee ID'] || 'ID de Empleado'}</Label>
                    <Input
                        id="employee_id"
                        value={data.employee_id}
                        onChange={(e) => onChange('employee_id', e.target.value)}
                        required
                        autoComplete="off"
                        placeholder={es['Employee ID Placeholder'] || 'Ej: EMP0001'}
                        className="w-full"
                    />
                    <InputError message={errors.employee_id} />
                </div>

                {/* Contraseña */}
                <div className="space-y-1">
                    <Label htmlFor="password">
                        {es['Password'] || 'Contraseña'}
                        {isEditing && <span className="text-sm text-muted-foreground ml-1">(opcional)</span>}
                    </Label>
                    <Input
                        type="password"
                        id="password"
                        value={data.password}
                        className="w-full"
                        onChange={(e) => {
                            onChange('password', e.target.value);
                            if (isEditing) setPasswordTouched(true);
                        }}
                        autoComplete="off"
                        required={!isEditing}
                        placeholder={isEditing ? 'Dejar vacío para mantener contraseña actual' : 'Se auto-completa con el documento'}
                    />
                    {isEditing && passwordTouched && data.password && (
                        <p className="text-sm text-amber-600 dark:text-amber-400">
                            ⚠️ Se cambiará la contraseña si continúa
                        </p>
                    )}
                    <InputError message={errors.password} />
                </div>
            </div>
            
            {/* Sección 3: Dirección y Roles - Responsive: 1 col móvil, 2 cols desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Dirección completa */}
                <div className="space-y-1">
                    <Label htmlFor="address">{es['Address'] || 'Dirección'}</Label>
                    <textarea
                        id="address"
                        value={data.address || ''}
                        onChange={(e) => onChange('address', e.target.value)}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                        placeholder={es['Address Placeholder'] || 'Ingrese la dirección completa'}
                        rows={3}
                        required
                    />
                    <InputError message={errors.address} />
                </div>
                
                {/* Roles adicionales (opcional) */}
                <div className="space-y-1">
                    <Label>{es['User Roles'] || 'Roles de Usuario'}</Label>
                    <div className="border border-input rounded-md p-3 bg-background min-h-[80px]">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {roles.map(role => (
                                <div key={role.id} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id={`role-${role.id}`}
                                        checked={data.roleIds.includes(role.id)}
                                        onChange={(e) => {
                                            const updated = e.target.checked
                                                ? [...data.roleIds, role.id]
                                                : data.roleIds.filter(id => id !== role.id);
                                            onChange('roleIds', updated);
                                        }}
                                        className="rounded border-gray-300 flex-shrink-0"
                                    />
                                    <label htmlFor={`role-${role.id}`} className="text-sm cursor-pointer truncate">
                                        {role.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                        {roles.length === 0 && (
                            <p className="text-sm text-muted-foreground italic">{es['No additional roles available'] || 'No hay roles adicionales disponibles'}</p>
                        )}
                    </div>
                    <InputError message={errors.roleIds} />
                </div>
            </div>

            {/* Sección 4: Permisos Directos (Expandible) */}
            <div className="mt-2">
                <div 
                    className="flex items-center gap-2 cursor-pointer mb-0 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" 
                    onClick={() => setShowPermissions(!showPermissions)}
                >
                    {showPermissions ? <ChevronDown className="h-4 w-4 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 flex-shrink-0" />}
                    <Label className="cursor-pointer font-medium">{es['Assign Direct Permissions'] || 'Asignar Permisos Directos'}</Label>
                    <span className="text-xs text-muted-foreground ml-auto">({es['Optional'] || 'Opcional'})</span>
                </div>
                {showPermissions && (
                    <div className="bg-white dark:bg-gray-900 rounded-lg border p-4 space-y-3">
                        {Object.entries(groupedPermissions).map(([group, perms]) => (
                            <div key={group} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                {/* Checkbox maestro para todo el grupo */}
                                <div className="mb-3 flex items-center gap-2 font-semibold capitalize">
                                    <input
                                        type="checkbox"
                                        checked={isGroupChecked(group)}
                                        ref={(el) => {
                                            if (el) el.indeterminate = isGroupIndeterminate(group);
                                        }}
                                        onChange={() => handleToggleGroup(group)}
                                        className="flex-shrink-0"
                                    />
                                    <span className="text-gray-900 dark:text-gray-100">{group}</span>
                                </div>
                                {/* Grid responsivo de permisos individuales */}
                                <div className="ml-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {perms.map((perm) => {
                                        const [, action] = perm.name.split('.');
                                        return (
                                            <div key={perm.id} className="flex items-center gap-2 text-sm bg-white dark:bg-gray-700 p-2 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={data.permissionIds.includes(perm.id)}
                                                    onChange={() => {
                                                        const updated = data.permissionIds.includes(perm.id)
                                                            ? data.permissionIds.filter((id) => id !== perm.id)
                                                            : [...data.permissionIds, perm.id];
                                                        onChange('permissionIds', updated);
                                                    }}
                                                    className="flex-shrink-0"
                                                />
                                                <span className="capitalize text-gray-700 dark:text-gray-300 truncate">
                                                    {action.replaceAll('_', ' ')}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                        {Object.keys(groupedPermissions).length === 0 && (
                            <p className="text-sm text-muted-foreground italic text-center py-4">
                                {es['No permissions available to assign'] || 'No hay permisos disponibles para asignar'}
                            </p>
                        )}
                    </div>
                )}
                <InputError message={errors.permissionIds} />
            </div>
        </form>
    );
}