import BulkQRGenerator from '@/components/bulk-qr-generator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import es from '@/lang/es';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, Edit, Eye, FileText, Mail, MapPin, Monitor, Phone, Search, Shield } from 'lucide-react';
import { useState } from 'react';

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
    description?: string;
    location: string;
    status: string;
    installation_date: string;
    warranty_expires_on: string;
    specifications: Record<string, string | number | boolean> | null;
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
        links: { url: string | null; label: string; active: boolean }[];
    };
    equipment_search: string;
    show_all: boolean;
};

export default function Show({ user, equipment, equipment_search, show_all }: Props) {
    const [search, setSearch] = useState(equipment_search || '');
    const [isExporting, setIsExporting] = useState(false);
    const [isExportingPdf, setIsExportingPdf] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params: Record<string, string> = {};
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
                    color: 'border dark:text-white border-blue-600',
                    docType: 'RTN',
                };
            case 'extranjero':
                return {
                    label: 'Extranjero',
                    color: 'border dark:text-white border-purple-600',
                    docType: 'Pasaporte',
                };
            default:
                return {
                    label: 'Particular',
                    color: 'border dark:text-white border-green-600',
                    docType: 'DNI',
                };
        }
    };

    const typeInfo = getTypeInfo(user.tipo);

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'buen_estado':
                return {
                    label: 'Buen Estado',
                    className: 'border-green-500  dark:text-white dark:border-green-500',
                };
            case 'mal_estado':
                return {
                    label: 'Mal Estado',
                    className: 'border-red-500  dark:text-white dark:border-red-500',
                };
            case 'mantenimiento':
                return {
                    label: 'Mantenimiento',
                    className: 'border-yellow-400  dark:text-white dark:border-yellow-400',
                };
            default:
                return {
                    label: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
                    className: 'text-gray-400 border-gray-400  dark:text-white-400 dark:border-gray-400',
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
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user.name}</h1>
                                <p className="text-muted-foreground text-sm">
                                    {es['Client since']}{' '}
                                    {new Date(user.created_at).toLocaleDateString(es['locale'], {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" className="hover:bg-gray-100 dark:hover:bg-gray-800" asChild>
                                    <Link href="/admin/clients">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        {es['Back']}
                                    </Link>
                                </Button>
                                <Button variant="outline" className="hover:bg-gray-100 dark:hover:bg-gray-800" asChild>
                                    <Link href={`/admin/clients/${user.id}/edit`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        {es['Edit']}
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* Left Column - Basic Info */}
                            <div className="space-y-6 lg:col-span-2">
                                {/* Personal Information */}
                                <div className="rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800">
                                    <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        <FileText className="h-5 w-5" />
                                        {es['Personal Information']}
                                    </h2>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{es['Full Name']}</label>
                                            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{user.name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{es['Client Type']}</label>
                                            <div className="mt-1">
                                                <Badge variant="outline" className={typeInfo.color}>
                                                    {typeInfo.label}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{typeInfo.docType}</label>
                                            <p className="mt-1 rounded border bg-gray-50 px-3 py-2 font-mono text-sm font-bold text-gray-900 dark:bg-gray-700 dark:text-gray-100">
                                                {user.rtn_dni_passport}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{es['Email Status']}</label>
                                            <div className="mt-1">
                                                    {user.email_verified_at ? es['Verified'] : es['Unverified']}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800">
                                    <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        <Phone className="h-5 w-5" />
                                        {es['Contact Information']}
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="flex items-center gap-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                                                <Phone className="h-6 w-6 text-blue-600" />
                                                <div className="flex-1">
                                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{es['Phone']}</label>
                                                    <p className="text-base font-medium">
                                                        <a href={`tel:${user.phone}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                                                            {user.phone}
                                                        </a>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                                                <Mail className="h-6 w-6 text-green-600" />
                                                <div className="flex-1">
                                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                                                    <p className="text-base font-medium">
                                                        {user.email ? (
                                                            <a
                                                                href={`mailto:${user.email}`}
                                                                className="text-green-600 hover:text-green-800 hover:underline"
                                                            >
                                                                {user.email}
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-500 italic">{es['No email registered']}</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
                                            <MapPin className="mt-1 h-5 w-5 text-yellow-600" />
                                            <div className="flex-1">
                                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{es['Direction']}</label>
                                                <p className="mt-1 text-sm leading-relaxed text-gray-900 dark:text-gray-100">
                                                    {user.address || <span className="text-gray-500 italic">{es['No address registered']}</span>}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Equipment */}
                                <div className="rounded-lg border bg-white p-4 dark:bg-gray-800">
                                    <div className="mb-4 space-y-4">
                                        <h2 className="flex items-center gap-2 text-lg font-semibold">
                                            <Monitor className="h-5 w-5" />
                                            {es['Assigned Equipment']} ({equipment.total})
                                        </h2>

                                        {/* Fila de Botones */}
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex flex-wrap gap-2">
                                                {equipment.data.length > 0 && <BulkQRGenerator equipment={equipment.data} />}
                                                {equipment.data.length > 0 && (
                                                    <Button
                                                        size="sm"
                                                        className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700"
                                                        disabled={isExporting}
                                                        onClick={async () => {
                                                            setIsExporting(true);
                                                            try {
                                                                const link = document.createElement('a');
                                                                link.href = `/admin/clients/${user.id}/export-equipment`;
                                                                link.download = '';
                                                                document.body.appendChild(link);
                                                                link.click();
                                                                document.body.removeChild(link);
                                                                setTimeout(() => setIsExporting(false), 2000);
                                                            } catch {
                                                                setIsExporting(false);
                                                            }
                                                        }}
                                                    >
                                                        {isExporting ? (
                                                            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                                <circle
                                                                    className="opacity-25"
                                                                    cx="12"
                                                                    cy="12"
                                                                    r="10"
                                                                    stroke="currentColor"
                                                                    strokeWidth="4"
                                                                ></circle>
                                                                <path
                                                                    className="opacity-75"
                                                                    fill="currentColor"
                                                                    d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                ></path>
                                                            </svg>
                                                        ) : (
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                                />
                                                            </svg>
                                                        )}
                                                        {isExporting ? 'Generando...' : 'Excel'}
                                                    </Button>
                                                )}
                                                {equipment.data.length > 0 && (
                                                    <Button
                                                        size="sm"
                                                        className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700"
                                                        disabled={isExportingPdf}
                                                        onClick={async () => {
                                                            setIsExportingPdf(true);
                                                            try {
                                                                const link = document.createElement('a');
                                                                link.href = `/admin/clients/${user.id}/export-equipment-pdf`;
                                                                link.download = '';
                                                                document.body.appendChild(link);
                                                                link.click();
                                                                document.body.removeChild(link);
                                                                setTimeout(() => setIsExportingPdf(false), 2000);
                                                            } catch {
                                                                setIsExportingPdf(false);
                                                            }
                                                        }}
                                                    >
                                                        {isExportingPdf ? (
                                                            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                                <circle
                                                                    className="opacity-25"
                                                                    cx="12"
                                                                    cy="12"
                                                                    r="10"
                                                                    stroke="currentColor"
                                                                    strokeWidth="4"
                                                                ></circle>
                                                                <path
                                                                    className="opacity-75"
                                                                    fill="currentColor"
                                                                    d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                ></path>
                                                            </svg>
                                                        ) : (
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                                />
                                                            </svg>
                                                        )}
                                                        {isExportingPdf ? 'Generando...' : 'PDF'}
                                                    </Button>
                                                )}
                                                {show_all ? (
                                                    <Button size="sm" className="bg-orange-600 text-white hover:bg-orange-700" asChild>
                                                        <Link href={`/admin/clients/${user.id}`} className="flex items-center gap-2">
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                                />
                                                            </svg>
                                                            {es['Paginated']}
                                                        </Link>
                                                    </Button>
                                                ) : (
                                                    <Button size="sm" className="bg-orange-600 text-white hover:bg-orange-700" asChild>
                                                        <Link href={`/admin/clients/${user.id}?show_all=1`} className="flex items-center gap-2">
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                                                                />
                                                            </svg>
                                                            {es['All']}
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                            <Button size="sm" asChild>
                                                <Link href={`/equipment/create?client_id=${user.id}`}>+ {es['Add Equipment']}</Link>
                                            </Button>
                                        </div>

                                        {/* Fila de Búsquedas */}
                                        <div className="border-t pt-4">
                                            <form onSubmit={handleSearch} className="flex max-w-md gap-2">
                                                <Input
                                                    type="text"
                                                    placeholder={es['Search by description, tag, category, status...']}
                                                    value={search}
                                                    onChange={(e) => setSearch(e.target.value)}
                                                    className="flex-1 text-sm"
                                                />
                                                <Button type="submit" variant="outline" className="hover:bg-accent hover:text-accent-foreground px-3">
                                                    <Search className="h-4 w-4" />
                                                </Button>
                                                {search && (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        className="px-3 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-100"
                                                        onClick={() => {
                                                            setSearch('');
                                                            const params: Record<string, string> = {};
                                                            if (show_all) {
                                                                params.show_all = '1';
                                                            }
                                                            router.get(window.location.pathname, params, { preserveState: true });
                                                        }}
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M6 18L18 6M6 6l12 12"
                                                            />
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
                                                            <th className="p-2 text-left">{es['Tag']}</th>
                                                            <th className="p-2 text-left">
                                                                {es['Brand']}/{es['Model']}
                                                            </th>
                                                            <th className="p-2 text-left">{es['Description']}</th>
                                                            <th className="p-2 text-left">{es['Category']}</th>
                                                            <th className="p-2 text-left">{es['Status']}</th>
                                                            <th className="p-2 text-left">{es['Actions']}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {equipment.data.map((item) => {
                                                            const statusInfo = getStatusInfo(item.status);
                                                            return (
                                                                <tr key={item.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                                                                    <td className="p-2 font-mono font-medium text-blue-600 dark:text-blue-400">
                                                                        {item.asset_tag}
                                                                    </td>
                                                                    <td className="p-2">
                                                                        <div>
                                                                            <p className="font-medium">{item.brand}</p>
                                                                            <p className="text-gray-600 dark:text-gray-400">{item.model}</p>
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-2">
                                                                        <p className="text-xs text-gray-700 dark:text-gray-300">
                                                                            {item.description || (
                                                                                <span className="text-gray-500 italic">{es['No description']}</span>
                                                                            )}
                                                                        </p>
                                                                    </td>
                                                                    <td className="p-2">
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {item.category}
                                                                        </Badge>
                                                                    </td>
                                                                    <td className="p-2 text-center">
                                                                        <Badge variant="outline" className={`text-xs ${statusInfo.className}`}>
                                                                            {statusInfo.label}
                                                                        </Badge>
                                                                    </td>
                                                                    <td className="p-2 text-center">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() => router.get(`/equipment/${item.id}`)}
                                                                        >
                                                                            <Eye className="h-3 w-3" />
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
                                                <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                                                    <p className="text-center text-xs text-gray-600 sm:text-left">
                                                        {es['Showing']} {(equipment.current_page - 1) * equipment.per_page + 1} {es['to']}{' '}
                                                        {Math.min(equipment.current_page * equipment.per_page, equipment.total)} {es['of']}{' '}
                                                        {equipment.total} {es['equipment']}
                                                    </p>
                                                    <div className="flex flex-wrap justify-center gap-1 sm:justify-end">
                                                        {equipment.links.map((link, index) => {
                                                            if (link.url === null) return null;
                                                            return (
                                                                <Button
                                                                    key={index}
                                                                    variant={link.active ? 'default' : 'outline'}
                                                                    size="sm"
                                                                    className="min-w-[32px] px-3 py-1 text-xs"
                                                                    onClick={() =>
                                                                        link.url &&
                                                                        router.get(link.url, { equipment_search: search }, { preserveState: true })
                                                                    }
                                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <p className="py-8 text-center text-sm text-gray-500 italic">{es['No equipment found']}</p>
                                    )}
                                </div>
                            </div>

                            {/* Right Column - Additional Info */}
                            <div className="space-y-6">
                                {/* Roles & Permissions */}
                                <div className="rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800">
                                    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        <Shield className="h-5 w-5" />
                                        {es['Roles and Permissions']}
                                    </h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-400">
                                                {es['Assigned Roles']}
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {user.roles.map((role) => (
                                                    <Badge key={role.id} variant="secondary" className="px-3 py-1 text-sm">
                                                        {role.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        {user.permissions.length > 0 && (
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    {es['Direct Permissions']} ({user.permissions.length})
                                                </label>
                                                <div className="flex max-h-32 flex-wrap gap-1 overflow-y-auto">
                                                    {user.permissions.map((permission) => (
                                                        <Badge key={permission.id} variant="outline" className="px-2 py-1 text-xs">
                                                            {permission.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Timestamps */}
                                <div className="rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800">
                                    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        <Calendar className="h-5 w-5" />
                                        {es['Important Dates']}
                                    </h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{es['Registration Date']}</label>
                                            <p className="mt-1 text-base text-gray-900 dark:text-gray-100">
                                                {new Date(user.created_at).toLocaleDateString(es['locale'], {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{es['Last Update']}</label>
                                            <p className="mt-1 text-base text-gray-900 dark:text-gray-100">
                                                {new Date(user.updated_at).toLocaleDateString(es['locale'], {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
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
