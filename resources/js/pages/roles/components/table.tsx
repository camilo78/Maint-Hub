import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableFooter, TableRow } from '@/components/ui/table';
import { router } from '@inertiajs/react';
import { Pencil, Trash2, Eye } from 'lucide-react';
import CommonFunctions from '@/pages/helpers/common';
import es from '@/lang/es';

type Role = {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
  permissions: { id: number; name: string }[];
  user_count: number;
};

interface Props {
    roles: {
    data: Role[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: {
      url: string | null;
      label: string;
      active: boolean;
    }[];
  },
    onView: (role: Role) => void;
    onEdit: (role: Role) => void;
    onDelete: (role: Role) => void;
}
export default function RoleTable({ roles, onView, onEdit, onDelete }: Props) {
    const { hasPermission } = CommonFunctions();
    return (
        <>
            <div className="bg-background overflow-x-auto rounded-lg border">
                <Table>
                    <TableCaption>{es['A list of all roles.']}</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">#</TableHead>
                            <TableHead>{es['Role Name']}</TableHead>
                            <TableHead className="text-center">{es['Users']}</TableHead>
                            <TableHead className="text-center">{es['Created At']}</TableHead>
                            <TableHead className="text-center">{es['Updated At']}</TableHead>
                            <TableHead className="text-center">{es['Actions']}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {roles.data.length > 0 ? (
                            roles.data.map((role: Role, index: number) => (
                                <TableRow key={role.id}>
                                    <TableCell className="font-medium">{index + 1 + (roles.current_page - 1) * 10}</TableCell>
                                    <TableCell>{role.name.charAt(0).toUpperCase() + role.name.slice(1)} 
                                        <span className="block text-xs text-muted-foreground">{es['Total Permissions']}: {role.permissions.length > 0 ? role.permissions.length : '0'}</span>
                                    </TableCell>
                                   <TableCell className="text-center">
                                        {role.user_count > 0 ? role.user_count : es['No users assigned']}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {new Date(role.created_at).toLocaleDateString(es['locale'], {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {new Date(role.updated_at).toLocaleDateString(es['locale'], {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </TableCell>
                                    <TableCell className="space-x-2 text-center">
                                        <Button size="icon" variant="ghost" onClick={() => onView(role)}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        {hasPermission('role.update') && (
                                            <Button size="icon" variant="ghost" onClick={() => onEdit(role)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {hasPermission('role.delete') && (
                                            <Button size="icon" variant="ghost" onClick={() => onDelete(role)}>
                                                <Trash2 className="text-destructive h-4 w-4" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-muted-foreground py-4 text-center">
                                    {es['No roles found.']}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={6} className="text-sm text-muted-foreground text-right py-3 pr-4">
                                {es['Showing']} {(roles.current_page - 1) * roles.per_page + 1} {es['to']} {(roles.current_page - 1) * roles.per_page + roles.data.length} {es['of']} {roles.total} {es['roles']}
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
                {roles.links.map((link: { url: string | null; label: string; active: boolean }, idx: number) => (
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
