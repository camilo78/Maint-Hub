import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import EquipmentSearch from './components/search';
import EquipmentTable from './components/table';
import { Toaster } from '@/components/ui/sonner';
import { type BreadcrumbItem } from '@/types';
import { toast } from 'sonner';
import es from '@/lang/es';

type Client = {
    id: number;
    name: string;
};

type Equipment = {
    id: number;
    client_id: number;
    asset_tag: string | null;
    category: string;
    brand: string | null;
    model: string | null;
    serial_number: string | null;
    location: string;
    status: 'activo' | 'inactivo' | 'en_reparacion';
    installation_date: string | null;
    warranty_expires_on: string | null;
    notes: string | null;
    specifications: Record<string, string | number> | null;
    client: Client;
    created_at: Date;
};

type Props = {
    equipment: {
        data: Equipment[];
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
    categories: string[];
    search?: string;
    category?: string;
    status?: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: es['Dashboard'], href: '/dashboard' },
    { title: es['Equipment'], href: '/equipment' },
];

export default function Index({ equipment, categories, search: initialSearch, category: initialCategory, status: initialStatus }: Props) {
    const [search, setSearch] = useState(initialSearch ?? '');
    const [category, setCategory] = useState(initialCategory ?? '');
    const [status, setStatus] = useState(initialStatus ?? '');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

    const { delete: destroy } = useForm();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params: { search?: string; category?: string; status?: string } = {};
        if (search.trim()) params.search = search.trim();
        if (category) params.category = category;
        if (status) params.status = status;
        router.get('/equipment', params, { preserveScroll: true });
    };

    const openDeleteDialog = (equipmentItem: Equipment) => {
        setSelectedEquipment(equipmentItem);
        setShowDeleteDialog(true);
    };

    const closeDeleteDialog = () => {
        setShowDeleteDialog(false);
        setSelectedEquipment(null);
    };

    const handleDelete = () => {
        if (!selectedEquipment) return;
        destroy(`/equipment/${selectedEquipment.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(es['Equipment deleted successfully']);
                closeDeleteDialog();
            },
            onError: (errors) => {
                console.error('Delete error:', errors);
                toast.error(es['Failed to delete equipment']);
                closeDeleteDialog();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={es['Manage Equipment']} />
            <div className="space-y-6 p-6">
                <Toaster position="top-right" />
                
                <EquipmentSearch
                    search={search}
                    category={category}
                    status={status}
                    categories={categories}
                    onSearchChange={(e) => setSearch(e.target.value)}
                    onCategoryChange={(e) => setCategory(e.target.value)}
                    onStatusChange={(e) => setStatus(e.target.value)}
                    onSubmit={handleSearch}
                />

                <div className="flex justify-end">
                    <Button asChild>
                        <a href="/equipment/create">{es['Add New Equipment']}</a>
                    </Button>
                </div>

                <EquipmentTable
                    equipment={equipment}
                    onEdit={(equipmentItem: Equipment) => router.get(`/equipment/${equipmentItem.id}/edit`)}
                    onDelete={openDeleteDialog}
                />

                {showDeleteDialog && selectedEquipment && (
                    <Dialog open={showDeleteDialog} onOpenChange={closeDeleteDialog}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{es['Delete Equipment']}</DialogTitle>
                                <DialogDescription>
                                    {es['Are you sure you want to delete this equipment']} <strong>{selectedEquipment.brand} {selectedEquipment.model}</strong>?
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="destructive" onClick={handleDelete}>
                                    {es['Yes, Delete']}
                                </Button>
                                <Button variant="outline" onClick={closeDeleteDialog}>
                                    {es['Cancel']}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </AppLayout>
    );
}