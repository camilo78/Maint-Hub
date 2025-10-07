<?php

namespace Database\Seeders;

use App\Models\Equipment;
use App\Models\User;
use Illuminate\Database\Seeder;

class EquipmentSeeder extends Seeder
{
    public function run(): void
    {
        $clients = User::role('client')->get();

        if ($clients->isEmpty()) {
            return;
        }

        $equipments = [
            [
                'client_id' => $clients->random()->id,
                'asset_tag' => null, // Se generará automáticamente
                'category' => 'Aire Acondicionado',
                'description' => 'Aire 12000 BTU',
                'brand' => 'LG',
                'model' => 'Dual Cool S4-W12JA3AA',
                'serial_number' => 'AC123456789',
                'location' => 'Sala principal',
                'status' => 'buen_estado',
                'installation_date' => now()->subMonths(6),
                'warranty_expires_on' => now()->addMonths(18),
                'specifications' => [
                    'btu' => 12000,
                    'voltage' => '220V',
                    'refrigerant_type' => 'R-410A',
                    'type' => 'split'
                ]
            ],
            [
                'client_id' => $clients->random()->id,
                'asset_tag' => null, // Se generará automáticamente
                'category' => 'Línea Blanca',
                'description' => 'Lavadora 15 kg',
                'brand' => 'Samsung',
                'model' => 'WF15T4000AV',
                'serial_number' => 'LV987654321',
                'location' => 'Área de lavado',
                'status' => 'buen_estado',
                'installation_date' => now()->subYear(),
                'warranty_expires_on' => now()->addMonths(12),
                'specifications' => [
                    'capacity_kg' => 15,
                    'type' => 'carga_frontal',
                    'energy_efficiency' => 'A++',
                    'rpm' => 1200
                ]
            ],
            [
                'client_id' => $clients->random()->id,
                'asset_tag' => null, // Se generará automáticamente
                'category' => 'TV y Video',
                'description' => 'TV 55 pulgadas',
                'brand' => 'Samsung',
                'model' => 'QN55Q80A',
                'serial_number' => 'TV555444333',
                'location' => 'Sala de estar',
                'status' => 'en_reparacion',
                'installation_date' => now()->subMonths(8),
                'warranty_expires_on' => now()->addMonths(16),
                'specifications' => [
                    'screen_size_inches' => 55,
                    'resolution' => '4K UHD',
                    'is_smart_tv' => true,
                    'hdr_support' => true
                ]
            ]
        ];

        foreach ($equipments as $equipment) {
            // Generar asset_tag si no existe
            if (empty($equipment['asset_tag'])) {
                $equipment['asset_tag'] = Equipment::generateAssetTag($equipment['client_id']);
            }
            Equipment::create($equipment);
        }
    }
}