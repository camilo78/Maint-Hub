import { useState } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { X, FileText, Download, Loader2, Upload, AlertCircle, File } from 'lucide-react';
import es from '@/lang/es';

interface Document {
    id: number;
    path: string;
    original_name: string;
    size?: number;
    mime_type?: string;
}

interface Props {
    maintenanceId?: number;
    existingDocuments: Document[];
}

export default function DocumentUploader({ maintenanceId, existingDocuments }: Props) {
    const [documents, setDocuments] = useState<Document[]>(existingDocuments);
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !maintenanceId) return;

        const formData = new FormData();
        Array.from(e.target.files).forEach((file) => {
            formData.append('documents[]', file);
        });

        setUploading(true);

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
            setUploading(false);
        }
    };

    const handleDelete = (documentId: number) => {
        if (!confirm(es['Are you sure you want to delete this document?'])) return;

        router.delete(route('maintenances.documents.delete', documentId), {
            onSuccess: () => {
                setDocuments(prev => prev.filter(doc => doc.id !== documentId));
            },
        });
    };

    const handleDownload = (document: Document) => {
        window.open(`/storage/${document.path}`, '_blank');
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '';
        const kb = bytes / 1024;
        if (kb < 1024) return `${kb.toFixed(1)} KB`;
        return `${(kb / 1024).toFixed(1)} MB`;
    };

    const getFileIcon = (mimeType?: string) => {
        if (!mimeType) return FileText;
        if (mimeType.includes('pdf')) return FileText;
        if (mimeType.includes('word') || mimeType.includes('document')) return FileText;
        if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return FileText;
        return File;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-600" />
                    Documentos
                    <span className="text-sm font-normal text-gray-500">
                        ({documents.length})
                    </span>
                    {uploading && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
                </CardTitle>
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
                        <div>
                            <Label htmlFor="document-upload" className="flex items-center gap-2 mb-2">
                                <Upload className="h-4 w-4" />
                                Cargar Documentos
                            </Label>
                            <Input
                                id="document-upload"
                                type="file"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                                multiple
                                onChange={handleUpload}
                                disabled={uploading}
                                className="cursor-pointer"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Formatos aceptados: PDF, DOC, DOCX, XLS, XLSX, TXT
                            </p>
                        </div>

                        {documents.length > 0 && (
                            <div className="space-y-2">
                                {documents.map((document) => {
                                    const FileIcon = getFileIcon(document.mime_type);
                                    return (
                                        <div
                                            key={document.id}
                                            className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <span className="text-sm font-medium flex items-center gap-2">
                                                        <FileIcon className="h-4 w-4 text-gray-500" />
                                                        {document.original_name}
                                                    </span>
                                                    {document.size && (
                                                        <span className="text-xs text-gray-500">
                                                            {formatFileSize(document.size)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDownload(document)}
                                                    className="h-8 w-8 p-0"
                                                    title="Descargar documento"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDelete(document.id)}
                                                    className="h-8 w-8 p-0"
                                                    title="Eliminar documento"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {documents.length === 0 && !uploading && (
                            <div className="text-center py-12 text-gray-400">
                                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No hay documentos cargados</p>
                                <p className="text-xs text-gray-400 mt-1">Usa el botón de arriba para cargar documentos</p>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
