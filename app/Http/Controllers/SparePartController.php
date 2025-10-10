<?php

namespace App\Http\Controllers;

use App\Models\SparePart;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SparePartController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:255|unique:spare_parts,sku',
            'description' => 'nullable|string',
            'brand' => 'nullable|string|max:255',
            'part_number' => 'nullable|string|max:255',
            'stock' => 'required|integer|min:0',
            'minimum_stock' => 'required|integer|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'unit_measure' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
        ]);

        $sparePart = SparePart::create($validated);

        return response()->json([
            'message' => 'Spare part created successfully',
            'sparePart' => $sparePart
        ]);
    }

    public function update(Request $request, SparePart $sparePart)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => ['required', 'string', 'max:255', Rule::unique('spare_parts', 'sku')->ignore($sparePart->id)],
            'description' => 'nullable|string',
            'brand' => 'nullable|string|max:255',
            'part_number' => 'nullable|string|max:255',
            'stock' => 'required|integer|min:0',
            'minimum_stock' => 'required|integer|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'unit_measure' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
        ]);

        $sparePart->update($validated);

        return response()->json([
            'message' => 'Spare part updated successfully',
            'sparePart' => $sparePart
        ]);
    }
}