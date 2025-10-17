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
        Schema::create('maintenance_user', function (Blueprint $table) {
            $table->foreignId('maintenance_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->boolean('is_leader')->default(false);
            $table->timestamps();

            // Asegurar que la combinación sea única
            $table->unique(['maintenance_id', 'user_id']);

            // Índices para mejorar performance
            $table->index('is_leader');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_user');
    }
};
