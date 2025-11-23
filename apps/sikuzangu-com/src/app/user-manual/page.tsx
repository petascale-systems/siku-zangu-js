import Image from 'next/image';
import homeImage from '../../../public/images/user-manual/Home.jpeg';
import profileImage from '../../../public/images/user-manual/profile.jpeg';
import calendarImage from '../../../public/images/user-manual/calender.jpeg';
import insightsImage from '../../../public/images/user-manual/articles.jpeg';
import logEntryImage from '../../../public/images/user-manual/log enrty.jpeg';
import notificationsImage from '../../../public/images/user-manual/notifications.jpeg';
import changePinImage from '../../../public/images/user-manual/change pin.jpeg';
import signinImage from '../../../public/images/user-manual/login.jpeg';
import registerImage from '../../../public/images/user-manual/register.jpeg';
import languageImage from '../../../public/images/user-manual/language.jpeg';
import deleteImage from '../../../public/images/user-manual/delete.jpeg';
import setupProfileImage from '../../../public/images/user-manual/use names.jpeg';
import birthDateImage from '../../../public/images/user-manual/user dob.jpeg';
import lastPeriodImage from '../../../public/images/user-manual/userfday.jpeg';
import periodLengthImage from '../../../public/images/user-manual/user lnghtWhatsApp Image 2025-11-23 at 3.18.18 PM.jpeg';
import cycleLengthImage from '../../../public/images/user-manual/cycle lenght.jpeg';
import symptomsImage from '../../../public/images/user-manual/symptoms.jpeg';
import medicationImage from '../../../public/images/user-manual/med.jpeg';
import logo from '../../../public/images/logo.png';
import {WebsiteNav, WebsiteFooter} from '@siku-zangu/react'

export default function UserManualPage() {
    return (
        <div className="bg-primary-base">
            <WebsiteNav logo={logo}/>
            <section className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8 sm:mb-12">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                            <span className="text-primary">User Manual</span>
                        </h1>
                        <p className="text-base sm:text-lg text-neutral-dark-text max-w-2xl mx-auto">
                            Your complete guide to tracking your menstrual cycle with Siku Zangu
                        </p>
                    </div>
                    <div className="mb-12 sm:mb-16">
                        <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6">
                            <h2 className="text-xl sm:text-2xl font-medium text-neutral-dark-text mb-2 text-center">
                                Step 1: Choose Your Language
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <div className="flex justify-center">
                                <div className="relative w-full max-w-[280px] sm:max-w-[320px]">
                                    <div className="bg-gradient-to-br from-pink-100 to-pink-50 rounded-3xl p-6 shadow-xl">
                                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                            <Image
                                                src={languageImage}
                                                alt="Language Selection Screen"
                                                width={280}
                                                height={560}
                                                className="rounded-2xl w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-md sm:text-xl font-medium text-neutral-dark-text">
                                    How to select your language:
                                </h3>
                                <ol className="space-y-3 text-neutral-placeholder">
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">1.</span>
                                        <span>When you first open the app, you'll see the language selection screen</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">2.</span>
                                        <span>Choose between English or Kiswahili</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">3.</span>
                                        <span>Tap "Continue in English" or your preferred language</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">4.</span>
                                        <span>You can change this later in your profile settings</span>
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                    <div className="mb-12 sm:mb-16">
                        <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6">
                            <h2 className="text-xl sm:text-2xl font-medium text-neutral-dark-text mb-2 text-center">
                                Step 2: Create Your Account
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <div className="space-y-4 order-2 lg:order-1">
                                <h3 className="text-md sm:text-xl font-medium text-neutral-dark-text">
                                    How to register:
                                </h3>
                                <ol className="space-y-3 text-neutral-placeholder">
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">1.</span>
                                        <span>Enter your phone number starting with +255</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">2.</span>
                                        <span>Create a secure 4-digit PIN</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">3.</span>
                                        <span>Remember your PIN - you'll need it to log in</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">4.</span>
                                        <span>Tap "Register" to create your account</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">5.</span>
                                        <span>If you already have an account, tap "Log in" at the bottom</span>
                                    </li>
                                </ol>
                            </div>
                            <div className="flex justify-center order-1 lg:order-2">
                                <div className="relative w-full max-w-[280px] sm:max-w-[320px]">
                                    <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-3xl p-6 shadow-xl">
                                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                            <Image
                                                src={registerImage}
                                                alt="Registration Screen"
                                                width={280}
                                                height={560}
                                                className="rounded-2xl w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mb-12 sm:mb-16">
                        <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6">
                            <h2 className="text-xl sm:text-2xl font-medium text-neutral-dark-text mb-2 text-center">
                                Step 3: Sign In to Your Account
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <div className="flex justify-center">
                                <div className="relative w-full max-w-[280px] sm:max-w-[320px]">
                                    <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-3xl p-6 shadow-xl">
                                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                            <Image
                                                src={signinImage}
                                                alt="Sign In Screen"
                                                width={280}
                                                height={560}
                                                className="rounded-2xl w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-md sm:text-xl font-medium text-neutral-dark-text">
                                    How to sign in:
                                </h3>
                                <ol className="space-y-3 text-neutral-placeholder">
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">1.</span>
                                        <span>Open the Siku Zangu app from your device's home screen</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">2.</span>
                                        <span>Enter your registered phone number</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">3.</span>
                                        <span>Enter your 4-digit PIN in the "PIN" field</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">4.</span>
                                        <span>Tap the "Login" button to access your account</span>
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
                        <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6">
                            <h2 className="text-xl sm:text-2xl font-medium text-neutral-dark-text mb-2 text-center">
                                Step 4: Set Up Your Profile
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <div className="space-y-4 order-2 lg:order-1">
                                <h3 className="text-md sm:text-xl font-medium text-neutral-dark-text">
                                    How to complete your profile:
                                </h3>
                                <ol className="space-y-3 text-neutral-placeholder">
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">1.</span>
                                        <span>Enter your first name (required)</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">2.</span>
                                        <span>Add your last name (optional)</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">3.</span>
                                        <span>Review the Privacy Policy</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">4.</span>
                                        <span>Your data is never shared without consent</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">5.</span>
                                        <span>Tap "Next" to continue</span>
                                    </li>
                                </ol>
                            </div>
                            <div className="flex justify-center order-1 lg:order-2">
                                <div className="relative w-full max-w-[280px] sm:max-w-[320px]">
                                    <div className="bg-gradient-to-br from-amber-100 to-amber-50 rounded-3xl p-6 shadow-xl">
                                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                            <Image
                                                src={setupProfileImage}
                                                alt="Setup Profile Screen"
                                                width={280}
                                                height={560}
                                                className="rounded-2xl w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Birth Date Section */}
                    <div className="mb-12 sm:mb-16">
                        <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6">
                            <h2 className="text-xl sm:text-2xl font-medium text-neutral-dark-text mb-2 text-center">
                                Step 5: Enter Your Birth Date
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <div className="flex justify-center">
                                <div className="relative w-full max-w-[280px] sm:max-w-[320px]">
                                    <div className="bg-gradient-to-br from-lime-100 to-lime-50 rounded-3xl p-6 shadow-xl">
                                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                            <Image
                                                src={birthDateImage}
                                                alt="Birth Date Screen"
                                                width={280}
                                                height={560}
                                                className="rounded-2xl w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-md sm:text-xl font-medium text-neutral-dark-text">
                                    How to enter your birth date:
                                </h3>
                                <ol className="space-y-3 text-neutral-placeholder">
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">1.</span>
                                        <span>Use the date picker to select your birth day</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">2.</span>
                                        <span>Choose your birth month</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">3.</span>
                                        <span>Select your birth year</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">4.</span>
                                        <span>This helps provide age-appropriate health information</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">5.</span>
                                        <span>Review Terms and Conditions, then tap "Next"</span>
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* Last Period Section */}
                    <div className="mb-12 sm:mb-16">
                        <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6">
                            <h2 className="text-xl sm:text-2xl font-medium text-neutral-dark-text mb-2 text-center">
                                Step 6: Enter Your Last Period Date
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <div className="space-y-4 order-2 lg:order-1">
                                <h3 className="text-md sm:text-xl font-medium text-neutral-dark-text">
                                    How to enter your last period:
                                </h3>
                                <ol className="space-y-3 text-neutral-placeholder">
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">1.</span>
                                        <span>Select the first day of your last period</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">2.</span>
                                        <span>Use the date picker or tap "Yesterday" for quick selection</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">3.</span>
                                        <span>If unsure, provide your best estimate</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">4.</span>
                                        <span>This helps predict your next period</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">5.</span>
                                        <span>Tap "Next" to continue</span>
                                    </li>
                                </ol>
                            </div>
                            <div className="flex justify-center order-1 lg:order-2">
                                <div className="relative w-full max-w-[280px] sm:max-w-[320px]">
                                    <div className="bg-gradient-to-br from-sky-100 to-sky-50 rounded-3xl p-6 shadow-xl">
                                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                            <Image
                                                src={lastPeriodImage}
                                                alt="Last Period Screen"
                                                width={280}
                                                height={560}
                                                className="rounded-2xl w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Period Length Section */}
                    <div className="mb-12 sm:mb-16">
                        <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6">
                            <h2 className="text-xl sm:text-2xl font-medium text-neutral-dark-text mb-2 text-center">
                                Step 7: Set Your Period Duration
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <div className="flex justify-center">
                                <div className="relative w-full max-w-[280px] sm:max-w-[320px]">
                                    <div className="bg-gradient-to-br from-fuchsia-100 to-fuchsia-50 rounded-3xl p-6 shadow-xl">
                                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                            <Image
                                                src={periodLengthImage}
                                                alt="Period Length Screen"
                                                width={280}
                                                height={560}
                                                className="rounded-2xl w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-md sm:text-xl font-medium text-neutral-dark-text">
                                    How to set period duration:
                                </h3>
                                <ol className="space-y-3 text-neutral-placeholder">
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">1.</span>
                                        <span>Select how many days your period typically lasts</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">2.</span>
                                        <span>Choose from 3 to 7+ days (most common is 4-5 days)</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">3.</span>
                                        <span>Include all days with any flow, including spotting</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">4.</span>
                                        <span>You can update this later in your profile</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">5.</span>
                                        <span>Tap "Next" to continue</span>
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* Cycle Length Section */}
                    <div className="mb-12 sm:mb-16">
                        <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6">
                            <h2 className="text-xl sm:text-2xl font-medium text-neutral-dark-text mb-2 text-center">
                                Step 8: Set Your Cycle Length
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <div className="space-y-4 order-2 lg:order-1">
                                <h3 className="text-md sm:text-xl font-medium text-neutral-dark-text">
                                    How to set cycle length:
                                </h3>
                                <ol className="space-y-3 text-neutral-placeholder">
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">1.</span>
                                        <span>A cycle starts on day 1 of your period</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">2.</span>
                                        <span>It ends the day before your next period starts</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">3.</span>
                                        <span>Select from 26-30+ days (28 is average)</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">4.</span>
                                        <span>The app shows your fertile window based on this</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">5.</span>
                                        <span>Tap "Next" to continue</span>
                                    </li>
                                </ol>
                            </div>
                            <div className="flex justify-center order-1 lg:order-2">
                                <div className="relative w-full max-w-[280px] sm:max-w-[320px]">
                                    <div className="bg-gradient-to-br from-violet-100 to-violet-50 rounded-3xl p-6 shadow-xl">
                                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                            <Image
                                                src={cycleLengthImage}
                                                alt="Cycle Length Screen"
                                                width={280}
                                                height={560}
                                                className="rounded-2xl w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Symptoms Tracking Section */}
                    <div className="mb-12 sm:mb-16">
                        <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6">
                            <h2 className="text-xl sm:text-2xl font-medium text-neutral-dark-text mb-2 text-center">
                                Step 9: Track Your Symptoms and Mood
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <div className="flex justify-center">
                                <div className="relative w-full max-w-[280px] sm:max-w-[320px]">
                                    <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-3xl p-6 shadow-xl">
                                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                            <Image
                                                src={symptomsImage}
                                                alt="Symptoms Tracking Screen"
                                                width={280}
                                                height={560}
                                                className="rounded-2xl w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-md sm:text-xl font-medium text-neutral-dark-text">
                                    How to track symptoms and moods:
                                </h3>
                                <ol className="space-y-3 text-neutral-placeholder">
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">1.</span>
                                        <span>Select your current symptoms: Cramps, Fatigue, Bloating, Tender breasts, Backache, Headache</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">2.</span>
                                        <span>Choose your mood: Happy, Sad, Tired, Angry, In Love, Calm, Anxious</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">3.</span>
                                        <span>You can select multiple symptoms</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">4.</span>
                                        <span>Understanding patterns helps manage your cycle better</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">5.</span>
                                        <span>Continue to complete setup</span>
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* Medication Section */}
                    <div className="mb-12 sm:mb-16">
                        <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6">
                            <h2 className="text-xl sm:text-2xl font-medium text-neutral-dark-text mb-2 text-center">
                                Step 10: Set Up Medication Tracking
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <div className="space-y-4 order-2 lg:order-1">
                                <h3 className="text-md sm:text-xl font-medium text-neutral-dark-text">
                                    How to track medications:
                                </h3>
                                <ol className="space-y-3 text-neutral-placeholder">
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">1.</span>
                                        <span>Select medication types you're taking</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">2.</span>
                                        <span>Options include: Pain Relief, Herbal Supplement, Hormone Therapy, Birth Control</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">3.</span>
                                        <span>This helps track effectiveness and avoid missed doses</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">4.</span>
                                        <span>You can skip this step if not taking any medications</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">5.</span>
                                        <span>Tap "Complete Setup" to finish onboarding</span>
                                    </li>
                                </ol>
                            </div>
                            <div className="flex justify-center order-1 lg:order-2">
                                <div className="relative w-full max-w-[280px] sm:max-w-[320px]">
                                    <div className="bg-gradient-to-br from-red-100 to-pink-50 rounded-3xl p-6 shadow-xl">
                                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                            <Image
                                                src={medicationImage}
                                                alt="Medication Tracking Screen"
                                                width={280}
                                                height={560}
                                                className="rounded-2xl w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mb-12 sm:mb-16">
                        <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6">
                            <h2 className="text-xl sm:text-2xl font-medium text-neutral-dark-text mb-2 text-center">
                                Step 11: View Your Cycle Overview
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <div className="space-y-4 order-2 lg:order-1">
                                <h3 className="text-md sm:text-xl font-medium text-neutral-dark-text">
                                    Understanding your home screen:
                                </h3>
                                <ol className="space-y-3 text-neutral-placeholder">
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">1.</span>
                                        <span>View days until your next period</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">2.</span>
                                        <span>Check your ovulation status (Coming/Active)</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">3.</span>
                                        <span>See your fertile window days</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">4.</span>
                                        <span>Read "Today's Insight" for personalized tips</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">5.</span>
                                        <span>Access "Today's Log" to record your daily information</span>
                                    </li>
                                </ol>
                            </div>
                            <div className="flex justify-center order-1 lg:order-2">
                                <div className="relative w-full max-w-[280px] sm:max-w-[320px]">
                                    <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-3xl p-6 shadow-xl">
                                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                            <Image
                                                src={homeImage}
                                                alt="Home Screen"
                                                width={280}
                                                height={560}
                                                className="rounded-2xl w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mb-12 sm:mb-16">
                        <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6">
                            <h2 className="text-xl sm:text-2xl font-medium text-neutral-dark-text mb-2 text-center">
                                Step 12: Use the Calendar
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <div className="flex justify-center">
                                <div className="relative w-full max-w-[280px] sm:max-w-[320px]">
                                    <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-3xl p-6 shadow-xl">
                                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                            <Image
                                                src={calendarImage}
                                                alt="Calendar Screen"
                                                width={280}
                                                height={560}
                                                className="rounded-2xl w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-md sm:text-xl font-medium text-neutral-dark-text">
                                    How to use the calendar:
                                </h3>
                                <ol className="space-y-3 text-neutral-placeholder">
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">1.</span>
                                        <span>Tap the calendar icon in the bottom navigation</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">2.</span>
                                        <span>Pink circles indicate period days</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">3.</span>
                                        <span>Purple circles show ovulation days</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">4.</span>
                                        <span>Teal circles mark your fertility window</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">5.</span>
                                        <span>View your cycle length and next period date at the bottom</span>
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                    <div className="mb-12 sm:mb-16">
                        <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6">
                            <h2 className="text-xl sm:text-2xl font-medium text-neutral-dark-text mb-2 text-center">
                                Step 13: Log Your Daily Information
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <div className="space-y-4 order-2 lg:order-1">
                                <h3 className="text-md sm:text-xl font-medium text-neutral-dark-text">
                                    How to log symptoms and moods:
                                </h3>
                                <ol className="space-y-3 text-neutral-placeholder">
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">1.</span>
                                        <span>Tap the plus (+) icon in the center of the bottom navigation</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">2.</span>
                                        <span>Select your symptoms: Cramps, Fatigue, Bloating, Tender Breasts, Backache, Headache</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">3.</span>
                                        <span>Choose your moods: Happy, Sad, Tired, Angry, In Love, Calm, Anxious</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">4.</span>
                                        <span>Update your cycle details if needed</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">5.</span>
                                        <span>Log daily for the most accurate insights</span>
                                    </li>
                                </ol>
                            </div>
                            <div className="flex justify-center order-1 lg:order-2">
                                <div className="relative w-full max-w-[280px] sm:max-w-[320px]">
                                    <div className="bg-gradient-to-br from-rose-100 to-rose-50 rounded-3xl p-6 shadow-xl">
                                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                            <Image
                                                src={logEntryImage}
                                                alt="Log Entry Screen"
                                                width={280}
                                                height={560}
                                                className="rounded-2xl w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mb-12 sm:mb-16">
                        <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6">
                            <h2 className="text-xl sm:text-2xl font-medium text-neutral-dark-text mb-2 text-center">
                                Step 14: Read Health Insights and Tips
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <div className="flex justify-center">
                                <div className="relative w-full max-w-[280px] sm:max-w-[320px]">
                                    <div className="bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-3xl p-6 shadow-xl">
                                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                            <Image
                                                src={insightsImage}
                                                alt="Insights Screen"
                                                width={280}
                                                height={560}
                                                className="rounded-2xl w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-md sm:text-xl font-medium text-neutral-dark-text">
                                    How to access insights:
                                </h3>
                                <ol className="space-y-3 text-neutral-placeholder">
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">1.</span>
                                        <span>Tap the lightbulb icon in the bottom navigation</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">2.</span>
                                        <span>Browse educational articles about menstrual health</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">3.</span>
                                        <span>Tap "Read More" to view full articles</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">4.</span>
                                        <span>Learn about cycle phases, symptoms, and hygiene</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">5.</span>
                                        <span>Check back regularly for new content</span>
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                    <div className="mb-12 sm:mb-16">
                        <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6">
                            <h2 className="text-xl sm:text-2xl font-medium text-neutral-dark-text mb-2 text-center">
                                Step 15: Manage Your Profile
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <div className="space-y-4 order-2 lg:order-1">
                                <h3 className="text-md sm:text-xl font-medium text-neutral-dark-text">
                                    How to access profile settings:
                                </h3>
                                <ol className="space-y-3 text-neutral-placeholder">
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">1.</span>
                                        <span>Tap the profile icon in the bottom right corner</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">2.</span>
                                        <span>Change language between English and Kiswahili</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">3.</span>
                                        <span>Manage your notification preferences</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">4.</span>
                                        <span>Change your PIN for security</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">5.</span>
                                        <span>Update cycle info or delete your account</span>
                                    </li>
                                </ol>
                            </div>
                            <div className="flex justify-center order-1 lg:order-2">
                                <div className="relative w-full max-w-[280px] sm:max-w-[320px]">
                                    <div className="bg-gradient-to-br from-teal-100 to-teal-50 rounded-3xl p-6 shadow-xl">
                                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                            <Image
                                                src={profileImage}
                                                alt="Profile Screen"
                                                width={280}
                                                height={560}
                                                className="rounded-2xl w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mb-12 sm:mb-16">
                        <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6">
                            <h2 className="text-xl sm:text-2xl font-medium text-neutral-dark-text mb-2 text-center">
                                Step 16: Set Up Notifications
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <div className="flex justify-center">
                                <div className="relative w-full max-w-[280px] sm:max-w-[320px]">
                                    <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-3xl p-6 shadow-xl">
                                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                            <Image
                                                src={notificationsImage}
                                                alt="Notifications Screen"
                                                width={280}
                                                height={560}
                                                className="rounded-2xl w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-md sm:text-xl font-medium text-neutral-dark-text">
                                    How to manage notifications:
                                </h3>
                                <ol className="space-y-3 text-neutral-placeholder">
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">1.</span>
                                        <span>Go to Profile and tap "Notifications"</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">2.</span>
                                        <span>Toggle "Period arrival reminders" to get notified before your period</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">3.</span>
                                        <span>Enable "Fertile days alerts" to know your most fertile days</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">4.</span>
                                        <span>Turn on "Medication reminders" to stay on track</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">5.</span>
                                        <span>Tap "Save Preferences" to confirm your choices</span>
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                    <div className="mb-12 sm:mb-16">
                        <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6">
                            <h2 className="text-xl sm:text-2xl font-medium text-neutral-dark-text mb-2 text-center">
                                Step 17: Delete Your Account (Optional)
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <div className="flex justify-center">
                                <div className="relative w-full max-w-[280px] sm:max-w-[320px]">
                                    <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-3xl p-6 shadow-xl">
                                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                            <Image
                                                src={deleteImage}
                                                alt="Delete Account Screen"
                                                width={280}
                                                height={560}
                                                className="rounded-2xl w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-md sm:text-xl font-medium text-neutral-dark-text">
                                    How to delete your account:
                                </h3>
                                <ol className="space-y-3 text-neutral-placeholder">
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">1.</span>
                                        <span>Go to Profile and tap "Delete Account"</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">2.</span>
                                        <span>A confirmation page will appear</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">3.</span>
                                        <span>Read the warning carefully - this action cannot be undone</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">4.</span>
                                        <span>Tap "Yes, Delete My Account" to confirm</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-primary flex-shrink-0">5.</span>
                                        <span>To cancel, tap "Cancel" or close the dialog</span>
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                        <div className="mb-12 sm:mb-16">
                            <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6">
                                <h2 className="text-xl sm:text-2xl font-medium text-neutral-dark-text mb-2 text-center">
                                    Step 18: Change Your PIN
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                                <div className="space-y-4 order-2 lg:order-1">
                                    <h3 className="text-md sm:text-xl font-medium text-neutral-dark-text">
                                        How to update your PIN:
                                    </h3>
                                    <ol className="space-y-3 text-neutral-placeholder">
                                        <li className="flex gap-3">
                                            <span className="font-semibold text-primary flex-shrink-0">1.</span>
                                            <span>Go to Profile and select "Change PIN"</span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="font-semibold text-primary flex-shrink-0">2.</span>
                                            <span>Enter your current 4-digit PIN</span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="font-semibold text-primary flex-shrink-0">3.</span>
                                            <span>Create a new 4-digit PIN</span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="font-semibold text-primary flex-shrink-0">4.</span>
                                            <span>Confirm your new PIN by entering it again</span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="font-semibold text-primary flex-shrink-0">5.</span>
                                            <span>Review security tips and tap "Save New PIN"</span>
                                        </li>
                                    </ol>
                                </div>
                                <div className="flex justify-center order-1 lg:order-2">
                                    <div className="relative w-full max-w-[280px] sm:max-w-[320px]">
                                        <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-3xl p-6 shadow-xl">
                                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                                <Image
                                                    src={changePinImage}
                                                    alt="Change PIN Screen"
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
                            <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6">
                                <h2 className="text-xl sm:text-2xl font-medium text-neutral-dark-text mb-2 text-center">
                                    Step 19: Delete Your Account (Optional)
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                                <div className="flex justify-center">
                                    <div className="relative w-full max-w-[280px] sm:max-w-[320px]">
                                        <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-3xl p-6 shadow-xl">
                                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                                <Image
                                                    src={deleteImage}
                                                    alt="Delete Account Screen"
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
                                        How to delete your account:
                                    </h3>
                                    <ol className="space-y-3 text-neutral-placeholder">
                                        <li className="flex gap-3">
                                            <span className="font-semibold text-primary flex-shrink-0">1.</span>
                                            <span>Go to Profile and tap "Delete Account"</span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="font-semibold text-primary flex-shrink-0">2.</span>
                                            <span>A confirmation page will appear</span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="font-semibold text-primary flex-shrink-0">3.</span>
                                            <span>Read the warning carefully - this action cannot be undone</span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="font-semibold text-primary flex-shrink-0">4.</span>
                                            <span>Tap "Yes, Delete My Account" to confirm</span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="font-semibold text-primary flex-shrink-0">5.</span>
                                            <span>To cancel, tap "Cancel" or close the dialog</span>
                                        </li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                        <div className="bg-purple-50 border-l-4 border-purple-600 rounded-lg p-6 sm:p-8">
                            <h3 className="text-xl sm:text-2xl font-bold text-purple-900 mb-3">
                                Pro Tips for Better Tracking
                            </h3>
                            <div className="text-sm sm:text-base text-purple-800 leading-relaxed">
                                <ul className="space-y-2">
                                    <li className="flex gap-3">
                                        <span className="font-semibold flex-shrink-0">•</span>
                                        <span><strong>Log Daily:</strong> Track your symptoms and mood every day for the most accurate insights and pattern recognition</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold flex-shrink-0">•</span>
                                        <span><strong>Update Cycle Info:</strong> Keep your cycle length and period duration updated as your body changes</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold flex-shrink-0">•</span>
                                        <span><strong>Enable Notifications:</strong> Turn on reminders to never miss logging or tracking important dates</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold flex-shrink-0">•</span>
                                        <span><strong>Read Insights:</strong> Check daily insights and educational content to better understand your cycle</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold flex-shrink-0">•</span>
                                        <span><strong>Secure Your PIN:</strong> Use a PIN you can remember but others cannot guess, and never share it with anyone</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
            </section>
            <WebsiteFooter logo={logo}/>
        </div>
);
}