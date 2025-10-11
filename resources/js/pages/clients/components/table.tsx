import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import es from '@/lang/es';
import { router } from '@inertiajs/react';
import { ChevronDown, ChevronRight, Eye, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

type Role = {
    id: number;
    name: string;
};
type User = {
    id: number;
    name: string;
    email: string;
    phone: string;
    tipo: string;
    rtn_dni_passport: string;
    address: string;
    email_verified_at: string | null;
    roles: Role[];
    permissions: { id: number; name: string }[];
    created_at: Date;
};
interface Props {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
}
export default function UserTable({ users, onEdit, onDelete }: Props) {
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    const toggleRow = (userId: number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(userId)) {
            newExpanded.delete(userId);
        } else {
            newExpanded.add(userId);
        }
        setExpandedRows(newExpanded);
    };

    return (
        <>
            <div className="bg-background overflow-x-auto rounded-lg border">
                <Table>
                    <TableCaption>{es['A list of all users.']}</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead className="w-[80px]">#</TableHead>
                            <TableHead>{es['Name']}</TableHead>
                            <TableHead className="text-center">{es['Phone']}</TableHead>
                            <TableHead className="text-center">{es['Type']}</TableHead>
                            <TableHead className="text-center">{es['RTN/DNI/Passport']}</TableHead>
                            <TableHead className="text-center">{es['Actions']}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.data.length > 0 ? (
                            users.data.map((user: User, index: number) => (
                                <>
                                    <TableRow key={user.id}>
                                        <TableCell className="text-center">
                                            <Button variant="ghost" size="sm" onClick={() => toggleRow(user.id)} className="h-6 w-6 p-0">
                                                {expandedRows.has(user.id) ? (
                                                    <ChevronDown className="h-4 w-4" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </TableCell>
                                        <TableCell className="font-medium">{index + 1 + (users.current_page - 1) * 10}</TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-muted-foreground text-xs">{user.rtn_dni_passport}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <a href={`tel:${user.phone}`} className="text-blue-600">
                                                {user.phone}
                                            </a>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span
                                                className={`rounded-full px-2 py-1 text-xs ${
                                                    user.tipo === 'corporativo'
                                                        ? 'border dark:text-white border-blue-600'
                                                        : user.tipo === 'extranjero'
                                                        ? 'border dark:text-white border-purple-600'
                                                        : 'border dark:text-white border-green-600'
                                                }`}
                                            >
                                                {user.tipo === 'corporativo'
                                                    ? es['Corporate'] + ' ⭐'
                                                    : user.tipo === 'extranjero'
                                                    ? es['Foreign']
                                                    : es['Particular']}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div>
                                                <div className="font-medium">{user.rtn_dni_passport}</div>
                                                <div className="text-muted-foreground text-xs">
                                                    {user.tipo === 'corporativo'
                                                        ? es['RTN']
                                                        : user.tipo === 'extranjero'
                                                        ? es['Passport']
                                                        : es['DNI']}
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="space-x-2 text-center">
                                            <Button size="icon" variant="ghost" asChild>
                                                <a href={`/admin/clients/${user.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </a>
                                            </Button>
                                            <Button size="icon" variant="ghost" onClick={() => onEdit(user)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" onClick={() => onDelete(user)}>
                                                <Trash2 className="text-red-600 h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                    {expandedRows.has(user.id) && (
                                        <TableRow className="bg-muted/50">
                                            <TableCell></TableCell>
                                            <TableCell colSpan={6} className="py-3">
                                                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                                                    <div>
                                                        <span className="text-muted-foreground font-medium">{es['Email']}: </span>
                                                        <span>
                                                            {user.email ? (
                                                                <a href={`mailto:${user.email}`} className="text-blue-600 hover:underline">
                                                                    {user.email}
                                                                </a>
                                                            ) : (
                                                                es['No email']
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="max-w-xs">
                                                        <span className="text-muted-foreground font-medium">{es['Address']}: </span>
                                                        <span className="break-words hyphens-auto whitespace-normal">{user.address || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-muted-foreground py-4 text-center">
                                    {es['No users found.'] || 'No se encontraron clientes.'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={7} className="text-muted-foreground py-3 pr-4 text-right text-sm">
                                {es['Showing']} {(users.current_page - 1) * users.per_page + 1} {es['to']}{' '}
                                {(users.current_page - 1) * users.per_page + users.data.length} {es['of']} {users.total} {es['users']}
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
            <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                    variant="outline"
                    disabled={users.current_page === 1}
                    onClick={() => router.get(`?page=${users.current_page - 1}`)}
                    size="sm"
                    className="h-9 min-w-[80px]"
                >
                    {es['Previous'] || 'Anterior'}
                </Button>

                {Array.from({ length: users.last_page }, (_, i) => i + 1).map((page) => (
                    <Button
                        key={page}
                        variant={page === users.current_page ? 'default' : 'outline'}
                        onClick={() => router.get(`?page=${users.current_page + 1}`)}
                        size="sm"
                        className="h-9 w-9"
                    >
                        {page}
                    </Button>
                ))}

                <Button
                    variant="outline"
                    disabled={users.current_page === users.last_page}
                    onClick={() => router.get(`?page=${users.current_page + 1}`)}
                    size="sm"
                    className="h-9 min-w-[80px]"
                >
                    {es['Next'] || 'Siguiente'}
                </Button>
            </div>
        </>
    );
}
