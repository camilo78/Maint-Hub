<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_spare_part', function (Blueprint $table) {
            $table->id();
            $table->foreignId('maintenance_id')->constrained()->onDelete('cascade');
            $table->foreignId('spare_part_id')->constrained()->onDelete('cascade');
            $table->unsignedInteger('quantity')->default(1);
            $table->string('observations')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_spare_part');
    }
};