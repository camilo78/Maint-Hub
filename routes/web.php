<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\SparePartController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Maintenance routes
    Route::resource('maintenances', MaintenanceController::class);
    
    // Spare Parts routes
    Route::post('spare-parts', [SparePartController::class, 'store'])->name('spare-parts.store');
    Route::put('spare-parts/{sparePart}', [SparePartController::class, 'update'])->name('spare-parts.update');
});


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
