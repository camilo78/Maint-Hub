import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import es from '@/lang/es';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: es['Appearance settings'],
        href: '/settings/appearance',
    },
];

export default function Appearance() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={es['Appearance settings']} />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title={es['Appearance settings']} description={es["Update your account's appearance settings"]} />
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
