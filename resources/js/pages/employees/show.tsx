import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft, Edit, Mail, Phone, MapPin, FileText, Calendar, Shield, Briefcase, IdCard } from 'lucide-react';
import es from '@/lang/es';

type Role = {
    id: number;
    name: string;
};

type Employee = {
    id: number;
    name: string;
    email: string;
    phone: string;
    tipo: string;
    rtn_dni_passport: string;
    address: string;
    career: string;
    employee_id: string;
    email_verified_at: string | null;
    roles: Role[];
    permissions: { id: number; name: string }[];
    created_at: string;
    updated_at: string;
};

type Props = {
    employee: Employee;
};

export default function Show({ employee }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: es['Dashboard'], href: '/dashboard' },
        { title: es['Employees'] || 'Empleados', href: '/admin/employees' },
        { title: employee.name, href: `/admin/employees/${employee.id}` },
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

    const typeInfo = getTypeInfo(employee.tipo);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Empleado: ${employee.name}`} />
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
                                    {employee.name}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {es['Employee since']} {new Date(employee.created_at).toLocaleDateString(es['locale'], {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" className="hover:bg-gray-100 dark:hover:bg-gray-800" asChild>
                                    <Link href="/admin/employees">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        {es['Back']}
                                    </Link>
                                </Button>
                                <Button asChild>
                                    <Link href={`/admin/employees/${employee.id}/edit`}>
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
                                                {employee.name}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                {es['Document Type']}
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
                                                {employee.rtn_dni_passport}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                {es['Email Status']}
                                            </label>
                                            <div className="mt-1">
                                                <Badge variant={employee.email_verified_at ? "default" : "secondary"}>
                                                    {employee.email_verified_at ? es['Verified'] : es['Unverified']}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Professional Information */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
                                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                        <Briefcase className="h-5 w-5" />
                                        {es['Professional Information']}
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <IdCard className="h-5 w-5 text-blue-600" />
                                            <div>
                                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    {es['Employee ID']}
                                                </label>
                                                <p className="text-sm font-mono font-bold text-gray-900 dark:text-gray-100">
                                                    {employee.employee_id}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                            <Briefcase className="h-5 w-5 text-green-600" />
                                            <div>
                                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    {es['Professional Career']}
                                                </label>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {employee.career}
                                                </p>
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
                                                        <a href={`tel:${employee.phone}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                                                            {employee.phone}
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
                                                        {employee.email ? (
                                                            <a href={`mailto:${employee.email}`} className="text-green-600 hover:text-green-800 hover:underline">
                                                                {employee.email}
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
                                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    {es['Direction']}
                                                </label>
                                                <p className="text-sm text-gray-900 dark:text-gray-100 mt-1 leading-relaxed">
                                                    {employee.address || <span className="text-gray-500 italic">{es['No address registered']}</span>}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
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
                                                {employee.roles.map((role) => (
                                                    <Badge key={role.id} variant="secondary" className="text-sm px-3 py-1">
                                                        {role.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        {employee.permissions.length > 0 && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                                                    {es['Direct Permissions']} ({employee.permissions.length})
                                                </label>
                                                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                                                    {employee.permissions.map((permission) => (
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
                                                {es['Hiring Date']}
                                            </label>
                                            <p className="text-base text-gray-900 dark:text-gray-100 mt-1">
                                                {new Date(employee.created_at).toLocaleDateString(es['locale'], {
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
                                                {new Date(employee.updated_at).toLocaleDateString(es['locale'], {
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