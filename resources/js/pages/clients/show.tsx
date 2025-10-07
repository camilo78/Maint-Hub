import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import BulkQRGenerator from '@/components/bulk-qr-generator';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft, Edit, Mail, Phone, MapPin, FileText, Calendar, Shield, Monitor, Search, Eye } from 'lucide-react';
import es from '@/lang/es';
import { useState, useEffect, useCallback } from 'react';

type Role = {
    id: number;
    name: string;
};

type User = {
    id: number;
    name: string;
    email: string;
    phone: string;
    tipo: string;
    rtn_dni_passport: string;
    address: string;
    email_verified_at: string | null;
    roles: Role[];
    permissions: { id: number; name: string }[];
    created_at: string;
    updated_at: string;
};

type Equipment = {
    id: number;
    asset_tag: string;
    brand: string;
    model: string;
    serial_number: string;
    category: string;
    location: string;
    status: string;
    installation_date: string;
    warranty_expires_on: string;
    specifications: any;
    notes: string;
    created_at: string;
};

type Props = {
    user: User;
    equipment: {
        data: Equipment[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: any[];
    };
    equipment_search: string;
    show_all: boolean;
};

export default function Show({ user, equipment, equipment_search, show_all }: Props) {
    const [search, setSearch] = useState(equipment_search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params: any = {};
        if (search.trim()) {
            params.equipment_search = search.trim();
        }
        if (show_all) {
            params.show_all = '1';
        }
        router.get(window.location.pathname, params, { preserveState: true });
    };
    const breadcrumbs: BreadcrumbItem[] = [
        { title: es['Dashboard'], href: '/dashboard' },
        { title: es['Clients'], href: '/admin/clients' },
        { title: user.name, href: `/admin/clients/${user.id}` },
    ];

    const getTypeInfo = (tipo: string) => {
        switch (tipo) {
            case 'corporativo':
                return {
                    label: 'Corporativo',
                    color: 'bg-blue-100 text-blue-800 border-blue-300',
                    docType: 'RTN'
                };
            case 'extranjero':
                return {
                    label: 'Extranjero',
                    color: 'bg-purple-100 text-purple-800 border-purple-300',
                    docType: 'Pasaporte'
                };
            default:
                return {
                    label: 'Particular',
                    color: 'bg-green-100 text-green-800 border-green-300',
                    docType: 'DNI'
                };
        }
    };

    const typeInfo = getTypeInfo(user.tipo);

    const getStatusInfo = (status: string) => {
        switch(status) {
            case 'buen_estado':
                return {
                    label: 'Buen Estado',
                    className: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                };
            case 'mal_estado':
                return {
                    label: 'Mal Estado',
                    className: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                };
            case 'en_reparacion':
                return {
                    label: 'En Reparación',
                    className: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
                };
            default:
                return {
                    label: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
                    className: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
                };
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Cliente: ${user.name}`} />
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
                                    {user.name}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {es['Client since']} {new Date(user.created_at).toLocaleDateString(es['locale'], {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" className="hover:bg-gray-100 dark:hover:bg-gray-800" asChild>
                                    <Link href="/admin/clients">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        {es['Back']}
                                    </Link>
                                </Button>
                                <Button asChild>
                                    <Link href={`/admin/clients/${user.id}/edit`}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Editar
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column - Basic Info */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Personal Information */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
                                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                        <FileText className="h-5 w-5" />
                                        {es['Personal Information']}
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                {es['Full Name']}
                                            </label>
                                            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                                {user.name}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                {es['Client Type']}
                                            </label>
                                            <div className="mt-1">
                                                <Badge variant="outline" className={typeInfo.color}>
                                                    {typeInfo.label}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                {typeInfo.docType}
                                            </label>
                                            <p className="text-sm font-mono font-bold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded border mt-1">
                                                {user.rtn_dni_passport}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                {es['Email Status']}
                                            </label>
                                            <div className="mt-1">
                                                <Badge variant={user.email_verified_at ? "default" : "secondary"}>
                                                    {user.email_verified_at ? es['Verified'] : es['Unverified']}
                                                </Badge>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
                                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                        <Phone className="h-5 w-5" />
                                        {es['Contact Information']}
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                                <Phone className="h-6 w-6 text-blue-600" />
                                                <div className="flex-1">
                                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                        {es['Phone']}
                                                    </label>
                                                    <p className="text-base font-medium">
                                                        <a href={`tel:${user.phone}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                                                            {user.phone}
                                                        </a>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                                <Mail className="h-6 w-6 text-green-600" />
                                                <div className="flex-1">
                                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                        Email
                                                    </label>
                                                    <p className="text-base font-medium">
                                                        {user.email ? (
                                                            <a href={`mailto:${user.email}`} className="text-green-600 hover:text-green-800 hover:underline">
                                                                {user.email}
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-500 italic">{es['No email registered']}</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                            <MapPin className="h-5 w-5 text-yellow-600 mt-1" />
                                            <div className="flex-1">
                                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    {es['Direction']}
                                                </label>
                                                <p className="text-sm text-gray-900 dark:text-gray-100 mt-1 leading-relaxed">
                                                    {user.address || <span className="text-gray-500 italic">{es['No address registered']}</span>}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Equipment */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
                                    <div className="space-y-4 mb-4">
                                        <h2 className="text-lg font-semibold flex items-center gap-2">
                                            <Monitor className="h-5 w-5" />
                                            {es['Assigned Equipment']} ({equipment.total})
                                        </h2>
                                        
                                        {/* Fila de Botones */}
                                        <div className="flex flex-wrap gap-2 justify-between items-center">
                                            <div className="flex gap-2 flex-wrap">
                                                {equipment.data.length > 0 && (
                                                    <BulkQRGenerator equipment={equipment.data} />
                                                )}
                                                {show_all ? (
                                                    <Button size="sm" variant="outline" className="hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-100" asChild>
                                                        <Link href={`/admin/clients/${user.id}`} className="flex items-center gap-2">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            Ver Paginado
                                                        </Link>
                                                    </Button>
                                                ) : (
                                                    <Button size="sm" variant="outline" className="hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-100" asChild>
                                                        <Link href={`/admin/clients/${user.id}?show_all=1`} className="flex items-center gap-2">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                                            </svg>
                                                            Ver Todos
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                            <Button size="sm" asChild>
                                                <Link href={`/equipment/create?client_id=${user.id}`}>
                                                    + {es['Add Equipment']}
                                                </Link>
                                            </Button>
                                        </div>
                                        
                                        {/* Fila de Búsquedas */}
                                        <div className="border-t pt-4">
                                            <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                                                <Input
                                                    type="text"
                                                    placeholder="Buscar por descripción, etiqueta, categoría, estado..."
                                                    value={search}
                                                    onChange={(e) => setSearch(e.target.value)}
                                                    className="flex-1 text-sm"
                                                />
                                                <Button type="submit" size="sm" variant="outline" className="hover:bg-accent hover:text-accent-foreground px-3">
                                                    <Search className="h-4 w-4" />
                                                </Button>
                                                {search && (
                                                    <Button 
                                                        type="button" 
                                                        size="sm" 
                                                        variant="ghost" 
                                                        className="hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-100 px-3"
                                                        onClick={() => {
                                                            setSearch('');
                                                            const params: any = {};
                                                            if (show_all) {
                                                                params.show_all = '1';
                                                            }
                                                            router.get(window.location.pathname, params, { preserveState: true });
                                                        }}
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </Button>
                                                )}
                                            </form>
                                        </div>
                                    </div>
                                    
                                    {equipment.data.length > 0 ? (
                                        <>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-xs">
                                                    <thead>
                                                        <tr className="border-b">
                                                            <th className="text-left p-2">{es['Asset Tag']}</th>
                                                            <th className="text-left p-2">{es['Brand']}/{es['Model']}</th>
                                                            <th className="text-left p-2">Descripción</th>
                                                            <th className="text-left p-2">{es['Category']}</th>
                                                            <th className="text-left p-2">{es['Status']}</th>
                                                            <th className="text-left p-2">{es['Actions']}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {equipment.data.map((item, index) => {
                                                            const statusInfo = getStatusInfo(item.status);
                                                            return (
                                                                <tr key={item.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                                                                    <td className="p-2 font-mono font-medium text-blue-600 dark:text-blue-400">{item.asset_tag}</td>
                                                                    <td className="p-2">
                                                                        <div>
                                                                            <p className="font-medium">{item.brand}</p>
                                                                            <p className="text-gray-600 dark:text-gray-400">{item.model}</p>
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-2">
                                                                        <p className="text-gray-700 dark:text-gray-300 text-xs">
                                                                            {item.description || <span className="italic text-gray-500">Sin descripción</span>}
                                                                        </p>
                                                                    </td>
                                                                    <td className="p-2">
                                                                        <Badge variant="outline" className="text-xs">{item.category}</Badge>
                                                                    </td>
                                                                    <td className="p-2">
                                                                        <Badge variant="outline" className={`text-xs ${statusInfo.className}`}>
                                                                            {statusInfo.label}
                                                                        </Badge>
                                                                    </td>
                                                                    <td className="p-2">
                                                                        <Button size="sm" variant="outline" onClick={() => router.get(`/equipment/${item.id}`)}>
                                                                            <Eye className="h-3 w-3 mr-1" />
                                                                            {es['View']}
                                                                        </Button>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                            
                                            {/* Pagination - Responsive */}
                                            {equipment.last_page > 1 && (
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-4 border-t">
                                                    <p className="text-xs text-gray-600 text-center sm:text-left">
                                                        {es['Showing']} {((equipment.current_page - 1) * equipment.per_page) + 1} {es['to']} {Math.min(equipment.current_page * equipment.per_page, equipment.total)} {es['of']} {equipment.total} {es['equipment']}
                                                    </p>
                                                    <div className="flex gap-1 justify-center sm:justify-end flex-wrap">
                                                        {equipment.links.map((link, index) => {
                                                            if (link.url === null) return null;
                                                            return (
                                                                <Button
                                                                    key={index}
                                                                    variant={link.active ? "default" : "outline"}
                                                                    size="sm"
                                                                    className="text-xs px-3 py-1 min-w-[32px]"
                                                                    onClick={() => router.get(link.url, { equipment_search: search }, { preserveState: true })}
                                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic text-center py-8">{es['No equipment found.']}</p>
                                    )}
                                </div>
                            </div>

                            {/* Right Column - Additional Info */}
                            <div className="space-y-6">
                                {/* Roles & Permissions */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
                                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                        <Shield className="h-5 w-5" />
                                        {es['Roles and Permissions']}
                                    </h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                                                {es['Assigned Roles']}
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {user.roles.map((role) => (
                                                    <Badge key={role.id} variant="secondary" className="text-sm px-3 py-1">
                                                        {role.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        {user.permissions.length > 0 && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                                                    {es['Direct Permissions']} ({user.permissions.length})
                                                </label>
                                                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                                                    {user.permissions.map((permission) => (
                                                        <Badge key={permission.id} variant="outline" className="text-xs px-2 py-1">
                                                            {permission.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Timestamps */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
                                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                        <Calendar className="h-5 w-5" />
                                        {es['Important Dates']}
                                    </h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                {es['Registration Date']}
                                            </label>
                                            <p className="text-base text-gray-900 dark:text-gray-100 mt-1">
                                                {new Date(user.created_at).toLocaleDateString(es['locale'], {
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
                                                {new Date(user.updated_at).toLocaleDateString(es['locale'], {
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