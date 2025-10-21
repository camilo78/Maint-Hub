import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';
import es from '@/lang/es';
import { Eye, Plus } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface CAI {
    id: number;
    rtn_emisor: string;
    nombre_comercial: string;
    punto_emision: string;
    tipo_documento: string;
    cai: string;
    prefijo: string;
    rango_inicial: number;
    rango_final: number;
    ultimo_correlativo_usado: number;
    rango_disponible: number;
    fecha_limite_emision: string;
    estado: 'ACTIVO' | 'AGOTADO' | 'VENCIDO' | 'INACTIVO';
    created_at: string;
}

interface Props {
    cais: {
        data: CAI[];
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
        estado?: string;
        tipo_documento?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: es['Dashboard'], href: '/dashboard' },
    { title: es['CAI Management'], href: '/cai' },
];

export default function Index({ cais, filtros }: Props) {
    const getEstadoBadge = (estado: string) => {
        switch (estado) {
            case 'ACTIVO':
                return <Badge className="bg-green-500">{es['Active']}</Badge>;
            case 'AGOTADO':
                return <Badge variant="destructive">{es['Exhausted']}</Badge>;
            case 'VENCIDO':
                return <Badge variant="destructive">{es['Expired']}</Badge>;
            case 'INACTIVO':
                return <Badge variant="secondary">{es['Inactive']}</Badge>;
            default:
                return <Badge>{estado}</Badge>;
        }
    };

    const calcularUtilizacion = (cai: CAI) => {
        const totalRango = cai.rango_final - cai.rango_inicial + 1;
        const utilizado = cai.ultimo_correlativo_usado - cai.rango_inicial + 1;
        return Math.round((utilizado / totalRango) * 100);
    };

    const estaProximoVencimiento = (fecha: string) => {
        const dias = Math.ceil(
            (new Date(fecha).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
        );
        return dias <= 30 && dias >= 0;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={es['CAI Management']} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border bg-background relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border p-4 md:min-h-min">
                    <div className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10" />
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">{es['CAI Management']}</h1>
                                <p className="text-sm text-muted-foreground">
                                    Gestión de Autorizaciones del SAR para Facturación
                                </p>
                            </div>
                            <Button asChild>
                                <Link href="/cai/create">
                                    <Plus className="h-4 w-4 mr-2" />
                                    {es['New CAI']}
                                </Link>
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {cais?.data
                                ?.filter((cai) => cai.estado === 'ACTIVO')
                                .map((cai) => (
                                    <Card key={cai.id}>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg">
                                                {cai.tipo_documento}
                                            </CardTitle>
                                            <CardDescription className="font-mono text-xs">
                                                {cai.prefijo}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div>
                                                {getEstadoBadge(cai.estado)}
                                                {estaProximoVencimiento(cai.fecha_limite_emision) && (
                                                    <Badge variant="outline" className="ml-2 text-yellow-600">
                                                        Próx. Vencimiento
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-muted-foreground">{es['Usage']}:</span>
                                                    <span className="font-medium">{calcularUtilizacion(cai)}%</span>
                                                </div>
                                                <Progress value={calcularUtilizacion(cai)} className="h-2" />
                                            </div>

                                            <div className="space-y-1 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">{es['Available Range']}:</span>
                                                    <span className="font-medium">{cai.rango_disponible ?? 0}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">{es['Expiration Date']}:</span>
                                                    <span>
                                                        {new Date(cai.fecha_limite_emision).toLocaleDateString('es-HN')}
                                                    </span>
                                                </div>
                                            </div>

                                            <Button variant="outline" size="sm" asChild className="w-full">
                                                <Link href={route('cai.show', cai.id)}>
                                                    <Eye className="h-3 w-3 mr-2" />
                                                    {es['Invoice Details']}
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                        </div>

                        {/* Tabla completa */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Todos los CAIs</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{es['Document Type']}</TableHead>
                                            <TableHead>{es['Prefix']}</TableHead>
                                            <TableHead>{es['CAI']}</TableHead>
                                            <TableHead className="text-right">{es['Available Range']}</TableHead>
                                            <TableHead className="text-center">{es['Usage']}</TableHead>
                                            <TableHead>{es['Expiration Date']}</TableHead>
                                            <TableHead className="text-center">{es['Status']}</TableHead>
                                            <TableHead className="text-center">{es['Actions']}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {!cais?.data || cais.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                    {es['No data available']}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            cais.data.map((cai) => (
                                                <TableRow key={cai.id}>
                                                    <TableCell className="font-medium">{cai.tipo_documento}</TableCell>
                                                    <TableCell className="font-mono text-sm">{cai.prefijo}</TableCell>
                                                    <TableCell className="font-mono text-xs">
                                                        {cai.cai.substring(0, 20)}...
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {(cai.rango_disponible ?? 0).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <Progress
                                                                value={calcularUtilizacion(cai)}
                                                                className="h-2"
                                                            />
                                                            <p className="text-xs text-center text-muted-foreground">
                                                                {calcularUtilizacion(cai)}%
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span
                                                            className={
                                                                estaProximoVencimiento(cai.fecha_limite_emision)
                                                                    ? 'text-yellow-600 font-medium'
                                                                    : ''
                                                            }
                                                        >
                                                            {new Date(cai.fecha_limite_emision).toLocaleDateString('es-HN')}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {getEstadoBadge(cai.estado)}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={route('cai.show', cai.id)}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
