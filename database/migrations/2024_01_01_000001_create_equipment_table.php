<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipment', function (Blueprint $table) {
            // --- CAMPOS UNIVERSALES (Aplican a CUALQUIER equipo) ---
            $table->id();
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->string('asset_tag')->unique()->nullable(); // Etiqueta/QR para identificarlo
            $table->string('category'); // Categoría principal (Ej: "Aire Acondicionado", "Línea Blanca", "TV y Video")
            $table->string('description')->nullable(); // Descripción del equipo (Ej: "TV 50 pulgadas", "Aire acondicionado 12000 BTU")
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->string('serial_number')->nullable();
            $table->string('location')->comment('Ubicación dentro del inmueble del cliente'); // Ubicación dentro del inmueble del cliente
            $table->enum('status', ['buen_estado', 'mal_estado', 'mantenimiento'])->default('buen_estado');
            $table->date('installation_date')->nullable();
            $table->date('warranty_expires_on')->nullable();
            $table->text('notes')->nullable();
            
            // --- CAMPO MÁGICO PARA ESPECIFICACIONES ---
            $table->json('specifications')->nullable(); // Aquí guardaremos los detalles específicos de cada tipo

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipment');
    }
};