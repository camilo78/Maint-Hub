import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import EquipmentForm from './components/form';
import { Toaster } from '@/components/ui/sonner';
import { type BreadcrumbItem } from '@/types';
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
    description: string | null;
    brand: string | null;
    model: string | null;
    serial_number: string | null;
    location: string;
    status: 'buen_estado' | 'mal_estado' | 'mantenimiento';
    installation_date: string | null;
    warranty_expires_on: string | null;
    notes: string | null;
    specifications: Record<string, string> | null;
    client: Client;
    created_at: Date;
};

type Props = {
    equipment: Equipment;
    categories: string[];
    descriptions: string[];
    clients: Client[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: es['Dashboard'], href: '/dashboard' },
    { title: es['Equipment'], href: '/equipment' },
    { title: es['Edit Equipment'], href: '#' },
];

export default function Edit({ equipment, categories, descriptions, clients }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        client_id: equipment.client_id.toString(),
        category: equipment.category,
        description: equipment.description || '',
        brand: equipment.brand || '',
        model: equipment.model || '',
        serial_number: equipment.serial_number || '',
        asset_tag: equipment.asset_tag || '',
        location: equipment.location,
        status: equipment.status,
        installation_date: equipment.installation_date ? equipment.installation_date.split('T')[0] : '',
        warranty_expires_on: equipment.warranty_expires_on ? equipment.warranty_expires_on.split('T')[0] : '',
        notes: equipment.notes || '',
        specifications: equipment.specifications || {} as Record<string, string>,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/equipment/${equipment.id}`, {
            
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={es['Edit Equipment']} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border bg-background relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border p-4 md:min-h-min">
                    <div className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10" />
                    </div>

                    <div className="relative z-10 space-y-6">
                        <Toaster position="top-right" />
                        
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold">{es['Edit Equipment']}</h1>
                            <Button variant="outline" asChild>
                                <a href="/equipment">{es['Back']}</a>
                            </Button>
                        </div>

                        <div className="relative z-10 space-y-6">
                            <EquipmentForm
                                data={data}
                                errors={errors}
                                clients={clients}
                                categories={categories}
                                descriptions={descriptions}
                                onChange={(field, value) => setData(field, value)}
                                onSubmit={handleSubmit}
                                isEditing={true}
                            />
                            
                            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                                <Button variant="outline" asChild>
                                    <a href="/equipment">{es['Cancel']}</a>
                                </Button>
                                <Button type="submit" form="equipment-form" disabled={processing}>
                                    {processing ? es['Processing'] : es['Save Changes']}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}