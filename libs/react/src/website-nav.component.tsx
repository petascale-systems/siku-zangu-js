"use client"

import {StaticImport} from "next/dist/shared/lib/get-img-props";
import Image from "next/image";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useState} from "react";

export function WebsiteNav({logo}: { logo: string | StaticImport }) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/features', label: 'Features' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav className='fixed top-0 z-50 bg-white w-full border-b border-gray-200 shadow-sm'>
      <div className='flex justify-between items-center px-4 sm:px-6 lg:px-8 h-16 max-w-7xl mx-auto'>
        {/* Logo */}
        <Link href={'/'} className='flex-shrink-0'>
          <Image height={40} src={logo} alt='Siku Zangu' className='h-10 sm:h-12 w-auto'/>
        </Link>

        {/* Desktop Navigation */}
        <div className='hidden md:flex text-gray-600 font-medium gap-1 lg:gap-2'>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 lg:px-4 py-2 rounded-lg transition-colors hover:bg-gray-100 ${
                pathname === link.href ? 'text-primary font-semibold bg-pink-50' : ''
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Admin Login Button */}
        <Link
          href={'/login'}
          className='hidden md:flex bg-primary text-white py-2 px-4 lg:py-2.5 lg:px-5 rounded-xl font-semibold hover:bg-pink-600 transition-colors text-sm lg:text-base whitespace-nowrap'
        >
          Admin Login
        </Link>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className='md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors'
          aria-label='Toggle menu'
        >
          {isMenuOpen ? (
            <svg className='w-6 h-6 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          ) : (
            <svg className='w-6 h-6 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className='md:hidden border-t border-gray-200 bg-white'>
          <div className='px-4 py-3 space-y-1'>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg transition-colors hover:bg-gray-100 ${
                  pathname === link.href ? 'text-primary font-semibold bg-pink-50' : 'text-gray-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={'/login'}
              onClick={() => setIsMenuOpen(false)}
              className='block w-full text-center bg-primary text-white py-3 px-4 rounded-xl font-semibold hover:bg-pink-600 transition-colors mt-4'
            >
              Admin Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}