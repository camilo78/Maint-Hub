import { useState } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, FileText, Download, Loader2 } from 'lucide-react';
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

    return (
        <div className="space-y-4">
            <div>
                <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                    multiple
                    onChange={handleUpload}
                    disabled={!maintenanceId || uploading}
                />
                {!maintenanceId && (
                    <p className="text-sm text-gray-500 mt-2">
                        {es['Save the maintenance first to upload documents']}
                    </p>
                )}
            </div>

            {uploading && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {es['Uploading...']}
                </div>
            )}

            {documents.length > 0 && (
                <div className="space-y-2">
                    {documents.map((document) => (
                        <div
                            key={document.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <FileText className="h-5 w-5 text-gray-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {document.original_name}
                                    </p>
                                    {document.size && (
                                        <p className="text-xs text-gray-500">
                                            {formatFileSize(document.size)}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDownload(document)}
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDelete(document.id)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
