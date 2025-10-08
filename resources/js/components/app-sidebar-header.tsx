import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { useAppearance } from '@/hooks/use-appearance';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useState, useEffect } from 'react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const { appearance, updateAppearance } = useAppearance();
    const [currentLang, setCurrentLang] = useState('es');

    useEffect(() => {
        const savedLang = localStorage.getItem('language') || 'es';
        setCurrentLang(savedLang);
    }, []);

    const toggleAppearance = () => {
        updateAppearance(appearance === 'dark' ? 'light' : 'dark');
    };

    const Icon = appearance === 'dark' ? Sun : Moon;

    return (
        <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2 w-full justify-between">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>

                <div className="flex items-center gap-2">
                    <select 
                        onChange={(e) => {
                            localStorage.setItem('language', e.target.value);
                            setCurrentLang(e.target.value);
                            location.reload();
                        }}
                        value={currentLang}
                        className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs flex items-center"
                    >
                        <option value="es">{currentLang === 'es' ? 'Español' : 'Spanish'}</option>
                        <option value="en">{currentLang === 'es' ? 'Inglés' : 'English'}</option>
                    </select>
                    <button
                        onClick={toggleAppearance}
                        className={cn(
                            'flex items-center rounded-md px-3.5 py-1.5 transition-colors',
                            'text-neutral-500 hover:bg-neutral-200/60 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-700/60'
                        )}
                        title={`Switch to ${appearance === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        <Icon className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </header>
    );
}
