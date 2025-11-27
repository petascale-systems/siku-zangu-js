import Link from 'next/link';
import { WebsiteNav, WebsiteFooter } from '@siku-zangu/react';
import logo from '../../../public/images/logo.png';

export default function AboutPage() {
  return (
    <div className="bg-primary-base">
      <WebsiteNav logo={logo} />
      <section className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8">
            <span className="text-primary">About Siku Zangu</span>
          </h1>

          <div className="space-y-6 sm:space-y-8">
            <div className="prose prose-sm sm:prose-base max-w-none text-center">
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed text-center">
                <span className="font-semibold text-primary">Siku Zangu</span>{' '}
                is a bold digital health initiative designed to empower African
                women and girls with intelligent, culturally relevant tools to
                manage their menstrual and reproductive health. At the heart of
                our platform is a powerful fusion of data science, mobile
                technology, and local knowledge to help users track their
                cycles, understand their bodies, and make informed decisions,
                all in a safe, accessible, and respectful space.
              </p>

              <p className="text-base sm:text-lg text-gray-700 leading-relaxed text-center">
                In many parts of Africa, conversations around menstruation,
                fertility, and hormonal health are still clouded by stigma and
                silence. Siku Zangu tackles these taboos head-on by transforming
                how health information is delivered and received across the
                continent. Using AI-powered cycle prediction and real-time
                symptom tracking, we provide accurate, personalized insights
                while respecting the privacy, language and lived experiences of
                every user.
              </p>

              <p className="text-base sm:text-lg text-gray-700 leading-relaxed text-center">
                Siku Zangu is not just an app. It is a movement toward more
                informed, confident women who understand their bodies and
                support one another through every stage of womanhood. It is a
                safe space a space where women and girls can learn, ask, share,
                and thrive; all in their own language, on their own terms.
              </p>
            </div>

            <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6 text-center">
                What We Do
              </h2>
              <ul className="space-y-4 sm:space-y-5 max-w-3xl mx-auto">
                <li className="flex gap-3 sm:gap-4 text-left">
                  <span className="text-primary text-xl sm:text-2xl flex-shrink-0">
                    •
                  </span>
                  <div>
                    <span className="font-semibold text-gray-900">
                      Track & Predict
                    </span>
                    <span className="text-gray-700">
                      {' '}
                      – We help users log and predict menstrual cycles,
                      ovulation, and symptoms with AI and localized tips
                      tailored to their needs.
                    </span>
                  </div>
                </li>
                <li className="flex gap-3 sm:gap-4">
                  <span className="text-primary text-xl sm:text-2xl flex-shrink-0">
                    •
                  </span>
                  <div>
                    <span className="font-semibold text-gray-900">Educate</span>
                    <span className="text-gray-700">
                      {' '}
                      – We deliver culturally-sensitive, science-based health
                      education in English and Kiswahili, helping to demystify
                      menstruation and reproductive health.
                    </span>
                  </div>
                </li>
                <li className="flex gap-3 sm:gap-4">
                  <span className="text-primary text-xl sm:text-2xl flex-shrink-0">
                    •
                  </span>
                  <div>
                    <span className="font-semibold text-gray-900">Protect</span>
                    <span className="text-gray-700">
                      {' '}
                      – We prioritize data privacy and consent, with anonymous
                      use options and encrypted tracking.
                    </span>
                  </div>
                </li>
                <li className="flex gap-3 sm:gap-4">
                  <span className="text-primary text-xl sm:text-2xl flex-shrink-0">
                    •
                  </span>
                  <div>
                    <span className="font-semibold text-gray-900">Connect</span>
                    <span className="text-gray-700">
                      {' '}
                      – We are cultivating a supportive digital community where
                      users can share experiences, ask questions, and feel less
                      alone.
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6 text-center">
                Core Values
              </h2>
              <div className="space-y-4 sm:space-y-5 text-gray-700 max-w-3xl mx-auto text-center">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2">
                    Empowerment
                  </h3>
                  <p className="text-sm sm:text-base">
                    Equipping users with knowledge and tools to take control of
                    their health.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2">
                    Privacy
                  </h3>
                  <p className="text-sm sm:text-base">
                    Respecting bodies and boundaries. Data is secure. choices
                    belong to the user, and anonymity is honored.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2">
                    Cultural Sensitivity
                  </h3>
                  <p className="text-sm sm:text-base">
                    Designing with respect for African languages, traditions,
                    and lived realities, blending modern tech with African
                    knowledge and wisdom.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2">
                    Inclusivity
                  </h3>
                  <p className="text-sm sm:text-base">
                    For every African woman and girl, whether rural or urban,
                    connected or offline, young or experienced.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2">
                    Evidence-Based
                  </h3>
                  <p className="text-sm sm:text-base">
                    Grounding features and content in science, validated by
                    medical experts, and adapted to local context.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2">
                    Innovation
                  </h3>
                  <p className="text-sm sm:text-base">
                    Applying human-centered thinking, mobile-first design, and
                    AI to bridge gaps in menstrual education and access to care.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">
                Our Vision
              </h2>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                A future where every woman and girl in Africa, no matter her
                age, income, or location, has the knowledge, tools, and freedom
                to manage her menstrual and reproductive health with confidence,
                care, and cultural pride.
              </p>
            </div>

            <div className="bg-pink-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">
                Our Mission
              </h2>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                To empower women and girls in Africa with culturally relevant,
                accessible, and intelligent tools to understand their menstrual
                cycles, improve their reproductive health, so they can live with
                dignity, confidence, and control over their health.
              </p>
            </div>
          </div>
        </div>
      </section>
      <WebsiteFooter logo={logo} />
    </div>
  );
}
