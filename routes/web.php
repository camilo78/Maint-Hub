<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\MaintenanceFileController;
use App\Http\Controllers\MaintenanceAssignmentController;
use App\Http\Controllers\SparePartController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Maintenance routes
    Route::resource('maintenances', MaintenanceController::class);

    // Maintenance Files routes
    Route::post('maintenances/{maintenance}/images', [MaintenanceFileController::class, 'uploadImages'])->name('maintenances.images.upload');
    Route::delete('maintenance-images/{image}', [MaintenanceFileController::class, 'deleteImage'])->name('maintenances.images.delete');
    Route::post('maintenances/{maintenance}/documents', [MaintenanceFileController::class, 'uploadDocuments'])->name('maintenances.documents.upload');
    Route::delete('maintenance-documents/{document}', [MaintenanceFileController::class, 'deleteDocument'])->name('maintenances.documents.delete');

    // Maintenance Spare Parts routes (solo para edición)
    Route::post('maintenances/{maintenance}/spare-parts', [MaintenanceController::class, 'attachSparePart'])->name('maintenances.spare-parts.attach');
    Route::delete('maintenances/{maintenance}/spare-parts/{sparePart}', [MaintenanceController::class, 'detachSparePart'])->name('maintenances.spare-parts.detach');
    Route::put('maintenances/{maintenance}/spare-parts/{sparePart}', [MaintenanceController::class, 'updateSparePart'])->name('maintenances.spare-parts.update');

    // Maintenance Crew Assignment routes (asignación de cuadrilla en vivo)
    Route::post('maintenances/{maintenance}/crew', [MaintenanceAssignmentController::class, 'assignTechnician'])->name('maintenances.crew.assign');
    Route::delete('maintenances/{maintenance}/crew/{user}', [MaintenanceAssignmentController::class, 'removeTechnician'])->name('maintenances.crew.remove');
    Route::post('maintenances/{maintenance}/crew/leader', [MaintenanceAssignmentController::class, 'changeLeader'])->name('maintenances.crew.change-leader');

    // Spare Parts routes
    Route::post('spare-parts', [SparePartController::class, 'store'])->name('spare-parts.store');
    Route::put('spare-parts/{sparePart}', [SparePartController::class, 'update'])->name('spare-parts.update');
});


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
