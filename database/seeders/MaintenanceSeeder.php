<?php

namespace Database\Seeders;

use App\Models\Maintenance;
use App\Models\User;
use App\Models\Equipment;
use App\Models\SparePart;
use Illuminate\Database\Seeder;

class MaintenanceSeeder extends Seeder
{
    public function run(): void
    {
        // Obtener clientes y equipos existentes
        $clients = User::whereHas('roles', function($q) {
            $q->where('name', 'Client');
        })->get();

        $equipment = Equipment::all();
        $spareParts = SparePart::all();

        if ($clients->isEmpty() || $equipment->isEmpty()) {
            return;
        }

        $maintenances = [
            [
                'description' => 'Mantenimiento preventivo mensual del sistema de aire acondicionado. Incluye limpieza de filtros, revisión de refrigerante y verificación de componentes eléctricos.',
                'client_id' => $clients->random()->id,
                'equipment_id' => $equipment->random()->id,
                'priority' => 'green',
                'type' => 'preventive',
                'status' => 'pending',
                'cost' => 150.00
            ],
            [
                'description' => 'Reparación urgente de falla en motor principal. El equipo presenta ruidos anómalos y vibración excesiva.',
                'client_id' => $clients->random()->id,
                'equipment_id' => $equipment->random()->id,
                'priority' => 'red',
                'type' => 'corrective',
                'status' => 'in_progress',
                'cost' => 450.00
            ],
            [
                'description' => 'Cambio de aceite hidráulico y revisión general del sistema. Mantenimiento programado cada 6 meses.',
                'client_id' => $clients->random()->id,
                'equipment_id' => $equipment->random()->id,
                'priority' => 'yellow',
                'type' => 'preventive',
                'status' => 'completed',
                'cost' => 280.00
            ],
            [
                'description' => 'Calibración de sensores y actualización de software del equipo. Incluye pruebas de funcionamiento.',
                'client_id' => $clients->random()->id,
                'equipment_id' => $equipment->random()->id,
                'priority' => 'orange',
                'type' => 'preventive',
                'status' => 'rescheduled',
                'cost' => 320.00
            ],
            [
                'description' => 'Reemplazo de componentes defectuosos identificados en inspección rutinaria. Requiere piezas especiales.',
                'client_id' => $clients->random()->id,
                'equipment_id' => $equipment->random()->id,
                'priority' => 'yellow',
                'type' => 'corrective',
                'status' => 'pending',
                'cost' => 680.00
            ],
            [
                'description' => 'Limpieza profunda y lubricación de partes móviles. Mantenimiento preventivo trimestral.',
                'client_id' => $clients->random()->id,
                'equipment_id' => $equipment->random()->id,
                'priority' => 'green',
                'type' => 'preventive',
                'status' => 'completed',
                'cost' => 120.00
            ]
        ];

        foreach ($maintenances as $maintenanceData) {
            $maintenance = Maintenance::create($maintenanceData);

            // Agregar repuestos aleatorios a algunos mantenimientos
            if ($spareParts->isNotEmpty() && rand(1, 100) > 50) {
                $randomSpareParts = $spareParts->random(rand(1, 3));
                
                foreach ($randomSpareParts as $sparePart) {
                    $maintenance->spareParts()->attach($sparePart->id, [
                        'quantity' => rand(1, 5),
                        'observations' => $this->getRandomObservation()
                    ]);
                }
            }
        }
    }

    private function getRandomObservation(): string
    {
        $observations = [
            'Pieza en buen estado',
            'Requiere instalación cuidadosa',
            'Verificar compatibilidad antes de instalar',
            'Pieza de repuesto original',
            'Instalación según manual del fabricante',
            'Revisar torque de ajuste',
            null // Algunas sin observaciones
        ];

        return $observations[array_rand($observations)] ?? '';
    }
}