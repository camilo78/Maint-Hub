<?php

namespace Database\Seeders;

use App\Models\SparePart;
use Illuminate\Database\Seeder;

class SparePartSeeder extends Seeder
{
    public function run(): void
    {
        $spareParts = [
            [
                'name' => 'Industrial Air Filter',
                'sku' => 'FAI-001',
                'description' => 'High efficiency air filter for industrial equipment',
                'brand' => 'FilterPro',
                'part_number' => 'FP-AI-2024',
                'stock' => 25,
                'minimum_stock' => 5,
                'cost_price' => 45.50,
                'sale_price' => 65.00,
                'unit_measure' => 'Unit',
                'location' => 'Shelf A-1'
            ],
            [
                'name' => 'Hydraulic Oil 10W40',
                'sku' => 'AH-10W40',
                'description' => 'Synthetic hydraulic oil for heavy machinery',
                'brand' => 'HydroMax',
                'part_number' => 'HM-10W40-5L',
                'stock' => 50,
                'minimum_stock' => 10,
                'cost_price' => 28.75,
                'sale_price' => 42.00,
                'unit_measure' => 'Liter',
                'location' => 'Warehouse B-3'
            ],
            [
                'name' => 'Hex Bolt M8x25',
                'sku' => 'TH-M8-25',
                'description' => 'Stainless steel hex bolt M8x25mm',
                'brand' => 'FastenPro',
                'part_number' => 'FP-TH-M8-25',
                'stock' => 200,
                'minimum_stock' => 50,
                'cost_price' => 0.85,
                'sale_price' => 1.25,
                'unit_measure' => 'Unit',
                'location' => 'Drawer C-12'
            ],
            [
                'name' => 'Bearing 6205-2RS',
                'sku' => 'ROD-6205-2RS',
                'description' => 'Sealed ball bearing',
                'brand' => 'BearingTech',
                'part_number' => 'BT-6205-2RS',
                'stock' => 15,
                'minimum_stock' => 3,
                'cost_price' => 12.30,
                'sale_price' => 18.50,
                'unit_measure' => 'Unit',
                'location' => 'Shelf D-2'
            ]
        ];

        foreach ($spareParts as $sparePart) {
            SparePart::create($sparePart);
        }
    }
}