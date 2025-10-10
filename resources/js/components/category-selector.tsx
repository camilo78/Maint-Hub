import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import InputError from '@/components/input-error';

interface CategorySelectorProps {
    value: string;
    categories: string[];
    onChange: (value: string) => void;
    error?: string;
    label?: string;
    required?: boolean;
}

export default function CategorySelector({
    value,
    categories,
    onChange,
    error,
    label = 'Categoría',
    required = false
}: CategorySelectorProps) {
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCategory, setNewCategory] = useState('');

    const handleAddCategory = () => {
        const trimmedCategory = newCategory.trim();
        if (trimmedCategory) {
            console.log('Adding new category:', trimmedCategory);
            onChange(trimmedCategory);
            setNewCategory('');
            setShowNewCategory(false);
        }
    };

    const handleSelectChange = (selectedValue: string) => {
        console.log('Select changed to:', selectedValue);
        onChange(selectedValue);
    };

    const handleCancelNew = () => {
        setNewCategory('');
        setShowNewCategory(false);
    };

    return (
        <div className="space-y-2">
            <Label htmlFor="category">{label} {required && '*'}</Label>
            {/* Hidden input para asegurar que el valor se envíe */}
            <input type="hidden" name="category" value={value || ''} />
            
            {!showNewCategory ? (
                <div className="flex gap-2">
                    <select
                        id="category"
                        name="category"
                        value={value || ''}
                        onChange={(e) => handleSelectChange(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background flex-1"
                        required={required}
                    >
                        <option value="">Seleccionar categoría</option>
                        {/* Mostrar categoría actual si no está en la lista */}
                        {value && !categories.includes(value) && (
                            <option key={value} value={value}>
                                {value} (Nueva)
                            </option>
                        )}
                        {categories.map(cat => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowNewCategory(true)}
                        className="px-3"
                        title="Agregar nueva categoría"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div className="flex gap-2">
                    <Input
                        name="category"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Nueva categoría..."
                        className="flex-1"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCategory();
                            }
                            if (e.key === 'Escape') {
                                handleCancelNew();
                            }
                        }}
                        autoFocus
                    />
                    <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={handleAddCategory}
                        disabled={!newCategory.trim()}
                        className="px-3"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCancelNew}
                        className="px-3"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
            
            <InputError message={error} />
        </div>
    );
}