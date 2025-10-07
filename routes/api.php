<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\V1\AuthController;
use App\Http\Controllers\API\V1\UserController;
use App\Models\Equipment;

Route::prefix('v1')->group(function () {
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);

        Route::get('users', [UserController::class, 'getUsers']);
    });
});

// Ruta para obtener todos los equipos de un cliente
Route::get('/clients/{clientId}/equipment/all', function ($clientId) {
    return Equipment::where('client_id', $clientId)
        ->select('id', 'asset_tag', 'brand', 'model', 'serial_number', 'category', 'description', 'location', 'status')
        ->get();
});