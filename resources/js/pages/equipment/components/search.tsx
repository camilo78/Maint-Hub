import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import es from '@/lang/es';

interface Props {
    search: string;
    category: string;
    status: string;
    categories: string[];
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onCategoryChange: (value: string) => void;
    onStatusChange: (value: string) => void;
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
        <form onSubmit={onSubmit} className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                    type="text"
                    placeholder={es['Search equipment...']}
                    value={search}
                    onChange={onSearchChange}
                />
                
                <Select value={category} onValueChange={onCategoryChange}>
                    <SelectTrigger>
                        <SelectValue placeholder={es['All Categories']} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{es['All Categories']}</SelectItem>
                        {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                                {cat}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={status} onValueChange={onStatusChange}>
                    <SelectTrigger>
                        <SelectValue placeholder={es['All Status']} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{es['All Status']}</SelectItem>
                        <SelectItem value="activo">{es['Good Condition']}</SelectItem>
                        <SelectItem value="inactivo">{es['Bad Condition']}</SelectItem>
                        <SelectItem value="en_reparacion">{es['Maintenance']}</SelectItem>
                    </SelectContent>
                </Select>

                <div className="flex gap-2">
                    <Button type="submit" variant="outline">
                        <Search className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => {
                        onSearchChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
                        onCategoryChange('all');
                        onStatusChange('all');
                    }}>
                        {es['Clear']}
                    </Button>
                </div>
            </div>
        </form>
    );
}