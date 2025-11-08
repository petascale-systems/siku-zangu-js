"use client"

import React, {Suspense, useEffect} from "react";
import {NavLink, useCurrentSessionAdmin} from "@siku-zangu/react";
import {
    ArrowTrendingUpIcon,
    BellIcon,
    ChartBarIcon,
    DocumentTextIcon,
    HomeIcon,
    ShieldExclamationIcon,
    UsersIcon
} from "@heroicons/react/24/outline";

export default function Layout({children}: { children: React.ReactNode }) {
    const {admin, isFetchingAdmin} = useCurrentSessionAdmin();
    return (
        <div className='bg-inherit h-full flex divide-x divide-gray-200'>
            <nav className='min-w-64 h-full flex flex-col divide-y divide-gray-200'>
                <div className='h-15 w-full px-4 flex justify-start items-center'>
                    <span className='text-primary font-bold text-lg'>Sikuzangu Admin</span>
                </div>

                <div className='grow w-full py-4 px-2'>
                    <NavLink href='/dashboard' text='Dashboard' activeMode='exact'
                             icon={<HomeIcon className='size-4.5 stroke-2'/>}/>
                    <NavLink href='/dashboard/admins' text='Admins'
                             icon={<ShieldExclamationIcon className='size-5 stroke-2'/>}/>
                    <NavLink href='/dashboard/users' text='Users' icon={<UsersIcon className='size-4.5 stroke-2'/>}/>
                    <NavLink href='/dashboard/articles' text='Articles'
                             icon={<DocumentTextIcon className='size-4.5 stroke-2'/>}/>
                    <NavLink href='/dashboard/notifications' text='Notifications'
                             icon={<BellIcon className='size-5 stroke-2'/>}/>
                    <NavLink href='/dashboard/stats' text='Stats' icon={<ChartBarIcon className='size-4.5 stroke-2'/>}/>
                    <NavLink href='/dashboard/trends' text='Trends'
                             icon={<ArrowTrendingUpIcon className='size-4.5 stroke-2'/>}/>
                </div>
            </nav>
            <main className='h-full grow flex flex-col divide-y divide-gray-200'>
                <div className='flex justify-between items-center min-h-15 sticky px-4'>
                    <span className='text-primary text-base font-medium'>Sikuzangu Admin Portal</span>
                </div>

                <div className='bg-gray-50 grow overflow-y-auto'>
                    <Suspense fallback={<span>Loading...</span>}>
                        {children}
                    </Suspense>
                </div>
            </main>
        </div>
    )
}