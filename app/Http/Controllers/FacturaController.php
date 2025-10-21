<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFacturaRequest;
use App\Models\CaiAutorizacion;
use App\Models\Factura;
use App\Models\DetalleFactura;
use App\Models\LogFacturacion;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class FacturaController extends Controller
{
    /**
     * Display a listing of facturas with filters
     */
    public function index(Request $request)
    {
        $filtros = $request->only(['numero_factura', 'cliente_rtn', 'fecha_desde', 'fecha_hasta', 'estado']);

        $facturas = Factura::with(['cliente', 'caiAutorizacion', 'emisor'])
            ->filtros($filtros)
            ->orderBy('fecha_emision', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Facturas/Index', [
            'facturas' => $facturas,
            'filtros' => $filtros,
        ]);
    }

    /**
     * Show the form for creating a new factura
     */
    public function create()
    {
        // Obtener CAIs activos disponibles
        $caisDisponibles = CaiAutorizacion::activos()
            ->porTipoDocumento('FACTURA')
            ->get();

        if ($caisDisponibles->isEmpty()) {
            return redirect()->route('facturas.index')
                ->withErrors(['error' => 'No hay CAIs activos disponibles. Debe registrar uno antes de facturar.']);
        }

        // Obtener clientes (usuarios) para autocompletado
        $clientes = User::select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        // Obtener mantenimientos finalizados sin factura
        $mantenimientosFacturables = \App\Models\Maintenance::facturables()
            ->with(['client', 'equipment', 'spareParts'])
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($mantenimiento) {
                return [
                    'id' => $mantenimiento->id,
                    'description' => $mantenimiento->description,
                    'client_id' => $mantenimiento->client_id,
                    'client_name' => $mantenimiento->client->name ?? 'N/A',
                    'client_email' => $mantenimiento->client->email ?? '',
                    'client_phone' => $mantenimiento->client->phone ?? '',
                    'client_address' => $mantenimiento->client->address ?? '',
                    'client_rtn' => $mantenimiento->client->rtn_dni_passport ?? '',
                    'equipment_name' => $mantenimiento->equipment->name ?? 'N/A',
                    'cost' => $mantenimiento->cost,
                    'total_cost' => $mantenimiento->total_cost,
                    'spare_parts_cost' => $mantenimiento->spare_parts_cost,
                    'spare_parts' => $mantenimiento->spareParts->map(function ($part) {
                        return [
                            'id' => $part->id,
                            'name' => $part->name,
                            'quantity' => $part->pivot->quantity,
                            'sale_price' => $part->sale_price,
                            'total' => $part->sale_price * $part->pivot->quantity,
                        ];
                    }),
                ];
            });

        return Inertia::render('Facturas/Create', [
            'cais_disponibles' => $caisDisponibles,
            'clientes' => $clientes,
            'mantenimientos_facturables' => $mantenimientosFacturables,
        ]);
    }

    /**
     * Store a newly created factura (LÓGICA CRÍTICA)
     */
    public function store(StoreFacturaRequest $request)
    {
        try {
            DB::beginTransaction();

            // 1. Obtener CAI activo con bloqueo para evitar correlativo duplicado
            $cai = CaiAutorizacion::lockForUpdate()
                ->activos()
                ->porTipoDocumento('FACTURA')
                ->firstOrFail();

            // 2. Validar disponibilidad
            if ($cai->esta_agotado || $cai->esta_vencido) {
                throw new \Exception('CAI no disponible. Estado: ' . $cai->verificarEstado());
            }

            // 3. Obtener siguiente correlativo (auto-incrementa en DB)
            $correlativo = $cai->obtenerSiguienteCorrelativo();

            // 4. Calcular totales fiscales desde el detalle
            $totales = $this->calcularTotalesFiscales($request->detalles);

            // 5. Crear factura
            $factura = Factura::create([
                'cai_autorizacion_id' => $cai->id,
                'numero_correlativo' => $correlativo,
                'numero_factura' => $cai->generarNumeroFactura($correlativo),
                'cai' => $cai->cai,
                'cliente_id' => $request->cliente_id,
                'cliente_rtn' => $request->cliente_rtn,
                'cliente_nombre' => $request->cliente_nombre,
                'cliente_direccion' => $request->cliente_direccion,
                'cliente_telefono' => $request->cliente_telefono,
                'cliente_email' => $request->cliente_email,
                'mantenimiento_id' => $request->mantenimiento_id,
                'orden_trabajo_id' => $request->orden_trabajo_id,
                'fecha_emision' => now(),
                'fecha_limite_emision' => $cai->fecha_limite_emision,
                'tipo_pago' => $request->tipo_pago,
                'dias_credito' => $request->dias_credito,
                'subtotal_gravado_15' => $totales['subtotal_gravado_15'],
                'subtotal_gravado_18' => $totales['subtotal_gravado_18'],
                'subtotal_exento' => $totales['subtotal_exento'],
                'subtotal' => $totales['subtotal'],
                'isv_15' => $totales['isv_15'],
                'isv_18' => $totales['isv_18'],
                'isv_total' => $totales['isv_total'],
                'total_a_pagar' => $totales['total'],
                'exenta' => $request->exenta ?? false,
                'orden_compra_exenta' => $request->orden_compra_exenta,
                'constancia_exoneracion' => $request->constancia_exoneracion,
                'estado' => 'VIGENTE',
                'emitida_por' => auth()->id(),
            ]);

            // 6. Crear detalles
            foreach ($request->detalles as $index => $detalle) {
                $calculos = DetalleFactura::calcularLinea(
                    $detalle['cantidad'],
                    $detalle['precio_unitario'],
                    $detalle['tipo_gravamen'],
                    $detalle['descuento_porcentaje'] ?? 0
                );

                $factura->detalles()->create([
                    'numero_linea' => $index + 1,
                    'producto_servicio_id' => $detalle['producto_servicio_id'] ?? null,
                    'codigo_producto' => $detalle['codigo_producto'] ?? null,
                    'descripcion' => $detalle['descripcion'],
                    'cantidad' => $detalle['cantidad'],
                    'unidad_medida' => $detalle['unidad_medida'] ?? 'UND',
                    'precio_unitario' => $detalle['precio_unitario'],
                    'tipo_gravamen' => $detalle['tipo_gravamen'],
                    'tasa_isv' => $calculos['tasa_isv'],
                    'descuento_porcentaje' => $detalle['descuento_porcentaje'] ?? 0,
                    'descuento_monto' => $calculos['descuento_monto'],
                    'subtotal_linea' => $calculos['subtotal_linea'],
                    'isv_linea' => $calculos['isv_linea'],
                    'total_linea' => $calculos['total_linea'],
                ]);
            }

            // 7. Registrar log
            LogFacturacion::registrar(
                $factura->id,
                auth()->id(),
                'CREACION',
                'Factura creada exitosamente',
                null,
                $factura->toArray()
            );

            DB::commit();

            return redirect()->route('facturas.show', $factura->id)
                ->with('success', "Factura {$factura->numero_factura} generada exitosamente");

        } catch (\Exception $e) {
            DB::rollBack();

            return back()
                ->withInput()
                ->withErrors(['error' => 'Error al generar factura: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified factura
     */
    public function show(Factura $factura)
    {
        $factura->load([
            'detalles',
            'caiAutorizacion',
            'cliente',
            'mantenimiento',
            'emisor',
            'anulador',
            'logs.usuario'
        ]);

        return Inertia::render('Facturas/Show', [
            'factura' => $factura,
        ]);
    }

    /**
     * Anular una factura (NO DELETE - SOFT)
     */
    public function anular(Request $request, Factura $factura)
    {
        $request->validate([
            'motivo' => 'required|string|min:10|max:500',
        ], [
            'motivo.required' => 'Debe especificar el motivo de anulación',
            'motivo.min' => 'El motivo debe tener al menos 10 caracteres',
        ]);

        try {
            DB::beginTransaction();

            $datosAnteriores = $factura->toArray();

            $factura->anular($request->motivo, auth()->id());

            // Registrar log de anulación
            LogFacturacion::registrar(
                $factura->id,
                auth()->id(),
                'ANULACION',
                'Factura anulada: ' . $request->motivo,
                $datosAnteriores,
                $factura->fresh()->toArray()
            );

            DB::commit();

            return redirect()->route('facturas.show', $factura->id)
                ->with('success', 'Factura anulada exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors(['error' => 'Error al anular factura: ' . $e->getMessage()]);
        }
    }

    /**
     * Generate PDF for fiscal invoice
     */
    public function generarPDF(Factura $factura)
    {
        $factura->load([
            'detalles',
            'caiAutorizacion',
            'emisor',
        ]);

        // Marcar como impresa en el primer PDF generado
        if (!$factura->impresa) {
            $factura->marcarImpresa();

            LogFacturacion::registrar(
                $factura->id,
                auth()->id(),
                'IMPRESION',
                'Primera impresión de factura generada'
            );
        }

        $pdf = Pdf::loadView('pdf.factura', [
            'factura' => $factura,
        ])->setPaper('letter');

        return $pdf->stream("Factura-{$factura->numero_factura}.pdf");
    }

    /**
     * Marcar factura como impresa manualmente
     */
    public function marcarImpresa(Factura $factura)
    {
        try {
            $factura->marcarImpresa();

            LogFacturacion::registrar(
                $factura->id,
                auth()->id(),
                'IMPRESION',
                'Factura marcada como impresa'
            );

            return back()->with('success', 'Factura marcada como impresa');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Calcular totales fiscales desde el detalle
     */
    private function calcularTotalesFiscales(array $detalles)
    {
        $totales = [
            'subtotal_gravado_15' => 0,
            'subtotal_gravado_18' => 0,
            'subtotal_exento' => 0,
            'isv_15' => 0,
            'isv_18' => 0,
        ];

        foreach ($detalles as $detalle) {
            $calculos = DetalleFactura::calcularLinea(
                $detalle['cantidad'],
                $detalle['precio_unitario'],
                $detalle['tipo_gravamen'],
                $detalle['descuento_porcentaje'] ?? 0
            );

            switch ($detalle['tipo_gravamen']) {
                case 'GRAVADO_15':
                    $totales['subtotal_gravado_15'] += $calculos['subtotal_linea'];
                    $totales['isv_15'] += $calculos['isv_linea'];
                    break;
                case 'GRAVADO_18':
                    $totales['subtotal_gravado_18'] += $calculos['subtotal_linea'];
                    $totales['isv_18'] += $calculos['isv_linea'];
                    break;
                case 'EXENTO':
                    $totales['subtotal_exento'] += $calculos['subtotal_linea'];
                    break;
            }
        }

        $totales['subtotal'] = $totales['subtotal_gravado_15']
                             + $totales['subtotal_gravado_18']
                             + $totales['subtotal_exento'];

        $totales['isv_total'] = $totales['isv_15'] + $totales['isv_18'];
        $totales['total'] = $totales['subtotal'] + $totales['isv_total'];

        // Redondear a 2 decimales
        return array_map(fn($valor) => round($valor, 2), $totales);
    }
}
