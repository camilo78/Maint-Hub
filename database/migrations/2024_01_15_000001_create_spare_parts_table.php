<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spare_parts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('sku')->unique();
            $table->text('description')->nullable();
            $table->string('brand')->nullable();
            $table->string('part_number')->nullable();
            $table->unsignedInteger('stock')->default(0);
            $table->unsignedInteger('minimum_stock')->default(5);
            $table->decimal('cost_price', 10, 2)->nullable();
            $table->decimal('sale_price', 10, 2)->nullable();
            $table->string('unit_measure')->default('Unit');
            $table->string('location')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spare_parts');
    }
};