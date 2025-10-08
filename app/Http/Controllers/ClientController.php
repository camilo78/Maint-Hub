<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Redirect;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\User;

/**
 * Controlador de Usuarios
 * 
 * Maneja todas las operaciones CRUD de usuarios:
 * - Listado con filtros y paginación
 * - Creación de nuevos usuarios
 * - Actualización de usuarios existentes
 * - Eliminación de usuarios
 * - Asignación de roles y permisos
 */
class ClientController extends Controller
{
    private function formatStatus($status)
    {
        return ucwords(str_replace('_', ' ', $status));
    }


    public function index(Request $request)
    {
        $search = $request->input('search');
        
        $query = User::query()->with(['roles','permissions'])
            ->whereHas('roles', function ($q) {
                $q->where('name', 'Client');
            });

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                ->orWhere('email', 'like', '%' . $search . '%')
                ->orWhere('phone', 'like', '%' . $search . '%')
                ->orWhere('rtn_dni_passport', 'like', '%' . $search . '%');
            });
        }

        $users = $query->paginate(10)->withQueryString();

        return Inertia::render('clients/index', [
            'users' => $users,
            'search' => $search
        ]);
    }
    

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:users,email',
            'phone' => 'required|string|max:20',
            'tipo' => 'required|in:particular,corporativo,extranjero',
            'rtn_dni_passport' => 'required|string|max:20',
            'address' => 'required|string|max:500',
            'password' => 'required|string|min:6'
        ]);
    
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'tipo' => $validated['tipo'],
            'rtn_dni_passport' => $validated['rtn_dni_passport'],
            'address' => $validated['address'],
            'password' => bcrypt($validated['password'])
        ]);
        
        $user->assignRole('Client');
        
        return back()->with('success', 'Cliente creado exitosamente!');
    }

    /**
     * Display the specified resource.
     */
    public function show(User $client, Request $request)
    {
        if (!$client->hasRole('Client')) {
            abort(404);
        }
        
        $client->load(['roles', 'permissions']);
        
        $search = $request->input('equipment_search');
        $showAll = $request->boolean('show_all');
        
        $equipmentQuery = \App\Models\Equipment::where('client_id', $client->id);
        
        if ($search && trim($search) !== '') {
            $searchTerm = trim($search);
            $equipmentQuery->where(function ($q) use ($searchTerm) {
                $q->where('description', 'LIKE', '%' . $searchTerm . '%')
                  ->orWhere('asset_tag', 'LIKE', '%' . $searchTerm . '%')
                  ->orWhere('category', 'LIKE', '%' . $searchTerm . '%')
                  ->orWhere('status', 'LIKE', '%' . $searchTerm . '%')
                  ->orWhere('brand', 'LIKE', '%' . $searchTerm . '%')
                  ->orWhere('model', 'LIKE', '%' . $searchTerm . '%');
            });
        }
        
        if ($showAll) {
            $equipment = $equipmentQuery->orderBy('created_at', 'desc')->get();
            $equipment = [
                'data' => $equipment,
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => $equipment->count(),
                'total' => $equipment->count(),
                'links' => []
            ];
        } else {
            $equipment = $equipmentQuery->orderBy('created_at', 'desc')
                ->paginate(10, ['*'], 'equipment_page')
                ->withQueryString();
        }
        
        return Inertia::render('clients/show', [
            'user' => $client,
            'equipment' => $equipment,
            'equipment_search' => $search,
            'show_all' => $showAll
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    public function update(Request $request, User $client): RedirectResponse
    {
        if (!$client->hasRole('Client')) {
            return back()->withErrors(['error' => 'Solo se pueden editar clientes.']);
        }
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:users,email,' . $client->id,
            'phone' => 'required|string|max:20',
            'tipo' => 'required|in:particular,corporativo,extranjero',
            'rtn_dni_passport' => 'required|string|max:20',
            'address' => 'required|string|max:500',
            'password' => 'nullable|string|min:6'
        ]);
        
        $client->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'tipo' => $validated['tipo'],
            'rtn_dni_passport' => $validated['rtn_dni_passport'],
            'address' => $validated['address']
        ]);
        
        if (!empty($validated['password'])) {
            $client->update(['password' => bcrypt($validated['password'])]);
        }
        
        return back()->with('success', 'Cliente actualizado exitosamente!');
    }


    public function destroy(User $client): RedirectResponse
    {
        if (!$client->hasRole('Client')) {
            return back()->withErrors(['error' => 'Solo se pueden eliminar clientes.']);
        }
        
        if ($client->id === auth()->id()) {
            return back()->withErrors(['error' => 'No puedes eliminar tu propia cuenta.']);
        }
        
        $client->delete();
        
        return back()->with('success', 'Cliente eliminado exitosamente.');
    }

    /**
     * Export equipment for a specific client to an Excel file.
     */
    public function exportEquipment(User $client)
    {
        if (!$client->hasRole('Client')) {
            abort(404);
        }

        $equipment = \App\Models\Equipment::where('client_id', $client->id)->get();
        
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        // Title
        $title = 'Inventario de equipos ' . $client->name . ', ' . now()->format('d/m/Y');
        $sheet->setCellValue('A1', $title);
        $sheet->mergeCells('A1:H1');
        $sheet->getStyle('A1')->getFont()->setBold(true);
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('A1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('E5E5E5');
        
        // Headers
        $sheet->setCellValue('A2', '#');
        $sheet->setCellValue('B2', 'Etiqueta de Activo');
        $sheet->setCellValue('C2', 'Descripción');
        $sheet->setCellValue('D2', 'Categoría');
        $sheet->setCellValue('E2', 'Estado');
        $sheet->setCellValue('F2', 'Marca');
        $sheet->setCellValue('G2', 'Modelo');
        $sheet->setCellValue('H2', 'Especificaciones');
        $sheet->getStyle('A2:H2')->getFont()->setBold(true);
        $sheet->getStyle('A2:H2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('A2:H2')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('E5E5E5');
        
        // Data
        $row = 3;
        $counter = 1;
        foreach ($equipment as $item) {
            $sheet->setCellValue('A' . $row, $counter);
            $sheet->setCellValue('B' . $row, $item->asset_tag);
            $sheet->setCellValue('C' . $row, $item->description);
            $sheet->setCellValue('D' . $row, $item->category);
            $sheet->setCellValue('E' . $row, $this->formatStatus($item->status));
            $sheet->setCellValue('F' . $row, $item->brand);
            $sheet->setCellValue('G' . $row, $item->model);
            $specifications = '';
            if ($item->specifications) {
                $specs = is_array($item->specifications) ? $item->specifications : json_decode($item->specifications, true);
                $specText = [];
                foreach ($specs as $key => $value) {
                    $specText[] = ucfirst(str_replace('_', ' ', $key)) . ': ' . $value;
                }
                $specifications = implode(', ', $specText);
            }
            $sheet->setCellValue('H' . $row, $specifications);
            $row++;
            $counter++;
        }
        
        // Auto-size columns
        foreach (range('A', 'H') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }
        
        // Add borders to table
        $tableRange = 'A2:H' . ($row - 1);
        $sheet->getStyle($tableRange)->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
        
        $fileName = 'equipos-' . str_replace(' ', '-', strtolower($client->name)) . '-' . now()->format('Y-m-d') . '.xlsx';
        
        $writer = new Xlsx($spreadsheet);
        
        return response()->streamDownload(function() use ($writer) {
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    /**
     * Export equipment for a specific client to a PDF file.
     */
    public function exportEquipmentPdf(User $client)
    {
        if (!$client->hasRole('Client')) {
            abort(404);
        }

        $equipment = \App\Models\Equipment::where('client_id', $client->id)->get();
        
        $data = [
            'client' => $client,
            'equipment' => $equipment,
            'date' => now()->format('d/m/Y')
        ];
        
        $pdf = Pdf::loadView('exports.equipment-pdf', $data);
        $fileName = 'equipos-' . str_replace(' ', '-', strtolower($client->name)) . '-' . now()->format('Y-m-d') . '.pdf';
        
        return $pdf->download($fileName);
    }
}
