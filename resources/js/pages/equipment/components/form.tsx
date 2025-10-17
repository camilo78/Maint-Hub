import { useState, useEffect } from 'react';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import TipTapEditor from '@/components/tiptap-editor';

import es from '@/lang/es';

type Client = {
    id: number;
    name: string;
};

interface Props {
    data: {
        client_id: string;
        category: string;
        description: string;
        brand: string;
        model: string;
        serial_number: string;
        asset_tag: string;
        location: string;
        status: 'buen_estado' | 'mal_estado' | 'mantenimiento';
        installation_date: string;
        warranty_expires_on: string;
        notes: string;
        specifications: Record<string, string>;
    };
    errors: {
        client_id?: string;
        category?: string;
        description?: string;
        brand?: string;
        model?: string;
        serial_number?: string;
        asset_tag?: string;
        location?: string;
        status?: string;
        installation_date?: string;
        warranty_expires_on?: string;
        notes?: string;
        specifications?: string;
    };
    clients: Client[];
    categories: string[];
    descriptions: string[];
    onChange: (field: keyof Props['data'], value: string | Record<string, string>) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    isEditing?: boolean;
}

/**
 * Formulario para crear/editar equipos
 * Maneja información básica, fechas, notas y especificaciones técnicas
 */
export default function EquipmentForm({
    data,
    errors,
    clients,
    categories,
    descriptions,
    onChange,
    onSubmit,
    isEditing = false
}: Props) {

    const [showClientWarning] = useState(false);

    // Generar asset_tag automáticamente cuando cambia el cliente
    useEffect(() => {
        if (!isEditing && data.client_id) {
            const client = clients.find(c => c.id.toString() === data.client_id);
            if (client) {
                const name = client.name.replace(/[^a-zA-Z\s]/g, '');
                const nameParts = name.trim().split(' ');
                let initials = '';
                nameParts.forEach(part => {
                    if (part) initials += part[0].toUpperCase();
                });
                if (!initials) initials = 'EQ';
                const timestamp = Date.now().toString().slice(-4);
                onChange('asset_tag', `${initials}${timestamp}`);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.client_id, isEditing]);

    // Maneja cambios en especificaciones técnicas
    const handleSpecificationChange = (key: string, value: string) => {
        const updatedSpecs = { ...data.specifications };
        if (value.trim() === '') {
            delete updatedSpecs[key];
        } else {
            updatedSpecs[key] = value;
        }
        onChange('specifications', updatedSpecs);
    };

    // Agrega nueva especificación con clave temporal
    const addSpecification = () => {
        const newKey = `spec_${Date.now()}`;
        onChange('specifications', { ...data.specifications, [newKey]: '' });
    };

    return (
        <form id="equipment-form" onSubmit={onSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{es['Basic Information']}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Cliente */}
                        <div className="space-y-2">
                            <Label>{es['Client']} *</Label>
                            <Select value={data.client_id} onValueChange={(value) => onChange('client_id', value)}>
                                <SelectTrigger id="client_id">
                                    <SelectValue placeholder={es['Select client']} />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map(client => (
                                        <SelectItem key={client.id} value={client.id.toString()}>
                                            {client.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {isEditing && showClientWarning && (
                                <div className="text-xs text-muted-foreground bg-muted/50 border border-muted rounded p-2">
                                    ⚠️ {es['Client Change Warning']}
                                </div>
                            )}
                            <InputError message={errors.client_id} />
                        </div>

                {/* Categoría */}
                <div className="space-y-2">
                    <Label htmlFor="category">{es['Category']} *</Label>
                    <Input
                        id="category"
                        name="category"
                        list="categories"
                        value={data.category}
                        onChange={(e) => onChange('category', e.target.value)}
                        placeholder={es['Category Placeholder'] || 'Escribir o seleccionar categoría...'}
                        className="w-full"
                        required
                    />
                    <datalist id="categories">
                        {categories.map(cat => (
                            <option key={cat} value={cat} />
                        ))}
                    </datalist>
                    <InputError message={errors.category} />
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                    <Label htmlFor="description">{es['Description']}</Label>
                    <div className="relative">
                        <Input
                            id="description"
                            name="description"
                            list="descriptions"
                            value={data.description}
                            onChange={(e) => onChange('description', e.target.value)}
                            placeholder={es['Description Placeholder'] || 'Ej: TV 50 pulgadas, Aire 12000 BTU...'}
                            className="w-full"
                            style={{ minWidth: '100%' }}
                        />
                        <datalist id="descriptions" style={{ width: '100%' }}>
                            {descriptions.map(desc => (
                                <option key={desc} value={desc} style={{ width: '100%' }} />
                            ))}
                        </datalist>
                    </div>
                    <InputError message={errors.description} />
                </div>

                        {/* Estado */}
                        <div className="space-y-2">
                            <Label>{es['Status']} *</Label>
                            <Select value={data.status} onValueChange={(value) => onChange('status', value as 'buen_estado' | 'mal_estado' | 'mantenimiento')}>
                                <SelectTrigger id="status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="buen_estado">{es['Good Condition']}</SelectItem>
                                    <SelectItem value="mal_estado">{es['Bad Condition']}</SelectItem>
                                    <SelectItem value="mantenimiento">{es['Maintenance']}</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.status} />
                        </div>

                {/* Marca */}
                <div className="space-y-2">
                    <Label htmlFor="brand">{es['Brand']}</Label>
                    <Input
                        id="brand"
                        value={data.brand}
                        onChange={(e) => onChange('brand', e.target.value)}
                        placeholder={es['Brand Placeholder']}
                        className="w-full"
                    />
                    <InputError message={errors.brand} />
                </div>

                {/* Modelo */}
                <div className="space-y-2">
                    <Label htmlFor="model">{es['Model']}</Label>
                    <Input
                        id="model"
                        value={data.model}
                        onChange={(e) => onChange('model', e.target.value)}
                        placeholder={es['Model Placeholder']}
                        className="w-full"
                    />
                    <InputError message={errors.model} />
                </div>

                {/* Número de Serie */}
                <div className="space-y-2">
                    <Label htmlFor="serial_number">{es['Serial Number']}</Label>
                    <Input
                        id="serial_number"
                        value={data.serial_number}
                        onChange={(e) => onChange('serial_number', e.target.value)}
                        placeholder={es['Serial Placeholder']}
                        className="w-full"
                    />
                    <InputError message={errors.serial_number} />
                </div>

                {/* Etiqueta */}
                <div className="space-y-2">
                    <Label htmlFor="asset_tag">{es['Asset Tag']} *</Label>
                    <Input
                        id="asset_tag"
                        value={data.asset_tag}
                        disabled
                        placeholder={es['Auto-generated']}
                        className="w-full bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">{es['Auto-generated based on client']}</p>
                    <InputError message={errors.asset_tag} />
                </div>

                {/* Ubicación */}
                <div className="space-y-2">
                    <Label htmlFor="location">{es['Location']} *</Label>
                    <Input
                        id="location"
                        value={data.location}
                        onChange={(e) => onChange('location', e.target.value)}
                        placeholder={es['Location Placeholder']}
                        required
                        className="w-full"
                    />
                    <InputError message={errors.location} />
                </div>

                {/* Fecha de Instalación */}
                <div className="space-y-2">
                    <Label htmlFor="installation_date">{es['Installation Date']}</Label>
                    <div className="relative">
                        <Input
                            type="date"
                            id="installation_date"
                            value={data.installation_date}
                            onChange={(e) => onChange('installation_date', e.target.value)}
                            className="w-full [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:-translate-y-1/2 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 dark:[&::-webkit-calendar-picker-indicator]:invert"
                        />
                    </div>
                    <InputError message={errors.installation_date} />
                </div>

                {/* Vencimiento de Garantía */}
                <div className="space-y-2">
                    <Label htmlFor="warranty_expires_on">{es['Warranty Expires On']}</Label>
                    <div className="relative">
                        <Input
                            type="date"
                            id="warranty_expires_on"
                            value={data.warranty_expires_on}
                            onChange={(e) => onChange('warranty_expires_on', e.target.value)}
                            className="w-full [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:-translate-y-1/2 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 dark:[&::-webkit-calendar-picker-indicator]:invert"
                        />
                    </div>
                    <InputError message={errors.warranty_expires_on} />
                </div>
                    </div>
                </CardContent>
            </Card>

            {/* Información adicional del equipo */}
            <Card>
                <CardHeader>
                    <CardTitle>{es['Additional Information'] || 'Información Adicional'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Notas */}
                    <div className="space-y-2">
                        <Label>{es['Notes']}</Label>
                        <TipTapEditor
                            content={data.notes}
                            onChange={(content) => onChange('notes', content)}
                            placeholder={es['Notes Placeholder']}
                            className="w-full"
                        />
                        <InputError message={errors.notes} />
                    </div>
                </CardContent>
            </Card>

            {/* Especificaciones técnicas opcionales */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {es['Technical Specifications']}
                        <span className="text-xs text-muted-foreground ml-auto">({es['Optional']})</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                        {Object.entries(data.specifications || {}).map(([key, value]) => {
                            const displayKey = key.startsWith('spec_') ? '' : key;
                            return (
                            <div key={key} className="grid grid-cols-2 gap-3">
                                <Input
                                    placeholder={es['Specification Name Placeholder'] || 'Nombre (ej: BTU, Capacidad)'}
                                    defaultValue={displayKey}
                                    onBlur={(e) => {
                                        const newKey = e.target.value.trim();
                                        if (newKey && newKey !== key) {
                                            const newSpecs = { ...data.specifications };
                                            delete newSpecs[key];
                                            newSpecs[newKey] = value;
                                            onChange('specifications', newSpecs);
                                        }
                                    }}
                                />
                                <div className="flex gap-2">
                                    <Input
                                        placeholder={es['Specification Value Placeholder'] || 'Valor (ej: 12000, 15kg)'}
                                        value={value as string}
                                        onChange={(e) => handleSpecificationChange(key, e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newSpecs = { ...data.specifications };
                                            delete newSpecs[key];
                                            onChange('specifications', newSpecs);
                                        }}
                                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                            );
                        })}
                        <button
                            type="button"
                            onClick={addSpecification}
                            className="w-full py-2 px-4 border-2 border-dashed border-muted-foreground/30 rounded-lg text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground transition-colors"
                        >
                            + {es['Add Specification'] || 'Agregar Especificación'}
                        </button>
                        <InputError message={errors.specifications} />
                </CardContent>
            </Card>
        </form>
    );
}