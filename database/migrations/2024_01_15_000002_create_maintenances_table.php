<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenances', function (Blueprint $table) {
            $table->id();
            $table->text('description');
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('equipment_id')->constrained('equipment')->onDelete('cascade');
            $table->enum('priority', ['red', 'orange', 'yellow', 'green'])->default('green');
            $table->enum('type', ['preventive', 'corrective']);
            $table->enum('status', ['pending', 'in_progress', 'completed', 'rescheduled', 'cancelled'])->default('pending');
            $table->decimal('cost', 10, 2)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenances');
    }
};