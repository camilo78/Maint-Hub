import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';

import UserForm from './components/form';
import UserSearch from './components/search';
import UserTable from './components/table';

import { Toaster } from '@/components/ui/sonner';
import { type BreadcrumbItem } from '@/types';
import { toast } from 'sonner';
import es from '@/lang/es';

type Role = {
    id: number;
    name: string;
};

type Permission = {
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
    permissions: Permission[];
    created_at: Date;
};

type Props = {
    users: {
        data: User[];
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
    roles: Role[];
    permissions: { id: number; name: string }[];
    mustVerifyEmail: boolean;
    status?: string;
    search?: string;
    role?: string;
    tipo?: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: es['Dashboard'], href: '/dashboard' },
    { title: es['Clients'], href: '/admin/clients' },
];

type DialogType = 'create' | 'edit' | 'delete' | null;

export default function Index({ users, search: initialSearch, tipo: initialTipo }: Props) {
    const [search, setSearch] = useState(initialSearch ?? '');
    const [tipo, setTipo] = useState(initialTipo ?? 'all');
    const [openDialog, setOpenDialog] = useState<DialogType>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const defaultFormData = {
        name: '',
        email: '',
        phone: '',
        tipo: '',
        rtn_dni_passport: '',
        address: '',
        password: '',
    };

    const { data, setData, put, post, delete: destroy, processing, errors, reset } = useForm({ ...defaultFormData });

    const isCreating = openDialog === 'create';
    const isEditing = openDialog === 'edit';

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params: { search?: string; tipo?: string } = {};
        if (search.trim()) params.search = search.trim();
        if (tipo && tipo !== 'all') params.tipo = tipo;
        router.get('/admin/clients', params, { preserveScroll: true });
    };

    const handleClear = () => {
        setSearch('');
        setTipo('all');
        router.get('/admin/clients', {}, { preserveScroll: true });
    };

    const openModal = (type: DialogType, user: User | null = null) => {
        setSelectedUser(user);

        setData(
            user
                ? {
                    ...defaultFormData,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    tipo: user.tipo,
                    rtn_dni_passport: user.rtn_dni_passport,
                    address: user.address,
                    password: '', // Vacío en modo edición
                }
                : defaultFormData,
        );

        setOpenDialog(type);
    };

    const closeModal = () => {
        setOpenDialog(null);
        setSelectedUser(null);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const method = isEditing ? put : post;
        const url = isEditing ? `/admin/clients/${selectedUser!.id}` : '/admin/clients';

        method(url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(isEditing ? es['User updated successfully'] : es['User created successfully']);
                closeModal();
            },
            onError: (Errors) => {
                toast.error(Errors?.update || Errors?.create || (isEditing ? es['Failed to update user'] : es['Failed to create user']));
            },
        });
    };

    const handleDelete = () => {
        if (!selectedUser) return;
        destroy(`/admin/clients/${selectedUser.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(es['User deleted successfully']);
                closeModal();
            },
            onError: (errors) => {
                console.error('Delete error:', errors);
                toast.error(es['Failed to delete user']);
                closeModal();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={es['Manage Clients']} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border bg-background relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border p-4 md:min-h-min">
                    <div className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10" />
                    </div>

                    <div className="relative z-10 space-y-6">
                        <Toaster position="top-right" />
                        <UserSearch
                            search={search}
                            tipo={tipo}
                            onSearchChange={(e) => setSearch(e.target.value)}
                            onTipoChange={(value) => setTipo(value === 'all' ? '' : value)}
                            onSubmit={handleSearch}
                            onClear={handleClear}
                        />

                        <div className="flex justify-end">
                            <Button onClick={() => openModal('create')}>{es['Add New User'] || 'Agregar Nuevo Cliente'}</Button>
                        </div>

                        <UserTable
                            users={users}
                            onEdit={(user: User) => openModal('edit', user)}
                            onDelete={(user: User) => openModal('delete', user)}
                        />

                        {openDialog && (
                            <Dialog open={!!openDialog} onOpenChange={closeModal}>
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                    {isCreating || isEditing ? (
                                        <>
                                            <DialogHeader>
                                                <DialogTitle>{isCreating ? (es['Create User'] || 'Crear Cliente') : (es['Edit User'] || 'Editar Cliente')}</DialogTitle>
                                                <DialogDescription>{isCreating ? (es['Add a new user.'] || 'Agregar un nuevo cliente.') : (es['Update user details.'] || 'Actualizar detalles del cliente.')}</DialogDescription>
                                            </DialogHeader>
                                            <UserForm
                                                data={data}
                                                errors={errors}
                                                processing={processing}
                                                submitLabel={isCreating ? (es['Create User'] || 'Crear Cliente') : (es['Save Changes'] || 'Guardar Cambios')}
                                                onChange={(field, value) => setData(field, value)}
                                                onSubmit={handleSubmit}
                                                isEditing={isEditing}
                                            />
                                            <DialogFooter>
                                                <Button type="submit" form="user-form" disabled={processing}>
                                                    {isCreating ? (es['Create User'] || 'Crear Cliente') : (es['Save Changes'] || 'Guardar Cambios')}
                                                </Button>
                                                <Button type="button" variant="outline" onClick={closeModal}>
                                                    {es['Cancel'] || 'Cancelar'}
                                                </Button>
                                            </DialogFooter>
                                        </>
                                    ) : (
                                        <>
                                            <DialogHeader>
                                                <DialogTitle>{es['Delete User'] || 'Eliminar Cliente'}</DialogTitle>
                                                <DialogDescription>
                                                    {es['Are you sure you want to delete this user'] || '¿Estás seguro de que quieres eliminar al cliente'} "{selectedUser?.name}"?
                                                </DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter>
                                                <Button variant="destructive" onClick={handleDelete}>
                                                    {es['Yes, Delete']}
                                                </Button>
                                                <Button variant="outline" onClick={closeModal}>
                                                    {es['Cancel']}
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
