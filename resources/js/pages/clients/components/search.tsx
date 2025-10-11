import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import es from '@/lang/es';

interface UserSearchProps {
    search: string;
    tipo: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onTipoChange: (value: string) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onClear: () => void;
}

export default function UserSearch({ search, tipo, onSearchChange, onTipoChange, onSubmit, onClear }: UserSearchProps) {
    return (
        <form onSubmit={onSubmit} className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                    type="text"
                    placeholder={es['Search users...'] || 'Buscar clientes...'}
                    value={search}
                    onChange={onSearchChange}
                />
                
                <Select value={tipo} onValueChange={onTipoChange}>
                    <SelectTrigger>
                        <SelectValue placeholder={es['All Types']} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{es['All Types']}</SelectItem>
                        <SelectItem value="particular">{es['Particular']}</SelectItem>
                        <SelectItem value="corporativo">{es['Corporate']}</SelectItem>
                        <SelectItem value="extranjero">{es['Foreigner']}</SelectItem>
                    </SelectContent>
                </Select>

                <div className="flex gap-2">
                    <Button type="submit" variant="outline">
                        <Search className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="outline" onClick={onClear} className="hover:bg-muted">
                        {es['Clear']}
                    </Button>
                </div>
            </div>
        </form>
    );
}
