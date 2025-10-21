import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';
import es from '@/lang/es';
import { AlertCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: es['Dashboard'], href: '/dashboard' },
    { title: es['CAI Management'], href: '/cai' },
    { title: es['Create'], href: '/cai/create' },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        rtn_emisor: '',
        nombre_comercial: '',
        punto_emision: '',
        tipo_documento: 'FACTURA',
        cai: '',
        prefijo: '',
        rango_inicial: '',
        rango_final: '',
        fecha_limite_emision: '',
        constancia_registro: '',
    });

    const formatearRTN = (valor: string) => {
        const numeros = valor.replace(/\D/g, '');
        if (numeros.length <= 4) {
            return numeros;
        } else if (numeros.length <= 8) {
            return `${numeros.slice(0, 4)}-${numeros.slice(4)}`;
        } else {
            return `${numeros.slice(0, 4)}-${numeros.slice(4, 8)}-${numeros.slice(8, 14)}`;
        }
    };

    const handleRTNChange = (valor: string) => {
        const rtnFormateado = formatearRTN(valor);
        setData('rtn_emisor', rtnFormateado);
    };

    const formatearPuntoEmision = (valor: string) => {
        const numeros = valor.replace(/\D/g, '');
        return numeros.padStart(3, '0').slice(0, 3);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('cai.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={es['Register CAI']} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border bg-background relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border p-4 md:min-h-min">
                    <div className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10" />
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">{es['Register CAI']}</h1>
                                <p className="text-sm text-muted-foreground">
                                    Registrar nueva autorización del SAR para facturación
                                </p>
                            </div>
                            <Button variant="outline" asChild>
                                <Link href="/cai">{es['Back']}</Link>
                            </Button>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex gap-2">
                                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-800 dark:text-blue-200">
                                    <p className="font-semibold mb-1">Información Importante:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>El CAI debe tener entre 37 y 50 caracteres alfanuméricos</li>
                                        <li>El prefijo suele tener el formato: FAC-001-001</li>
                                        <li>El rango inicial y final deben coincidir con la autorización del SAR</li>
                                        <li>La fecha límite no puede ser anterior a hoy</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            {/* Información del Emisor */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Información del Emisor</CardTitle>
                                    <CardDescription>Datos de la empresa emisora</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="rtn_emisor">
                                                {es['Issuer RTN']} <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="rtn_emisor"
                                                value={data.rtn_emisor}
                                                onChange={(e) => handleRTNChange(e.target.value)}
                                                placeholder="0000-0000-000000"
                                                maxLength={18}
                                                className={errors.rtn_emisor ? 'border-red-500' : ''}
                                                required
                                            />
                                            {errors.rtn_emisor && (
                                                <p className="text-sm text-red-500 mt-1">{errors.rtn_emisor}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="nombre_comercial">
                                                {es['Business Name']} <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="nombre_comercial"
                                                value={data.nombre_comercial}
                                                onChange={(e) => setData('nombre_comercial', e.target.value)}
                                                placeholder="Nombre de la empresa"
                                                className={errors.nombre_comercial ? 'border-red-500' : ''}
                                                required
                                            />
                                            {errors.nombre_comercial && (
                                                <p className="text-sm text-red-500 mt-1">{errors.nombre_comercial}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="constancia_registro">{es['Registration Voucher']}</Label>
                                            <Input
                                                id="constancia_registro"
                                                value={data.constancia_registro}
                                                onChange={(e) => setData('constancia_registro', e.target.value)}
                                                placeholder="Número de constancia"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Información del CAI */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Autorización del SAR</CardTitle>
                                    <CardDescription>Datos de la autorización fiscal</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="punto_emision">
                                                {es['Emission Point']} <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="punto_emision"
                                                value={data.punto_emision}
                                                onChange={(e) => setData('punto_emision', formatearPuntoEmision(e.target.value))}
                                                placeholder="001"
                                                maxLength={3}
                                                className={errors.punto_emision ? 'border-red-500' : ''}
                                                required
                                            />
                                            {errors.punto_emision && (
                                                <p className="text-sm text-red-500 mt-1">{errors.punto_emision}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="tipo_documento">
                                                {es['Document Type']} <span className="text-red-500">*</span>
                                            </Label>
                                            <Select value={data.tipo_documento} onValueChange={(value) => setData('tipo_documento', value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="FACTURA">{es['Invoice']}</SelectItem>
                                                    <SelectItem value="NOTA_CREDITO">{es['Credit Note']}</SelectItem>
                                                    <SelectItem value="NOTA_DEBITO">{es['Debit Note']}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="prefijo">
                                                {es['Prefix']} <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="prefijo"
                                                value={data.prefijo}
                                                onChange={(e) => setData('prefijo', e.target.value.toUpperCase())}
                                                placeholder="FAC-001-001"
                                                className={errors.prefijo ? 'border-red-500' : ''}
                                                required
                                            />
                                            {errors.prefijo && <p className="text-sm text-red-500 mt-1">{errors.prefijo}</p>}
                                        </div>

                                        <div className="md:col-span-3">
                                            <Label htmlFor="cai">
                                                {es['CAI Number']} <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="cai"
                                                value={data.cai}
                                                onChange={(e) => setData('cai', e.target.value.toUpperCase())}
                                                placeholder="CAI (37-50 caracteres alfanuméricos)"
                                                className={errors.cai ? 'border-red-500' : ''}
                                                required
                                            />
                                            {errors.cai && <p className="text-sm text-red-500 mt-1">{errors.cai}</p>}
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Solo letras mayúsculas y números (37-50 caracteres)
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Rango de Facturación */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>{es['Authorized Range']}</CardTitle>
                                    <CardDescription>Rango de correlativos autorizados</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="rango_inicial">
                                                {es['Initial Range']} <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="rango_inicial"
                                                type="number"
                                                value={data.rango_inicial}
                                                onChange={(e) => setData('rango_inicial', e.target.value)}
                                                placeholder="1"
                                                min="1"
                                                className={errors.rango_inicial ? 'border-red-500' : ''}
                                                required
                                            />
                                            {errors.rango_inicial && (
                                                <p className="text-sm text-red-500 mt-1">{errors.rango_inicial}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="rango_final">
                                                {es['Final Range']} <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="rango_final"
                                                type="number"
                                                value={data.rango_final}
                                                onChange={(e) => setData('rango_final', e.target.value)}
                                                placeholder="1000"
                                                min="1"
                                                className={errors.rango_final ? 'border-red-500' : ''}
                                                required
                                            />
                                            {errors.rango_final && (
                                                <p className="text-sm text-red-500 mt-1">{errors.rango_final}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="fecha_limite_emision">
                                                {es['Expiration Date']} <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="fecha_limite_emision"
                                                type="date"
                                                value={data.fecha_limite_emision}
                                                onChange={(e) => setData('fecha_limite_emision', e.target.value)}
                                                className={errors.fecha_limite_emision ? 'border-red-500' : ''}
                                                required
                                            />
                                            {errors.fecha_limite_emision && (
                                                <p className="text-sm text-red-500 mt-1">{errors.fecha_limite_emision}</p>
                                            )}
                                        </div>
                                    </div>

                                    {data.rango_inicial && data.rango_final && parseInt(data.rango_final) > parseInt(data.rango_inicial) && (
                                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                            <p className="text-sm text-green-800 dark:text-green-200">
                                                <strong>Rango Total:</strong>{' '}
                                                {(parseInt(data.rango_final) - parseInt(data.rango_inicial) + 1).toLocaleString()} facturas
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Botones */}
                            <div className="flex justify-end gap-3 border-t pt-6">
                                <Button variant="outline" asChild>
                                    <Link href="/cai">{es['Cancel']}</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? es['Processing'] : es['Register CAI']}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
