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
        Schema::create('facturas', function (Blueprint $table) {
            $table->id();

            // Referencias a CAI
            $table->foreignId('cai_autorizacion_id')->constrained('cai_autorizaciones');
            $table->string('numero_factura', 50); // Prefijo + Correlativo completo
            $table->unsignedBigInteger('numero_correlativo'); // Solo el número
            $table->string('cai', 50); // Denormalizado para reportes

            // Cliente (OBLIGATORIO por ley)
            $table->foreignId('cliente_id')->nullable()->constrained('users');
            $table->string('cliente_rtn', 20); // OBLIGATORIO: DNI, RTN o Pasaporte del cliente
            $table->string('cliente_nombre', 255); // OBLIGATORIO
            $table->text('cliente_direccion')->nullable();
            $table->string('cliente_telefono', 20)->nullable();
            $table->string('cliente_email', 100)->nullable();

            // Referencias internas
            $table->foreignId('mantenimiento_id')->nullable()->constrained('maintenances');
            $table->unsignedBigInteger('orden_trabajo_id')->nullable();

            // Fechas y control
            $table->dateTime('fecha_emision'); // OBLIGATORIO
            $table->date('fecha_limite_emision'); // Del CAI, denormalizado
            $table->enum('tipo_pago', ['CONTADO', 'CREDITO', 'TARJETA', 'TRANSFERENCIA']);
            $table->integer('dias_credito')->nullable(); // Si tipo_pago = CREDITO

            // Montos fiscales (CRÍTICO - 2 decimales)
            $table->decimal('subtotal_gravado_15', 12, 2)->default(0.00);
            $table->decimal('subtotal_gravado_18', 12, 2)->default(0.00);
            $table->decimal('subtotal_exento', 12, 2)->default(0.00);
            $table->decimal('subtotal', 12, 2); // Suma de todos los subtotales
            $table->decimal('isv_15', 12, 2)->default(0.00); // 15% sobre gravado_15
            $table->decimal('isv_18', 12, 2)->default(0.00); // 18% sobre gravado_18
            $table->decimal('isv_total', 12, 2); // Suma de ISV
            $table->decimal('total_a_pagar', 12, 2); // subtotal + isv_total

            // Exenciones (cuando aplique)
            $table->boolean('exenta')->default(false);
            $table->string('orden_compra_exenta', 50)->nullable(); // OBLIGATORIO si exenta=true
            $table->string('constancia_exoneracion', 50)->nullable();

            // Control fiscal
            $table->enum('estado', ['VIGENTE', 'ANULADA', 'CANCELADA'])->default('VIGENTE');
            $table->text('motivo_anulacion')->nullable();
            $table->foreignId('anulada_por')->nullable()->constrained('users');
            $table->dateTime('anulada_at')->nullable();

            // Auditoría
            $table->foreignId('emitida_por')->constrained('users'); // Usuario que emitió
            $table->boolean('impresa')->default(false);
            $table->dateTime('impresa_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->unique(['cai_autorizacion_id', 'numero_correlativo']);
            $table->index('fecha_emision');
            $table->index('cliente_rtn');
            $table->index('estado');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('facturas');
    }
};
