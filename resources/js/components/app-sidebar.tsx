import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, BookKey, Users, BookOpen, Folder, Wrench, Monitor, Settings } from 'lucide-react';
import AppLogo from './app-logo';
import { type SharedData } from '@/types';
import es from '@/lang/es';


export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const roles = auth.role ?? [];
    const isAdmin = roles.includes('Admin') || roles.includes('Superadmin');
    const mainNavItems: NavItem[] = [
        {
            title: es['Dashboard'],    
            href: '/dashboard',
            icon: LayoutGrid,
        },
        {
            title: es['Equipment'],
            href: '/equipment',
            icon: Monitor,
        },
        {
            title: es['Maintenances'],
            href: '/maintenances',
            icon: Settings,
        },
        ...(isAdmin ? [{
            title: es['Clients'],    
            href: '/admin/clients',
            icon: Users,
        },
        {
            title: es['Employees'] || 'Empleados',    
            href: '/admin/employees',
            icon: Wrench,
        }] : []),
    ];
    
    const footerNavItems: NavItem[] = [
        ...(isAdmin ? [{
            title: es['Roles'],
            href: '/admin/roles',
            icon: BookKey,
        }] : []),
        {
            title: es['Repository'],
            href: 'https://github.com/AhtashamYousaf/laravel-react-roles-permissions',
            icon: Folder,
        },
        {
            title: es['Documentation'],
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
