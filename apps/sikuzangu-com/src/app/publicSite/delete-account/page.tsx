import Image from 'next/image';
import signinImage from '../../../../public/images/signup.png';
import profileSettingsImage from '../../../../public/images/profile.png';
import confirmDeleteImage from '../../../../public/images/delete.png';
import { WebsiteNav,WebsiteFooter } from '@siku-zangu/react';
import logoPNG from '../../../../public/images/logo.png';

export default function DeleteAccountPage() {
  return (
    <div className="bg-primary-base">
      <WebsiteNav logo={logoPNG} />
      <section className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              <span className="text-primary">How to Delete Your Account</span>
            </h1>
            <p className="text-base sm:text-lg text-neutral-dark-text max-w-2xl mx-auto">
              Follow these simple steps to permanently delete your Siku Zangu account
            </p>
          </div>
          <div className="mb-12 sm:mb-16">
            <div className=" rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6">
              <h2 className="text-xl sm:text-2xl font-medium text-neutral-dark-text mb-2 text-center">
                Step 1: Open and Sign in to the Siku Zangu App
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="flex justify-center">
                <div className="relative w-full max-w-[280px] sm:max-w-[320px]">
                  <div className="bg-gradient-to-br from-pink-100 to-pink-50 rounded-3xl p-6 shadow-xl">
                    <div className="bg-white rounded-2xl shadow-lg aspect-[9/16] flex items-center justify-center overflow-hidden">
                      <Image
                        src={signinImage}
                        alt="Sign In Screen"
                        width={280}
                        height={560}
                        className="rounded-2xl w-full h-auto"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-md sm:text-xl font-medium text-neutral-dark-text">
                  How to sign in to your account:
                </h3>
                <ol className="space-y-3 text-neutral-placeholder">
                  <li className="flex gap-3">
                    <span className="font-semibold text-primary flex-shrink-0">1.</span>
                    <span>Open the Siku Zangu app from your device's home screen</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-primary flex-shrink-0">2.</span>
                    <span>If you're not a member, tap the "Create Member" text</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-primary flex-shrink-0">3.</span>
                    <span>Enter your Pin in the "Pin" field</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-primary flex-shrink-0">4.</span>
                    <span>Tap the Login button to access your account</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-primary flex-shrink-0">5.</span>
                    <span>If you forgot your PIN, tap the "Forgot PIN?" link below the PIN field</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
          <div className="mb-12 sm:mb-16">
            <div className=" rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6">
              <h2 className="text-xl sm:text-2xl font-medium text-neutral-dark-text mb-2 text-center">
                Step 2: Navigate to Your Profile Settings
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-4 order-2 lg:order-1">
                <h3 className="text-md sm:text-xl font-medium text-neutral-dark-text">
                  How to access your profile settings:
                </h3>
                <ol className="space-y-3 text-neutral-placeholder">
                  <li className="flex gap-3">
                    <span className="font-semibold text-primary flex-shrink-0">1.</span>
                    <span>After signing in, locate the "Profile" icon (the main app page shows your cycle)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-primary flex-shrink-0">2.</span>
                    <span>Look for your profile icon in the bottom right of your page</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-primary flex-shrink-0">3.</span>
                    <span>Tap on your profile to access your personal information</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-primary flex-shrink-0">4.</span>
                    <span>Select the "Delete Account" option</span>
                  </li>
                </ol>
              </div>
              <div className="flex justify-center order-1 lg:order-2">
                <div className="relative w-full max-w-[280px] sm:max-w-[320px]">
                  <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-3xl p-6 shadow-xl">
                    <div className="bg-white rounded-2xl shadow-lg aspect-[9/16] flex items-center justify-center overflow-hidden">
                      <Image
                        src={profileSettingsImage}
                        alt="Profile Settings Screen"
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
          <div className="mb-12 sm:mb-16">
            <div className=" rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6">
              <h2 className="text-xl sm:text-2xl font-medium text-neutral-dark-text mb-2 text-center">
                Step 3: Confirm Account Deletion
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="flex justify-center">
                <div className="relative w-full max-w-[280px] sm:max-w-[320px]">
                  <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-3xl p-6 shadow-xl">
                    <div className="bg-white rounded-2xl shadow-lg aspect-[9/16] flex items-center justify-center overflow-hidden">
                      <Image
                        src={confirmDeleteImage}
                        alt="Confirmation Screen"
                        width={280}
                        height={560}
                        className="rounded-2xl w-full h-auto"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-md sm:text-xl font-medium text-neutral-dark-text">
                  How to confirm account deletion:
                </h3>
                <ol className="space-y-3 text-neutral-placeholder">
                  <li className="flex gap-3">
                    <span className="font-semibold text-primary flex-shrink-0">1.</span>
                    <span>A confirmation page will appear with options for why you're deleting your account</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-primary flex-shrink-0">2.</span>
                    <span>Read the warning carefully - this action cannot be undone</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-primary flex-shrink-0">3.</span>
                    <span>If you're sure, tap the "Yes, Delete My Account" button</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-primary flex-shrink-0">4.</span>
                    <span>To cancel, tap "Cancel" or close the dialog</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
          <div className="bg-blue-100 border-l-4 border-blue-600 rounded-lg p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-bold text-blue-900 mb-3">
              Important Notice
            </h3>
            <p className="text-sm sm:text-base text-blue-800 leading-relaxed">
              Deleting your account will permanently remove all your data, including tracking information, logged symptoms, and cycle data. This action cannot be undone. If you're experiencing any issues with the app, please consider contacting our support team first at{' '}
              <a href="mailto:support@sikuzangu.org" className="underline font-semibold hover:text-blue-600">
                support@sikuzangu.org
              </a>
            </p>
          </div>
        </div>
      </section>
      <WebsiteFooter logo={logoPNG} />
    </div>
  );
}