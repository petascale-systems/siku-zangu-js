import Link from 'next/link';
import Image from 'next/image';
import cycleImage from '../../../../public/images/cycle.png';
import symptomImage from '../../../../public/images/symptoms.png';
import insightImage from '../../../../public/images/insights.png';
import languageImage from '../../../../public/images/language.png';
import notificationImage from '../../../../public/images/notifications.png';


export default function FeaturesPage() {
  return (
    <div className="bg-primary-base">
      <section className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            Your Cycle, Your Health,
            <span className="block text-primary">Your Guide</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Discover all the features that make Siku Zangu your perfect companion for cycle tracking and wellness.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link
              href="#"
              className="inline-flex items-center justify-center gap-2 bg-primary text-white py-3 px-8 rounded-full font-semibold hover:bg-pink-600 transition-all text-base shadow-lg hover:shadow-xl w-full sm:w-auto"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              App Store
            </Link>
            <Link
              href="#"
              className="inline-flex items-center justify-center gap-2 bg-primary text-white py-3 px-8 rounded-full font-semibold hover:bg-pink-600 transition-all text-base shadow-lg hover:shadow-xl w-full sm:w-auto"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
              </svg>
              Google Play
            </Link>
          </div>
        </div>
      </section>
      <section className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 ">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-dark-text">
                Cycle Tracking
              </h2>
              <p className="text-base sm:text-lg text-neutral-placeholder leading-relaxed">
                Easily track your menstrual cycle with our intuitive calendar interface. Mark your period start and end dates, and let Siku Zangu predict your next cycle.
              </p>
              <ul className="space-y-3 text-neutral-placeholder">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>Simple and intuitive calendar view</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>Accurate cycle predictions</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>Get notifications for upcoming periods</span>
                </li>
              </ul>
            </div>
            <div className="flex justify-center lg:justify-end order-1 lg:order-2">
              <div className="relative w-full max-w-[280px] sm:max-w-[320px]">
                <div className="bg-gradient-to-br from-pink-100 to-pink-50 rounded-3xl p-8 shadow-xl">
                  <div className="bg-white rounded-2xl shadow-lg aspect-[9/16] flex items-center justify-center">
                    <Image
                      src={cycleImage}
                      alt="Cycle Tracking Interface"
                      width={280}
                      height={560}
                      className="rounded-2xl w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 ">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="flex justify-center lg:justify-start order-1">
              <div className="relative w-full max-w-[280px] sm:max-w-[320px]">
                <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-3xl p-8 shadow-xl">
                  <div className="bg-white rounded-2xl shadow-lg aspect-[9/16] flex items-center justify-center">
                    <Image
                      src={symptomImage}
                      alt="Symptoms Logging Interface"
                      width={280}
                      height={560}
                      className="rounded-2xl w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4 sm:space-y-6 order-2">
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-dark-text">
                Symptoms Logging
              </h2>
              <p className="text-base sm:text-lg text-neutral-placeholder leading-relaxed">
                Track your daily symptoms, mood, and flow intensity. Understanding your patterns helps you take better care of your health.
              </p>
              <ul className="space-y-3 text-neutral-placeholder">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>Log moods, flow, and physical symptoms</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>Visual icons make logging quick and easy</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>Identify patterns over time</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-dark-text">
                Reminders & Notifications
              </h2>
              <p className="text-base sm:text-lg text-neutral-placeholder leading-relaxed">
                Never miss important dates with smart reminders. Get notified about your upcoming period, fertile window, and medication reminders.
              </p>
              <ul className="space-y-3 text-neutral-placeholder">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>Period and fertile window reminders</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>Customizable notification preferences</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>Medication and supplement reminders</span>
                </li>
              </ul>
            </div>
            <div className="flex justify-center lg:justify-end order-1 lg:order-2">
              <div className="relative w-full max-w-[280px] sm:max-w-[320px]">
                <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-3xl p-8 shadow-xl">
                  <div className="bg-white rounded-2xl shadow-lg aspect-[9/16] flex items-center justify-center">
                    <Image
                      src={notificationImage}
                      alt="Reminders Interface"
                      width={280}
                      height={560}
                      className="rounded-2xl w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 ">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="flex justify-center lg:justify-start order-1">
              <div className="relative w-full max-w-[280px] sm:max-w-[320px]">
                <div className="bg-gradient-to-br from-pink-100 to-red-50 rounded-3xl p-8 shadow-xl">
                  <div className="bg-white rounded-2xl shadow-lg aspect-[9/16] flex items-center justify-center">
                    <Image
                      src={insightImage}
                      alt="Health Insights Interface"
                      width={280}
                      height={560}
                      className="rounded-2xl w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4 sm:space-y-6 order-2">
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-dark-text">
                Health Insights
              </h2>
              <p className="text-base sm:text-lg text-neutral-placeholder leading-relaxed">
                Get personalized insights about your cycle and overall reproductive health. Learn what's normal for your body and when to seek medical advice.
              </p>
              <ul className="space-y-3 text-neutral-placeholder">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>Personalized cycle analysis and trends</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>Educational articles and health tips</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>Understand your body better</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-dark-text">
                Bilingual Support
              </h2>
              <p className="text-base sm:text-lg text-neutral-placeholder leading-relaxed">
                Siku Zangu speaks your language! Switch seamlessly between English and Kiswahili for a truly inclusive experience that respects your cultural identity.
              </p>
              <ul className="space-y-3 text-neutral-placeholder">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>Full support for English and Kiswahili</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>Switch languages with one tap</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>Culturally appropriate terminology and content</span>
                </li>
              </ul>
            </div>
            <div className="flex justify-center lg:justify-end order-1 lg:order-2">
              <div className="relative w-full max-w-[280px] sm:max-w-[320px]">
                <div className="bg-gradient-to-br from-orange-100 to-red-50 rounded-3xl p-8 shadow-xl">
                  <div className="bg-white rounded-2xl shadow-lg aspect-[9/16] flex items-center justify-center">
                    <Image
                      src={languageImage}
                      alt="Bilingual Support Interface"
                      width={280}
                      height={560}
                      className="rounded-2xl w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}