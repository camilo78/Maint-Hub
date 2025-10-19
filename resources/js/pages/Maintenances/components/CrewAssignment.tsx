import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Crown, X, Loader2, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface CrewMember {
    id: number;
    name: string;
    email?: string;
    employee_id?: string;
    is_leader: boolean;
}

interface Technician {
    id: number;
    name: string;
    email?: string;
    employee_id?: string;
}

interface Props {
    maintenanceId?: number;
    availableTechnicians: Technician[];
    existingCrew: CrewMember[];
}

export default function CrewAssignment({ maintenanceId, availableTechnicians, existingCrew }: Props) {
    const [crew, setCrew] = useState<CrewMember[]>(existingCrew || []);
    const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
    const [loading, setLoading] = useState(false);
    const [technicianSearch, setTechnicianSearch] = useState('');

    const handleAssignTechnician = async (technicianId: number) => {
        if (!maintenanceId) return;

        setLoading(true);
        try {
            const response = await window.axios.post(
                route('maintenances.crew.assign', maintenanceId),
                { user_id: technicianId }
            );
            setCrew(response.data.crew);
            setSelectedTechnicianId('');
            setTechnicianSearch('');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Error al asignar técnico';
            alert(errorMessage);
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveTechnician = async (userId: number) => {
        if (!maintenanceId || !confirm('¿Eliminar este técnico de la cuadrilla?')) return;

        setLoading(true);
        try {
            const response = await window.axios.delete(
                route('maintenances.crew.remove', [maintenanceId, userId])
            );
            setCrew(response.data.crew);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Error al eliminar técnico';
            alert(errorMessage);
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeLeader = async (userId: number) => {
        if (!maintenanceId) return;

        setLoading(true);
        try {
            const response = await window.axios.post(
                route('maintenances.crew.change-leader', maintenanceId),
                { user_id: userId }
            );
            setCrew(response.data.crew);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Error al cambiar líder';
            alert(errorMessage);
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const availableForAssignment = availableTechnicians.filter(
        tech => !crew.find(member => member.id === tech.id)
    );

    const filteredTechnicians = availableForAssignment.filter(tech =>
        technicianSearch === '' ||
        tech.name.toLowerCase().includes(technicianSearch.toLowerCase()) ||
        tech.employee_id?.toLowerCase().includes(technicianSearch.toLowerCase())
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-600" />
                    Cuadrilla de Mantenimiento
                    <span className="text-sm font-normal text-gray-500">
                        ({crew.length})
                    </span>
                    {loading && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {!maintenanceId ? (
                    <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                        <p className="text-sm text-yellow-800">
                            Guarda el mantenimiento primero para asignar la cuadrilla
                        </p>
                    </div>
                ) : (
                    <>
                        <div>
                            <Label>Agregar Técnico</Label>
                            <Select
                                value={selectedTechnicianId}
                                onValueChange={(value) => {
                                    setSelectedTechnicianId(value);
                                    handleAssignTechnician(parseInt(value));
                                }}
                                disabled={loading || availableForAssignment.length === 0}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={
                                        availableForAssignment.length === 0
                                            ? "Todos los técnicos están asignados"
                                            : "Seleccionar técnico..."
                                    } />
                                </SelectTrigger>
                                <SelectContent>
                                    <div className="p-2 border-b">
                                        <Input
                                            placeholder="Buscar técnico..."
                                            value={technicianSearch}
                                            onChange={(e) => setTechnicianSearch(e.target.value)}
                                            onKeyDown={(e) => e.stopPropagation()}
                                            onClick={(e) => e.stopPropagation()}
                                            className="h-8"
                                        />
                                    </div>
                                    {filteredTechnicians.length === 0 ? (
                                        <div className="p-4 text-center text-sm text-gray-500">
                                            No se encontraron técnicos
                                        </div>
                                    ) : (
                                        filteredTechnicians.map(tech => (
                                            <SelectItem key={tech.id} value={tech.id.toString()}>
                                                {tech.name}
                                                {tech.employee_id && <span className="text-gray-500"> - ID: {tech.employee_id}</span>}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {crew.length > 0 && (
                            <div className="space-y-2">
                                {crew.map(member => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-800 hover:text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <span className="text-sm font-medium flex items-center gap-2">
                                                    {member.name}
                                                    {member.is_leader && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                                                            <Crown className="h-3 w-3" />
                                                            Líder
                                                        </span>
                                                    )}
                                                </span>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {member.email && (
                                                        <span className="text-xs text-gray-500 truncate">{member.email}</span>
                                                    )}
                                                    {member.employee_id && (
                                                        <span className="text-xs text-gray-500">ID: {member.employee_id}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {!member.is_leader && (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleChangeLeader(member.id)}
                                                    disabled={loading}
                                                    className="h-8 w-8 p-0"
                                                    title="Hacer líder"
                                                >
                                                    <Crown className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleRemoveTechnician(member.id)}
                                                disabled={loading}
                                                className="h-8 w-8 p-0"
                                                title="Eliminar de la cuadrilla"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {crew.length === 0 && !loading && (
                            <div className="text-center py-8 text-gray-400">
                                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No hay técnicos asignados</p>
                                <p className="text-xs text-gray-400 mt-1">Selecciona técnicos del menú superior</p>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
