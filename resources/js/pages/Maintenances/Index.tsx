import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toaster } from '@/components/ui/sonner';
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import es from '@/lang/es';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ChevronDown, ChevronRight, Edit, Eye, Search, Trash2 } from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Maintenance {
    id: number;
    description: string;
    priority: string;
    type: string;
    status: string;
    cost: number;
    created_at: string;
    client: {
        id: number;
        name: string;
    };
    equipment: {
        id: number;
        description: string;
        asset_tag: string;
    };
}

interface Props {
    maintenances: {
        data: Maintenance[];
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
    filters: {
        search?: string;
        status?: string;
        priority?: string;
        type?: string;
    };
    flash?: {
        success?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: es['Dashboard'], href: '/dashboard' },
    { title: es['Maintenances'], href: '/maintenances' },
];

export default function Index({ maintenances, filters, flash }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [priority, setPriority] = useState(filters.priority || 'all');
    const [type, setType] = useState(filters.type || 'all');
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null);

    const { delete: destroy } = useForm();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('maintenances.index'),
            {
                search,
                status: status === 'all' ? '' : status,
                priority: priority === 'all' ? '' : priority,
                type: type === 'all' ? '' : type,
            },
            { preserveState: true },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('all');
        setPriority('all');
        setType('all');
        router.get(route('maintenances.index'));
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'red':
                return 'bg-red-500';
            case 'orange':
                return 'bg-orange-500';
            case 'yellow':
                return 'bg-yellow-500';
            case 'green':
                return 'bg-green-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getPriorityTextColor = (priority: string) => {
        switch (priority) {
            case 'red':
                return 'text-red-500';
            case 'orange':
                return 'text-orange-500';
            case 'yellow':
                return 'text-yellow-500';
            case 'green':
                return 'text-green-500';
            default:
                return 'text-gray-500';
        }
    };

    const translatePriority = (priority: string) => {
        switch (priority) {
            case 'red':
                return 'Rojo';
            case 'orange':
                return 'Naranja';
            case 'yellow':
                return 'Amarillo';
            case 'green':
                return 'Verde';
            default:
                return priority;
        }
    };

    const translateType = (type: string) => {
        switch (type) {
            case 'preventive':
                return 'Preventivo';
            case 'corrective':
                return 'Correctivo';
            default:
                return type;
        }
    };

    const translateStatus = (status: string) => {
        switch (status) {
            case 'pending':
                return 'Pendiente';
            case 'in_progress':
                return 'En Progreso';
            case 'completed':
                return 'Completado';
            case 'rescheduled':
                return 'Reprogramado';
            case 'cancelled':
                return 'Cancelado';
            default:
                return status.replace('_', ' ');
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            pending: 'bg-yellow-400 text-black',
            in_progress: 'bg-blue-400 text-black',
            completed: 'bg-green-400 text-black',
            rescheduled: 'bg-orange-500 text-black',
            cancelled: 'bg-red-100 text-red-900',
        };
        return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-900';
    };

    const toggleRow = (maintenanceId: number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(maintenanceId)) {
            newExpanded.delete(maintenanceId);
        } else {
            newExpanded.add(maintenanceId);
        }
        setExpandedRows(newExpanded);
    };

    const openDeleteDialog = (maintenance: Maintenance) => {
        setSelectedMaintenance(maintenance);
        setShowDeleteDialog(true);
    };

    const closeDeleteDialog = () => {
        setShowDeleteDialog(false);
        setSelectedMaintenance(null);
    };

    const handleDelete = () => {
        if (!selectedMaintenance) return;
        destroy(route('maintenances.destroy', selectedMaintenance.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(es['Maintenance deleted successfully']);
                closeDeleteDialog();
            },
            onError: (errors) => {
                console.error('Delete error:', errors);
                toast.error(es['Failed to delete maintenance']);
                closeDeleteDialog();
            },
        });
    };

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={es['Maintenances']} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border bg-background relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border p-4 md:min-h-min">
                    <div className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10" />
                    </div>

                    <div className="relative z-10 space-y-6">
                        <Toaster position="top-right" />

                        <form onSubmit={handleSearch} className="mb-6 space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                                <Input placeholder={es['Search'] + '...'} value={search} onChange={(e) => setSearch(e.target.value)} />

                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={es['Status']} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{es['All']}</SelectItem>
                                        <SelectItem value="pending">{es['Pending']}</SelectItem>
                                        <SelectItem value="in_progress">{es['In Progress']}</SelectItem>
                                        <SelectItem value="completed">{es['Completed']}</SelectItem>
                                        <SelectItem value="rescheduled">{es['Rescheduled']}</SelectItem>
                                        <SelectItem value="cancelled">{es['Cancelled']}</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={priority} onValueChange={setPriority}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={es['Priority']} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{es['All']}</SelectItem>
                                        <SelectItem value="red">{es['Red']}</SelectItem>
                                        <SelectItem value="orange">{es['Orange']}</SelectItem>
                                        <SelectItem value="yellow">{es['Yellow']}</SelectItem>
                                        <SelectItem value="green">{es['Green']}</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={es['Type']} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{es['All']}</SelectItem>
                                        <SelectItem value="preventive">{es['Preventive']}</SelectItem>
                                        <SelectItem value="corrective">{es['Corrective']}</SelectItem>
                                    </SelectContent>
                                </Select>

                                <div className="flex gap-2">
                                    <Button type="submit" variant="outline">
                                        <Search className="h-4 w-4" />
                                    </Button>
                                    <Button type="button" variant="ghost" onClick={clearFilters}>
                                        {es['Clear']}
                                    </Button>
                                </div>
                            </div>
                        </form>

                        <div className="flex justify-end">
                            <Button asChild>
                                <Link href={route('maintenances.create')}>{es['New Maintenance']}</Link>
                            </Button>
                        </div>
                        <div className="bg-background overflow-x-auto rounded-lg border">
                            <Table>
                                <TableCaption>{es['A list of all maintenances.'] || 'Lista de todos los mantenimientos.'}</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]"></TableHead>
                                        <TableHead className="w-[80px]">#</TableHead>
                                        <TableHead>{es['Priority']}</TableHead>
                                        <TableHead>{es['Client']}</TableHead>
                                        <TableHead>{es['Equipment']}</TableHead>
                                        <TableHead>{es['Type']}</TableHead>
                                        <TableHead className="text-center">{es['Status']}</TableHead>
                                        <TableHead>{es['Cost']}</TableHead>
                                        <TableHead className="text-center">{es['Actions']}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {maintenances.data.length > 0 ? (
                                        maintenances.data.map((maintenance, index) => (
                                            <Fragment key={maintenance.id}>
                                                <TableRow>
                                                    <TableCell className="text-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleRow(maintenance.id)}
                                                            className="h-6 w-6 p-0"
                                                        >
                                                            {expandedRows.has(maintenance.id) ? (
                                                                <ChevronDown className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronRight className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {index + 1 + (maintenances.current_page - 1) * maintenances.per_page}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`h-4 w-4 rounded-full ${getPriorityColor(maintenance.priority)}`}></div>
                                                            <span className={`font-medium ${getPriorityTextColor(maintenance.priority)}`}>
                                                                {translatePriority(maintenance.priority)}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-medium">{maintenance.client.name}</TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{maintenance.equipment.description}</div>
                                                            <div className="text-muted-foreground text-xs">{maintenance.equipment.asset_tag}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{translateType(maintenance.type)}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge className={getStatusBadge(maintenance.status)}>
                                                            {translateStatus(maintenance.status)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{maintenance.cost ? `$${maintenance.cost}` : '-'}</TableCell>
                                                    <TableCell className="space-x-2 text-center">
                                                        <Button size="icon" variant="ghost" asChild title={es['View']}>
                                                            <Link href={route('maintenances.show', maintenance.id)}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button size="icon" variant="ghost" asChild title={es['Edit']}>
                                                            <Link href={route('maintenances.edit', maintenance.id)}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => openDeleteDialog(maintenance)}
                                                            title={es['Delete']}
                                                        >
                                                            <Trash2 className="text-destructive h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                                {expandedRows.has(maintenance.id) && (
                                                    <TableRow className="bg-muted/50">
                                                        <TableCell></TableCell>
                                                        <TableCell colSpan={9} className="py-3">
                                                            <div className="text-sm">
                                                                <span className="text-muted-foreground font-medium">
                                                                    {es['Description'] || 'Descripción'}:{' '}
                                                                </span>
                                                                <span className="break-words hyphens-auto whitespace-normal">
                                                                    {maintenance.description}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </Fragment>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={10} className="text-muted-foreground py-4 text-center">
                                                {es['No maintenances found.'] || 'No se encontraron mantenimientos.'}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-muted-foreground py-3 pr-4 text-right text-sm">
                                            {es['Showing']} {(maintenances.current_page - 1) * maintenances.per_page + 1} {es['to']}{' '}
                                            {(maintenances.current_page - 1) * maintenances.per_page + maintenances.data.length} {es['of']}{' '}
                                            {maintenances.total} {es['maintenances'] || 'mantenimientos'}
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </div>

                        {maintenances.last_page > 1 && (
                            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
                                {maintenances.links?.map((link: { url: string | null; label: string; active: boolean }, idx: number) => (
                                    <Button
                                        key={idx}
                                        variant={link.active ? 'default' : 'outline'}
                                        onClick={() => link.url && router.get(link.url)}
                                        disabled={!link.url}
                                        size="sm"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}

                        {showDeleteDialog && selectedMaintenance && (
                            <Dialog open={showDeleteDialog} onOpenChange={closeDeleteDialog}>
                                <DialogContent className="sm:max-w-sm">
                                    <DialogHeader>
                                        <DialogTitle>{es['Delete'] + ' ' + es['Maintenance']}</DialogTitle>
                                        <DialogDescription>{es['Are you sure you want to delete this maintenance?']}</DialogDescription>
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
                </div>
            </div>
        </AppLayout>
    );
}
