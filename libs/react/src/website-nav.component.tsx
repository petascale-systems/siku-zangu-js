import {StaticImport} from "next/dist/shared/lib/get-img-props";
import Image from "next/image";
import Link from "next/link";
import {usePathname} from "next/navigation";

export default function WebsiteNav({logo}: { logo: string | StaticImport }) {
    const pathname = usePathname();
    return (
        <nav className='flex justify-between items-center px-4 border-b border-gray-200 shadow-xs fixed top-0 z-5 bg-white w-full text-base h-16'>
            <Link href={'/'}><Image height={48} src={logo} alt=''/></Link>
            <div className='flex text-gray-600 font-medium gap-4'>
                <Link href={'/'} className={`p-2.5 ${pathname == '/' ? 'text-primary font-semibold' : ''}`}>Home</Link>
                <Link href={'/features'}
                      className={`p-2.5 ${pathname == '/features' ? 'text-primary font-semibold' : ''}`}>Features</Link>
                <Link href={'/about'}
                      className={`p-2.5 ${pathname == '/about' ? 'text-primary font-semibold' : ''}`}>About</Link>
                <Link href={'/contact'}
                      className={`p-2.5 ${pathname == '/contact' ? 'text-primary font-semibold' : ''}`}>Contact</Link>
            </div>

            <Link href={'/login'} className='bg-primary text-white py-2.5 px-5 rounded-xl font-semibold'>Admin
                Login</Link>
        </nav>
    )
}