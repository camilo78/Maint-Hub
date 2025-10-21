<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cai_autorizaciones', function (Blueprint $table) {
            $table->id();
            $table->string('rtn_emisor', 18); // Formato: 0000-0000-000000 (14 dígitos + 2 guiones)
            $table->string('nombre_comercial', 255);
            $table->string('punto_emision', 3); // Ej: "001"
            $table->enum('tipo_documento', ['FACTURA', 'NOTA_CREDITO', 'NOTA_DEBITO']);
            $table->string('cai', 50); // Número CAI completo
            $table->string('prefijo', 10); // Ej: "FAC-001-001"
            $table->unsignedBigInteger('rango_inicial');
            $table->unsignedBigInteger('rango_final');
            $table->unsignedBigInteger('ultimo_correlativo_usado')->default(0);
            $table->date('fecha_limite_emision'); // Fecha de vencimiento del CAI
            $table->enum('estado', ['ACTIVO', 'AGOTADO', 'VENCIDO', 'INACTIVO'])->default('ACTIVO');
            $table->string('constancia_registro', 50)->nullable(); // Número de constancia del establecimiento
            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index(['estado', 'fecha_limite_emision']);
            $table->unique(['rtn_emisor', 'punto_emision', 'tipo_documento', 'ultimo_correlativo_usado'], 'unique_correlativo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cai_autorizaciones');
    }
};
