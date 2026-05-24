"use client"
import {Admin, ADMIN_ZOD_SCHEMA, AdminRole, UserStatus} from "@siku-zangu/core";
import {ChangeEvent, FormEvent, useEffect, useState} from "react";
import {Button, Label, Select, Spinner, TextInput} from "flowbite-react";
import {ZodError} from "zod";

export function AdminForm({admin, isLoading, error, onSubmit}: {
    admin?: Admin,
    isLoading?: boolean,
    error?: ZodError,
    onSubmit?: (admin: Admin) => void
}) {
    const [_error, _setError] = useState<ZodError>();
    const [_admin, _setAdmin] = useState<Admin>({
        role: 'member',
        status: 'active',
        kv: {first_name: '', last_name: '', email: ''}
    });

    const _handleFirstNameInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        _setAdmin({..._admin, kv: {..._admin?.kv, first_name: e.target.value}});
    }

    const _handleLastNameInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        _setAdmin({..._admin, kv: {..._admin?.kv, last_name: e.target.value}});
    }

    const _handleEmailInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        _setAdmin({..._admin, kv: {..._admin?.kv, email: e.target.value}});
    }

    const _handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
        _setAdmin({..._admin, status: e.target.value as UserStatus});
    }

    const _handleRoleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        _setAdmin({..._admin, role: e.target.value as AdminRole});
    }

    const _handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!onSubmit) return;

        const parsedAdmin = ADMIN_ZOD_SCHEMA.safeParse(_admin)
        _setError(parsedAdmin.error)
        if (parsedAdmin.success) onSubmit(parsedAdmin.data);
    }

    useEffect(() => _setError(error), [error]);
    useEffect(() => {
        _setAdmin({
            role: admin?.role ?? 'member',
            status: admin?.status ?? 'active',
            kv: {
                first_name: admin?.kv?.first_name ?? '',
                last_name: admin?.kv?.last_name ?? '',
                email: admin?.kv?.email ?? ''
            }
        })
    }, [admin]);
    return (
        <form className='flex flex-col w-full gap-3 p-2' onSubmit={_handleSubmit}>
            <div className='flex flex-col items-start gap-2 w-full'>
                <Label htmlFor="admin_form_first_name">First name</Label>
                <div className='flex flex-col w-full gap-1'>
                    <TextInput id="admin_form_first_name" type="text" className='w-full' sizing='md'
                               placeholder='Enter first name'
                               value={_admin?.kv?.first_name} onChange={_handleFirstNameInputChange}/>
                    {_error?.issues && <span
                        className='text-xs text-red-700'>{_error?.issues?.find(i => i?.path?.join(".") == "kv.first_name")?.message}</span>}
                </div>
            </div>

            <div className='flex flex-col items-start gap-2 w-full'>
                <Label htmlFor="admin_form_last_name">Last name</Label>
                <div className='flex flex-col w-full gap-1'>
                    <TextInput id="admin_form_last_name" type="text" className='w-full' sizing='md'
                               placeholder='Enter last name'
                               value={_admin?.kv?.last_name} onChange={_handleLastNameInputChange}/>
                    {_error?.issues && <span
                        className='text-xs text-red-700'>{_error?.issues?.find(i => i?.path?.join(".") == "kv.last_name")?.message}</span>}
                </div>
            </div>

            <div className='flex flex-col items-start gap-2 w-full'>
                <Label htmlFor="admin_form_email">Email</Label>
                <div className='flex flex-col w-full gap-1'>
                    <TextInput disabled={(_admin?.user_id && _admin?.user_id?.trim()?.length > 1) as boolean}
                               id="admin_form_email"
                               type="email" className='w-full' sizing='md'
                               placeholder='Enter email'
                               value={_admin?.kv?.email} onChange={_handleEmailInputChange}/>
                    {_error?.issues && <span
                        className='text-xs text-red-700'>{_error?.issues?.find(i => i?.path?.join(".") == "kv.email")?.message}</span>}
                </div>
            </div>

            <div className='flex flex-col items-start gap-2 w-full'>
                <Label htmlFor="admin_form_role">Role</Label>
                <Select id="admin_form_role" required className='w-full' value={_admin?.role}
                        onChange={_handleRoleChange}>
                    <option value='admin'>Admin</option>
                    <option value='member'>Member</option>
                </Select>
            </div>

            <div className='flex flex-col items-start gap-2 w-full'>
                <Label htmlFor="admin_form_status">Status</Label>
                <Select id="admin_form_status" required className='w-full' value={_admin?.status}
                        onChange={_handleStatusChange}>
                    <option value='active'>Active</option>
                    <option value='inactive'>Inactive</option>
                </Select>
            </div>

            <Button disabled={isLoading} color='primary' className='mt-4 gap-2' type='submit'>
                {isLoading && <Spinner size='sm' color='gray'/>}
                <span>{isLoading ? 'Submitting ...' : 'Submit'}</span>
            </Button>
        </form>
    )
}