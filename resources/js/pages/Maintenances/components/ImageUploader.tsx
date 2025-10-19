import { useState } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { X, Upload, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import es from '@/lang/es';

interface Image {
    id: number;
    path: string;
    original_name: string;
}

interface Props {
    maintenanceId?: number;
    existingImages: Image[];
}

export default function ImageUploader({ maintenanceId, existingImages }: Props) {
    const [images, setImages] = useState<Image[]>(existingImages);
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !maintenanceId) return;

        const formData = new FormData();
        Array.from(e.target.files).forEach((file) => {
            formData.append('images[]', file);
        });

        setUploading(true);

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
            setUploading(false);
        }
    };

    const handleDelete = (imageId: number) => {
        if (!confirm(es['Are you sure you want to delete this image?'])) return;

        router.delete(route('maintenances.images.delete', imageId), {
            onSuccess: () => {
                setImages(prev => prev.filter(img => img.id !== imageId));
            },
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-gray-600" />
                    Imágenes
                    <span className="text-sm font-normal text-gray-500">
                        ({images.length})
                    </span>
                    {uploading && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
                </CardTitle>
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
                        <div>
                            <Label htmlFor="image-upload" className="flex items-center gap-2 mb-2">
                                <Upload className="h-4 w-4" />
                                Cargar Imágenes
                            </Label>
                            <Input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleUpload}
                                disabled={uploading}
                                className="cursor-pointer"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Formatos aceptados: JPG, PNG, GIF, WebP
                            </p>
                        </div>

                        {images.length > 0 && (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {images.map((image) => (
                                        <div
                                            key={image.id}
                                            className="relative group border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden transition-colors hover:bg-gray-50"
                                        >
                                            <div className="aspect-square">
                                                <img
                                                    src={`/storage/${image.path}`}
                                                    alt={image.original_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDelete(image.id)}
                                                    className="h-8 w-8 p-0 bg-background shadow-xs"
                                                    title="Eliminar imagen"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                                                <p className="text-xs text-white truncate" title={image.original_name}>
                                                    {image.original_name}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {images.length === 0 && !uploading && (
                            <div className="text-center py-12 text-gray-400">
                                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No hay imágenes cargadas</p>
                                <p className="text-xs text-gray-400 mt-1">Usa el botón de arriba para cargar imágenes</p>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
