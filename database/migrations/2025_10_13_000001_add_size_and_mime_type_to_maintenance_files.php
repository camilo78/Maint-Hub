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
        // Agregar campos size y mime_type a maintenance_images
        Schema::table('maintenance_images', function (Blueprint $table) {
            $table->unsignedBigInteger('size')->nullable()->after('original_name');
            $table->string('mime_type')->nullable()->after('size');
        });

        // Agregar campos size y mime_type a maintenance_documents
        Schema::table('maintenance_documents', function (Blueprint $table) {
            $table->unsignedBigInteger('size')->nullable()->after('original_name');
            $table->string('mime_type')->nullable()->after('size');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('maintenance_images', function (Blueprint $table) {
            $table->dropColumn(['size', 'mime_type']);
        });

        Schema::table('maintenance_documents', function (Blueprint $table) {
            $table->dropColumn(['size', 'mime_type']);
        });
    }
};
