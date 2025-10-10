import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableFooter, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { router } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import es from '@/lang/es';

type Client = {
    id: number;
    name: string;
};

type Equipment = {
    id: number;
    client_id: number;
    asset_tag: string | null;
    category: string;
    brand: string | null;
    model: string | null;
    serial_number: string | null;
    location: string; // Ubicación dentro del inmueble del cliente
    status: 'buen_estado' | 'mal_estado' | 'mantenimiento';
    installation_date: string | null;
    warranty_expires_on: string | null;
    notes: string | null;
    specifications: Record<string, string | number | boolean> | null;
    client: Client;
    created_at: Date;
};

interface Props {
    equipment: {
        data: Equipment[];
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
    onEdit: (equipment: Equipment) => void;
    onDelete: (equipment: Equipment) => void;
}

export default function EquipmentTable({ equipment, onEdit, onDelete }: Props) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'buen_estado':
                return <Badge variant="default" className="bg-green-0 text-white border-green-600">{es['Good Condition']}</Badge>;
            case 'mal_estado':
                return <Badge variant="secondary" className="bg-red-0 text-white border-red-600">{es['Bad Condition']}</Badge>;
            case 'mantenimiento':
                return <Badge variant="default" className="bg-yellow-0 text-white border-yellow-600">Mantenimiento</Badge>;
            default:
                return <Badge variant="secondary">{status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}</Badge>;
        }
    };

    return (
        <>
            <div className="bg-background overflow-x-auto rounded-lg border">
                <Table>
                    <TableCaption>{es['A list of all equipment.']}</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">#</TableHead>
                            <TableHead>{es['Client']}</TableHead>
                            <TableHead>{es['Equipment']}</TableHead>
                            <TableHead>{es['Category']}</TableHead>
                            <TableHead>{es['Location']}</TableHead>
                            <TableHead className="text-center">{es['Status']}</TableHead>
                            <TableHead className="text-center">{es['Actions']}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {equipment.data.length > 0 ? (
                            equipment.data.map((item: Equipment, index: number) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                        {index + 1 + (equipment.current_page - 1) * equipment.per_page}
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{item.client.name}</div>
                                            {item.asset_tag && (
                                                <div className="text-xs text-muted-foreground">
                                                    {es['Tag']}: {item.asset_tag}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">
                                                {item.brand} {item.model}
                                            </div>
                                            {item.serial_number && (
                                                <div className="text-xs text-muted-foreground">
                                                    Serie: {item.serial_number}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell>{item.location}</TableCell>
                                    <TableCell className="text-center">
                                        {getStatusBadge(item.status)}
                                    </TableCell>
                                    <TableCell className="space-x-2 text-center">
                                        <Button size="icon" variant="ghost" onClick={() => router.get(`/equipment/${item.id}`)}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={() => onEdit(item)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={() => onDelete(item)}>
                                            <Trash2 className="text-destructive h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-muted-foreground py-4 text-center">
                                    {es['No equipment found.']}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={7} className="text-sm text-muted-foreground text-right py-3 pr-4">
                                {es['Showing']} {(equipment.current_page - 1) * equipment.per_page + 1} {es['to']} {(equipment.current_page - 1) * equipment.per_page + equipment.data.length} {es['of']} {equipment.total} {es['equipment']}
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
                {equipment.links.map((link: { url: string | null; label: string; active: boolean }, idx: number) => (
                    <Button
                        key={idx}
                        variant={link.active ? 'default' : 'outline'}
                        onClick={() => link.url && router.get(link.url)}
                        disabled={!link.url}
                        size="sm"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </div>
        </>
    );
}