import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type BreadcrumbItem } from '@/types';
import es from '@/lang/es';
import { FileText, ArrowLeft } from 'lucide-react';

interface Factura {
    id: number;
    numero_factura: string;
    numero_correlativo: number;
    cai: string;
    cliente_rtn: string;
    cliente_nombre: string;
    cliente_direccion: string;
    cliente_telefono: string;
    cliente_email: string;
    fecha_emision: string;
    fecha_limite_emision: string;
    tipo_pago: string;
    dias_credito: number | null;
    subtotal_gravado_15: number;
    subtotal_gravado_18: number;
    subtotal_exento: number;
    subtotal: number;
    isv_15: number;
    isv_18: number;
    isv_total: number;
    total_a_pagar: number;
    exenta: boolean;
    orden_compra_exenta: string | null;
    estado: string;
    motivo_anulacion: string | null;
    impresa: boolean;
    emisor: {
        name: string;
    };
    anulador: {
        name: string;
    } | null;
    detalles: Array<{
        numero_linea: number;
        descripcion: string;
        cantidad: number;
        precio_unitario: number;
        tipo_gravamen: string;
        tasa_isv: number;
        subtotal_linea: number;
        isv_linea: number;
        total_linea: number;
    }>;
    cai_autorizacion: {
        rtn_emisor: string;
        nombre_comercial: string;
        prefijo: string;
    };
}

interface Props {
    factura: Factura;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: es['Dashboard'], href: '/dashboard' },
    { title: es['Invoices'], href: '/facturas' },
    { title: es['Invoice Details'], href: '#' },
];

export default function Show({ factura }: Props) {
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
            <Head title={`${es['Invoice']} ${factura.numero_factura}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border bg-background relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border p-4 md:min-h-min">
                    <div className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10" />
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">{factura.numero_factura}</h1>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(factura.fecha_emision).toLocaleString('es-HN')}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" asChild>
                                    <a href={route('facturas.pdf', factura.id)} target="_blank" rel="noopener noreferrer">
                                        <FileText className="h-4 w-4 mr-2" />
                                        {es['Print PDF']}
                                    </a>
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/facturas">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        {es['Back']}
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Información Fiscal */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>{es['Fiscal Information']}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{es['Status']}:</span>
                                        {getEstadoBadge(factura.estado)}
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{es['CAI']}:</span>
                                        <span className="font-mono text-sm">{factura.cai}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{es['Expiration Date']}:</span>
                                        <span>
                                            {new Date(factura.fecha_limite_emision).toLocaleDateString('es-HN')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{es['Issuer RTN']}:</span>
                                        <span>{factura.cai_autorizacion.rtn_emisor}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{es['Business Name']}:</span>
                                        <span>{factura.cai_autorizacion.nombre_comercial}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{es['Created by']}:</span>
                                        <span>{factura.emisor.name}</span>
                                    </div>
                                    {factura.impresa && (
                                        <div className="pt-2 border-t">
                                            <Badge variant="outline">{es['Printed']}</Badge>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Información del Cliente */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>{es['Customer Information']}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div>
                                        <span className="text-muted-foreground text-sm">{es['Customer Name']}:</span>
                                        <p className="font-medium">{factura.cliente_nombre}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground text-sm">{es['Customer RTN']}:</span>
                                        <p className="font-medium">{factura.cliente_rtn}</p>
                                    </div>
                                    {factura.cliente_direccion && (
                                        <div>
                                            <span className="text-muted-foreground text-sm">{es['Customer Address']}:</span>
                                            <p>{factura.cliente_direccion}</p>
                                        </div>
                                    )}
                                    {factura.cliente_telefono && (
                                        <div>
                                            <span className="text-muted-foreground text-sm">{es['Customer Phone']}:</span>
                                            <p>{factura.cliente_telefono}</p>
                                        </div>
                                    )}
                                    <div className="pt-2 border-t">
                                        <span className="text-muted-foreground text-sm">{es['Payment Type']}:</span>
                                        <p className="font-medium">
                                            {factura.tipo_pago}
                                            {factura.dias_credito && ` (${factura.dias_credito} días)`}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Detalle de Factura */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{es['Invoice Details Line']}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12">#</TableHead>
                                            <TableHead>{es['Description']}</TableHead>
                                            <TableHead className="text-right">{es['Quantity']}</TableHead>
                                            <TableHead className="text-right">{es['Unit Price']}</TableHead>
                                            <TableHead className="text-center">{es['Tax Rate']}</TableHead>
                                            <TableHead className="text-right">{es['Total']}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {factura.detalles.map((detalle) => (
                                            <TableRow key={detalle.numero_linea}>
                                                <TableCell>{detalle.numero_linea}</TableCell>
                                                <TableCell>{detalle.descripcion}</TableCell>
                                                <TableCell className="text-right">
                                                    {parseFloat(String(detalle.cantidad)).toFixed(2)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    L {parseFloat(String(detalle.precio_unitario)).toFixed(2)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {detalle.tipo_gravamen === 'GRAVADO_15' && es['Taxed 15%']}
                                                    {detalle.tipo_gravamen === 'GRAVADO_18' && es['Taxed 18%']}
                                                    {detalle.tipo_gravamen === 'EXENTO' && es['Exempt']}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    L {parseFloat(String(detalle.total_linea)).toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Totales */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{es['Total to Pay']}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="max-w-md ml-auto space-y-2">
                                    {factura.subtotal_gravado_15 > 0 && (
                                        <>
                                            <div className="flex justify-between text-sm">
                                                <span>{es['Subtotal Taxed 15%']}:</span>
                                                <span>L {parseFloat(String(factura.subtotal_gravado_15)).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>{es['ISV 15%']}:</span>
                                                <span>L {parseFloat(String(factura.isv_15)).toFixed(2)}</span>
                                            </div>
                                        </>
                                    )}
                                    {factura.subtotal_gravado_18 > 0 && (
                                        <>
                                            <div className="flex justify-between text-sm">
                                                <span>{es['Subtotal Taxed 18%']}:</span>
                                                <span>L {parseFloat(String(factura.subtotal_gravado_18)).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>{es['ISV 18%']}:</span>
                                                <span>L {parseFloat(String(factura.isv_18)).toFixed(2)}</span>
                                            </div>
                                        </>
                                    )}
                                    {factura.subtotal_exento > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span>{es['Subtotal Exempt']}:</span>
                                            <span>L {parseFloat(String(factura.subtotal_exento)).toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="border-t pt-2 flex justify-between font-medium">
                                        <span>{es['Subtotal']}:</span>
                                        <span>L {parseFloat(String(factura.subtotal)).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-medium">
                                        <span>{es['Total ISV']}:</span>
                                        <span>L {parseFloat(String(factura.isv_total)).toFixed(2)}</span>
                                    </div>
                                    <div className="border-t-2 pt-2 flex justify-between text-xl font-bold">
                                        <span>{es['Total to Pay']}:</span>
                                        <span>L {parseFloat(String(factura.total_a_pagar)).toFixed(2)}</span>
                                    </div>
                                </div>

                                {factura.exenta && (
                                    <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                        <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                                            {es['Exempt Invoice']}
                                        </p>
                                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                            {es['Exempt Purchase Order']}: {factura.orden_compra_exenta}
                                        </p>
                                    </div>
                                )}

                                {factura.estado === 'ANULADA' && (
                                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                        <p className="font-semibold text-red-800 dark:text-red-200">{es['Voided']}</p>
                                        <p className="text-sm text-red-700 dark:text-red-300">
                                            {es['Void Reason']}: {factura.motivo_anulacion}
                                        </p>
                                        {factura.anulador && (
                                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                                {es['Voided by']}: {factura.anulador.name}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
