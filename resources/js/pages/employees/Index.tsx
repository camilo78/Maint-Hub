import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Toaster } from '@/components/ui/sonner';
import AppLayout from '@/layouts/app-layout';

import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import EmployeeForm from './components/form';
import EmployeeSearch from './components/search';
import EmployeeTable from './components/table';
import es from '@/lang/es';

const breadcrumbs: BreadcrumbItem[] = [
    { title: es['Dashboard'], href: '/dashboard' },
    { title: es['Employees'] || 'Empleados', href: '/admin/employees' },
];

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
    created_at: Date;
};

interface Props {
    employees: {
        data: Employee[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };
    roles: { id: number; name: string }[];
    permissions: { id: number; name: string }[];
    mustVerifyEmail: boolean;
    status?: string;
    search?: string;
}

export default function Index({ employees, roles, permissions, search: initialSearch }: Props) {
    const [search, setSearch] = useState(initialSearch ?? '');
    const [roleId, setRoleId] = useState('all');
    const [openDialog, setOpenDialog] = useState<'create' | 'edit' | 'delete' | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);


    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        errors,
        reset,
    } = useForm<{
        name: string;
        email: string;
        phone: string;
        tipo: string;
        rtn_dni_passport: string;
        address: string;
        career: string;
        employee_id: string;
        password: string;
        roleIds: number[];
        permissionIds: number[];
    }>({
        name: '',
        email: '',
        phone: '',
        tipo: '',
        rtn_dni_passport: '',
        address: '',
        career: '',
        employee_id: '',
        password: '',
        roleIds: [],
        permissionIds: [],
    });

    const isCreating = openDialog === 'create';
    const isEditing = openDialog === 'edit';

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params: { search?: string; role?: string } = {};
        if (search.trim()) params.search = search.trim();
        if (roleId !== 'all') params.role = roleId;
        router.get('/admin/employees', params, { preserveScroll: true });
    };

    const openModal = (type: 'create' | 'edit' | 'delete', employee: Employee | null = null) => {
        setSelectedEmployee(employee);

        if (type === 'edit' && employee) {
            setData({
                name: employee.name,
                email: employee.email || '',
                phone: employee.phone,
                tipo: employee.tipo,
                rtn_dni_passport: employee.rtn_dni_passport,
                address: employee.address,
                career: employee.career || '',
                employee_id: employee.employee_id || '',
                password: '',
                roleIds: employee.roles?.map(r => r.id) || [],
                permissionIds: employee.permissions?.map((p) => p.id) ?? [],
            });
        } else if (type === 'create') {
            reset();
        }

        setOpenDialog(type);
    };

    const closeModal = () => {
        setOpenDialog(null);
        setSelectedEmployee(null);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const method = isEditing ? put : post;
        const url = isEditing ? `/admin/employees/${selectedEmployee?.id}` : '/admin/employees';

        method(url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(isEditing ? (es['Employee updated successfully'] || 'Empleado actualizado exitosamente') : (es['Employee created successfully'] || 'Empleado creado exitosamente'));
                closeModal();
            },
            onError: () => {
                toast.error(isEditing ? (es['Failed to update employee'] || 'Error al actualizar empleado') : (es['Failed to create employee'] || 'Error al crear empleado'));
            },
        });
    };

    const handleDelete = () => {
        if (!selectedEmployee) return;

        destroy(`/admin/employees/${selectedEmployee.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(es['Employee deleted successfully'] || 'Empleado eliminado exitosamente');
                closeModal();
            },
            onError: (Errors) => {
                toast.error(Errors?.delete || (es['Failed to delete employee'] || 'Error al eliminar empleado'));
                closeModal();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={es['Manage Employees'] || 'Gestionar Empleados'} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border bg-background relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border p-4 md:min-h-min">
                    <div className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10" />
                    </div>

                    <div className="relative z-10 space-y-6">
                        <Toaster position="top-right" />

                        <EmployeeSearch 
                            search={search} 
                            roleId={roleId}
                            roles={roles}
                            onSearchChange={(e) => setSearch(e.target.value)} 
                            onRoleChange={setRoleId}
                            onSubmit={handleSearch} 
                        />

                        <div className="flex justify-end">
                            <Button onClick={() => openModal('create')}>{es['Add New Employee'] || 'Agregar Nuevo Empleado'}</Button>
                        </div>

                        <EmployeeTable
                            employees={employees}
                            onEdit={(employee) => openModal('edit', employee)}
                            onDelete={(employee) => openModal('delete', employee)}
                        />

                        {openDialog && (
                            <Dialog open={!!openDialog} onOpenChange={closeModal}>
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">


                                    {/* Create or Edit Dialog */}
                                    {(isCreating || isEditing) && (
                                        <>
                                            <DialogHeader>
                                                <DialogTitle>{isCreating ? (es['Create Employee'] || 'Crear Empleado') : (es['Edit Employee'] || 'Editar Empleado')}</DialogTitle>
                                                <DialogDescription>
                                                    {isCreating ? (es['Add a new employee.'] || 'Agregar un nuevo empleado.') : (es['Update employee details.'] || 'Actualizar detalles del empleado.')}
                                                </DialogDescription>
                                            </DialogHeader>

                                            <div className="flex-1 pr-2">
                                                <EmployeeForm
                                                    data={data}
                                                    roles={roles}
                                                    permissions={permissions}
                                                    errors={errors}
                                                    onChange={(field, value) => setData(field as keyof typeof data, value as string | number[])}
                                                    onSubmit={handleSubmit}
                                                    isEditing={isEditing}
                                                />
                                            </div>
                                            <DialogFooter className="mt-0 pt-0 mr-2">
                                                <Button type="submit" form="employee-form" disabled={processing}>
                                                    {processing ? (es['Processing'] || 'Procesando...') : (isCreating ? (es['Create Employee'] || 'Crear Empleado') : (es['Save Changes'] || 'Guardar Cambios'))}
                                                </Button>
                                                <Button type="button" variant="outline" onClick={closeModal}>
                                                    {es['Cancel'] || 'Cancelar'}
                                                </Button>
                                            </DialogFooter>
                                        </>
                                    )}

                                    {/* Delete Dialog */}
                                    {openDialog === 'delete' && selectedEmployee && (
                                        <>
                                            <DialogHeader>
                                                <DialogTitle>{es['Delete Employee'] || 'Eliminar Empleado'}</DialogTitle>
                                                <DialogDescription>
                                                    {es['Are you sure you want to delete the employee'] || '¿Estás seguro de que quieres eliminar al empleado'} <strong>{selectedEmployee.name}</strong>?
                                                </DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter>
                                                <Button variant="destructive" onClick={handleDelete}>
                                                    {es['Yes, Delete'] || 'Sí, Eliminar'}
                                                </Button>
                                                <Button variant="outline" onClick={closeModal}>
                                                    {es['Cancel'] || 'Cancelar'}
                                                </Button>
                                            </DialogFooter>
                                        </>
                                    )}
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}