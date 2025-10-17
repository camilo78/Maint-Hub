import React, { useState } from 'react';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import es from '@/lang/es';

interface Props {
    data: {
        name: string;
        email: string;
        phone: string;
        tipo: string;
        rtn_dni_passport: string;
        address: string;
        password: string;
    };
    errors: {
        name?: string;
        email?: string;
        phone?: string;
        tipo?: string;
        rtn_dni_passport?: string;
        address?: string;
        password?: string;
    };
    processing?: boolean;
    onChange: (field: 'name' | 'email' | 'phone' | 'tipo' | 'rtn_dni_passport' | 'address' | 'password', value: string) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    submitLabel: string;
    isEditing?: boolean; 
}

export default function UserForm({
    data,
    errors,
    onChange,
    onSubmit,
    isEditing = false
}: Props) {
    const [passwordTouched, setPasswordTouched] = useState(false);

    return (
        <form id="user-form" onSubmit={onSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-2">
                    <Label htmlFor="client-name">{es['Name'] || 'Nombre'}</Label>
                    <Input
                        id="client-name"
                        name="name"
                        value={data.name}
                        onChange={(e) => onChange('name', e.target.value)}
                        required
                        autoComplete="name"
                        className="w-full"
                    />
                    <InputError message={errors.name} />
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <Label htmlFor="client-email">Email</Label>
                    <Input
                        type="email"
                        id="client-email"
                        name="email"
                        value={data.email}
                        onChange={(e) => onChange('email', e.target.value)}
                        autoComplete="email"
                        className="w-full"
                    />
                    <InputError message={errors.email} />
                </div>

            </div>

            {/* Phone, Type, Document in 3 columns */}
            <div className="grid grid-cols-3 gap-4">
                {/* Phone */}
                <div className="space-y-2">
                    <Label htmlFor="client-phone">{es['Phone'] || 'Teléfono'}</Label>
                    <Input
                        id="client-phone"
                        name="phone"
                        type="tel"
                        value={data.phone}
                        onChange={(e) => onChange('phone', e.target.value)}
                        required
                        autoComplete="tel"
                        className="w-full"
                    />
                    <InputError message={errors.phone} />
                </div>

                {/* Tipo */}
                <div className="space-y-2">
                    <Label htmlFor="client-tipo">{es['Type'] || 'Tipo'}</Label>
                    <select
                        id="client-tipo"
                        name="tipo"
                        value={data.tipo}
                        onChange={(e) => onChange('tipo', e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        required
                    >
                        <option value="">{es['Select a type'] || 'Seleccionar tipo'}</option>
                        <option value="particular">{es['Individual'] || 'Particular'}</option>
                        <option value="corporativo">{es['Corporate'] || 'Corporativo'}</option>
                        <option value="extranjero">{es['Foreign'] || 'Extranjero'}</option>
                    </select>
                    <InputError message={errors.tipo} />
                </div>

                {/* RTN/DNI/Passport */}
                <div className="space-y-2">
                    <Label htmlFor="client-rtn-dni-passport">
                        {data.tipo === 'corporativo' ? (es['RTN'] || 'RTN') + ' (14 dígitos)' :
                        data.tipo === 'extranjero' ? (es['Passport'] || 'Pasaporte') + ' (6-12 caracteres)' :
                        (es['DNI'] || 'DNI') + ' (13 dígitos)'}
                    </Label>
                    <Input
                        id="client-rtn-dni-passport"
                        name="rtn_dni_passport"
                        value={data.rtn_dni_passport}
                        className="w-full"
                        onChange={(e) => {
                            let value;
                            if (data.tipo === 'extranjero') {
                                // Para pasaporte, permitir letras y números
                                value = e.target.value.toUpperCase();
                                if (value.length <= 12) {
                                    onChange('rtn_dni_passport', value);
                                    // Solo auto-llenar contraseña en modo create
                                    if (!isEditing) {
                                        onChange('password', value);
                                    }
                                }
                            } else {
                                // Para DNI y RTN, solo números
                                value = e.target.value.replace(/\D/g, '');
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
            </div>

            {/* Password and Address in 2 columns */}
            <div className="grid grid-cols-2 gap-4">

                {/* Contraseña */}
                <div className="space-y-1">
                    <Label htmlFor="client-password">
                        {es['Password'] || 'Contraseña'}
                        {isEditing && <span className="text-sm text-muted-foreground ml-1">(opcional)</span>}
                    </Label>
                    <Input
                        type="password"
                        id="client-password"
                        name="password"
                        value={data.password}
                        className="w-full"
                        onChange={(e) => {
                            onChange('password', e.target.value);
                            if (isEditing) setPasswordTouched(true);
                        }}
                        autoComplete={isEditing ? "new-password" : "off"}
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
                {/* Dirección */}
                <div className="space-y-2">
                    <Label htmlFor="client-address">{es['Address'] || 'Dirección'}</Label>
                    <textarea
                        id="client-address"
                        name="address"
                        value={data.address || ''}
                        onChange={(e) => onChange('address', e.target.value)}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder={es['Enter complete address'] || 'Ingrese la dirección completa'}
                        rows={3}
                        autoComplete="street-address"
                    />
                    <InputError message={errors.address} />
                </div>
            </div>
        </form>
    );
}
