<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCaiRequest;
use App\Models\CaiAutorizacion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CaiAutorizacionController extends Controller
{
    /**
     * Display a listing of CAI authorizations
     */
    public function index(Request $request)
    {
        $query = CaiAutorizacion::query()
            ->when($request->estado, function ($query, $estado) {
                $query->where('estado', $estado);
            })
            ->when($request->tipo_documento, function ($query, $tipo) {
                $query->where('tipo_documento', $tipo);
            })
            ->orderBy('created_at', 'desc');

        $cais = $query->paginate(15)->withQueryString();

        // Actualizar estados antes de mostrar
        foreach ($cais as $cai) {
            $cai->verificarEstado();
        }

        return Inertia::render('CAI/Index', [
            'cais' => $cais,
            'filtros' => $request->only(['estado', 'tipo_documento']),
        ]);
    }

    /**
     * Show the form for creating a new CAI
     */
    public function create()
    {
        return Inertia::render('CAI/Create');
    }

    /**
     * Store a newly created CAI
     */
    public function store(StoreCaiRequest $request)
    {
        try {
            $cai = CaiAutorizacion::create([
                'rtn_emisor' => $request->rtn_emisor,
                'nombre_comercial' => $request->nombre_comercial,
                'punto_emision' => $request->punto_emision,
                'tipo_documento' => $request->tipo_documento,
                'cai' => $request->cai,
                'prefijo' => $request->prefijo,
                'rango_inicial' => $request->rango_inicial,
                'rango_final' => $request->rango_final,
                'ultimo_correlativo_usado' => $request->rango_inicial - 1, // Iniciar antes del primer número
                'fecha_limite_emision' => $request->fecha_limite_emision,
                'estado' => 'ACTIVO',
                'constancia_registro' => $request->constancia_registro,
            ]);

            return redirect()->route('cai.index')
                ->with('success', 'CAI registrado exitosamente');

        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => 'Error al registrar CAI: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified CAI
     */
    public function show(CaiAutorizacion $cai)
    {
        $cai->load(['facturas' => function ($query) {
            $query->orderBy('created_at', 'desc')->take(50);
        }]);

        $cai->verificarEstado();

        return Inertia::render('CAI/Show', [
            'cai' => $cai,
            'estadisticas' => [
                'total_facturas' => $cai->facturas()->count(),
                'facturas_vigentes' => $cai->facturas()->vigentes()->count(),
                'facturas_anuladas' => $cai->facturas()->anuladas()->count(),
                'monto_total' => $cai->facturas()->vigentes()->sum('total_a_pagar'),
                'utilizacion_porcentaje' => round(
                    (($cai->ultimo_correlativo_usado - $cai->rango_inicial + 1) /
                    ($cai->rango_final - $cai->rango_inicial + 1)) * 100,
                    2
                ),
            ],
        ]);
    }

    /**
     * Desactivar CAI (soft delete)
     */
    public function desactivar(CaiAutorizacion $cai)
    {
        try {
            $cai->update(['estado' => 'INACTIVO']);

            return redirect()->route('cai.index')
                ->with('success', 'CAI desactivado exitosamente');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Reactivar CAI (si no está vencido ni agotado)
     */
    public function reactivar(CaiAutorizacion $cai)
    {
        try {
            if ($cai->esta_vencido) {
                throw new \Exception('No se puede reactivar un CAI vencido');
            }

            if ($cai->esta_agotado) {
                throw new \Exception('No se puede reactivar un CAI agotado');
            }

            $cai->update(['estado' => 'ACTIVO']);

            return redirect()->route('cai.index')
                ->with('success', 'CAI reactivado exitosamente');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
