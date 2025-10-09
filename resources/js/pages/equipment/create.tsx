import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import EquipmentForm from './components/form';
import { Toaster } from '@/components/ui/sonner';
import { type BreadcrumbItem } from '@/types';
import { toast } from 'sonner';
import es from '@/lang/es';
import { useEffect } from 'react';

type Client = {
    id: number;
    name: string;
};

type Props = {
    categories: string[];
    descriptions: string[];
    clients: Client[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: es['Dashboard'], href: '/dashboard' },
    { title: es['Equipment'], href: '/equipment' },
    { title: es['Create Equipment'], href: '/equipment/create' },
];

export default function Create({ categories, descriptions, clients }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        client_id: '',
        category: '',
        description: '',
        brand: '',
        model: '',
        serial_number: '',
        asset_tag: '',
        location: '',
        status: 'buen_estado' as 'buen_estado' | 'mal_estado' | 'en_reparacion',
        installation_date: '',
        warranty_expires_on: '',
        notes: '',
        specifications: {} as Record<string, any>,
    });

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const clientId = urlParams.get('client_id');
        if (clientId) {
            setData('client_id', clientId);
        }
    }, []);

    const fromClient = new URLSearchParams(window.location.search).get('from_client');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = { ...data };
        if (fromClient) {
            formData.from_client = '1';
        }
        post('/equipment', {
            data: formData,
            onSuccess: () => {
                toast.success(es['Equipment created successfully']);
            },
            onError: () => {
                toast.error(es['Failed to create equipment']);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={es['Create Equipment']} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border bg-background relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border p-4 md:min-h-min">
                    <div className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10" />
                    </div>

                    <div className="relative z-10 space-y-6">
                        <Toaster position="top-right" />
                        
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold">{es['Create Equipment']}</h1>
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
                                isEditing={false}
                            />
                            
                            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                                <Button variant="outline" asChild>
                                    <a href="/equipment">{es['Cancel']}</a>
                                </Button>
                                <Button type="submit" form="equipment-form" disabled={processing}>
                                    {processing ? es['Processing'] : es['Create Equipment']}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}