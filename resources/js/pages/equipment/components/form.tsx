import React, { useState } from 'react';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronRight } from 'lucide-react';
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
        status: 'buen_estado' | 'mal_estado' | 'en_reparacion';
        installation_date: string;
        warranty_expires_on: string;
        notes: string;
        specifications: Record<string, any>;
    };
    errors: {
        client_id?: string;
        category?: string;
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
    onChange: (field: keyof Props['data'], value: string | Record<string, any>) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    isEditing?: boolean;
}

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
    const [showSpecifications, setShowSpecifications] = useState(false);
    const [showClientWarning, setShowClientWarning] = useState(false);

    const handleSpecificationChange = (key: string, value: string) => {
        const updatedSpecs = { ...data.specifications };
        if (value.trim() === '') {
            delete updatedSpecs[key];
        } else {
            updatedSpecs[key] = value;
        }
        onChange('specifications', updatedSpecs);
    };

    const addSpecification = () => {
        const newKey = `spec_${Date.now()}`;
        onChange('specifications', { ...data.specifications, [newKey]: '' });
    };

    return (
        <form id="equipment-form" onSubmit={onSubmit} className="space-y-4 py-2">
            {/* Todos los campos en 3 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Cliente */}
                <div className="space-y-2">
                    <Label htmlFor="client_id">{es['Client']} *</Label>
                    <select
                        id="client_id"
                        value={data.client_id}
                        onChange={(e) => onChange('client_id', e.target.value)}
                        onFocus={() => setShowClientWarning(true)}
                        onBlur={() => setShowClientWarning(false)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        required
                    >
                        <option value="">{es['Select Client']}</option>
                        {clients.map(client => (
                            <option key={client.id} value={client.id}>
                                {client.name}
                            </option>
                        ))}
                    </select>
                    {isEditing && showClientWarning && (
                        <div className="text-xs text-muted-foreground bg-muted/50 border border-muted rounded p-2">
                            ⚠️ {es['Client Change Warning'] || 'Cambiar el cliente moverá este equipo a otro cliente'}
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
                        placeholder="Escribir o seleccionar categoría..."
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
                    <Label htmlFor="description">Descripción</Label>
                    <div className="relative">
                        <Input
                            id="description"
                            name="description"
                            list="descriptions"
                            value={data.description}
                            onChange={(e) => onChange('description', e.target.value)}
                            placeholder="Ej: TV 50 pulgadas, Aire 12000 BTU..."
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
                    <Label htmlFor="status">{es['Status']} *</Label>
                    <select
                        id="status"
                        value={data.status}
                        onChange={(e) => onChange('status', e.target.value as 'buen_estado' | 'mal_estado' | 'en_reparacion')}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        required
                    >
                        <option value="buen_estado">Buen Estado</option>
                        <option value="mal_estado">Mal Estado</option>
                        <option value="en_reparacion">En Reparación</option>
                    </select>
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
                    <Label htmlFor="asset_tag">{es['Tag']}</Label>
                    <Input
                        id="asset_tag"
                        value={data.asset_tag}
                        onChange={(e) => onChange('asset_tag', e.target.value)}
                        placeholder={es['Tag Placeholder'] || 'Ej: EQ-001, LAP-123'}
                        className="w-full"
                    />
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

            {/* Notas - Ancho completo */}
            <div className="space-y-2">
                <Label htmlFor="notes">{es['Notes']}</Label>
                <TipTapEditor
                    content={data.notes}
                    onChange={(content) => onChange('notes', content)}
                    placeholder={es['Notes Placeholder']}
                    className="w-full"
                />
                <InputError message={errors.notes} />
            </div>

            {/* Especificaciones Técnicas */}
            <div className="mt-4">
                <div 
                    className="flex items-center gap-2 cursor-pointer mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" 
                    onClick={() => setShowSpecifications(!showSpecifications)}
                >
                    {showSpecifications ? <ChevronDown className="h-4 w-4 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 flex-shrink-0" />}
                    <Label className="cursor-pointer font-medium">{es['Technical Specifications']}</Label>
                    <span className="text-xs text-muted-foreground ml-auto">({es['Optional']})</span>
                </div>
                {showSpecifications && (
                    <div className="bg-white dark:bg-gray-900 rounded-lg border p-4 space-y-3">
                        {Object.entries(data.specifications || {}).map(([key, value]) => (
                            <div key={key} className="grid grid-cols-2 gap-3">
                                <Input
                                    placeholder={es['Specification Name Placeholder'] || 'Nombre (ej: BTU, Capacidad)'}
                                    value={key.startsWith('spec_') ? '' : key}
                                    onChange={(e) => {
                                        const newSpecs = { ...data.specifications };
                                        delete newSpecs[key];
                                        if (e.target.value.trim()) {
                                            newSpecs[e.target.value] = value;
                                        }
                                        onChange('specifications', newSpecs);
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
                        ))}
                        <button
                            type="button"
                            onClick={addSpecification}
                            className="w-full py-2 px-4 border-2 border-dashed border-muted-foreground/30 rounded-lg text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground transition-colors"
                        >
                            + {es['Add Specification'] || 'Agregar Especificación'}
                        </button>
                        <InputError message={errors.specifications} />
                    </div>
                )}
            </div>
        </form>
    );
}