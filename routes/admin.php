<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\EquipmentController;

Route::middleware(['auth', 'verified', 'role:Admin|Superadmin'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('roles', RoleController::class);
    Route::resource('permissions', PermissionController::class);
    Route::resource('clients', ClientController::class);
    Route::resource('employees', EmployeeController::class);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('equipment', EquipmentController::class);
});