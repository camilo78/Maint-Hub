import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import es from '@/lang/es';

interface Props {
    search: string;
    category: string;
    status: string;
    categories: string[];
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onStatusChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export default function EquipmentSearch({ 
    search, 
    category, 
    status, 
    categories, 
    onSearchChange, 
    onCategoryChange, 
    onStatusChange, 
    onSubmit 
}: Props) {
    return (
        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
                <Input
                    type="text"
                    placeholder={es['Search equipment...']}
                    value={search}
                    onChange={onSearchChange}
                    className="w-full"
                />
            </div>
            
            <div className="w-full sm:w-48">
                <select
                    value={category}
                    onChange={onCategoryChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                    <option value="">{es['All Categories']}</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
            </div>

            <div className="w-full sm:w-40">
                <select
                    value={status}
                    onChange={onStatusChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                    <option value="">{es['All Status']}</option>
                    <option value="activo">{es['Active']}</option>
                    <option value="inactivo">{es['Inactive']}</option>
                    <option value="en_reparacion">{es['Under Repair']}</option>
                </select>
            </div>

            <Button type="submit" className="w-full sm:w-auto">
                {es['Search']}
            </Button>
        </form>
    );
}