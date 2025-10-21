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
        Schema::create('detalle_facturas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('factura_id')->constrained('facturas')->onDelete('cascade');
            $table->integer('numero_linea'); // Orden de la línea
            $table->unsignedBigInteger('producto_servicio_id')->nullable();
            $table->string('codigo_producto', 50)->nullable();
            $table->text('descripcion'); // OBLIGATORIO
            $table->decimal('cantidad', 10, 2); // OBLIGATORIO
            $table->string('unidad_medida', 20)->default('UND'); // Ej: "UND", "HRS", "KG"
            $table->decimal('precio_unitario', 12, 2); // OBLIGATORIO

            // Fiscales por línea
            $table->enum('tipo_gravamen', ['GRAVADO_15', 'GRAVADO_18', 'EXENTO']);
            $table->decimal('tasa_isv', 5, 2); // 15.00 o 18.00 o 0.00
            $table->decimal('descuento_porcentaje', 5, 2)->default(0.00);
            $table->decimal('descuento_monto', 12, 2)->default(0.00);

            // Cálculos (almacenados para auditoría)
            $table->decimal('subtotal_linea', 12, 2); // (cantidad * precio_unitario) - descuento
            $table->decimal('isv_linea', 12, 2); // subtotal_linea * (tasa_isv/100)
            $table->decimal('total_linea', 12, 2); // subtotal_linea + isv_linea

            $table->timestamps();

            // Índices
            $table->index(['factura_id', 'numero_linea']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detalle_facturas');
    }
};
