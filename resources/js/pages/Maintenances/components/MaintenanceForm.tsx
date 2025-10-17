import { useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, Edit, FileText, Wrench } from 'lucide-react';
import SparePartModal from './SparePartModal';
import FileUploadSection from './FileUploadSection';
import CrewAssignment from './CrewAssignment';
import es from '@/lang/es';

interface Client {
    id: number;
    name: string;
}

interface Equipment {
    id: number;
    description: string;
    asset_tag: string;
    client_id: number;
}

interface SparePart {
    id?: number;
    name: string;
    sku: string;
    description?: string;
    brand?: string;
    part_number?: string;
    sale_price?: number;
    cost_price?: number;
    stock: number;
    minimum_stock: number;
    unit_measure: string;
    location?: string;
}

interface Technician {
    id: number;
    name: string;
    email?: string;
    employee_id?: string;
}

interface CrewMember {
    id: number;
    name: string;
    email?: string;
    employee_id?: string;
    is_leader: boolean;
}

interface MaintenanceData {
    id?: number;
    description: string;
    client_id: number;
    equipment_id: number;
    priority: string;
    type: string;
    status: string;
    cost: number;
    spare_parts?: Array<{
        id: number;
        name: string;
        pivot: {
            quantity: number;
            observations: string;
        };
    }>;
    images?: Array<{
        id: number;
        path: string;
        original_name: string;
        size?: number;
        mime_type?: string;
    }>;
    documents?: Array<{
        id: number;
        path: string;
        original_name: string;
        size?: number;
        mime_type?: string;
    }>;
}

interface Props {
    maintenance?: MaintenanceData;
    clients: Client[];
    equipment: Equipment[];
    spareParts: SparePart[];
    technicians?: Technician[];
    assignedCrew?: CrewMember[];
    submitRoute: string;
    method: 'post' | 'put';
}

export default function MaintenanceForm({
    maintenance,
    clients,
    equipment,
    spareParts,
    technicians = [],
    assignedCrew = [],
    submitRoute,
    method
}: Props) {
    const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
    const [equipmentSearch, setEquipmentSearch] = useState('');
    const [sparePartSearch, setSparePartSearch] = useState('');
    const [selectedSparePartValue, setSelectedSparePartValue] = useState('');
    const [selectedSpareParts, setSelectedSpareParts] = useState<Array<{
        id: number;
        name: string;
        sku: string;
        quantity: number;
        observations: string;
        sale_price: number;
        unit_measure: string;
    }>>([]);
    const [isSparePartModalOpen, setIsSparePartModalOpen] = useState(false);
    const [editingSparePart, setEditingSparePart] = useState<SparePart | undefined>();
    const [availableSpareParts, setAvailableSpareParts] = useState<SparePart[]>(spareParts);

    const { data, setData, post, put, errors } = useForm({
        description: maintenance?.description || '',
        client_id: maintenance?.client_id ? maintenance.client_id.toString() : '',
        equipment_id: maintenance?.equipment_id ? maintenance.equipment_id.toString() : '',
        priority: maintenance?.priority || 'green',
        type: maintenance?.type || 'preventive',
        status: maintenance?.status || 'pending',
        cost: maintenance?.cost ? maintenance.cost.toString() : ''
    });

    useEffect(() => {
        if (maintenance?.spare_parts) {
            const initialSpareParts = maintenance.spare_parts.map(sp => {
                const fullSparePartData = spareParts.find(s => s.id === sp.id);
                return {
                    id: sp.id,
                    name: sp.name,
                    sku: fullSparePartData?.sku || '',
                    quantity: sp.pivot.quantity,
                    observations: sp.pivot.observations || '',
                    sale_price: fullSparePartData?.sale_price || 0,
                    unit_measure: fullSparePartData?.unit_measure || 'Unit'
                };
            });
            setSelectedSpareParts(initialSpareParts);
        }
    }, [maintenance, spareParts]);

    const handleSparePartSuccess = (newSparePart: SparePart) => {
        setAvailableSpareParts(prev => {
            const existing = prev.find(sp => sp.id === newSparePart.id);
            if (existing) {
                return prev.map(sp => sp.id === newSparePart.id ? newSparePart : sp);
            } else {
                return [...prev, newSparePart];
            }
        });
    };

    const openSparePartModal = (sparePart?: SparePart) => {
        setEditingSparePart(sparePart);
        setIsSparePartModalOpen(true);
    };

    const closeSparePartModal = () => {
        setEditingSparePart(undefined);
        setIsSparePartModalOpen(false);
    };

    useEffect(() => {
        if (data.client_id) {
            const clientEquipment = equipment.filter(e => e.client_id === parseInt(data.client_id));
            setFilteredEquipment(clientEquipment);
            
            if (data.equipment_id && !clientEquipment.find(e => e.id === parseInt(data.equipment_id))) {
                setData('equipment_id', '');
            }
        } else {
            setFilteredEquipment([]);
            setData('equipment_id', '');
        }
    }, [data.client_id, data.equipment_id, equipment, setData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (method === 'post') {
            post(route(submitRoute));
        } else {
            put(route(submitRoute, maintenance?.id));
        }
    };

    // Agregar repuesto - Solo disponible en modo edición
    const addSparePart = async (sparePartId: number) => {
        const sparePart = availableSpareParts.find(sp => sp.id === sparePartId);
        if (!sparePart || selectedSpareParts.find(sp => sp.id === sparePartId)) {
            setSelectedSparePartValue(''); // Resetear el select
            return;
        }

        // Solo en modo EDICIÓN: Crear la relación inmediatamente vía API
        if (method === 'put' && maintenance?.id) {
            try {
                await axios.post(
                    route('maintenances.spare-parts.attach', maintenance.id),
                    {
                        spare_part_id: sparePartId,
                        quantity: 1,
                        observations: ''
                    }
                );

                // Agregar al estado local con los datos del servidor
                setSelectedSpareParts([...selectedSpareParts, {
                    id: sparePart.id!,
                    name: sparePart.name,
                    quantity: 1,
                    observations: '',
                    sale_price: sparePart.sale_price || 0,
                    unit_measure: sparePart.unit_measure,
                    sku: sparePart.sku
                }]);

                // Resetear el select después de agregar
                setSelectedSparePartValue('');
                setSparePartSearch('');

                console.log('Repuesto agregado exitosamente');
            } catch (error) {
                const errorMessage = error instanceof Error && 'response' in error
                    ? (error as any).response?.data?.message
                    : 'Error al agregar el repuesto';
                alert(errorMessage);
                console.error('Error:', error);
                setSelectedSparePartValue(''); // Resetear incluso si hay error
            }
        }
    };

    // Actualizar cantidad/observaciones - En edición actualiza vía API
    const updateSparePart = async (id: number, field: string, value: string | number) => {
        // Actualizar el estado local inmediatamente para UX responsivo
        setSelectedSpareParts(prev =>
            prev.map(sp => sp.id === id ? { ...sp, [field]: value } : sp)
        );

        // En modo EDICIÓN: Sincronizar con la API
        if (method === 'put' && maintenance?.id) {
            try {
                const updatedSparePart = selectedSpareParts.find(sp => sp.id === id);
                if (!updatedSparePart) return;

                await axios.put(
                    route('maintenances.spare-parts.update', [maintenance.id, id]),
                    {
                        quantity: field === 'quantity' ? value : updatedSparePart.quantity,
                        observations: field === 'observations' ? value : updatedSparePart.observations
                    }
                );
            } catch (error) {
                console.error('Error al actualizar:', error);
                // Opcional: revertir cambio si falla
            }
        }
    };

    // Eliminar repuesto - En modo edición elimina la relación vía API
    const removeSparePart = async (id: number) => {
        // En modo EDICIÓN: Eliminar relación vía API (detach)
        if (method === 'put' && maintenance?.id) {
            try {
                await axios.delete(
                    route('maintenances.spare-parts.detach', [maintenance.id, id])
                );

                // Eliminar del estado local tras confirmación del servidor
                setSelectedSpareParts(prev => prev.filter(sp => sp.id !== id));
                console.log('Repuesto eliminado exitosamente');
            } catch (error) {
                const errorMessage = error instanceof Error && 'response' in error
                    ? (error as any).response?.data?.message
                    : 'Error al eliminar el repuesto';
                alert(errorMessage);
                console.error('Error:', error);
            }
        } else {
            // En modo CREACIÓN: Solo eliminar del estado local
            setSelectedSpareParts(prev => prev.filter(sp => sp.id !== id));
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'red': return 'bg-red-500';
            case 'orange': return 'bg-orange-500';
            case 'yellow': return 'bg-yellow-500';
            case 'green': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <form id="maintenance-form" onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gray-600" />
                        {es['Basic Information']}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="client_id">{es['Client']} *</Label>
                            <Select value={data.client_id.toString()} onValueChange={(value) => setData('client_id', value)}>
                                <SelectTrigger>
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
                            {errors.client_id && <p className="text-red-500 text-sm mt-1">{errors.client_id}</p>}
                        </div>

                        <div>
                            <Label htmlFor="equipment_id">{es['Equipment']} *</Label>
                            <Select 
                                value={data.equipment_id.toString()} 
                                onValueChange={(value) => setData('equipment_id', value)}
                                disabled={!data.client_id}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={es['Select equipment']} />
                                </SelectTrigger>
                                <SelectContent>
                                    <div className="p-2 border-b">
                                        <Input
                                            placeholder={es['Search equipment...']}
                                            value={equipmentSearch}
                                            onChange={(e) => setEquipmentSearch(e.target.value)}
                                            className="h-8"
                                        />
                                    </div>
                                    {filteredEquipment
                                        .filter(eq => 
                                            equipmentSearch === '' || 
                                            eq.asset_tag.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
                                            eq.description.toLowerCase().includes(equipmentSearch.toLowerCase())
                                        )
                                        .map(eq => (
                                            <SelectItem key={eq.id} value={eq.id.toString()}>
                                                {eq.asset_tag} - {eq.description}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                            {errors.equipment_id && <p className="text-red-500 text-sm mt-1">{errors.equipment_id}</p>}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="description">{es['Description']} *</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={4}
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <Label htmlFor="priority">{es['Priority']} *</Label>
                            <Select value={data.priority} onValueChange={(value) => setData('priority', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {['green', 'yellow', 'orange', 'red'].map(priority => (
                                        <SelectItem key={priority} value={priority}>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full ${getPriorityColor(priority)}`}></div>
                                                {es[priority.charAt(0).toUpperCase() + priority.slice(1)] || priority}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="type">{es['Type']} *</Label>
                            <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="preventive">{es['Preventive']}</SelectItem>
                                    <SelectItem value="corrective">{es['Corrective']}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="status">{es['Status']} *</Label>
                            <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">{es['Pending']}</SelectItem>
                                    <SelectItem value="in_progress">{es['In Progress']}</SelectItem>
                                    <SelectItem value="completed">{es['Completed']}</SelectItem>
                                    <SelectItem value="rescheduled">{es['Rescheduled']}</SelectItem>
                                    <SelectItem value="cancelled">{es['Cancelled']}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="cost">
                                {es['Cost']}
                                {data.status === 'completed' && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            <Input
                                id="cost"
                                type="number"
                                step="0.01"
                                value={data.cost}
                                onChange={(e) => setData('cost', e.target.value)}
                                required={data.status === 'completed'}
                                className={data.status === 'completed' && !data.cost ? 'border-red-500' : ''}
                            />
                            {data.status === 'completed' && !data.cost && (
                                <p className="text-red-500 text-sm mt-1">
                                    {es['El campo costo es obligatorio cuando el estado es Finalizado']}
                                </p>
                            )}
                            {errors.cost && <p className="text-red-500 text-sm mt-1">{errors.cost}</p>}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* CUADRILLA DE MANTENIMIENTO Y REPUESTOS EN 2 COLUMNAS */}
            {method === 'put' && maintenance?.id && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <CrewAssignment
                        maintenanceId={maintenance.id}
                        availableTechnicians={technicians}
                        existingCrew={assignedCrew}
                    />

                    {/* REPUESTOS */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wrench className="h-5 w-5 text-gray-600" />
                                {es['Spare Parts']}
                                <span className="text-sm font-normal text-gray-500">
                                    ({selectedSpareParts.length})
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>{es['Add Spare Part']}</Label>
                                <div className="flex gap-2">
                                    <Select
                                        value={selectedSparePartValue}
                                        onValueChange={(value) => {
                                            setSelectedSparePartValue(value);
                                            addSparePart(parseInt(value));
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={es['Select spare part']} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <div className="p-2 border-b">
                                                <Input
                                                    placeholder={es['Search spare part...']}
                                                    value={sparePartSearch}
                                                    onChange={(e) => setSparePartSearch(e.target.value)}
                                                    className="h-8"
                                                />
                                            </div>
                                            {availableSpareParts
                                                .filter(sp =>
                                                    !selectedSpareParts.find(ssp => ssp.id === sp.id) &&
                                                    (sparePartSearch === '' ||
                                                     sp.name.toLowerCase().includes(sparePartSearch.toLowerCase()) ||
                                                     sp.sku.toLowerCase().includes(sparePartSearch.toLowerCase()))
                                                )
                                                .map(sparePart => (
                                                    <SelectItem key={sparePart.id} value={sparePart.id.toString()}>
                                                        {sparePart.name} - {sparePart.sku} (Stock: {sparePart.stock})
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openSparePartModal()}
                                        className="shrink-0"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {selectedSpareParts.length > 0 && (
                                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                                    {selectedSpareParts.map(sparePart => {
                                        const sparePartData = availableSpareParts.find(sp => sp.id === sparePart.id);
                                        const salePrice = Number(sparePart.sale_price) || 0;
                                        const quantity = Number(sparePart.quantity) || 0;
                                        const subtotal = quantity * salePrice;

                                        return (
                                            <div key={sparePart.id} className="border border-gray-200 rounded-lg p-2.5 hover:border-blue-300 hover:bg-blue-50/30 transition-all space-y-2">
                                                {/* Header con nombre, precio y acciones */}
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <h4 className="font-semibold text-sm text-gray-900 truncate" title={sparePart.name}>
                                                                {sparePart.name}
                                                            </h4>
                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 shrink-0">
                                                                {sparePart.sku}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <span className="text-gray-500">
                                                                ${salePrice.toFixed(2)}/{sparePart.unit_measure}
                                                            </span>
                                                            <span className="text-gray-400">•</span>
                                                            <span className="font-semibold text-blue-600">
                                                                Total: ${subtotal.toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1 shrink-0">
                                                        {sparePartData && (
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => openSparePartModal(sparePartData)}
                                                                className="h-6 w-6 p-0"
                                                                title="Editar repuesto"
                                                            >
                                                                <Edit className="h-3 w-3 text-gray-600" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => removeSparePart(sparePart.id)}
                                                            className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                                                            title="Eliminar"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Cantidad y Observaciones en una fila */}
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div>
                                                        <Label className="text-xs text-gray-600">{es['Quantity']}</Label>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={sparePart.quantity}
                                                            onChange={(e) => updateSparePart(sparePart.id, 'quantity', parseInt(e.target.value))}
                                                            className="h-8 mt-0.5"
                                                        />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <Label className="text-xs text-gray-600">{es['Observations']}</Label>
                                                        <Input
                                                            value={sparePart.observations}
                                                            onChange={(e) => updateSparePart(sparePart.id, 'observations', e.target.value)}
                                                            placeholder={es['Observations...']}
                                                            className="h-8 mt-0.5 text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {selectedSpareParts.length === 0 && (
                                <div className="text-center py-8 text-gray-400">
                                    <Wrench className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No hay repuestos agregados</p>
                                    <p className="text-xs text-gray-400 mt-1">Selecciona repuestos del menú superior</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {method === 'put' && (
                <FileUploadSection
                    maintenanceId={maintenance?.id}
                    existingImages={maintenance?.images || []}
                    existingDocuments={maintenance?.documents || []}
                />
            )}

            <SparePartModal
                isOpen={isSparePartModalOpen}
                onClose={closeSparePartModal}
                sparePart={editingSparePart}
                onSuccess={handleSparePartSuccess}
            />
        </form>
    );
}