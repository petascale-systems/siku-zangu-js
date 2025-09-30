'use client'

import {Field, Input, Label} from '@headlessui/react'
import {EyeIcon, EyeSlashIcon} from "@heroicons/react/24/outline";
import {useState} from "react";
import logoPNG from '../../../public/images/logo.png'
import Image from "next/image";

export default function LoginPage() {
    const [_isPassword, _setIsPassword] = useState(true)
    return (
        <div className='flex flex-col w-full h-full overflow-y-auto justify-center items-center gap-6'>
            <div className='flex gap-4 items-center'>
                <Image src={logoPNG} alt={''}/>
                <span className='font-bold text-primary text-2xl'>Siku Zangu</span>
            </div>
            <div className='p-8 flex flex-col items-center border border-gray-200 rounded-lg gap-6'>
                <span className='text-lg font-medium text-gray-600'>Welcome back</span>
                <form className='w-96 space-y-4' onSubmit={e => e.preventDefault()}>

                    <Field className='flex flex-col gap-2'>
                        <Label className="text-base font-medium text-tertiary">Email</Label>
                        <Input type='text' name="email"
                               className="border border-gray-300 px-4 py-2 rounded-lg appearance-none focus:outline-gray-300 focus:outline-offset-1 focus:outline-2 text-gray-500 placeholder:text-gray-300"/>
                    </Field>

                    <Field className='flex flex-col gap-2'>
                        <Label className="text-base font-medium text-tertiary">Password</Label>
                        <div
                            className='flex gap-2 border border-gray-300 px-4 py-2 rounded-lg focus-within:outline-gray-300 focus-within:outline-offset-1 focus-within:outline-2'>
                            <Input type={_isPassword ? 'password' : 'text'} name="password"
                                   className="appearance-none focus:outline-none grow text-gray-500 placeholder:text-gray-300"/>
                            <button onClick={() => _setIsPassword(!_isPassword)} type='button'>
                                <EyeSlashIcon className={`text-gray-500 size-4.5 ${_isPassword ? 'hidden' : ''}`}/>
                                <EyeIcon className={`text-gray-500 size-4.5 ${!_isPassword ? 'hidden' : ''}`}/>
                            </button>
                        </div>
                    </Field>

                    <button
                        className='bg-primary text-white rounded-full w-full text-center py-2.5 text-sm font-medium'>Login
                    </button>
                </form>
            </div>
        </div>
    )
}