import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import es from '@/lang/es';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Eye, FileText, XCircle, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Factura {
    id: number;
    numero_factura: string;
    fecha_emision: string;
    cliente_nombre: string;
    cliente_rtn: string;
    total_a_pagar: number;
    estado: 'VIGENTE' | 'ANULADA' | 'CANCELADA';
    impresa: boolean;
}

interface Props {
    facturas: {
        data: Factura[];
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
    filtros: {
        numero_factura?: string;
        cliente_rtn?: string;
        fecha_desde?: string;
        fecha_hasta?: string;
        estado?: string;
    };
    flash?: {
        success?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: es['Dashboard'], href: '/dashboard' },
    { title: es['Invoices'], href: '/facturas' },
];

export default function Index({ facturas, filtros, flash }: Props) {
    const [numeroFactura, setNumeroFactura] = useState(filtros.numero_factura || '');
    const [clienteRtn, setClienteRtn] = useState(filtros.cliente_rtn || '');
    const [fechaDesde, setFechaDesde] = useState(filtros.fecha_desde || '');
    const [fechaHasta, setFechaHasta] = useState(filtros.fecha_hasta || '');
    const [estado, setEstado] = useState(filtros.estado || 'all');
    const [showAnularDialog, setShowAnularDialog] = useState(false);
    const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);

    const { data, setData, post, processing } = useForm({
        motivo: '',
    });

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('facturas.index'),
            {
                numero_factura: numeroFactura,
                cliente_rtn: clienteRtn,
                fecha_desde: fechaDesde,
                fecha_hasta: fechaHasta,
                estado: estado === 'all' ? '' : estado,
            },
            { preserveState: true },
        );
    };

    const clearFilters = () => {
        setNumeroFactura('');
        setClienteRtn('');
        setFechaDesde('');
        setFechaHasta('');
        setEstado('all');
        router.get(route('facturas.index'));
    };

    const handleAnular = () => {
        if (!selectedFactura) return;

        if (data.motivo.length < 10) {
            toast.error(es['Minimum 10 characters']);
            return;
        }

        post(route('facturas.anular', selectedFactura.id), {
            onSuccess: () => {
                setShowAnularDialog(false);
                setSelectedFactura(null);
                setData('motivo', '');
                toast.success(es['Invoice voided successfully']);
            },
            onError: () => {
                toast.error('Error al anular factura');
            },
        });
    };

    const getEstadoBadge = (estado: string) => {
        switch (estado) {
            case 'VIGENTE':
                return <Badge className="bg-green-500">{es['Valid']}</Badge>;
            case 'ANULADA':
                return <Badge variant="destructive">{es['Voided']}</Badge>;
            case 'CANCELADA':
                return <Badge variant="secondary">{es['Cancelled']}</Badge>;
            default:
                return <Badge>{estado}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={es['Invoices']} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border bg-background relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border p-4 md:min-h-min">
                    <div className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10" />
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold">{es['Invoices']}</h1>
                            <Button asChild>
                                <Link href="/facturas/create">{es['New Invoice']}</Link>
                            </Button>
                        </div>

                        {/* Filtros */}
                        <div className="bg-muted/50 p-4 rounded-lg">
                            <form onSubmit={handleSearch} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                    <div>
                                        <Label htmlFor="numero_factura">{es['Invoice Number']}</Label>
                                        <Input
                                            id="numero_factura"
                                            value={numeroFactura}
                                            onChange={(e) => setNumeroFactura(e.target.value)}
                                            placeholder={es['Invoice Number']}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="cliente_rtn">{es['Customer RTN']}</Label>
                                        <Input
                                            id="cliente_rtn"
                                            value={clienteRtn}
                                            onChange={(e) => setClienteRtn(e.target.value)}
                                            placeholder="0000-0000-00000"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="fecha_desde">{es['Date']} (Desde)</Label>
                                        <Input
                                            id="fecha_desde"
                                            type="date"
                                            value={fechaDesde}
                                            onChange={(e) => setFechaDesde(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="fecha_hasta">{es['Date']} (Hasta)</Label>
                                        <Input
                                            id="fecha_hasta"
                                            type="date"
                                            value={fechaHasta}
                                            onChange={(e) => setFechaHasta(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="estado">{es['Status']}</Label>
                                        <Select value={estado} onValueChange={setEstado}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos</SelectItem>
                                                <SelectItem value="VIGENTE">{es['Valid']}</SelectItem>
                                                <SelectItem value="ANULADA">{es['Voided']}</SelectItem>
                                                <SelectItem value="CANCELADA">{es['Cancelled']}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button type="button" onClick={clearFilters} variant="outline">
                                        {es['Clear']}
                                    </Button>
                                    <Button type="submit">
                                        <Search className="h-4 w-4 mr-2" />
                                        {es['Filter']}
                                    </Button>
                                </div>
                            </form>
                        </div>

                        {/* Tabla */}
                        <div className="rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{es['Invoice Number']}</TableHead>
                                        <TableHead>{es['Date']}</TableHead>
                                        <TableHead>{es['Customer']}</TableHead>
                                        <TableHead>{es['Customer RTN']}</TableHead>
                                        <TableHead className="text-right">{es['Total']}</TableHead>
                                        <TableHead className="text-center">{es['Status']}</TableHead>
                                        <TableHead className="text-center">{es['Actions']}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {facturas.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                {es['No data available']}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        facturas.data.map((factura) => (
                                            <TableRow key={factura.id}>
                                                <TableCell className="font-medium">{factura.numero_factura}</TableCell>
                                                <TableCell>
                                                    {new Date(factura.fecha_emision).toLocaleDateString('es-HN', {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                    })}
                                                </TableCell>
                                                <TableCell>{factura.cliente_nombre}</TableCell>
                                                <TableCell>{factura.cliente_rtn}</TableCell>
                                                <TableCell className="text-right">
                                                    L {parseFloat(String(factura.total_a_pagar)).toFixed(2)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {getEstadoBadge(factura.estado)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex justify-center gap-2">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={route('facturas.show', factura.id)}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>

                                                        <Button variant="ghost" size="sm" asChild>
                                                            <a
                                                                href={route('facturas.pdf', factura.id)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                <FileText className="h-4 w-4" />
                                                            </a>
                                                        </Button>

                                                        {factura.estado === 'VIGENTE' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedFactura(factura);
                                                                    setShowAnularDialog(true);
                                                                }}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Paginación */}
                        {facturas.links && facturas.links.length > 3 && (
                            <div className="flex justify-center gap-2">
                                {facturas.links.map((link, index) => (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => link.url && router.visit(link.url)}
                                        disabled={!link.url}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Dialog Anular Factura */}
            <Dialog open={showAnularDialog} onOpenChange={setShowAnularDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{es['Confirm Void']}</DialogTitle>
                        <DialogDescription>
                            {es['Are you sure you want to void this invoice?']}
                            <br />
                            <strong>{selectedFactura?.numero_factura}</strong>
                            <br />
                            <span className="text-red-500">{es['This action cannot be undone']}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="motivo">
                                {es['Void Reason']} <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="motivo"
                                value={data.motivo}
                                onChange={(e) => setData('motivo', e.target.value)}
                                placeholder={es['Minimum 10 characters']}
                                rows={4}
                                required
                            />
                            <p className="text-xs text-muted-foreground mt-1">{es['Minimum 10 characters']}</p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAnularDialog(false)}>
                            {es['Cancel']}
                        </Button>
                        <Button variant="destructive" onClick={handleAnular} disabled={processing}>
                            {processing ? es['Processing'] : es['Void Invoice']}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
