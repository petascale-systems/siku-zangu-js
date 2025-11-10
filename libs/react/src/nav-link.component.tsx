'use client'

import {ReactNode, useEffect, useState} from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";

export function NavLink({href, text, icon, activeMode = 'starts_with'}: {
    href: string,
    text?: string,
    icon?: ReactNode,
    activeMode?: 'exact' | 'starts_with'
}) {
    const pathname = usePathname();
    const [activeClass, setActiveClass] = useState('text-gray-700');

    useEffect(() => {
        if (activeMode === 'exact') setActiveClass(pathname === href ? "text-secondary bg-secondary/5" : "text-gray-700");
        if (activeMode === 'starts_with') if (activeMode === 'starts_with') setActiveClass(pathname.startsWith(href) ? "text-secondary bg-secondary/5" : "text-gray-700");
    }, [pathname])
    return (
        <Link href={href} className={`flex gap-3 items-center px-4 py-2.5 rounded hover:bg-gray-100 ${activeClass}`}>
            {icon}
            <span className='text-sm'>{text}</span>
        </Link>
    )
}