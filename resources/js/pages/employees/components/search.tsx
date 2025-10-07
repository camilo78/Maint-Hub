import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import es from '@/lang/es';

type Role = {
    id: number;
    name: string;
};

interface Props {
    search: string;
    roleId: string;
    roles: Role[];
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    onRoleChange: (roleId: string) => void;
}

export default function EmployeeSearch({ search, roleId, roles, onSearchChange, onRoleChange, onSubmit }: Props) {
    return (
        <form onSubmit={onSubmit} className="flex gap-2">
            <Input value={search} onChange={onSearchChange} placeholder="Buscar empleados..." className="input max-w-sm" />
            <Select value={roleId} onValueChange={onRoleChange}>
                <SelectTrigger className="col-span-3 w-[200px]">
                    <SelectValue placeholder={es['Select a role']} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{es['All Roles']}</SelectItem>
                    {roles.filter(role => role.name.toLowerCase() !== 'client').map((role) => (
                        <SelectItem key={role.id} value={String(role.id)}>
                            {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button type="submit" className="btn">
                {es['Search']}
            </Button>
        </form>
    );
}