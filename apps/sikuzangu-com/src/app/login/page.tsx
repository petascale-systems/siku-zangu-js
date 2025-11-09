'use client'

import {EMAIL_AND_PASSWORD_SCHEMA, EmailAndPassword} from '@siku-zangu/core'
import {Field, Input, Label} from '@headlessui/react'
import {EyeIcon, EyeSlashIcon} from "@heroicons/react/24/outline";
import {FormEvent, useState} from "react";
import logoPNG from '../../../public/images/logo.png'
import Image from "next/image";
import {ZodError} from 'zod'
import {useCurrentSessionAdmin, WebsiteNav} from "@siku-zangu/react";

export default function LoginPage() {
    const [_isPassword, _setIsPassword] = useState(true)
    const [_formData, _setFormData] = useState<EmailAndPassword>({email: '', password: ''})
    const [_formError, _setFormError] = useState<ZodError>()
    const {login, isLoggingIn} = useCurrentSessionAdmin()

    const _handleSubmitBtnClick = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const result = EMAIL_AND_PASSWORD_SCHEMA.safeParse(_formData)
        _setFormError(result.error)
        if (!result.success) return;

        login(_formData).catch(() => console.log('Console', e))
    }

    return (
        <div className='h-full overflow-y-auto'>
            <WebsiteNav logo={logoPNG}/>
            <div className='flex flex-col justify-center items-center gap-6 h-[calc(100%-4rem)] mt-16'>
                <div className='flex gap-4 items-center'>
                    <Image src={logoPNG} alt={''}/>
                    <span className='font-bold text-primary text-2xl'>Siku Zangu</span>
                </div>
                <div className='p-8 flex flex-col items-center border border-gray-200 rounded-lg gap-6 shadow'>
                    <span className='text-lg font-medium text-gray-600'>Welcome back</span>
                    <form className='w-96 space-y-4' onSubmit={_handleSubmitBtnClick}>
                        <Field className='flex flex-col gap-2'>
                            <Label className="text-base font-medium text-tertiary">Email</Label>
                            <div className='flex flex-col gap-1'>
                                <Input type='email' name="email" value={_formData.email}
                                       onChange={(e) => _setFormData({..._formData, email: e.target.value})}
                                       className="border border-gray-300 px-4 py-2 rounded-lg appearance-none focus:outline-gray-300 focus:outline-offset-1 focus:outline-2 text-gray-500 placeholder:text-gray-300"/>
                                <span
                                    className='text-xs text-red-400'>{_formError?.issues?.find(issue => issue.path && issue.path[0] == 'email')?.message}</span>
                            </div>
                        </Field>

                        <Field className='flex flex-col gap-2'>
                            <Label className="text-base font-medium text-tertiary">Password</Label>
                            <div className='flex flex-col gap-1'>
                                <div
                                    className='flex gap-2 border border-gray-300 px-4 py-2 rounded-lg focus-within:outline-gray-300 focus-within:outline-offset-1 focus-within:outline-2'>
                                    <Input type={_isPassword ? 'password' : 'text'} name="password"
                                           onChange={(e) => _setFormData({..._formData, password: e.target.value})}
                                           className="appearance-none focus:outline-none grow text-gray-500 placeholder:text-gray-300"/>
                                    <button onClick={() => _setIsPassword(!_isPassword)} type='button'>
                                        <EyeSlashIcon
                                            className={`text-gray-500 size-4.5 ${_isPassword ? 'hidden' : ''}`}/>
                                        <EyeIcon className={`text-gray-500 size-4.5 ${!_isPassword ? 'hidden' : ''}`}/>
                                    </button>
                                </div>
                                <span
                                    className='text-xs text-red-400'>{_formError?.issues?.find(issue => issue.path && issue.path[0] == 'password')?.message}</span>
                            </div>
                        </Field>

                        <button type='submit'
                                className='bg-primary text-white rounded-full w-full text-center py-2.5 text-sm font-medium'>
                            {isLoggingIn ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}