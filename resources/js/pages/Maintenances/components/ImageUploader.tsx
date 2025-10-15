import { useState } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Upload, Loader2 } from 'lucide-react';
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
        <div className="space-y-4">
            <div>
                <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUpload}
                    disabled={!maintenanceId || uploading}
                />
                {!maintenanceId && (
                    <p className="text-sm text-gray-500 mt-2">
                        {es['Save the maintenance first to upload images']}
                    </p>
                )}
            </div>

            {uploading && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {es['Uploading...']}
                </div>
            )}

            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((image) => (
                        <div key={image.id} className="relative group">
                            <img
                                src={`/storage/${image.path}`}
                                alt={image.original_name}
                                className="w-full h-32 object-cover rounded-lg"
                            />
                            <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleDelete(image.id)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                            <p className="text-xs text-gray-600 mt-1 truncate">
                                {image.original_name}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
