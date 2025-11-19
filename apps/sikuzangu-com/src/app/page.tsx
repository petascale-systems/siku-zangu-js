import Link from 'next/link';
import Image from 'next/image';
import homepageImage from '../../public/images/homepage.png';
import {WebsiteNav, WebsiteFooter} from '@siku-zangu/react'
import logo from '../../public/images/logo.png';

export default function HomePage() {
  return (
    <div className="bg-gradient-to-b from-pink-50 to-white">
      <WebsiteNav logo={logo}/>
      <section className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
          <div className="space-y-4 sm:space-y-6 text-center lg:text-left order-2 lg:order-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Empowering Women,
              <span className="block text-primary">One Cycle at a Time</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0">
              Track your cycle, understand your body – now in Kiswahili &
              English.
            </p>
            <Link
              href="#download"
              className="inline-flex items-center justify-center gap-2 bg-primary text-white py-3 sm:py-4 px-6 sm:px-8 rounded-full font-semibold hover:from-pink-500 hover:to-pink-600 transition-all text-base sm:text-lg shadow-lg hover:shadow-xl"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z" />
              </svg>
              Download App
            </Link>
          </div>
          <div className="flex justify-center lg:justify-end order-1 lg:order-2">
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[400px]">
              <Image
                src={homepageImage}
                alt="Siku Zangu App Interface"
                width={310}
                height={622}
                className="drop-shadow-2xl rounded-3xl w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </section>
      <section className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-dark-text mb-8 sm:mb-12 text-center lg:text-left">
            Why Siku Zangu
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-blue-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-3 sm:space-y-4 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <svg
                  className="w-7 h-7 sm:w-8 sm:h-8 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                Bilingual
              </h3>
              <p className="text-sm sm:text-base text-neutral-placeholder leading-relaxed">
                Switch seamlessly between English & Kiswahili for full
                inclusivity.
              </p>
            </div>
            <div className="bg-pink-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-3 sm:space-y-4 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-pink-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <svg
                  className="w-7 h-7 sm:w-8 sm:h-8 text-pink-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                Culturally Aware
              </h3>
              <p className="text-sm sm:text-base text-neutral-placeholder leading-relaxed">
                Rooted in African values, respecting culture and traditions.
              </p>
            </div>
            <div className="bg-yellow-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-3 sm:space-y-4 hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-yellow-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <svg
                  className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                Personalized Insights
              </h3>
              <p className="text-sm sm:text-base text-neutral-placeholder leading-relaxed">
                Get health tips and predictions tailored to your cycle.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 bg-gradient-to-b from-white to-pink-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-dark-text mb-8 sm:mb-12 text-center lg:text-left">
            How it Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
            <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4 p-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-xl sm:rounded-2xl flex items-center justify-center hover:scale-110 transition-transform">
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-primary">
                Track
              </h3>
              <p className="text-sm sm:text-base text-neutral-placeholder max-w-xs">
                Mark your Period start and end
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4 p-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-cyan-100 rounded-xl sm:rounded-2xl flex items-center justify-center hover:scale-110 transition-transform">
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-primary">Log</h3>
              <p className="text-sm sm:text-base text-neutral-placeholder max-w-xs">
                Record moods, flow & symptoms
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4 p-4 sm:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-yellow-100 rounded-xl sm:rounded-2xl flex items-center justify-center hover:scale-110 transition-transform">
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-primary">
                Learn
              </h3>
              <p className="text-sm sm:text-base text-neutral-placeholder max-w-xs">
                Get insights and tips for your wellness
              </p>
            </div>
          </div>
        </div>
      </section>
      <WebsiteFooter logo={logo}/>
    </div>
  );
}
