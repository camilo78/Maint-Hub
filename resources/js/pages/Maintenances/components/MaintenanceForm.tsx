import { useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Trash2, Plus, Edit } from 'lucide-react';
import SparePartModal from './SparePartModal';
import FileUploadSection from './FileUploadSection';
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
    id: number;
    name: string;
    sku: string;
    sale_price: number;
    stock: number;
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
    submitRoute: string;
    method: 'post' | 'put';
}

export default function MaintenanceForm({ 
    maintenance, 
    clients, 
    equipment, 
    spareParts, 
    submitRoute, 
    method 
}: Props) {
    const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
    const [equipmentSearch, setEquipmentSearch] = useState('');
    const [sparePartSearch, setSparePartSearch] = useState('');
    const [selectedSpareParts, setSelectedSpareParts] = useState<Array<{
        id: number;
        name: string;
        quantity: number;
        observations: string;
        sale_price: number;
    }>>([]);
    const [isSparePartModalOpen, setIsSparePartModalOpen] = useState(false);
    const [editingSparePart, setEditingSparePart] = useState<SparePart | undefined>();
    const [availableSpareParts, setAvailableSpareParts] = useState<SparePart[]>(spareParts);

    const { data, setData, post, put, processing, errors } = useForm({
        description: maintenance?.description || '',
        client_id: maintenance?.client_id ? maintenance.client_id.toString() : '',
        equipment_id: maintenance?.equipment_id ? maintenance.equipment_id.toString() : '',
        priority: maintenance?.priority || 'green',
        type: maintenance?.type || 'preventive',
        status: maintenance?.status || 'pending',
        cost: maintenance?.cost ? maintenance.cost.toString() : '',
        spare_parts: [],
        images: [],
        documents: []
    });

    useEffect(() => {
        if (maintenance?.spare_parts) {
            const initialSpareParts = maintenance.spare_parts.map(sp => ({
                id: sp.id,
                name: sp.name,
                quantity: sp.pivot.quantity,
                observations: sp.pivot.observations || '',
                sale_price: spareParts.find(s => s.id === sp.id)?.sale_price || 0
            }));
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
    }, [data.client_id, equipment]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Update data with spare parts before submission
        setData({
            ...data,
            spare_parts: selectedSpareParts.map(sp => ({
                id: sp.id,
                quantity: sp.quantity,
                observations: sp.observations
            }))
        });

        if (method === 'post') {
            post(route(submitRoute));
        } else {
            put(route(submitRoute, maintenance?.id));
        }
    };

    // Agregar repuesto - En modo edición usa API, en modo creación usa estado local
    const addSparePart = async (sparePartId: number) => {
        const sparePart = availableSpareParts.find(sp => sp.id === sparePartId);
        if (!sparePart || selectedSpareParts.find(sp => sp.id === sparePartId)) {
            return;
        }

        // En modo EDICIÓN: Crear la relación inmediatamente vía API
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
                    id: sparePart.id,
                    name: sparePart.name,
                    quantity: 1,
                    observations: '',
                    sale_price: sparePart.sale_price
                }]);

                // Mensaje de éxito (opcional)
                console.log('Repuesto agregado exitosamente');
            } catch (error) {
                const errorMessage = error instanceof Error && 'response' in error
                    ? (error as any).response?.data?.message
                    : 'Error al agregar el repuesto';
                alert(errorMessage);
                console.error('Error:', error);
            }
        } else {
            // En modo CREACIÓN: Solo agregar al estado local
            setSelectedSpareParts([...selectedSpareParts, {
                id: sparePart.id,
                name: sparePart.name,
                quantity: 1,
                observations: '',
                sale_price: sparePart.sale_price
            }]);
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
        if (!confirm('¿Está seguro de eliminar este repuesto?')) {
            return;
        }

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
                    <CardTitle>{es['Basic Information']}</CardTitle>
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
                            <Label htmlFor="cost">{es['Cost']}</Label>
                            <Input
                                id="cost"
                                type="number"
                                step="0.01"
                                value={data.cost}
                                onChange={(e) => setData('cost', e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* SOLO MOSTRAR REPUESTOS EN MODO EDICIÓN */}
            {method === 'put' && maintenance?.id && (
                <Card>
                    <CardHeader>
                        <CardTitle>{es['Spare Parts']}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Label>{es['Add Spare Part']}</Label>
                                <Select onValueChange={(value) => {
                                    addSparePart(parseInt(value));
                                    setSparePartSearch('');
                                }}>
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
                            </div>
                            <div className="pt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openSparePartModal()}
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    {es['New Spare Part']}
                                </Button>
                            </div>
                        </div>

                        {selectedSpareParts.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-2">{es['Spare Parts']}</th>
                                            <th className="text-left p-2">{es['Quantity']}</th>
                                            <th className="text-left p-2">{es['Unit Price']}</th>
                                            <th className="text-left p-2">{es['Subtotal']}</th>
                                            <th className="text-left p-2">{es['Observations']}</th>
                                            <th className="text-left p-2">{es['Actions']}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedSpareParts.map(sparePart => {
                                            const sparePartData = availableSpareParts.find(sp => sp.id === sparePart.id);
                                            return (
                                            <tr key={sparePart.id} className="border-b">
                                                <td className="p-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium">{sparePart.name}</span>
                                                        {sparePartData && (
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => openSparePartModal(sparePartData)}
                                                                className="h-6 w-6 p-0"
                                                            >
                                                                <Edit className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-2">
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={sparePart.quantity}
                                                        onChange={(e) => updateSparePart(sparePart.id, 'quantity', parseInt(e.target.value))}
                                                        className="w-20"
                                                    />
                                                </td>
                                                <td className="p-2">${sparePart.sale_price}</td>
                                                <td className="p-2 font-medium">${(sparePart.quantity * sparePart.sale_price).toFixed(2)}</td>
                                                <td className="p-2">
                                                    <Input
                                                        value={sparePart.observations}
                                                        onChange={(e) => updateSparePart(sparePart.id, 'observations', e.target.value)}
                                                        placeholder={es['Observations...']}
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => removeSparePart(sparePart.id)}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </td>
                                            </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
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