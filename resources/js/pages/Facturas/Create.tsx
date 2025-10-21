import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { type BreadcrumbItem } from '@/types';
import es from '@/lang/es';
import { useEffect, useState } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Cliente {
    id: number;
    name: string;
    email: string;
}

interface Mantenimiento {
    id: number;
    description: string;
    client_id: number;
    client_name: string;
    client_email: string;
    client_phone: string;
    client_address: string;
    client_rtn: string;
    equipment_name: string;
    cost: number;
    total_cost: number;
    spare_parts_cost: number;
    spare_parts: Array<{
        id: number;
        name: string;
        quantity: number;
        sale_price: number;
        total: number;
    }>;
}

interface DetalleLinea {
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    tipo_gravamen: 'GRAVADO_15' | 'GRAVADO_18' | 'EXENTO';
    unidad_medida: string;
    subtotal: number;
    isv: number;
    total: number;
}

interface Props {
    cais_disponibles: Array<{
        id: number;
        cai: string;
        prefijo: string;
        rango_disponible: number;
        fecha_limite_emision: string;
    }>;
    clientes: Cliente[];
    mantenimientos_facturables: Mantenimiento[];
}

interface Totales {
    subtotal_gravado_15: number;
    subtotal_gravado_18: number;
    subtotal_exento: number;
    subtotal: number;
    isv_15: number;
    isv_18: number;
    isv_total: number;
    total: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: es['Dashboard'], href: '/dashboard' },
    { title: es['Invoices'], href: '/facturas' },
    { title: es['Create'], href: '/facturas/create' },
];

export default function Create({ cais_disponibles, clientes, mantenimientos_facturables }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        mantenimiento_id: '',
        cliente_id: '',
        cliente_rtn: '',
        cliente_nombre: '',
        cliente_direccion: '',
        cliente_telefono: '',
        cliente_email: '',
        tipo_pago: 'CONTADO',
        dias_credito: '',
        exenta: false,
        orden_compra_exenta: '',
        detalles: [
            {
                descripcion: '',
                cantidad: 1,
                precio_unitario: 0,
                tipo_gravamen: 'GRAVADO_15' as const,
                unidad_medida: 'UND',
                subtotal: 0,
                isv: 0,
                total: 0,
            },
        ] as DetalleLinea[],
    });

    const [mantenimientoSeleccionado, setMantenimientoSeleccionado] = useState<Mantenimiento | null>(null);

    const [totales, setTotales] = useState<Totales>({
        subtotal_gravado_15: 0,
        subtotal_gravado_18: 0,
        subtotal_exento: 0,
        subtotal: 0,
        isv_15: 0,
        isv_18: 0,
        isv_total: 0,
        total: 0,
    });

    // Calcular totales en tiempo real
    useEffect(() => {
        calcularTotales();
    }, [data.detalles]);

    const calcularTotales = () => {
        let subtotal_15 = 0,
            subtotal_18 = 0,
            subtotal_exento = 0;
        let isv_15 = 0,
            isv_18 = 0;

        data.detalles.forEach((detalle) => {
            const subtotal = detalle.cantidad * detalle.precio_unitario;

            switch (detalle.tipo_gravamen) {
                case 'GRAVADO_15':
                    subtotal_15 += subtotal;
                    isv_15 += subtotal * 0.15;
                    break;
                case 'GRAVADO_18':
                    subtotal_18 += subtotal;
                    isv_18 += subtotal * 0.18;
                    break;
                case 'EXENTO':
                    subtotal_exento += subtotal;
                    break;
            }
        });

        const subtotal_total = subtotal_15 + subtotal_18 + subtotal_exento;
        const isv_total = isv_15 + isv_18;

        setTotales({
            subtotal_gravado_15: subtotal_15,
            subtotal_gravado_18: subtotal_18,
            subtotal_exento: subtotal_exento,
            subtotal: subtotal_total,
            isv_15: isv_15,
            isv_18: isv_18,
            isv_total: isv_total,
            total: subtotal_total + isv_total,
        });
    };

    const agregarLinea = () => {
        setData('detalles', [
            ...data.detalles,
            {
                descripcion: '',
                cantidad: 1,
                precio_unitario: 0,
                tipo_gravamen: 'GRAVADO_15' as const,
                unidad_medida: 'UND',
                subtotal: 0,
                isv: 0,
                total: 0,
            },
        ]);
    };

    const eliminarLinea = (index: number) => {
        if (data.detalles.length > 1) {
            const nuevosDetalles = data.detalles.filter((_, i) => i !== index);
            setData('detalles', nuevosDetalles);
        }
    };

    const actualizarDetalle = (index: number, campo: string, valor: any) => {
        const nuevosDetalles = [...data.detalles];
        (nuevosDetalles[index] as any)[campo] = valor;

        // Calcular montos de la línea
        const cantidad = parseFloat(String(nuevosDetalles[index].cantidad)) || 0;
        const precio = parseFloat(String(nuevosDetalles[index].precio_unitario)) || 0;
        const subtotal = cantidad * precio;

        let tasaISV = 0;
        if (nuevosDetalles[index].tipo_gravamen === 'GRAVADO_15') tasaISV = 0.15;
        if (nuevosDetalles[index].tipo_gravamen === 'GRAVADO_18') tasaISV = 0.18;

        nuevosDetalles[index].subtotal = subtotal;
        nuevosDetalles[index].isv = subtotal * tasaISV;
        nuevosDetalles[index].total = subtotal * (1 + tasaISV);

        setData('detalles', nuevosDetalles);
    };

    // Ya no validamos formato estricto, puede ser DNI, RTN o Pasaporte
    const validarDocumento = (documento: string) => {
        // Solo validar que no esté vacío y tenga al menos 6 caracteres
        return documento && documento.trim().length >= 6;
    };

    const handleDocumentoChange = (valor: string) => {
        // Permitir cualquier formato: DNI (13 dígitos), RTN (14 dígitos), Pasaporte (alfanumérico)
        setData('cliente_rtn', valor.toUpperCase());
    };

    const cargarDatosMantenimiento = (mantenimientoId: string) => {
        const mantenimiento = mantenimientos_facturables.find(m => m.id === parseInt(mantenimientoId));

        if (mantenimiento) {
            setMantenimientoSeleccionado(mantenimiento);

            // Cargar datos del cliente
            setData({
                ...data,
                mantenimiento_id: mantenimientoId,
                cliente_id: mantenimiento.client_id.toString(),
                cliente_rtn: mantenimiento.client_rtn, // Ya no formateamos, puede ser DNI/RTN/Pasaporte
                cliente_nombre: mantenimiento.client_name,
                cliente_direccion: mantenimiento.client_address,
                cliente_telefono: mantenimiento.client_phone,
                cliente_email: mantenimiento.client_email,
                // Cargar detalles: servicio de mantenimiento + repuestos
                detalles: [
                    // Servicio de mantenimiento
                    {
                        descripcion: `Servicio de mantenimiento: ${mantenimiento.description}`,
                        cantidad: 1,
                        precio_unitario: parseFloat(String(mantenimiento.cost || 0)),
                        tipo_gravamen: 'GRAVADO_15' as const,
                        unidad_medida: 'SRV',
                        subtotal: parseFloat(String(mantenimiento.cost || 0)),
                        isv: parseFloat(String(mantenimiento.cost || 0)) * 0.15,
                        total: parseFloat(String(mantenimiento.cost || 0)) * 1.15,
                    },
                    // Repuestos
                    ...mantenimiento.spare_parts.map(part => {
                        const cantidad = parseFloat(String(part.quantity || 0));
                        const precio = parseFloat(String(part.sale_price || 0));
                        const subtotal = cantidad * precio;
                        return {
                            descripcion: part.name,
                            cantidad: cantidad,
                            precio_unitario: precio,
                            tipo_gravamen: 'GRAVADO_15' as const,
                            unidad_medida: 'UND',
                            subtotal: subtotal,
                            isv: subtotal * 0.15,
                            total: subtotal * 1.15,
                        };
                    })
                ],
            });
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validar que haya al menos un detalle
        if (data.detalles.length === 0) {
            alert('Debe agregar al menos una línea de detalle');
            return;
        }

        // Validar que todos los detalles tengan descripción
        const detallesInvalidos = data.detalles.some(d => !d.descripcion || d.descripcion.trim() === '');
        if (detallesInvalidos) {
            alert('Todos los detalles deben tener una descripción');
            return;
        }

        // Validar documento del cliente (DNI, RTN o Pasaporte)
        if (!data.cliente_rtn || !validarDocumento(data.cliente_rtn)) {
            alert('El documento del cliente es obligatorio (DNI, RTN o Pasaporte). Debe tener al menos 6 caracteres.');
            return;
        }

        if (data.exenta && !data.orden_compra_exenta) {
            alert(es['Exempt purchase order required']);
            return;
        }

        console.log('Datos a enviar:', data);

        post(route('facturas.store'), {
            onError: (errors) => {
                console.error('Errores de validación:', errors);

                // Mostrar todos los errores
                if (typeof errors === 'object') {
                    const mensajesError = Object.entries(errors)
                        .map(([campo, mensaje]) => `${campo}: ${mensaje}`)
                        .join('\n');
                    alert('Errores de validación:\n\n' + mensajesError);
                } else {
                    alert('Error al crear la factura: ' + String(errors));
                }
            },
            onSuccess: (response) => {
                console.log('Factura creada exitosamente', response);
                alert('Factura creada exitosamente');
            },
            onFinish: () => {
                console.log('Petición finalizada');
            }
        });
    };

    if (cais_disponibles.length === 0) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title={es['Create Invoice']} />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {es['No active CAI available']}. {es['Register CAI first']}.
                        </AlertDescription>
                    </Alert>
                    <Button asChild variant="outline">
                        <Link href="/cai/create">{es['Register CAI']}</Link>
                    </Button>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={es['Create Invoice']} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border bg-background relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border p-4 md:min-h-min">
                    <div className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10" />
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold">{es['Create Invoice']}</h1>
                            <Button variant="outline" asChild>
                                <Link href="/facturas">{es['Back']}</Link>
                            </Button>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            {/* Selector de Mantenimiento */}
                            {mantenimientos_facturables.length > 0 && (
                                <Card className="border-blue-200 dark:border-blue-800">
                                    <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
                                        <CardTitle className="text-blue-900 dark:text-blue-100">
                                            {es['Select Maintenance']}
                                        </CardTitle>
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            Selecciona un mantenimiento finalizado para facturar. Los datos del cliente y servicios se cargarán automáticamente.
                                        </p>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div>
                                            <Label htmlFor="mantenimiento_select">{es['Completed Maintenance']}</Label>
                                            <Select
                                                value={data.mantenimiento_id}
                                                onValueChange={(value) => cargarDatosMantenimiento(value)}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Seleccionar mantenimiento..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {mantenimientos_facturables.map((mant) => (
                                                        <SelectItem key={mant.id} value={mant.id.toString()}>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">
                                                                    {mant.client_name} - {mant.equipment_name}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {mant.description.substring(0, 50)}... | Total: L {parseFloat(String(mant.total_cost || 0)).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {mantenimientoSeleccionado && (
                                                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                                    <p className="text-sm text-green-800 dark:text-green-200">
                                                        <strong>✓ Mantenimiento cargado:</strong> {mantenimientoSeleccionado.description}
                                                    </p>
                                                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                                                        Cliente: {mantenimientoSeleccionado.client_name} |
                                                        Equipo: {mantenimientoSeleccionado.equipment_name} |
                                                        Costo servicio: L {parseFloat(String(mantenimientoSeleccionado.cost || 0)).toFixed(2)} |
                                                        Repuestos: L {parseFloat(String(mantenimientoSeleccionado.spare_parts_cost || 0)).toFixed(2)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Información del Cliente */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>{es['Customer Information']}</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        {data.mantenimiento_id
                                            ? 'Datos cargados del mantenimiento seleccionado. Puedes modificarlos si es necesario.'
                                            : 'Completa los datos del cliente manualmente.'}
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="cliente_rtn">
                                                Documento del Cliente (DNI/RTN/Pasaporte) <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="cliente_rtn"
                                                value={data.cliente_rtn}
                                                onChange={(e) => handleDocumentoChange(e.target.value)}
                                                placeholder="DNI, RTN o Pasaporte"
                                                className={errors.cliente_rtn ? 'border-red-500' : ''}
                                            />
                                            {errors.cliente_rtn && (
                                                <p className="text-sm text-red-500 mt-1">{errors.cliente_rtn}</p>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-1">
                                                DNI (13 dígitos), RTN (14 dígitos) o Pasaporte (alfanumérico)
                                            </p>
                                        </div>

                                        <div>
                                            <Label htmlFor="cliente_nombre">
                                                {es['Customer Name']} <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="cliente_nombre"
                                                value={data.cliente_nombre}
                                                onChange={(e) => setData('cliente_nombre', e.target.value)}
                                                placeholder={es['Customer Name']}
                                                className={errors.cliente_nombre ? 'border-red-500' : ''}
                                            />
                                            {errors.cliente_nombre && (
                                                <p className="text-sm text-red-500 mt-1">{errors.cliente_nombre}</p>
                                            )}
                                        </div>

                                        <div className="md:col-span-2">
                                            <Label htmlFor="cliente_direccion">{es['Customer Address']}</Label>
                                            <Textarea
                                                id="cliente_direccion"
                                                value={data.cliente_direccion}
                                                onChange={(e) => setData('cliente_direccion', e.target.value)}
                                                placeholder={es['Customer Address']}
                                                rows={2}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="cliente_telefono">{es['Customer Phone']}</Label>
                                            <Input
                                                id="cliente_telefono"
                                                value={data.cliente_telefono}
                                                onChange={(e) => setData('cliente_telefono', e.target.value)}
                                                placeholder={es['Customer Phone']}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="cliente_email">{es['Customer Email']}</Label>
                                            <Input
                                                id="cliente_email"
                                                type="email"
                                                value={data.cliente_email}
                                                onChange={(e) => setData('cliente_email', e.target.value)}
                                                placeholder={es['Customer Email']}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="tipo_pago">
                                                {es['Payment Type']} <span className="text-red-500">*</span>
                                            </Label>
                                            <Select
                                                value={data.tipo_pago}
                                                onValueChange={(value) => setData('tipo_pago', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="CONTADO">{es['Cash']}</SelectItem>
                                                    <SelectItem value="CREDITO">{es['Credit']}</SelectItem>
                                                    <SelectItem value="TARJETA">{es['Card']}</SelectItem>
                                                    <SelectItem value="TRANSFERENCIA">{es['Transfer']}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {data.tipo_pago === 'CREDITO' && (
                                            <div>
                                                <Label htmlFor="dias_credito">{es['Credit Days']}</Label>
                                                <Input
                                                    id="dias_credito"
                                                    type="number"
                                                    value={data.dias_credito}
                                                    onChange={(e) => setData('dias_credito', e.target.value)}
                                                    placeholder="30"
                                                    min="1"
                                                />
                                            </div>
                                        )}

                                        <div className="md:col-span-2 flex items-center space-x-2">
                                            <Checkbox
                                                id="exenta"
                                                checked={data.exenta}
                                                onCheckedChange={(checked) => setData('exenta', Boolean(checked))}
                                            />
                                            <Label htmlFor="exenta" className="font-normal cursor-pointer">
                                                {es['Exempt Invoice']}
                                            </Label>
                                        </div>

                                        {data.exenta && (
                                            <div className="md:col-span-2">
                                                <Label htmlFor="orden_compra_exenta">
                                                    {es['Exempt Purchase Order']} <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="orden_compra_exenta"
                                                    value={data.orden_compra_exenta}
                                                    onChange={(e) => setData('orden_compra_exenta', e.target.value)}
                                                    placeholder={es['Exempt Purchase Order']}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Detalle de Productos/Servicios */}
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle>{es['Invoice Details Line']}</CardTitle>
                                        <Button type="button" onClick={agregarLinea} size="sm" variant="outline">
                                            <Plus className="h-4 w-4 mr-2" />
                                            {es['Add Line']}
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {data.detalles.map((detalle, index) => (
                                            <div
                                                key={index}
                                                className="grid grid-cols-12 gap-2 items-end p-4 border rounded-lg"
                                            >
                                                <div className="col-span-12 md:col-span-4">
                                                    <Label className="text-xs">{es['Description']}</Label>
                                                    <Input
                                                        value={detalle.descripcion}
                                                        onChange={(e) =>
                                                            actualizarDetalle(index, 'descripcion', e.target.value)
                                                        }
                                                        placeholder={es['Product/Service']}
                                                        required
                                                    />
                                                </div>

                                                <div className="col-span-6 md:col-span-2">
                                                    <Label className="text-xs">{es['Quantity']}</Label>
                                                    <Input
                                                        type="number"
                                                        value={detalle.cantidad}
                                                        onChange={(e) =>
                                                            actualizarDetalle(index, 'cantidad', e.target.value)
                                                        }
                                                        min="0.01"
                                                        step="0.01"
                                                        required
                                                    />
                                                </div>

                                                <div className="col-span-6 md:col-span-2">
                                                    <Label className="text-xs">{es['Unit Price']}</Label>
                                                    <Input
                                                        type="number"
                                                        value={detalle.precio_unitario}
                                                        onChange={(e) =>
                                                            actualizarDetalle(index, 'precio_unitario', e.target.value)
                                                        }
                                                        min="0"
                                                        step="0.01"
                                                        required
                                                    />
                                                </div>

                                                <div className="col-span-6 md:col-span-2">
                                                    <Label className="text-xs">{es['Tax Rate']}</Label>
                                                    <Select
                                                        value={detalle.tipo_gravamen}
                                                        onValueChange={(value) =>
                                                            actualizarDetalle(index, 'tipo_gravamen', value)
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="GRAVADO_15">{es['Taxed 15%']}</SelectItem>
                                                            <SelectItem value="GRAVADO_18">{es['Taxed 18%']}</SelectItem>
                                                            <SelectItem value="EXENTO">{es['Exempt']}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="col-span-5 md:col-span-1 text-right">
                                                    <Label className="text-xs">{es['Total']}</Label>
                                                    <p className="text-sm font-semibold mt-2">
                                                        L {detalle.total.toFixed(2)}
                                                    </p>
                                                </div>

                                                <div className="col-span-1 md:col-span-1">
                                                    {data.detalles.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            onClick={() => eliminarLinea(index)}
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Totales */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>{es['Total to Pay']}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="max-w-md ml-auto space-y-2">
                                        {totales.subtotal_gravado_15 > 0 && (
                                            <>
                                                <div className="flex justify-between text-sm">
                                                    <span>{es['Subtotal Taxed 15%']}:</span>
                                                    <span>L {totales.subtotal_gravado_15.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>{es['ISV 15%']}:</span>
                                                    <span>L {totales.isv_15.toFixed(2)}</span>
                                                </div>
                                            </>
                                        )}
                                        {totales.subtotal_gravado_18 > 0 && (
                                            <>
                                                <div className="flex justify-between text-sm">
                                                    <span>{es['Subtotal Taxed 18%']}:</span>
                                                    <span>L {totales.subtotal_gravado_18.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>{es['ISV 18%']}:</span>
                                                    <span>L {totales.isv_18.toFixed(2)}</span>
                                                </div>
                                            </>
                                        )}
                                        {totales.subtotal_exento > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span>{es['Subtotal Exempt']}:</span>
                                                <span>L {totales.subtotal_exento.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="border-t pt-2 flex justify-between font-medium">
                                            <span>{es['Subtotal']}:</span>
                                            <span>L {totales.subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between font-medium">
                                            <span>{es['Total ISV']}:</span>
                                            <span>L {totales.isv_total.toFixed(2)}</span>
                                        </div>
                                        <div className="border-t-2 pt-2 flex justify-between text-lg font-bold">
                                            <span>{es['Total to Pay']}:</span>
                                            <span>L {totales.total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Botones de Acción */}
                            <div className="flex justify-end gap-3 border-t pt-6">
                                <Button variant="outline" asChild>
                                    <Link href="/facturas">{es['Cancel']}</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? es['Generating...'] : es['Generate Invoice']}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
