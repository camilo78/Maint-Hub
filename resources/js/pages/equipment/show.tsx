import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import QRLabelDesign from '@/components/qr-label-design';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft, Edit, Monitor, User, Calendar, Shield, FileText, Settings } from 'lucide-react';
import es from '@/lang/es';


type Client = {
    id: number;
    name: string;
    email: string;
    phone: string;
};

type Equipment = {
    id: number;
    client_id: number;
    category: string;
    brand: string;
    model: string;
    serial_number: string;
    location: string;
    status: string;
    installation_date: string;
    warranty_expires_on: string;
    notes: string;
    specifications: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    client: Client;
    description?: string;
    asset_tag?: string;
};

type Props = {
    equipment: Equipment;
};

export default function Show({ equipment }: Props) {
    const getStatusName = (status: string) => {
        switch(status) {
            case 'mantenimiento': return es['Maintenance'];
            case 'buen_estado': return es['Good Condition'];
            case 'mal_estado': return es['Bad Condition'];
            default: return status.charAt(0).toUpperCase() + status.slice(1);
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: es['Dashboard'], href: '/dashboard' },
        { title: es['Equipment'], href: '/admin/equipment' },
        { title: `${equipment.brand} ${equipment.model}`, href: `/admin/equipment/${equipment.id}` },
    ];


    const getStatusColor = (status: string) => {
        switch (status) {
            case 'buen_estado':
                return 'bg-green-500 text-gray-800 border-green-500';
            case 'mal_estado':
                return 'bg-red-500 border-red-500';
            case 'mantenimiento':
                return 'bg-orange-500 text-white border-orange-500';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${es['Equipment']}: ${equipment.brand} ${equipment.model}`} />
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
                                    {equipment.brand} {equipment.model}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {es['Registered on']} {new Date(equipment.created_at).toLocaleDateString(es['locale'], {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" className="hover:bg-gray-100 dark:hover:bg-gray-800" asChild>
                                    <Link href="/equipment">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        {es['Go Back']}
                                    </Link>
                                </Button>
                                <Button asChild>
                                    <Link href={`/equipment/${equipment.id}/edit`}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        {es['Edit']}
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column - Basic Info */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Basic Information */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
                                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                        <Monitor className="h-5 w-5" />
                                        {es['Basic Information']}
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                {es['Brand']}
                                            </label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                                                {equipment.brand || es['Not specified']}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                {es['Model']}
                                            </label>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                                                {equipment.model || es['Not specified']}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                {es['Serial Number']}
                                            </label>
                                            <p className="text-sm font-mono font-bold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded border mt-1">
                                                {equipment.serial_number || es['Not specified']}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                {es['Category']}
                                            </label>
                                            <div className="mt-1">
                                                <Badge variant="outline" className="text-xs">
                                                    {equipment.category}
                                                </Badge>
                                            </div>
                                        </div>
                                        {equipment.description && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    Descripción
                                                </label>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                                                    {equipment.description}
                                                </p>
                                            </div>
                                        )}
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                {es['Status']}
                                            </label>
                                            <div className="mt-1">
                                                <Badge variant="outline" className={getStatusColor(equipment.status)}>
                                                    {getStatusName(equipment.status)}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                {es['Location']}
                                            </label>
                                            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                                                {equipment.location}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Client Information */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
                                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                        <User className="h-5 w-5" />
                                        {es['Client Assigned']}
                                    </h2>
                                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <User className="h-5 w-5 text-blue-600" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {equipment.client.name}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                {equipment.client.email} • {equipment.client.phone}
                                            </p>
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/admin/clients/${equipment.client.id}`}>
                                                {es['View']} {es['Client']}
                                            </Link>
                                        </Button>
                                    </div>
                                </div>

                                {/* Specifications */}
                                {equipment.specifications && Object.keys(equipment.specifications).length > 0 && (
                                    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
                                        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                            <Settings className="h-5 w-5" />
                                            {es['Technical Specifications']}
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {Object.entries(equipment.specifications).map(([key, value]) => (
                                                <div key={key} className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize block">
                                                        {key.replace(/_/g, ' ')}
                                                    </label>
                                                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                                                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Notes */}
                                {equipment.notes && (
                                    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
                                        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                            <FileText className="h-5 w-5" />
                                            {es['Notes']}
                                        </h2>
                                        <div 
                                            className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert"
                                            dangerouslySetInnerHTML={{ __html: equipment.notes }}
                                        />
                                    </div>
                                )}

                            </div>

                            {/* Right Column - Additional Info */}
                            <div className="space-y-6">
                                {/* Asset Tag */}
                                {equipment.asset_tag && (
                                    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
                                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                            <Shield className="h-5 w-5" />
                                            {es['Tag']}
                                        </h2>
                                        <div className="space-y-4">
                                            <div className="flex justify-center">
                                                <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm">
                                                    <div className="mb-3">
                                                        <img 
                                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`Tag: ${equipment.asset_tag}\nMarca: ${equipment.brand}\nModelo: ${equipment.model}\nSerie: ${equipment.serial_number}\nCategoría: ${equipment.category}${equipment.description ? '\nDescripción: ' + equipment.description : ''}\nUbicación: ${equipment.location}\nEstado: ${getStatusName(equipment.status)}\nURL: ${window.location.origin}/equipment/${equipment.id}`)}`}
                                                            alt="QR Code"
                                                            className="w-24 h-24 border-2 border-gray-300 rounded"
                                                        />
                                                    </div>
                                                    <div className="space-y-1 text-center">
                                                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{equipment.asset_tag}</div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">{equipment.brand} {equipment.model}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-500">Serie: {equipment.serial_number}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <QRLabelDesign equipment={equipment} />
                                        </div>
                                    </div>
                                )}
                                
                                {/* Dates */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
                                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                        <Calendar className="h-5 w-5" />
                                        {es['Important Dates']}
                                    </h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                {es['Installation Date']}
                                            </label>
                                            <p className="text-base text-gray-900 dark:text-gray-100 mt-1">
                                                {equipment.installation_date ? 
                                                    new Date(equipment.installation_date).toLocaleDateString(es['locale'], {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    }) : es['Not specified']
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                {es['Warranty Expires On']}
                                            </label>
                                            <p className="text-base text-gray-900 dark:text-gray-100 mt-1">
                                                {equipment.warranty_expires_on ? 
                                                    new Date(equipment.warranty_expires_on).toLocaleDateString(es['locale'], {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    }) : es['Not specified']
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                {es['Registration Date']}
                                            </label>
                                            <p className="text-base text-gray-900 dark:text-gray-100 mt-1">
                                                {new Date(equipment.created_at).toLocaleDateString(es['locale'], {
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
                                                {new Date(equipment.updated_at).toLocaleDateString(es['locale'], {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}