import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toaster } from '@/components/ui/sonner';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { toast } from 'sonner';
import es from '@/lang/es';

const breadcrumbs: BreadcrumbItem[] = [{ title: es['General settings'], href: '/settings/general' }];

export default function General() {
    const { settings } = usePage<SharedData>().props;

    const [previews, setPreviews] = useState({
        site_logo_lite: settings.site_logo_lite || '/logo.svg',
        site_logo_dark: settings.site_logo_dark || '/logo.svg',
        site_icon: settings.site_icon || '/favicon.ico',
        site_favicon: settings.site_favicon || '/favicon.svg',
    });

    const { data, setData, setDefaults, errors, processing, recentlySuccessful, post } = useForm<{
        app_name: string;
        site_logo_lite: File | null;
        site_logo_dark: File | null;
        site_icon: File | null;
        site_favicon: File | null;
    }>({
        app_name: settings.app_name ?? '',
        site_logo_lite: null,
        site_logo_dark: null,
        site_icon: null,
        site_favicon: null,
    });

    const handleImageChange = (key: keyof typeof previews, file: File | null) => {
        setData(key, file);

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviews((prev) => ({
                    ...prev,
                    [key]: e.target?.result as string,
                }));
            };
            reader.readAsDataURL(file);
        } else {
            // If file removed, reset preview to original
            setPreviews((prev) => ({
                ...prev,
                [key]: settings[key] ?? '',
            }));
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('settings.general.update'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                toast.success(es['Settings updated successfully']);
                setDefaults({
                    app_name: data.app_name,
                    site_logo_lite: null,
                    site_logo_dark: null,
                    site_icon: null,
                    site_favicon: null,
                });
            },
            onError: (Errors) => {
                toast.error(Errors?.update || es['Failed to update settings']);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={es['General Settings']} />
            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title={es['General Site Information']} description={es['Update site name and logos']} />
                    <Toaster position="top-right" />
                    <form onSubmit={submit} className="space-y-6">
                        {/* Site Name */}
                        <div className="grid gap-2">
                            <Label htmlFor="app_name">{es['Site Name']}</Label>
                            <Input
                                id="app_name"
                                value={data.app_name}
                                onChange={(e) => setData('app_name', e.target.value)}
                                required
                                placeholder={es['Site name']}
                            />
                            <InputError message={errors.app_name} />
                        </div>

                        {/* Logos & Icons */}
                        {(
                            [
                                ['site_logo_lite', es['Site Logo (Light)']],
                                ['site_logo_dark', es['Site Logo (Dark)']],
                                ['site_icon', es['Site Icon']],
                                ['site_favicon', es['Site Favicon']],
                            ] as [keyof typeof previews, string][]
                        ).map(([key, label]) => (
                            <div key={key} className="grid gap-2">
                                <Label htmlFor={key}>{label}</Label>
                                <img
                                    src={previews[key]}
                                    alt={`${label} preview`}
                                    className="max-h-[80px] bg-gray-200 p-2 dark:bg-gray-800 rounded-md"
                                />
                                <Input
                                    id={key}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageChange(key, e.target.files?.[0] ?? null)}
                                />
                                <InputError message={errors[key]} />
                            </div>
                        ))}

                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={processing}>
                                {es['Save Changes']}
                            </Button>
                            <Transition
                                show={recentlySuccessful}
                                enter="transition-opacity duration-500"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="transition-opacity duration-500"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">{es['Saved']}.</p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
