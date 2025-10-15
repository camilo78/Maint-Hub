import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import MaintenanceForm from './components/MaintenanceForm';
import { Button } from '@/components/ui/button';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { type BreadcrumbItem } from '@/types';
import es from '@/lang/es';

interface Client {
    id: number;
    name: string;
}

interface Equipment {
    id: number;
    description: string;
    asset_tag: string;
    client_id: number;
}

interface SparePart {
    id: number;
    name: string;
    sku: string;
    sale_price: number;
    stock: number;
}

interface MaintenanceData {
    id: number;
    description: string;
    client_id: number;
    equipment_id: number;
    priority: string;
    type: string;
    status: string;
    cost: number;
    spare_parts: Array<{
        id: number;
        name: string;
        pivot: {
            quantity: number;
            observations: string;
        };
    }>;
    images: Array<{
        id: number;
        path: string;
        original_name: string;
        size?: number;
        mime_type?: string;
    }>;
    documents: Array<{
        id: number;
        path: string;
        original_name: string;
        size?: number;
        mime_type?: string;
    }>;
}

interface Props {
    maintenance: MaintenanceData;
    clients: Client[];
    equipment: Equipment[];
    spareParts: SparePart[];
}

export default function Edit({ maintenance, clients, equipment, spareParts }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: es['Dashboard'], href: '/dashboard' },
        { title: es['Maintenances'], href: '/maintenances' },
        { title: es['Edit'], href: `/maintenances/${maintenance?.id}/edit` },
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={es['Edit Maintenance']} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border bg-background relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border p-4 md:min-h-min">
                    <div className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10" />
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold">{es['Edit Maintenance']}</h1>
                            <Button variant="outline" asChild>
                                <Link href="/maintenances">{es['Back']}</Link>
                            </Button>
                        </div>

                        <div className="relative z-10 space-y-6">
                            
                            <MaintenanceForm
                                maintenance={maintenance}
                                clients={clients}
                                equipment={equipment}
                                spareParts={spareParts}
                                submitRoute="maintenances.update"
                                method="put"
                            />
                            
                            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                                <Button variant="outline" asChild>
                                    <Link href="/maintenances">{es['Cancel']}</Link>
                                </Button>
                                <Button type="submit" form="maintenance-form">
                                    {es['Update Maintenance']}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}