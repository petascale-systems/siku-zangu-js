'use client'

import {ReactNode, useEffect, useState} from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";

export function NavLink({href, text, icon}: { href: string, text?: string, icon?: ReactNode }) {
    const pathname = usePathname();
    const [activeClass, setActiveClass] = useState('text-gray-700');

    useEffect(() => {
        setActiveClass(pathname == href ? "text-secondary bg-secondary/5" : "text-gray-700");
    }, [pathname])
    return (
        <Link href={href} className={`flex gap-3 items-center px-4 py-2.5 rounded hover:bg-gray-100 ${activeClass}`}>
            {icon}
            <span className='text-sm'>{text}</span>
        </Link>
    )
}