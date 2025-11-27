import logo from '../../../public/images/logo.png';
import { WebsiteNav, WebsiteFooter } from '@siku-zangu/react';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-primary-base">
      <WebsiteNav logo={logo} />
      <section className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              <span className="text-primary">Privacy Policy</span>
            </h1>
            <p className="text-sm sm:text-base text-neutral-placeholder">
              Effective Date: 30 August 2025
            </p>
          </div>
          <div className="space-y-6 sm:space-y-8 text-neutral-dark-text">
            <div className="bg-pink-50 rounded-xl sm:rounded-2xl p-6 sm:p-8">
              <p className="text-sm sm:text-base leading-relaxed mb-4">
                Welcome to Siku Zangu, your trusted menstrual health companion.
                We take your privacy seriously and are committed to protecting
                your personal data in line with the Tanzanian PDPA (2023),
                Kenya's DPA (2019), and global best practices such as GDPR.
              </p>
              <p className="text-sm sm:text-base leading-relaxed mb-4">
                This Privacy Policy explains how we collect, use, share, and
                safeguard your data when you use the Siku Zangu mobile app
                ("App") and related services.
              </p>
              <p className="text-sm sm:text-base leading-relaxed">
                By downloading, accessing, or using the App, you acknowledge
                that you have read and understood and agree to this policy. This
                Policy should be read together with our Terms of Service.
              </p>
            </div>
            <div>
              <h2 className="text-md sm:text-xl font-bold text-gray-900 mb-4">
                2. Data Controller Information
              </h2>
              <p className="text-sm sm:text-base leading-relaxed mb-3">
                The entity responsible for the processing of your personal data
                (the Data Controller) is:
              </p>
              <p className="text-sm sm:text-base leading-relaxed mb-3">
                <span className="font-semibold">
                  Siku Zangu Health Technologies Ltd.
                </span>
                <br />
                P.O. BOX 708
                <br />
                Arusha, Tanzania
              </p>
              <p className="text-sm sm:text-base leading-relaxed">
                For any privacy-related questions or requests, please contact us
                at:{' '}
                <a
                  href="mailto:info@sikuzangu.com"
                  className="text-primary hover:underline"
                >
                  info@sikuzangu.com
                </a>
              </p>
            </div>
            <div>
              <h2 className="text-md sm:text-xl font-bold text-gray-900 mb-4">
                3. Information We Collect & Why
              </h2>
              <p className="text-sm sm:text-base leading-relaxed mb-4">
                We only collect data that is necessary for the app to function
                and help you better understand your menstrual health.
              </p>
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-3">
                Information You Provide
              </h3>
              <ul className="list-disc list-inside space-y-2 text-sm sm:text-base leading-relaxed mb-4">
                <li>
                  <span className="font-semibold">Account Info:</span> Name,
                  email, password
                </li>
                <li>
                  <span className="font-semibold">Cycle Logs:</span> Period
                  dates, symptoms, flow levels, moods
                </li>
                <li>
                  <span className="font-semibold">Optional Profile Info:</span>{' '}
                  Location, languages, photos (only if uploaded voluntarily)
                </li>
                <li>
                  <span className="font-semibold">Messages:</span> If you
                  contact us directly
                </li>
              </ul>
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-3">
                Information Collected Automatically
              </h3>
              <ul className="list-disc list-inside space-y-2 text-sm sm:text-base leading-relaxed mb-4">
                <li>
                  <span className="font-semibold">Usage Data:</span> We collect
                  information about how you interact with the App, such as
                  features used, content viewed, actions taken, time, frequency,
                  and duration of your activities.
                </li>
                <li>
                  <span className="font-semibold">Device Data:</span> We collect
                  information about the device you use to access the App, such
                  as your IP address, device type, operating system, app
                  version, unique device identifiers, and crash data.
                </li>
                <li>
                  <span className="font-semibold">Location Data:</span> We may
                  request permission to access your device's precise geolocation
                  data when you use certain features, such as tagging a post
                  with a precise location. Collection of this data is based on
                  your consent, which you can manage through your device
                  settings or app permissions.
                </li>
              </ul>
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-3">
                Information We Do Not Collect
              </h3>
              <ul className="list-disc list-inside space-y-2 text-sm sm:text-base leading-relaxed">
                <li>
                  <span className="font-semibold">
                    Sensitive Personal Data:
                  </span>{' '}
                  We do not intentionally collect or request "Sensitive Personal
                  Data" as defined under the DPA (including data revealing race,
                  health status, ethnic origin, political opinions, religious
                  beliefs, biometric data, sexual orientation, etc.). Please do
                  not upload such information to the App.
                </li>
                <li>
                  <span className="font-semibold">Payment Information:</span>{' '}
                  This version of the App does not involve payments (yet), and
                  we do not collect any financial or payment card information.
                </li>
                <li>
                  <span className="font-semibold">
                    Data from minors (under 18):
                  </span>{' '}
                  The app is not intended for children.
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-md sm:text-xl font-bold text-gray-900 mb-4">
                4. How We Use Your Information (Purpose and Legal Basis)
              </h2>
              <ul className="space-y-3 text-sm sm:text-base leading-relaxed">
                <li>
                  <span className="font-semibold">
                    To Provide and Manage the Service:
                  </span>{' '}
                  (Legal Basis: Performance of Contract)
                </li>
                <li>
                  <span className="font-semibold">
                    To Communicate with You:
                  </span>{' '}
                  (Legal Basis: Performance of Contract; Legitimate Interest)
                </li>
                <li>
                  <span className="font-semibold">
                    To Improve and Personalise the Service:
                  </span>{' '}
                  (Legal Basis: Legitimate Interest; Consent for non-essential
                  analytics or personalization features)
                </li>
                <li>
                  <span className="font-semibold">
                    For Safety and Security:
                  </span>{' '}
                  (Legal Basis: Legitimate Interest; Legal Obligation)
                </li>
                <li>
                  <span className="font-semibold">
                    To Comply with Legal Obligations:
                  </span>{' '}
                  (Legal Basis: Legal Obligation)
                </li>
                <li>
                  <span className="font-semibold">With Your Consent:</span>{' '}
                  (Legal Basis: Consent)
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-md sm:text-xl font-bold text-gray-900 mb-4">
                5. How We Share Your Information
              </h2>
              <p className="text-sm sm:text-base leading-relaxed mb-3">
                We do not sell your personal data. We may share your information
                only in the following circumstances:
              </p>
              <ul className="space-y-2 text-sm sm:text-base leading-relaxed">
                <li>
                  <span className="font-semibold">
                    With Third-Party Service Providers:
                  </span>{' '}
                  Google Cloud, Paystack
                </li>
                <li>
                  <span className="font-semibold">For Legal Reasons:</span>{' '}
                  Disclosure to comply with law, enforce terms, protect rights
                </li>
                <li>
                  <span className="font-semibold">Business Transfers:</span> In
                  the event of a business transaction, we will notify you
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-md sm:text-xl font-bold text-gray-900 mb-4">
                6. International Data Transfers
              </h2>
              <p className="text-sm sm:text-base leading-relaxed mb-3">
                Your information may be transferred to, stored, and processed in
                countries other than Kenya. Safeguards include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm sm:text-base leading-relaxed">
                <li>Transfers to countries deemed adequate by the ODPC</li>
                <li>Standard Contractual Clauses</li>
                <li>Explicit consent</li>
              </ul>
            </div>
            <div>
              <h2 className="text-md sm:text-xl font-bold text-gray-900 mb-4">
                7. Data Security
              </h2>
              <p className="text-sm sm:text-base leading-relaxed">
                We implement reasonable security measures such as encryption,
                access controls, and secure servers to protect your data.
                However, no method is 100% secure.
              </p>
            </div>
            <div>
              <h2 className="text-md sm:text-xl font-bold text-gray-900 mb-4">
                8. Data Retention
              </h2>
              <p className="text-sm sm:text-base leading-relaxed">
                We retain your data as long as necessary. If you delete your
                account, we will delete or anonymize your data unless legally
                required to retain it.
              </p>
            </div>
            <div>
              <h2 className="text-md sm:text-xl font-bold text-gray-900 mb-4">
                9. Your Data Protection Rights
              </h2>
              <ul className="space-y-2 text-sm sm:text-base leading-relaxed mb-3">
                <li>• Right to Access</li>
                <li>• Right to Rectification</li>
                <li>• Right to Erasure</li>
                <li>• Right to Restrict Processing</li>
                <li>• Right to Object to Processing</li>
                <li>• Right to Data Portability</li>
                <li>• Right to Withdraw Consent</li>
              </ul>
              <p className="text-sm sm:text-base leading-relaxed">
                Contact us or use the App settings to exercise your rights. We
                will respond within legal timeframes.
              </p>
            </div>
            <div>
              <h2 className="text-md sm:text-xl font-bold text-gray-900 mb-4">
                10. Children's Privacy
              </h2>
              <p className="text-sm sm:text-base leading-relaxed">
                We do not knowingly collect data from individuals under 18. If
                we do, we will delete it promptly.
              </p>
            </div>
            <div>
              <h2 className="text-md sm:text-xl font-bold text-gray-900 mb-4">
                11. Cookies and Tracking Technologies
              </h2>
              <p className="text-sm sm:text-base leading-relaxed">
                We may use cookies, SDKs (like PostHog, Firebase Analytics), or
                similar technologies. You may control some of these via device
                settings.
              </p>
            </div>
            <div>
              <h2 className="text-md sm:text-xl font-bold text-gray-900 mb-4">
                12. Changes to This Privacy Policy
              </h2>
              <p className="text-sm sm:text-base leading-relaxed">
                We may update this policy. We'll notify you via the app or
                email. Continued use means acceptance.
              </p>
            </div>
            <div>
              <h2 className="text-md sm:text-xl font-bold text-gray-900 mb-4">
                13. Contact Us
              </h2>
              <p className="text-sm sm:text-base leading-relaxed mb-4">
                If you have any questions, concerns, or requests regarding this
                Privacy Policy or our data practices, please contact us at:
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
                understood, and agree to be bound by this Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </section>
      <WebsiteFooter logo={logo} />
    </div>
  );
}
