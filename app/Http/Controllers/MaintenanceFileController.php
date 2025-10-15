<?php

namespace App\Http\Controllers;

use App\Models\Maintenance;
use App\Models\MaintenanceDocument;
use App\Models\MaintenanceImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Controlador para manejar la subida de imágenes y documentos de mantenimientos
 * Se separa del MaintenanceController principal para evitar problemas con FormData
 */
class MaintenanceFileController extends Controller
{
    /**
     * Subir múltiples imágenes a un mantenimiento
     *
     * Validaciones:
     * - Máximo 10 MB por archivo
     * - Solo formatos: jpeg, png, jpg, gif, svg
     *
     * @param Request $request
     * @param Maintenance $maintenance
     * @return \Illuminate\Http\JsonResponse
     */
    public function uploadImages(Request $request, Maintenance $maintenance)
    {
        try {
            // Validar las imágenes
            $request->validate([
                'images' => 'required|array|max:10',
                'images.*' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:10240', // 10MB máximo
            ], [
                'images.*.max' => 'Cada imagen no puede exceder los 10 MB.',
                'images.*.image' => 'El archivo debe ser una imagen válida.',
                'images.*.mimes' => 'Solo se permiten imágenes en formato: jpeg, png, jpg, gif, svg.',
                'images.required' => 'Debe seleccionar al menos una imagen.',
                'images.max' => 'No puede subir más de 10 imágenes a la vez.',
            ]);

            $uploadedImages = [];

            foreach ($request->file('images') as $image) {
                // Generar nombre único para el archivo
                $originalName = $image->getClientOriginalName();
                $extension = $image->getClientOriginalExtension();
                $filename = Str::uuid() . '.' . $extension;

                // Definir la ruta completa donde se guardará
                $ruta = 'maintenance-images/' . $filename;

                // Guardar usando Storage::put() en el disco 'public'
                Storage::disk('public')->put($ruta, $image->get());

                // Crear registro en la base de datos
                $maintenanceImage = MaintenanceImage::create([
                    'maintenance_id' => $maintenance->id,
                    'path' => $ruta,
                    'original_name' => $originalName,
                    'size' => $image->getSize(),
                    'mime_type' => $image->getMimeType(),
                ]);

                // Agregar a la lista con todos los atributos necesarios
                $uploadedImages[] = [
                    'id' => $maintenanceImage->id,
                    'path' => $maintenanceImage->path,
                    'original_name' => $maintenanceImage->original_name,
                    'size' => $maintenanceImage->size,
                    'mime_type' => $maintenanceImage->mime_type,
                ];
            }

            return response()->json([
                'message' => 'Imágenes subidas exitosamente.',
                'images' => $uploadedImages
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error al subir imágenes:', [
                'maintenance_id' => $maintenance->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error al subir las imágenes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Subir múltiples documentos a un mantenimiento
     *
     * Validaciones:
     * - Máximo 10 MB por archivo
     * - Solo formatos: pdf, doc, docx, xls, xlsx
     *
     * @param Request $request
     * @param Maintenance $maintenance
     * @return \Illuminate\Http\JsonResponse
     */
    public function uploadDocuments(Request $request, Maintenance $maintenance)
    {
        try {
            // Validar los documentos
            $request->validate([
                'documents' => 'required|array|max:10',
                'documents.*' => 'required|file|mimes:pdf,doc,docx,xls,xlsx|max:10240', // 10MB máximo
            ], [
                'documents.*.max' => 'Cada documento no puede exceder los 10 MB.',
                'documents.*.file' => 'El archivo debe ser un documento válido.',
                'documents.*.mimes' => 'Solo se permiten documentos en formato: pdf, doc, docx, xls, xlsx.',
                'documents.required' => 'Debe seleccionar al menos un documento.',
                'documents.max' => 'No puede subir más de 10 documentos a la vez.',
            ]);

            $uploadedDocuments = [];

            foreach ($request->file('documents') as $document) {
                // Generar nombre único para el archivo
                $originalName = $document->getClientOriginalName();
                $extension = $document->getClientOriginalExtension();
                $filename = Str::uuid() . '.' . $extension;

                // Definir la ruta completa donde se guardará
                $ruta = 'maintenance-documents/' . $filename;

                // Guardar usando Storage::put() en el disco 'public'
                Storage::disk('public')->put($ruta, $document->get());

                // Crear registro en la base de datos
                $maintenanceDocument = MaintenanceDocument::create([
                    'maintenance_id' => $maintenance->id,
                    'path' => $ruta,
                    'original_name' => $originalName,
                    'size' => $document->getSize(),
                    'mime_type' => $document->getMimeType(),
                ]);

                // Agregar a la lista con todos los atributos necesarios
                $uploadedDocuments[] = [
                    'id' => $maintenanceDocument->id,
                    'path' => $maintenanceDocument->path,
                    'original_name' => $maintenanceDocument->original_name,
                    'size' => $maintenanceDocument->size,
                    'mime_type' => $maintenanceDocument->mime_type,
                ];
            }

            return response()->json([
                'message' => 'Documentos subidos exitosamente.',
                'documents' => $uploadedDocuments
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error al subir documentos:', [
                'maintenance_id' => $maintenance->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error al subir los documentos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar una imagen de mantenimiento
     *
     * @param MaintenanceImage $image
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteImage(MaintenanceImage $image)
    {
        try {
            // Eliminar archivo físico del storage
            if (Storage::disk('public')->exists($image->path)) {
                Storage::disk('public')->delete($image->path);
            }

            // Eliminar registro de la base de datos
            $image->delete();

            return response()->json([
                'message' => 'Imagen eliminada exitosamente.'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al eliminar imagen:', [
                'image_id' => $image->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error al eliminar la imagen: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un documento de mantenimiento
     *
     * @param MaintenanceDocument $document
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteDocument(MaintenanceDocument $document)
    {
        try {
            // Eliminar archivo físico del storage
            if (Storage::disk('public')->exists($document->path)) {
                Storage::disk('public')->delete($document->path);
            }

            // Eliminar registro de la base de datos
            $document->delete();

            return response()->json([
                'message' => 'Documento eliminado exitosamente.'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al eliminar documento:', [
                'document_id' => $document->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error al eliminar el documento: ' . $e->getMessage()
            ], 500);
        }
    }
}
