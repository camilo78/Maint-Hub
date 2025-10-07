import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export default function AppLogo() {
    const { settings } = usePage<SharedData>().props;

    return (
        <>
            {/* Light mode logo */}
            <img
                className="block dark:hidden h-10 w-auto max-w-full object-contain"
                src={settings.site_logo_lite || '/logo.svg'}
                alt={settings.app_name || 'App Logo'}
            />
            {/* Dark mode logo */}
            <img
                className="hidden dark:block h-10 w-auto max-w-full object-contain"
                src={settings.site_logo_dark || '/logo.svg'}
                alt={settings.app_name || 'App Logo'}
            />
        </>
    );
}
