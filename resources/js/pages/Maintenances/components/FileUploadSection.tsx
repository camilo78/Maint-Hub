import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChevronDown,
    ChevronUp,
    Upload,
    X,
    Download,
    FileText,
    Image as ImageIcon,
    Loader2,
    AlertCircle,
    Eye,
    File
} from 'lucide-react';
import es from '@/lang/es';

interface FileItem {
    id: number;
    path: string;
    original_name: string;
    size?: number;
    mime_type?: string;
}

interface Props {
    maintenanceId?: number;
    existingImages: FileItem[];
    existingDocuments: FileItem[];
}

export default function FileUploadSection({ maintenanceId, existingImages, existingDocuments }: Props) {
    const [images, setImages] = useState<FileItem[]>(existingImages || []);
    const [documents, setDocuments] = useState<FileItem[]>(existingDocuments || []);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [uploadingDocuments, setUploadingDocuments] = useState(false);
    const [imagesExpanded, setImagesExpanded] = useState(true);
    const [documentsExpanded, setDocumentsExpanded] = useState(true);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !maintenanceId) return;

        const formData = new FormData();
        Array.from(e.target.files).forEach((file) => {
            formData.append('images[]', file);
        });

        setUploadingImages(true);

        try {
            const response = await axios.post(
                route('maintenances.images.upload', maintenanceId),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            setImages(prev => [...prev, ...response.data.images]);
            e.target.value = '';
        } catch (error: any) {
            console.error('Upload failed:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to upload images';
            alert(errorMessage);
        } finally {
            setUploadingImages(false);
        }
    };

    const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !maintenanceId) return;

        const formData = new FormData();
        Array.from(e.target.files).forEach((file) => {
            formData.append('documents[]', file);
        });

        setUploadingDocuments(true);

        try {
            const response = await axios.post(
                route('maintenances.documents.upload', maintenanceId),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            setDocuments(prev => [...prev, ...response.data.documents]);
            e.target.value = '';
        } catch (error: any) {
            console.error('Upload failed:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to upload documents';
            alert(errorMessage);
        } finally {
            setUploadingDocuments(false);
        }
    };

    const handleImageDelete = async (imageId: number) => {
        if (!confirm(es['Are you sure you want to delete this image?'])) return;

        try {
            await axios.delete(route('maintenances.images.delete', imageId));
            setImages(prev => prev.filter(img => img.id !== imageId));
        } catch (error: any) {
            console.error('Delete failed:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to delete image';
            alert(errorMessage);
        }
    };

    const handleDocumentDelete = async (documentId: number) => {
        if (!confirm(es['Are you sure you want to delete this document?'])) return;

        try {
            await axios.delete(route('maintenances.documents.delete', documentId));
            setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        } catch (error: any) {
            console.error('Delete failed:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to delete document';
            alert(errorMessage);
        }
    };

    const handleDocumentDownload = (document: FileItem) => {
        window.open(`/storage/${document.path}`, '_blank');
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '';
        const kb = bytes / 1024;
        if (kb < 1024) return `${kb.toFixed(1)} KB`;
        return `${(kb / 1024).toFixed(1)} MB`;
    };

    return (
        <div className="space-y-4">
            {/* SECCIÓN DE IMÁGENES */}
            <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader
                    className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors duration-150 rounded-t-lg"
                    onClick={() => setImagesExpanded(!imagesExpanded)}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm">
                                <ImageIcon className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <CardTitle className="text-lg font-semibold text-gray-800">
                                    {es['Images']}
                                </CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                        {images.length} {images.length === 1 ? 'imagen' : 'imágenes'}
                                    </span>
                                    {uploadingImages && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            Subiendo...
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 hover:bg-blue-100 rounded-full transition-colors"
                        >
                            {imagesExpanded ? (
                                <ChevronUp className="h-5 w-5 text-gray-600" />
                            ) : (
                                <ChevronDown className="h-5 w-5 text-gray-600" />
                            )}
                        </Button>
                    </div>
                </CardHeader>

                {imagesExpanded && (
                    <CardContent className="space-y-4 pt-4">
                        {!maintenanceId ? (
                            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-400 rounded-lg shadow-sm">
                                <div className="p-2 bg-white rounded-full">
                                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                                </div>
                                <p className="text-sm text-yellow-800 font-medium">
                                    {es['Save the maintenance first to upload images']}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="relative">
                                    <label className="block">
                                        <div className="group relative flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md">
                                            <div className="p-2 bg-white rounded-lg group-hover:bg-blue-500 transition-colors">
                                                <Upload className="h-5 w-5 text-blue-500 group-hover:text-white transition-colors" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                                                    {uploadingImages ? 'Subiendo imágenes...' : 'Click para subir imágenes'}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    PNG, JPG, GIF hasta 10MB
                                                </p>
                                            </div>
                                        </div>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageUpload}
                                            disabled={uploadingImages}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                {uploadingImages && (
                                    <div className="flex items-center gap-3 text-sm text-blue-700 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 shadow-sm">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <div>
                                            <p className="font-medium">Subiendo imágenes...</p>
                                            <p className="text-xs text-blue-600 mt-0.5">Por favor espere un momento</p>
                                        </div>
                                    </div>
                                )}

                                {images.length > 0 && (
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-medium text-gray-700">
                                                Imágenes cargadas ({images.length})
                                            </h4>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {images.map((image) => (
                                                <div key={image.id} className="relative group">
                                                    <div className="aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-lg bg-gray-50">
                                                        <img
                                                            src={`/storage/${image.path}`}
                                                            alt={image.original_name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                        />
                                                        <div className="absolute inset-0 bg-opacity-0 group-hover:bg-black group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center gap-2">
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="secondary"
                                                                className="opacity-0 group-hover:opacity-100 transition-all shadow-lg h-9 w-9 p-0 bg-white hover:bg-blue-50"
                                                                onClick={() => window.open(`/storage/${image.path}`, '_blank')}
                                                            >
                                                                <Eye className="h-4 w-4 text-blue-600" />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="destructive"
                                                                className="opacity-0 group-hover:opacity-100 transition-all shadow-lg h-9 w-9 p-0"
                                                                onClick={() => handleImageDelete(image.id)}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 px-1">
                                                        <p className="text-xs font-medium text-gray-700 truncate" title={image.original_name}>
                                                            {image.original_name}
                                                        </p>
                                                        {image.size && (
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                {formatFileSize(image.size)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {images.length === 0 && !uploadingImages && (
                                    <div className="text-center py-12 px-4">
                                        <div className="inline-flex p-4 bg-gray-100 rounded-full mb-3">
                                            <ImageIcon className="h-10 w-10 text-gray-400" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-600">No hay imágenes cargadas</p>
                                        <p className="text-xs text-gray-500 mt-1">Sube imágenes para documentar el mantenimiento</p>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                )}
            </Card>

            {/* SECCIÓN DE DOCUMENTOS */}
            <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader
                    className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors duration-150 rounded-t-lg"
                    onClick={() => setDocumentsExpanded(!documentsExpanded)}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-sm">
                                <FileText className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <CardTitle className="text-lg font-semibold text-gray-800">
                                    {es['Documents']}
                                </CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                        {documents.length} {documents.length === 1 ? 'documento' : 'documentos'}
                                    </span>
                                    {uploadingDocuments && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-600">
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            Subiendo...
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 hover:bg-purple-100 rounded-full transition-colors"
                        >
                            {documentsExpanded ? (
                                <ChevronUp className="h-5 w-5 text-gray-600" />
                            ) : (
                                <ChevronDown className="h-5 w-5 text-gray-600" />
                            )}
                        </Button>
                    </div>
                </CardHeader>

                {documentsExpanded && (
                    <CardContent className="space-y-4 pt-4">
                        {!maintenanceId ? (
                            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-400 rounded-lg shadow-sm">
                                <div className="p-2 bg-white rounded-full">
                                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                                </div>
                                <p className="text-sm text-yellow-800 font-medium">
                                    {es['Save the maintenance first to upload documents']}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="relative">
                                    <label className="block">
                                        <div className="group relative flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md">
                                            <div className="p-2 bg-white rounded-lg group-hover:bg-purple-500 transition-colors">
                                                <Upload className="h-5 w-5 text-purple-500 group-hover:text-white transition-colors" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-medium text-gray-700 group-hover:text-purple-700">
                                                    {uploadingDocuments ? 'Subiendo documentos...' : 'Click para subir documentos'}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    PDF, DOC, DOCX, XLS, XLSX, TXT hasta 10MB
                                                </p>
                                            </div>
                                        </div>
                                        <Input
                                            type="file"
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                                            multiple
                                            onChange={handleDocumentUpload}
                                            disabled={uploadingDocuments}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                {uploadingDocuments && (
                                    <div className="flex items-center gap-3 text-sm text-purple-700 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200 shadow-sm">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <div>
                                            <p className="font-medium">Subiendo documentos...</p>
                                            <p className="text-xs text-purple-600 mt-0.5">Por favor espere un momento</p>
                                        </div>
                                    </div>
                                )}

                                {documents.length > 0 && (
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-medium text-gray-700">
                                                Documentos cargados ({documents.length})
                                            </h4>
                                        </div>
                                        <div className="space-y-3">
                                            {documents.map((document) => {
                                                const fileExtension = document.mime_type?.split('/')[1]?.toUpperCase() || 'FILE';
                                                const isPdf = document.mime_type === 'application/pdf';

                                                return (
                                                    <div
                                                        key={document.id}
                                                        className="group relative flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:shadow-md transition-all duration-200 bg-white"
                                                    >
                                                        <div className={`flex-shrink-0 p-3 rounded-lg group-hover:scale-110 transition-transform duration-200 ${
                                                            isPdf ? 'bg-red-100 group-hover:bg-red-200' : 'bg-purple-100 group-hover:bg-purple-200'
                                                        }`}>
                                                            <File className={`h-6 w-6 ${
                                                                isPdf ? 'text-red-600' : 'text-purple-600'
                                                            }`} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-purple-700 transition-colors" title={document.original_name}>
                                                                {document.original_name}
                                                            </p>
                                                            <div className="flex items-center gap-3 mt-1.5">
                                                                {document.size && (
                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                                                                        {formatFileSize(document.size)}
                                                                    </span>
                                                                )}
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
                                                                    isPdf ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'
                                                                }`}>
                                                                    {fileExtension}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleDocumentDownload(document)}
                                                                className="h-9 w-9 p-0 hover:bg-purple-50 hover:border-purple-500 transition-colors"
                                                                title="Descargar documento"
                                                            >
                                                                <Download className="h-4 w-4 text-purple-600" />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => handleDocumentDelete(document.id)}
                                                                className="h-9 w-9 p-0 hover:bg-red-600 transition-colors shadow-sm"
                                                                title="Eliminar documento"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {documents.length === 0 && !uploadingDocuments && (
                                    <div className="text-center py-12 px-4">
                                        <div className="inline-flex p-4 bg-gray-100 rounded-full mb-3">
                                            <FileText className="h-10 w-10 text-gray-400" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-600">No hay documentos cargados</p>
                                        <p className="text-xs text-gray-500 mt-1">Sube documentos relacionados al mantenimiento</p>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                )}
            </Card>
        </div>
    );
}
