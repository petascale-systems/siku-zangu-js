
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import {usePathname} from "next/navigation";
import Link from "next/link";

export function WebsiteFooter({ logo }: { logo: string | StaticImport }) {
  return (
    <footer className='bg-black text-white px-4 py-12'>
      <div className='max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8'>
        <div className='flex flex-col gap-4'>
          <p className='text-lg font-bold'>Siku Zangu</p>
          <p className='text-gray-300 text-base leading-relaxed'>
            Your personal guide to menstrual, fertility and personal care.
          </p>
          <div className='flex flex-col gap-3 mt-4'>
            <Link
              href={'#'}
              className='bg-primary text-white py-3 px-6 rounded-full font-semibold flex items-center gap-2 hover:from-pink-500 hover:to-pink-600 transition-all w-fit'
            >
              <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z'/>
              </svg>
              App Store
            </Link>
            <Link
              href={'#'}
              className='bg-primary text-white py-3 px-6 rounded-full font-semibold flex items-center gap-2 hover:from-pink-500 hover:to-pink-600 transition-all w-fit'
            >
              <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z'/>
              </svg>
              Google Play
            </Link>
          </div>
        </div>
        <div className='flex flex-col gap-4'>
          <h3 className='text-xl font-bold mb-2'>Company</h3>
          <Link href={'/about'} className='text-gray-300 hover:text-white transition-colors border-b border-transparent hover:border-white w-fit'>
            About us
          </Link>
          <Link href={'/privacy-policy'} className='text-gray-300 hover:text-white transition-colors border-b border-transparent hover:border-white w-fit'>
            Privacy Policy
          </Link>
          <Link href={'/terms-of-service'} className='text-gray-300 hover:text-white transition-colors border-b border-transparent hover:border-white w-fit'>
            Terms of Service
          </Link>
          <Link href={'/contact'} className='text-gray-300 hover:text-white transition-colors border-b border-transparent hover:border-white w-fit'>
            Contact us
          </Link>
          <Link href={'/delete-account'} className='text-gray-300 hover:text-white transition-colors border-b border-transparent hover:border-white w-fit'>
            Delete Account
          </Link>
            <Link href={'/user-manual'} className='text-gray-300 hover:text-white transition-colors border-b border-transparent hover:border-white w-fit'>
                User Manual
            </Link>
        </div>
        <div className='flex flex-col gap-4'>
          <h3 className='text-xl font-bold mb-2'>Socials</h3>
          <Link href={'https://instagram.com'} target='_blank' className='text-gray-300 hover:text-white transition-colors border-b border-transparent hover:border-white w-fit'>
            Instagram
          </Link>
          <Link href={'https://facebook.com'} target='_blank' className='text-gray-300 hover:text-white transition-colors border-b border-transparent hover:border-white w-fit'>
            Facebook
          </Link>
          <Link href={'https://twitter.com'} target='_blank' className='text-gray-300 hover:text-white transition-colors border-b border-transparent hover:border-white w-fit'>
            Twitter
          </Link>
          <Link href={'https://pinterest.com'} target='_blank' className='text-gray-300 hover:text-white transition-colors border-b border-transparent hover:border-white w-fit'>
            Pinterest
          </Link>
        </div>
      </div>

      <div className='max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm'>
        © {new Date().getFullYear()} Siku Zangu. All rights reserved.
      </div>
    </footer>
  );
}