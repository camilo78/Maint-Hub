<?php

namespace Database\Factories;

use App\Models\Equipment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class EquipmentFactory extends Factory
{
    protected $model = Equipment::class;

    public function definition(): array
    {
        $categories = [
            'Aire Acondicionado' => [
                'TV 32 pulgadas',
                'TV 43 pulgadas', 
                'TV 50 pulgadas',
                'TV 55 pulgadas',
                'TV 65 pulgadas'
            ],
            'Línea Blanca' => [
                'Refrigeradora 18 pies',
                'Refrigeradora 21 pies',
                'Lavadora 15 kg',
                'Lavadora 18 kg',
                'Microondas 1.2 cu ft'
            ],
            'TV y Video' => [
                'Aire 9000 BTU',
                'Aire 12000 BTU', 
                'Aire 18000 BTU',
                'Aire 24000 BTU',
                'Aire central 36000 BTU'
            ]
        ];

        $category = $this->faker->randomElement(array_keys($categories));
        $description = $this->faker->randomElement($categories[$category]);

        $clientId = User::factory()->create()->id;
        
        return [
            'client_id' => $clientId,
            'asset_tag' => Equipment::generateAssetTag($clientId),
            'category' => $category,
            'description' => $description,
            'brand' => $this->faker->randomElement(['LG', 'Samsung', 'Sony', 'Whirlpool', 'Carrier', 'Daikin']),
            'model' => $this->faker->bothify('??###'),
            'serial_number' => $this->faker->bothify('SN########'),
            'location' => $this->faker->randomElement(['Sala', 'Dormitorio 1', 'Dormitorio 2', 'Cocina', 'Oficina']),
            'status' => $this->faker->randomElement(['buen_estado', 'mal_estado', 'en_reparacion']),
            'installation_date' => $this->faker->dateTimeBetween('-2 years', 'now'),
            'warranty_expires_on' => $this->faker->dateTimeBetween('now', '+2 years'),
            'specifications' => [
                'voltaje' => $this->faker->randomElement(['110V', '220V']),
                'consumo' => $this->faker->numberBetween(100, 2000) . 'W'
            ]
        ];
    }
}