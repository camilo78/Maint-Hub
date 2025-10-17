import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    ArrowLeft,
    Edit,
    Wrench,
    User,
    Calendar,
    FileText,
    Users,
    Crown,
    Monitor,
    DollarSign,
    AlertCircle,
    Package,
    Image as ImageIcon,
    File
} from 'lucide-react';
import es from '@/lang/es';

type Client = {
    id: number;
    name: string;
    email?: string;
    phone?: string;
};

type Equipment = {
    id: number;
    description: string;
    asset_tag: string;
    brand?: string;
    model?: string;
    serial_number?: string;
    category?: string;
    location?: string;
    client?: Client;
};

type SparePart = {
    id: number;
    name: string;
    sku: string;
    sale_price: number;
    unit_measure: string;
    pivot: {
        quantity: number;
        observations?: string;
    };
};

type CrewMember = {
    id: number;
    name: string;
    email?: string;
    employee_id?: string;
    career?: string;
    is_leader: boolean;
};

type MaintenanceImage = {
    id: number;
    path: string;
    original_name: string;
};

type MaintenanceDocument = {
    id: number;
    path: string;
    original_name: string;
    mime_type?: string;
};

type Maintenance = {
    id: number;
    description: string;
    priority: string;
    type: string;
    status: string;
    cost?: number;
    client_id: number;
    equipment_id: number;
    client: Client;
    equipment: Equipment;
    spare_parts: SparePart[];
    crew: CrewMember[];
    images: MaintenanceImage[];
    documents: MaintenanceDocument[];
    created_at: string;
    updated_at: string;
};

type Props = {
    maintenance: Maintenance;
};

export default function Show({ maintenance }: Props) {
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'red': return 'bg-red-600 text-white border-red-600';
            case 'orange': return 'bg-orange-600 text-white border-orange-600';
            case 'yellow': return 'bg-yellow-600 text-white border-yellow-600';
            case 'green': return 'bg-green-600 text-white border-green-600';
            default: return 'bg-gray-600 text-white border-gray-600';
        }
    };

    const getPriorityName = (priority: string) => {
        switch (priority) {
            case 'red': return es['Red'];
            case 'orange': return es['Orange'];
            case 'yellow': return es['Yellow'];
            case 'green': return es['Green'];
            default: return priority;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-gray-100 text-gray-800 border-gray-300';
            case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'completed': return 'bg-green-100 text-green-800 border-green-300';
            case 'rescheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getStatusName = (status: string) => {
        switch (status) {
            case 'pending': return es['Pending'];
            case 'in_progress': return es['In Progress'];
            case 'completed': return es['Completed'];
            case 'rescheduled': return es['Rescheduled'];
            case 'cancelled': return es['Cancelled'];
            default: return status;
        }
    };

    const getTypeName = (type: string) => {
        switch (type) {
            case 'preventive': return es['Preventive'];
            case 'corrective': return es['Corrective'];
            default: return type;
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: es['Dashboard'], href: '/dashboard' },
        { title: es['Maintenances'] || 'Mantenimientos', href: '/maintenances' },
        { title: `#${maintenance.id}`, href: `/maintenances/${maintenance.id}` },
    ];

    const totalSparePartsCost = maintenance.spare_parts?.reduce((total, sparePart) => {
        return total + (Number(sparePart.sale_price) * Number(sparePart.pivot.quantity));
    }, 0) || 0;

    const laborCost = Number(maintenance.cost) || 0;
    const totalCost = laborCost + totalSparePartsCost;

    const leader = maintenance.crew?.find(member => member.is_leader);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${es['Maintenance']}: #${maintenance.id}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border bg-background relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border p-4 md:min-h-min">
                    <div className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10" />
                    </div>

                    <div className="relative z-10 space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {es['Maintenance']} #{maintenance.id}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {es['Created on']} {new Date(maintenance.created_at).toLocaleDateString(es['locale'], {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" className="hover:bg-gray-100 dark:hover:bg-gray-800" asChild>
                                    <Link href="/maintenances">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        {es['Go Back']}
                                    </Link>
                                </Button>
                                <Button asChild>
                                    <Link href={`/maintenances/${maintenance.id}/edit`}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        {es['Edit']}
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column - Main Info */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Basic Information */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
                                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                        <FileText className="h-5 w-5" />
                                        {es['Basic Information']}
                                    </h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                {es['Description']}
                                            </label>
                                            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1 leading-relaxed">
                                                {maintenance.description || es['Not specified']}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    {es['Priority']}
                                                </label>
                                                <div className="mt-1">
                                                    <Badge variant="outline" className={getPriorityColor(maintenance.priority)}>
                                                        {getPriorityName(maintenance.priority)}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    {es['Type']}
                                                </label>
                                                <div className="mt-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        {getTypeName(maintenance.type)}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    {es['Status']}
                                                </label>
                                                <div className="mt-1">
                                                    <Badge variant="outline" className={getStatusColor(maintenance.status)}>
                                                        {getStatusName(maintenance.status)}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Client & Equipment Information */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
                                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                        <Monitor className="h-5 w-5" />
                                        {es['Client']} & {es['Equipment']}
                                    </h2>
                                    <div className="space-y-4">
                                        {/* Cliente */}
                                        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <User className="h-5 w-5 text-blue-600" />
                                            <div className="flex-1">
                                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    {es['Client']}
                                                </label>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {maintenance.client?.name}
                                                </p>
                                                {(maintenance.client?.email || maintenance.client?.phone) && (
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                        {maintenance.client?.email} {maintenance.client?.phone && `• ${maintenance.client.phone}`}
                                                    </p>
                                                )}
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/admin/clients/${maintenance.client.id}`}>
                                                    {es['View']}
                                                </Link>
                                            </Button>
                                        </div>

                                        {/* Equipo */}
                                        <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                            <Monitor className="h-5 w-5 text-green-600" />
                                            <div className="flex-1">
                                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    {es['Equipment']}
                                                </label>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {maintenance.equipment?.asset_tag} - {maintenance.equipment?.description}
                                                </p>
                                                {(maintenance.equipment?.brand || maintenance.equipment?.model) && (
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                        {maintenance.equipment?.brand} {maintenance.equipment?.model}
                                                    </p>
                                                )}
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/equipment/${maintenance.equipment.id}`}>
                                                    {es['View']}
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Cuadrilla de Mantenimiento */}
                                {maintenance.crew && maintenance.crew.length > 0 && (
                                    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
                                        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                            <Users className="h-5 w-5" />
                                            {es['Maintenance Crew']}
                                            <span className="text-sm font-normal text-gray-500">
                                                ({maintenance.crew.length})
                                            </span>
                                        </h2>

                                        {leader && (
                                            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Crown className="h-4 w-4 text-yellow-600" />
                                                    <span className="text-xs font-semibold text-yellow-800 dark:text-yellow-400">
                                                        {es['Team Leader']}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                    {leader.name}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                    {leader.email && <span>{leader.email}</span>}
                                                    {leader.employee_id && <span>• ID: {leader.employee_id}</span>}
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            {maintenance.crew.map(member => (
                                                <div
                                                    key={member.id}
                                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <User className="h-4 w-4 text-gray-500 shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                    {member.name}
                                                                </p>
                                                                {member.is_leader && (
                                                                    <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-700 border-yellow-300">
                                                                        <Crown className="h-3 w-3 mr-1" />
                                                                        {es['Leader']}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                                                {member.email && <span>{member.email}</span>}
                                                                {member.employee_id && <span>• ID: {member.employee_id}</span>}
                                                                {member.career && <span>• {member.career}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/admin/employees/${member.id}`}>
                                                            {es['View']}
                                                        </Link>
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Repuestos Utilizados */}
                                {maintenance.spare_parts && maintenance.spare_parts.length > 0 && (
                                    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
                                        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                            <Wrench className="h-5 w-5" />
                                            {es['Spare Parts']}
                                            <span className="text-sm font-normal text-gray-500">
                                                ({maintenance.spare_parts.length})
                                            </span>
                                        </h2>
                                        <div className="space-y-2">
                                            {maintenance.spare_parts.map(sparePart => {
                                                const quantity = Number(sparePart.pivot.quantity) || 0;
                                                const salePrice = Number(sparePart.sale_price) || 0;
                                                const subtotal = quantity * salePrice;

                                                return (
                                                    <div key={sparePart.id} className="border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                                                    {sparePart.name}
                                                                </p>
                                                                <Badge variant="outline" className="text-xs shrink-0">
                                                                    {sparePart.sku}
                                                                </Badge>
                                                            </div>
                                                            <div className="text-sm font-semibold text-blue-600 shrink-0">
                                                                ${subtotal.toFixed(2)}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                                                            <span>
                                                                {es['Quantity']}: <strong className="text-gray-900 dark:text-gray-100">{quantity}</strong>
                                                            </span>
                                                            <span>•</span>
                                                            <span>
                                                                ${salePrice.toFixed(2)}/{sparePart.unit_measure}
                                                            </span>
                                                        </div>
                                                        {sparePart.pivot.observations && (
                                                            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded">
                                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                    <span className="font-medium">{es['Observations']}:</span> {sparePart.pivot.observations}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Imágenes */}
                                {maintenance.images && maintenance.images.length > 0 && (
                                    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
                                        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                            <ImageIcon className="h-5 w-5" />
                                            {es['Images']}
                                            <span className="text-sm font-normal text-gray-500">
                                                ({maintenance.images.length})
                                            </span>
                                        </h2>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                            {maintenance.images.map(image => (
                                                <a
                                                    key={image.id}
                                                    href={`/storage/${image.path}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-blue-500 transition-colors"
                                                >
                                                    <img
                                                        src={`/storage/${image.path}`}
                                                        alt={image.original_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center">
                                                        <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">
                                                            {es['View']}
                                                        </span>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Documentos */}
                                {maintenance.documents && maintenance.documents.length > 0 && (
                                    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
                                        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                            <File className="h-5 w-5" />
                                            {es['Documents']}
                                            <span className="text-sm font-normal text-gray-500">
                                                ({maintenance.documents.length})
                                            </span>
                                        </h2>
                                        <div className="space-y-2">
                                            {maintenance.documents.map(document => (
                                                <a
                                                    key={document.id}
                                                    href={`/storage/${document.path}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-500 transition-all"
                                                >
                                                    <File className="h-5 w-5 text-gray-500 shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                            {document.original_name}
                                                        </p>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Additional Info */}
                            <div className="space-y-6">
                                {/* Cost Summary */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
                                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                        <DollarSign className="h-5 w-5" />
                                        {es['Costs']}
                                    </h2>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {es['Labor Cost']}
                                            </span>
                                            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                ${laborCost.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {es['Spare Parts']}
                                            </span>
                                            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                ${totalSparePartsCost.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-2 border-purple-300 dark:border-purple-700">
                                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {es['Total']}
                                            </span>
                                            <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                                ${totalCost.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Important Dates */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
                                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                        <Calendar className="h-5 w-5" />
                                        {es['Important Dates']}
                                    </h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                {es['Created on']}
                                            </label>
                                            <p className="text-base text-gray-900 dark:text-gray-100 mt-1">
                                                {new Date(maintenance.created_at).toLocaleDateString(es['locale'], {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                {es['Last Update']}
                                            </label>
                                            <p className="text-base text-gray-900 dark:text-gray-100 mt-1">
                                                {new Date(maintenance.updated_at).toLocaleDateString(es['locale'], {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                {(maintenance.crew?.length > 0 || maintenance.spare_parts?.length > 0 || maintenance.images?.length > 0) && (
                                    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
                                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                            <Package className="h-5 w-5" />
                                            {es['Statistics']}
                                        </h2>
                                        <div className="space-y-3">
                                            {maintenance.crew && maintenance.crew.length > 0 && (
                                                <div className="flex items-center justify-between p-2 rounded">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                                        <Users className="h-4 w-4" />
                                                        {es['Crew Members']}
                                                    </span>
                                                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                        {maintenance.crew.length}
                                                    </span>
                                                </div>
                                            )}
                                            {maintenance.spare_parts && maintenance.spare_parts.length > 0 && (
                                                <div className="flex items-center justify-between p-2 rounded">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                                        <Wrench className="h-4 w-4" />
                                                        {es['Spare Parts']}
                                                    </span>
                                                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                        {maintenance.spare_parts.length}
                                                    </span>
                                                </div>
                                            )}
                                            {maintenance.images && maintenance.images.length > 0 && (
                                                <div className="flex items-center justify-between p-2 rounded">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                                        <ImageIcon className="h-4 w-4" />
                                                        {es['Images']}
                                                    </span>
                                                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                        {maintenance.images.length}
                                                    </span>
                                                </div>
                                            )}
                                            {maintenance.documents && maintenance.documents.length > 0 && (
                                                <div className="flex items-center justify-between p-2 rounded">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                                        <File className="h-4 w-4" />
                                                        {es['Documents']}
                                                    </span>
                                                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                        {maintenance.documents.length}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
