import logo from '../../../public/images/logo.png';
import { WebsiteNav, WebsiteFooter } from '@siku-zangu/react';

export default function TermsOfServicePage() {
  return (
    <div className="bg-primary-base">
      <WebsiteNav logo={logo} />
      <section className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 pt-20 sm:pt-24 md:pt-28">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              <span className="text-primary">Terms of Service</span>
            </h1>
            <p className="text-sm sm:text-base text-neutral-placeholder">
              Effective Date: 10 May 2026
            </p>
          </div>
          <div className="space-y-6 sm:space-y-8 text-neutral-dark-text">
            <div className="bg-pink-50 rounded-xl sm:rounded-2xl p-6 sm:p-8">
              <p className="text-sm sm:text-base leading-relaxed mb-4">
                PLEASE READ THESE TERMS OF SERVICE CAREFULLY. BY DOWNLOADING,
                ACCESSING, OR USING THE SIKU ZANGU MOBILE APPLICATION ("APP"),
                YOU AGREE TO BE BOUND BY THESE TERMS OF SERVICE AND OUR PRIVACY
                POLICY. IF YOU DO NOT AGREE TO ALL OF THESE TERMS, DO NOT USE
                THE APP.
              </p>
              <p className="text-sm sm:text-base leading-relaxed">
                These Terms of Service ("Terms") govern your access to and use
                of the Siku Zangu mobile app and related services ("Services")
                provided by Siku Zangu Health Technologies Ltd ("Company", "we",
                "us", or "our").
              </p>
            </div>
            <div>
              <h2 className="text-md sm:text-xl font-bold text-gray-900 mb-4">
                1. Introduction & Acceptance of Terms
              </h2>
              <p className="text-sm sm:text-base leading-relaxed">
                Siku Zangu is a digital health platform designed to support
                African women and girls in managing their menstrual and
                reproductive health. These Terms form a legally binding
                agreement between you and us. By using the App, you confirm that
                you accept these Terms and agree to comply with them.
              </p>
            </div>
            <div>
              <h2 className="text-md sm:text-xl font-bold text-gray-900 mb-4">
                2. Eligibility & User Accounts
              </h2>
              <p className="text-sm sm:text-base leading-relaxed">
                You must be at least 18 years old to use the App. Account
                registration requires accurate and up-to-date information. You
                are responsible for safeguarding your login credentials.
              </p>
            </div>
            <div>
              <h2 className="text-md sm:text-xl font-bold text-gray-900 mb-4">
                3. User-Generated Content
              </h2>
              <p className="text-sm sm:text-base leading-relaxed">
                Users retain rights to content they submit, but grant us a
                limited license to use it to improve and promote the app. You
                are responsible for the legality and accuracy of your content.
              </p>
            </div>
            <div>
              <h2 className="text-md sm:text-xl font-bold text-gray-900 mb-4">
                4. Acceptable Use Policy
              </h2>
              <p className="text-sm sm:text-base leading-relaxed">
                You agree not to upload or distribute content that is illegal,
                harmful, misleading, abusive, or violates rights of others.
                Misuse may lead to account suspension or legal action.
              </p>
            </div>
            <div>
              <h2 className="text-md sm:text-xl font-bold text-gray-900 mb-4">
                5. Data Protection & Privacy
              </h2>
              <p className="text-sm sm:text-base leading-relaxed">
                We comply with Tanzania's Personal Data Protection Act (PDPA)
                and Kenya's Data Protection Act (DPA). By using the App, you
                consent to data collection and processing as outlined in our
                Privacy Policy.
              </p>
            </div>
            <div>
              <h2 className="text-md sm:text-xl font-bold text-gray-900 mb-4">
                6. Intellectual Property
              </h2>
              <p className="text-sm sm:text-base leading-relaxed">
                All App content, excluding user-submitted materials, is owned by
                Siku Zangu Health Technologies Ltd. You may not copy or
                reproduce content without permission.
              </p>
            </div>
            <div>
              <h2 className="text-md sm:text-xl font-bold text-gray-900 mb-4">
                7. Disclaimers
              </h2>
              <p className="text-sm sm:text-base leading-relaxed mb-4">
                We provide the App 'as is'. We do not guarantee uninterrupted or
                error-free service. Use the App at your own risk.
              </p>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mt-4 mb-2">
                7.1 No Medical Advice
              </h3>
              <p className="text-sm sm:text-base leading-relaxed mb-4">
                The App provides general health, menstrual, and reproductive
                wellness information for educational purposes only. It is not a
                medical device and is not intended to diagnose, treat, cure, or
                prevent any disease or condition. Information in the App, including
                articles, insights, and predictions, is not a substitute for
                professional medical advice, diagnosis, or treatment. Always seek
                the advice of a qualified healthcare provider with any questions
                you may have regarding a medical condition. Never disregard
                professional medical advice or delay in seeking it because of
                content in the App.
              </p>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mt-4 mb-2">
                7.2 Sources & Citations for Educational Content
              </h3>
              <p className="text-sm sm:text-base leading-relaxed mb-4">
                Articles containing medical or health-related recommendations
                include references to peer-reviewed publications, public health
                authorities (e.g., WHO, Ministry of Health publications), and
                other credible sources. Citations are displayed at the end of
                each article. Where citations are missing, the content should be
                treated as general educational material only.
              </p>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mt-4 mb-2">
                7.3 Cycle, Period & Fertility Predictions
              </h3>
              <p className="text-sm sm:text-base leading-relaxed mb-2">
                Period, ovulation, and fertile-window predictions shown in the
                App are statistical estimates based on the cycle history you log.
                They are <strong>not</strong> a contraceptive method, a fertility
                treatment, or a medical diagnosis, and they should not be used as
                the sole basis for family-planning decisions. Prediction
                methodology is informed by the following peer-reviewed research:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base leading-relaxed mb-4">
                <li>
                  Symul L, Wac K, Hillard P, et al. Assessment of menstrual
                  health status and evolution through mobile apps for fertility
                  awareness. <em>npj Digit. Med.</em> 2, 64 (2019).{' '}
                  <a
                    href="https://doi.org/10.1038/s41746-019-0139-4"
                    className="text-primary hover:underline break-all"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    https://doi.org/10.1038/s41746-019-0139-4
                  </a>
                </li>
                <li>
                  Bull JR, Rowland SP, Scherwitzl EB, et al. Real-world menstrual
                  cycle characteristics of more than 600,000 menstrual cycles.{' '}
                  <em>npj Digit. Med.</em> 2, 83 (2019).{' '}
                  <a
                    href="https://doi.org/10.1038/s41746-019-0152-7"
                    className="text-primary hover:underline break-all"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    https://doi.org/10.1038/s41746-019-0152-7
                  </a>
                </li>
                <li>
                  Faust L, Bradley D, Landau E, Noddin K, Farland LV, Baron A,
                  Wolfberg A. Findings from a mobile application-based cohort are
                  consistent with established knowledge of the menstrual cycle,
                  fertile window, and conception. <em>Fertil Steril.</em> 2019
                  Sep;112(3):450-457.e3.{' '}
                  <a
                    href="https://doi.org/10.1016/j.fertnstert.2019.05.008"
                    className="text-primary hover:underline break-all"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    https://doi.org/10.1016/j.fertnstert.2019.05.008
                  </a>
                </li>
              </ul>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mt-4 mb-2">
                7.4 Emergencies
              </h3>
              <p className="text-sm sm:text-base leading-relaxed">
                If you believe you are experiencing a medical emergency, contact
                your local emergency services or visit the nearest healthcare
                facility immediately. Do not rely on the App for emergency care.
              </p>
            </div>
            <div>
              <h2 className="text-md sm:text-xl font-bold text-gray-900 mb-4">
                8. Limitation of Liability
              </h2>
              <p className="text-sm sm:text-base leading-relaxed">
                We are not liable for indirect, incidental, or consequential
                damages. Liability is limited to the amount you have paid us in
                the past 6 months, if any.
              </p>
            </div>
            <div>
              <h2 className="text-md sm:text-xl font-bold text-gray-900 mb-4">
                9. Indemnification
              </h2>
              <p className="text-sm sm:text-base leading-relaxed">
                You agree to indemnify us against any claims, losses, or
                liabilities arising from your use of the App or your submitted
                content.
              </p>
            </div>
            <div>
              <h2 className="text-md sm:text-xl font-bold text-gray-900 mb-4">
                10. Termination
              </h2>
              <p className="text-sm sm:text-base leading-relaxed">
                We reserve the right to suspend or terminate your access if you
                violate these Terms. You may stop using the App at any time.
              </p>
            </div>
            <div>
              <h2 className="text-md sm:text-xl font-bold text-gray-900 mb-4">
                11. Governing Law
              </h2>
              <p className="text-sm sm:text-base leading-relaxed">
                These Terms are governed by the laws of Tanzania. Disputes shall
                be resolved in the competent courts in the country.
              </p>
            </div>
            <div>
              <h2 className="text-md sm:text-xl font-bold text-gray-900 mb-4">
                12. Modifications
              </h2>
              <p className="text-sm sm:text-base leading-relaxed">
                We may revise these Terms. You will be notified of significant
                changes. Continued use of the App after changes implies
                acceptance.
              </p>
            </div>
            <div>
              <h2 className="text-md sm:text-xl font-bold text-gray-900 mb-4">
                13. Contact Information
              </h2>
              <p className="text-sm sm:text-base leading-relaxed mb-4">
                For any questions, reach us at:
              </p>
              <div className="space-y-2 text-sm sm:text-base">
                <p className="font-semibold text-gray-900">
                  Siku Zangu Health Technologies Ltd
                </p>
                <p>P.O. BOX 708 Arusha, Tanzania</p>
                <p>
                  Email:{' '}
                  <a
                    href="mailto:info@sikuzangu.com"
                    className="text-primary hover:underline"
                  >
                    info@sikuzangu.com
                  </a>
                </p>
              </div>
            </div>
            <div className="text-center pt-6 sm:pt-8">
              <p className="text-xs sm:text-sm text-gray-500">
                By using Siku Zangu, you acknowledge that you have read,
                understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </section>
      <WebsiteFooter logo={logo} />
    </div>
  );
}
