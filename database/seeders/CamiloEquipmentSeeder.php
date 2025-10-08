<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Equipment;
use Illuminate\Support\Facades\DB;

class CamiloEquipmentSeeder extends Seeder
{
    public function run(): void
    {
        $camilo = User::where('name', 'Camilo Alvarado')->first();
        
        if (!$camilo) {
            $this->command->error('Usuario Camilo Alvarado no encontrado');
            return;
        }

        $brands = ['LG', 'Samsung', 'Carrier', 'Daikin', 'Mitsubishi', 'York', 'Trane', 'Lennox'];
        $models = ['Inverter 12000', 'Split 18000', 'Window 9000', 'Cassette 24000', 'Ducted 36000'];
        $locations = ['Sala Principal', 'Dormitorio 1', 'Dormitorio 2', 'Oficina', 'Cocina', 'Comedor', 'Recepción', 'Sala de Juntas'];
        $statuses = ['buen_estado', 'mal_estado', 'mantenimiento'];

        $descriptions = [
            'Aire 9000 BTU',
            'Aire 12000 BTU', 
            'Aire 18000 BTU',
            'Aire 24000 BTU',
            'Aire central 36000 BTU',
            'Mini Split Inverter',
            'Ventana 110V',
            'Cassette techo'
        ];

        for ($i = 1; $i <= 50; $i++) {
            Equipment::create([
                'client_id' => $camilo->id,
                'asset_tag' => Equipment::generateAssetTag($camilo->id),
                'category' => 'Aire Acondicionado',
                'description' => $descriptions[array_rand($descriptions)],
                'brand' => $brands[array_rand($brands)],
                'model' => $models[array_rand($models)],
                'serial_number' => 'SN' . rand(100000, 999999),
                'location' => $locations[array_rand($locations)],
                'status' => $statuses[array_rand($statuses)],
                'installation_date' => now()->subDays(rand(30, 365)),
                'warranty_expires_on' => now()->addMonths(rand(6, 24)),
                'specifications' => [
                    'btu' => rand(9000, 36000),
                    'voltaje' => rand(0, 1) ? '110V' : '220V',
                    'refrigerante' => 'R410A',
                    'eficiencia' => rand(10, 20) . ' SEER'
                ]
            ]);
        }

        $this->command->info('50 equipos de aire acondicionado creados para Camilo Alvarado');
    }
}