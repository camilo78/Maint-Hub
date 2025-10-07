import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Toaster } from '@/components/ui/sonner';
import AppLayout from '@/layouts/app-layout';
import CommonFunctions from '@/pages/helpers/common';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import RoleForm from './components/form';
import RoleSearch from './components/search';
import RoleTable from './components/table';
import es from '@/lang/es';

const breadcrumbs: BreadcrumbItem[] = [
    { title: es['Dashboard'], href: '/dashboard' },
    { title: es['Roles'], href: '/admin/roles' },
];

type Role = {
    id: number;
    name: string;
    created_at: Date;
    updated_at: Date;
    permissions: { id: number; name: string }[];
    user_count: number;
};

type Props = {
    roles: {
        data: Role[];
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
    permissions: { id: number; name: string }[];
    mustVerifyEmail: boolean;
    status?: string;
    search?: string;
};

export default function Index({ roles, permissions, search: initialSearch }: Props) {
    const [search, setSearch] = useState(initialSearch ?? '');
    const [openDialog, setOpenDialog] = useState<'create' | 'edit' | 'view' | 'delete' | null>(null);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const { hasPermission } = CommonFunctions();

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
        permissions: number[];
    }>({
        name: '',
        permissions: [],
    });

    const isCreating = openDialog === 'create';
    const isEditing = openDialog === 'edit';

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim() !== initialSearch?.trim()) {
            router.get('/admin/roles', { search: search.trim() }, { preserveScroll: true });
        }
    };

    const togglePermission = (id: number) => {
        setData('permissions', data.permissions.includes(id) ? data.permissions.filter((pid) => pid !== id) : [...data.permissions, id]);
    };

    const openModal = (type: 'create' | 'edit' | 'view' | 'delete', role: Role | null = null) => {
        setSelectedRole(role);

        if (type === 'edit' && role) {
            setData({
                name: role.name,
                permissions: role.permissions?.map((p) => p.id) ?? [],
            });
        } else if (type === 'create') {
            reset();
        }

        setOpenDialog(type);
    };

    const closeModal = () => {
        setOpenDialog(null);
        setSelectedRole(null);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const method = isEditing ? put : post;
        const url = isEditing ? `/admin/roles/${selectedRole?.id}` : '/admin/roles';

        method(url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(isEditing ? es['Role updated successfully'] : es['Role created successfully']);
                closeModal();
            },
            onError: () => {
                toast.error(isEditing ? 'Error al actualizar rol' : 'Error al crear rol');
            },
        });
    };

    const handleDelete = () => {
        if (!selectedRole) return;

        destroy(`/admin/roles/${selectedRole.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(es['Role deleted successfully']);
                closeModal();
            },
            onError: (Errors) => {
                toast.error(Errors?.delete || 'Error al eliminar rol');
                closeModal();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={es['Manage Roles']} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border bg-background relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border p-4 md:min-h-min">
                    <div className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10" />
                    </div>

                    <div className="relative z-10 space-y-6">
                        <Toaster position="top-right" />

                        <RoleSearch search={search} onSearchChange={(e) => setSearch(e.target.value)} onSubmit={handleSearch} />

                        {hasPermission('role.create') && (
                            <div className="flex justify-end">
                                <Button onClick={() => openModal('create')}>{es['Add New Role']}</Button>
                            </div>
                        )}

                        <RoleTable
                            roles={roles}
                            onView={(role) => openModal('view', role)}
                            onEdit={(role) => openModal('edit', role)}
                            onDelete={(role) => openModal('delete', role)}
                        />

                        {openDialog && (
                            <Dialog open={!!openDialog} onOpenChange={closeModal}>
                                <DialogContent className={openDialog === 'view' ? "max-w-4xl max-h-[90vh] overflow-y-auto" : "sm:max-w-[500px]"}>
                                    {/* View Dialog */}
                                    {openDialog === 'view' && selectedRole && (
                                        <>
                                            <DialogHeader className="pb-3">
                                                <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                    Rol: {selectedRole.name}
                                                </DialogTitle>
                                                <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
                                                    ID: #{selectedRole.id} • {selectedRole.user_count || 0} usuarios • {selectedRole.permissions?.length || 0} permisos
                                                </DialogDescription>
                                            </DialogHeader>

                                            <div className="space-y-3">
                                                {selectedRole.permissions?.length ? (
                                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                                        {Object.entries(
                                                            selectedRole.permissions.reduce(
                                                                (acc: Record<string, typeof selectedRole.permissions>, perm) => {
                                                                    const [group] = perm.name.split('.');
                                                                    if (!acc[group]) acc[group] = [];
                                                                    acc[group].push(perm);
                                                                    return acc;
                                                                },
                                                                {},
                                                            ),
                                                        ).map(([group, perms]) => (
                                                            <div key={group} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border">
                                                                <h4 className="font-medium text-gray-900 dark:text-gray-100 capitalize text-sm mb-2">
                                                                    {group.replaceAll('_', ' ')}
                                                                </h4>
                                                                <div className="space-y-1">
                                                                    {perms.map((p) => {
                                                                        const [, action] = p.name.split('.');
                                                                        const translatedAction = es[action] || action?.replaceAll('_', ' ');
                                                                        return (
                                                                            <div key={p.id} className="flex items-center gap-2">
                                                                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></div>
                                                                                <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                                                                                    {translatedAction}
                                                                                </span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                        <p className="text-gray-500 dark:text-gray-400 text-sm">Sin permisos asignados</p>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    {/* Create or Edit Dialog */}
                                    {(isCreating || isEditing) && (
                                        <>
                                            <DialogHeader>
                                                <DialogTitle>{isCreating ? es['Create Role'] : es['Edit Role']}</DialogTitle>
                                                <DialogDescription>{isCreating ? es['Add a new role.'] : es['Update role details.']}</DialogDescription>
                                            </DialogHeader>

                                            <RoleForm
                                                type={openDialog}
                                                data={data}
                                                permissions={permissions}
                                                errors={errors}
                                                processing={processing}
                                                togglePermission={togglePermission}
                                                onChange={(key, value) => setData(key, value)}
                                                onSubmit={handleSubmit}
                                                onClose={closeModal}
                                            />
                                        </>
                                    )}

                                    {/* Delete Dialog */}
                                    {openDialog === 'delete' && selectedRole && (
                                        <>
                                            <DialogHeader>
                                                <DialogTitle>{es['Delete Role']}</DialogTitle>
                                                <DialogDescription>
                                                    {es['Are you sure you want to delete the role']} <strong>{selectedRole.name}</strong>?
                                                </DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter>
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => {
                                                        handleDelete();
                                                    }}
                                                >
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
