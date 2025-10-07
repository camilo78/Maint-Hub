import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import es from '@/lang/es';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: es['Profile settings'],
        href: '/settings/profile',
    },
];

type ProfileForm = {
    name: string;
    email: string;
    phone: string;
    tipo: string;
    rtn_dni_passport: string;
    address: string;
}

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: auth.user.name,
        email: auth.user.email || '',
        phone: auth.user.phone || '',
        tipo: auth.user.tipo || '',
        rtn_dni_passport: auth.user.rtn_dni_passport || '',
        address: auth.user.address || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={es['Profile settings']} />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title={es['Profile information']} description={es['Update your name and email address']} />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">{es['Name']}</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    autoComplete="name"
                                    placeholder={es['Full name']}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">{es['Email address']}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    autoComplete="username"
                                    placeholder={es['Email address']}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">{es['Phone']}</Label>
                                <Input
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    required
                                    placeholder={es['Phone']}
                                />
                                <InputError message={errors.phone} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="tipo">{es['Type']}</Label>
                                <select
                                    id="tipo"
                                    value={data.tipo}
                                    onChange={(e) => setData('tipo', e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                    required
                                >
                                    <option value="">{es['Select a type']}</option>
                                    <option value="particular">{es['Particular']}</option>
                                    <option value="corporativo">{es['Corporate']}</option>
                                    <option value="extranjero">{es['Foreign']}</option>
                                </select>
                                <InputError message={errors.tipo} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="rtn_dni_passport">
                                    {data.tipo === 'corporativo' ? es['RTN'] + ' (14 dígitos)' : 
                                     data.tipo === 'extranjero' ? es['Passport'] + ' (6-12 caracteres)' : 
                                     es['DNI'] + ' (13 dígitos)'}
                                </Label>
                                <Input
                                    id="rtn_dni_passport"
                                    value={data.rtn_dni_passport}
                                    onChange={(e) => {
                                        if (data.tipo === 'extranjero') {
                                            const value = e.target.value.toUpperCase();
                                            if (value.length <= 12) {
                                                setData('rtn_dni_passport', value);
                                            }
                                        } else {
                                            const value = e.target.value.replace(/\D/g, '');
                                            const maxLength = data.tipo === 'corporativo' ? 14 : 13;
                                            if (value.length <= maxLength) {
                                                setData('rtn_dni_passport', value);
                                            }
                                        }
                                    }}
                                    required
                                    placeholder={
                                        data.tipo === 'corporativo' ? '14 dígitos' : 
                                        data.tipo === 'extranjero' ? 'Ej: AB1234567' : 
                                        '13 dígitos'
                                    }
                                />
                                <InputError message={errors.rtn_dni_passport} />
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="address">{es['Address']}</Label>
                                <textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                    required
                                    placeholder={es['Address']}
                                />
                                <InputError message={errors.address} />
                            </div>
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div>
                                <p className="text-muted-foreground -mt-4 text-sm">
                                    {es['Your email address is unverified.']}{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    >
                                        {es['Click here to resend the verification email.']}
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        {es['A new verification link has been sent to your email address.']}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button className="" disabled={processing}>{es['Save']}</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">{es['Saved']}</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
