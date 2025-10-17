import { useState } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
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
            console.error(es['Upload failed'], error);
            const errorMessage = error.response?.data?.message || error.message || es['Failed to upload images'];
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
            console.error(es['Upload failed'], error);
            const errorMessage = error.response?.data?.message || error.message || es['Failed to upload documents'];
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
            console.error(es['Delete failed'], error);
            const errorMessage = error.response?.data?.message || error.message || es['Failed to delete image'];
            alert(errorMessage);
        }
    };

    const handleDocumentDelete = async (documentId: number) => {
        if (!confirm(es['Are you sure you want to delete this document?'])) return;

        try {
            await axios.delete(route('maintenances.documents.delete', documentId));
            setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        } catch (error: any) {
            console.error(es['Delete failed'], error);
            const errorMessage = error.response?.data?.message || error.message || es['Failed to delete document'];
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SECCIÓN DE IMÁGENES */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                            <CardTitle className="flex items-center gap-2">
                                <ImageIcon className="h-5 w-5 text-gray-600" />
                                {es['Images']}
                                <span className="text-sm font-normal text-gray-500">
                                    ({images.length})
                                </span>
                            </CardTitle>
                            {uploadingImages && (
                                <span className="flex items-center gap-1.5 text-xs text-blue-600">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Subiendo...
                                </span>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                        {!maintenanceId ? (
                            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                                <p className="text-sm text-yellow-800">
                                    {es['Save the maintenance first to upload images']}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="relative">
                                    <label className="block">
                                        <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer">
                                            <Upload className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm text-gray-600">
                                                {uploadingImages ? 'Subiendo...' : 'Click para subir imágenes'}
                                            </span>
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

                                {images.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {images.map((image) => (
                                            <div key={image.id}>
                                                <div className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-blue-500 transition-colors bg-gray-50">
                                                    <img
                                                        src={`/storage/${image.path}`}
                                                        alt={image.original_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center gap-2">
                                                        <button
                                                            type="button"
                                                            className="opacity-0 group-hover:opacity-100 transition-all duration-200 h-9 w-9 rounded-lg bg-white hover:bg-blue-500 text-gray-700 hover:text-white flex items-center justify-center shadow-lg hover:scale-110"
                                                            onClick={() => window.open(`/storage/${image.path}`, '_blank')}
                                                            title="Ver imagen"
                                                        >
                                                            <Eye className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="opacity-0 group-hover:opacity-100 transition-all duration-200 h-9 w-9 rounded-lg bg-white hover:bg-red-500 text-gray-700 hover:text-white flex items-center justify-center shadow-lg hover:scale-110"
                                                            onClick={() => handleImageDelete(image.id)}
                                                            title="Eliminar imagen"
                                                        >
                                                            <X className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1.5 truncate" title={image.original_name}>
                                                    {image.original_name}
                                                </p>
                                                {image.size && (
                                                    <p className="text-xs text-gray-400">
                                                        {formatFileSize(image.size)}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {images.length === 0 && !uploadingImages && (
                                    <div className="text-center py-8 text-gray-400">
                                        <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No hay imágenes cargadas</p>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
            </Card>

            {/* SECCIÓN DE DOCUMENTOS */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-gray-600" />
                                {es['Documents']}
                                <span className="text-sm font-normal text-gray-500">
                                    ({documents.length})
                                </span>
                            </CardTitle>
                            {uploadingDocuments && (
                                <span className="flex items-center gap-1.5 text-xs text-blue-600">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Subiendo...
                                </span>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                        {!maintenanceId ? (
                            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                                <p className="text-sm text-yellow-800">
                                    {es['Save the maintenance first to upload documents']}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="relative">
                                    <label className="block">
                                        <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors cursor-pointer">
                                            <Upload className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm text-gray-600">
                                                {uploadingDocuments ? 'Subiendo...' : 'Click para subir documentos'}
                                            </span>
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

                                {documents.length > 0 && (
                                    <div className="space-y-2">
                                        {documents.map((document) => {
                                            const fileExtension = document.mime_type?.split('/')[1]?.toUpperCase() || 'FILE';
                                            const isPdf = document.mime_type === 'application/pdf';
                                            const isWord = document.mime_type?.includes('word') || document.mime_type?.includes('msword');
                                            const isExcel = document.mime_type?.includes('sheet') || document.mime_type?.includes('excel');
                                            const isPowerPoint = document.mime_type?.includes('presentation') || document.mime_type?.includes('powerpoint');

                                            // Determinar el color según el tipo de archivo
                                            let bgColor = 'bg-gray-100';
                                            let textColor = 'text-gray-600';

                                            if (isPdf) {
                                                bgColor = 'bg-red-100';
                                                textColor = 'text-red-600';
                                            } else if (isWord) {
                                                bgColor = 'bg-blue-100';
                                                textColor = 'text-blue-600';
                                            } else if (isExcel) {
                                                bgColor = 'bg-green-100';
                                                textColor = 'text-green-600';
                                            } else if (isPowerPoint) {
                                                bgColor = 'bg-orange-100';
                                                textColor = 'text-orange-600';
                                            }

                                            return (
                                                <div
                                                    key={document.id}
                                                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50/50 transition-all group"
                                                >
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div className={`p-2 rounded ${bgColor}`}>
                                                            <File className={`h-5 w-5 ${textColor}`} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate" title={document.original_name}>
                                                                {document.original_name}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                {document.size && (
                                                                    <span className="text-xs text-gray-500">
                                                                        {formatFileSize(document.size)}
                                                                    </span>
                                                                )}
                                                                {document.mime_type && (
                                                                    <span className="text-xs text-gray-400">
                                                                        {fileExtension}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            className="h-9 w-9 rounded-lg bg-white hover:bg-blue-500 text-gray-700 hover:text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 border border-gray-200"
                                                            onClick={() => handleDocumentDownload(document)}
                                                            title="Descargar documento"
                                                        >
                                                            <Download className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="h-9 w-9 rounded-lg bg-white hover:bg-red-500 text-gray-700 hover:text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 border border-gray-200"
                                                            onClick={() => handleDocumentDelete(document.id)}
                                                            title="Eliminar documento"
                                                        >
                                                            <X className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {documents.length === 0 && !uploadingDocuments && (
                                    <div className="text-center py-8 text-gray-400">
                                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No hay documentos cargados</p>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
            </Card>
        </div>
    );
}
