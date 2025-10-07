import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { Badge } from '@/components/ui/badge';
import { router } from '@inertiajs/react';
import { Pencil, Trash2, ChevronDown, ChevronRight, Eye } from 'lucide-react';
import { useState } from 'react';
import es from '@/lang/es';

type Role = {
  id: number;
  name: string;
};

type Employee = {
  id: number;
  name: string;
  email: string;
  phone: string;
  tipo: string;
  rtn_dni_passport: string;
  address: string;
  career: string;
  employee_id: string;
  email_verified_at: string | null;
  roles: Role[];
  permissions: { id: number; name: string }[];
  created_at: Date;
};

interface Props {
    employees: {
        data: Employee[];
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

    onEdit: (employee: Employee) => void;
    onDelete: (employee: Employee) => void;
}

export default function EmployeeTable({ employees, onView, onEdit, onDelete }: Props) {
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    
    const toggleRow = (employeeId: number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(employeeId)) {
            newExpanded.delete(employeeId);
        } else {
            newExpanded.add(employeeId);
        }
        setExpandedRows(newExpanded);
    };
    


    return (
        <>
            <div className="bg-background overflow-x-auto rounded-lg border">
                <Table>
                    <TableCaption>{es['A list of all employees.'] || 'Lista de todos los empleados.'}</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead className="w-[80px]">#</TableHead>
                            <TableHead>{es['Name'] || 'Nombre'}</TableHead>
                            <TableHead className="text-center">{es['Roles'] || 'Roles'}</TableHead>
                            <TableHead className="text-center">{es['Phone'] || 'Teléfono'}</TableHead>
                            <TableHead className="text-center">{es['Career'] || 'Carrera'}</TableHead>
                            <TableHead className="text-center">{es['Employee ID'] || 'ID Empleado'}</TableHead>
                            <TableHead className="text-center">{es['Actions'] || 'Acciones'}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {employees.data.length > 0 ? (
                            employees.data.map((employee: Employee, index: number) => (
                                <>
                                    <TableRow key={employee.id}>
                                        <TableCell className="text-center">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => toggleRow(employee.id)}
                                                className="h-6 w-6 p-0"
                                            >
                                                {expandedRows.has(employee.id) ? 
                                                    <ChevronDown className="h-4 w-4" /> : 
                                                    <ChevronRight className="h-4 w-4" />
                                                }
                                            </Button>
                                        </TableCell>
                                        <TableCell className="font-medium">{index + 1 + (employees.current_page - 1) * 10}</TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{employee.name}</div>
                                                <div className="text-xs text-muted-foreground">{es['Permissions'] || 'Permisos'}: {employee.permissions.length}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex flex-wrap gap-1 justify-center">
                                                {employee.roles.map((role) => (
                                                    <Badge key={role.id} variant="outline" className="text-xs">
                                                        {role.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <a href={`tel:${employee.phone}`} className="text-blue-600">{employee.phone}</a>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                                {employee.career}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className="font-mono text-sm">{employee.employee_id}</span>
                                        </TableCell>
                                        <TableCell className="space-x-2 text-center">
                                            <Button size="icon" variant="ghost" asChild>
                                                <a href={`/admin/employees/${employee.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </a>
                                            </Button>
                                            <Button size="icon" variant="ghost" onClick={() => onEdit(employee)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" onClick={() => onDelete(employee)}>
                                                <Trash2 className="text-destructive h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                    {expandedRows.has(employee.id) && (
                                        <TableRow className="bg-muted/50">
                                            <TableCell></TableCell>
                                            <TableCell colSpan={8} className="py-3">
                                                <div className="space-y-3 text-sm">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <span className="font-medium text-muted-foreground">{es['Email'] || 'Email'}: </span>
                                                            <span>
                                                                {employee.email ? (
                                                                    <a href={`mailto:${employee.email}`} className="text-blue-600 hover:underline">
                                                                        {employee.email}
                                                                    </a>
                                                                ) : (
                                                                    es['No email'] || 'Sin email'
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-muted-foreground">{es['Document'] || 'Documento'}: </span>
                                                            <span className="font-mono">{employee.rtn_dni_passport}</span>
                                                            <span className="text-xs text-muted-foreground ml-2">
                                                                ({employee.tipo === 'corporativo' ? (es['RTN'] || 'RTN') : 
                                                                 employee.tipo === 'extranjero' ? (es['Passport'] || 'Pasaporte') : 
                                                                 (es['DNI'] || 'DNI')})
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-muted-foreground">{es['Address'] || 'Dirección'}: </span>
                                                        <span className="break-words hyphens-auto whitespace-normal">{employee.address || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={9} className="text-muted-foreground py-4 text-center">
                                    {es['No employees found.'] || 'No se encontraron empleados.'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={9} className="text-sm text-muted-foreground text-right py-3 pr-4">
                                {es['Showing'] || 'Mostrando'} {(employees.current_page - 1) * employees.per_page + 1} {es['to'] || 'a'} {(employees.current_page - 1) * employees.per_page + employees.data.length} {es['of'] || 'de'} {employees.total} {es['employees'] || 'empleados'}
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
            <div className="flex items-center justify-center gap-2 pt-4">
                <Button 
                    variant="outline"
                    disabled={employees.current_page === 1}
                    onClick={() => router.get(`?page=${employees.current_page - 1}`)}
                    size="sm"
                    className="h-9 min-w-[80px]"
                >
                    {es['Previous'] || 'Anterior'}
                </Button>
                
                {Array.from({ length: employees.last_page }, (_, i) => i + 1).map(page => (
                    <Button
                        key={page}
                        variant={page === employees.current_page ? 'default' : 'outline'}
                        onClick={() => router.get(`?page=${page}`)}
                        size="sm"
                        className="h-9 w-9"
                    >
                        {page}
                    </Button>
                ))}
                
                <Button 
                    variant="outline"
                    disabled={employees.current_page === employees.last_page}
                    onClick={() => router.get(`?page=${employees.current_page + 1}`)}
                    size="sm"
                    className="h-9 min-w-[80px]"
                >
                    {es['Next'] || 'Siguiente'}
                </Button>
            </div>
            

        </>
    );
}