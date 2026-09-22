import React, {useMemo, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {useRouter} from 'expo-router';
import { useForm, useStore, revalidateLogic } from '@tanstack/react-form';
import { z } from 'zod';
import {useUser} from '@siku-zangu/react-native';
import {
  COUNTRIES,
  Country,
  NUICountryCodePicker,
  colors,
  typography,
  useLanguage,
  useTranslate,
  useToast,
  PAGE_BOTTOM_PADDING,
  inputTraits,
  NUIFormField,
  fieldError,
  phoneField,
  phoneDigits,
  NUIButton,
  NUICard
} from '@siku-zangu/expo';


const t = {
    en: {
        title: 'Forgot PIN?',
        subtitle: "No worries! Enter the phone number linked to your account and we'll send you a verification code.",
        phoneLabel: 'Phone Number',
        phonePlaceholder: '712345678',
        errorRequired: 'Phone number is required',
        errorDigits: 'Enter 6–12 digits',
        errorChars: 'Only digits, spaces, or dashes allowed',
        sendCode: 'Send Verification Code',
        backToLogin: 'Back to Login',
        errorTitle: 'Error',
    },
    sw: {
        title: 'Umesahau PIN?',
        subtitle: 'Usiwe na wasiwasi! Weka namba ya simu iliyounganishwa na akaunti yako na tutakutumia nambari ya uthibitisho.',
        phoneLabel: 'Namba ya Simu',
        phonePlaceholder: '712345678',
        errorRequired: 'Namba ya simu inahitajika',
        errorDigits: 'Ingiza tarakimu 6–12',
        errorChars: 'Tarakimu, nafasi, au viunganishi pekee vinavyoruhusiwa',
        sendCode: 'Tuma Nambari ya Uthibitisho',
        backToLogin: 'Rudi kwenye Kuingia',
        errorTitle: 'Hitilafu',
    },
};

export default function ForgotPinScreen() {
  const { showError } = useToast();
    const router = useRouter();
    const insets = useSafeAreaInsets();

  // Language comes from the shared store, not the route param: a param is
  // frozen per screen, so switching language left every screen already on
  // the stack rendering the old one.
  const language = useLanguage();
  const translate = useTranslate();
    const tx = t[language];

    const { sendResetCode, isRequestingReset } = useUser();
    const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES.find(c => c.code === 'TZ') ?? COUNTRIES[0]);



    /** One schema behind the inline error and the submit. See login.tsx. */
    const phoneSchema = useMemo(
        () =>
            z.object({
                phone: phoneField({
                    required: tx.errorRequired,
                    length: tx.errorDigits,
                    charset: tx.errorChars,
                }),
            }),
        [tx]
    );

    const form = useForm({
        defaultValues: { phone: '' },
        // `revalidateLogic` + a single `onDynamic` validator, not one validator per
        // event. TanStack keeps an error PER SOURCE — `errorMap.onBlur`,
        // `errorMap.onChange`, `errorMap.onSubmit` — and a later `onChange` pass
        // only replaces its own entry. Because these validators are form-level,
        // blurring the phone field validated the whole object and stamped
        // "PIN is required" onto the still-empty PIN under `errorMap.onBlur`.
        // Typing the PIN cleared `onChange` but left `onBlur` untouched, so the
        // message was still there — and surfaced the moment Login was pressed.
        // One source, replaced on every run, cannot go stale.
        validationLogic: revalidateLogic({
            mode: 'change',
            modeAfterSubmission: 'change',
        }),
        validators: { onDynamic: phoneSchema },
        onSubmit: async ({ value }) => {
            await handleSendCode(value);
        },
    });

    // A failed submit reveals every field's error at once, including fields
    // the user never visited — otherwise pressing the button on an untouched
    // form would do nothing visible.
    const showErrors = useStore(form.store, (s) => s.submissionAttempts > 0);

    const handleSendCode = async ({ phone }: { phone: string }) => {
        const digits = phoneDigits(phone);
        const storedPhoneNumber = `${selectedCountry.code} ${digits}`;

        try {
            await sendResetCode(storedPhoneNumber);
            router.push({
                pathname: '/auth/verify-otp',
                params: {
                    lang: language,
                    phone: digits,
                    storagePhone: storedPhoneNumber,
                },
            });
        } catch (e: any) {
            showError(e?.message ?? (translate('forgot_pin.failedToSendCodePlease')));
        }
    };


    return (
        <KeyboardAvoidingView
            style={[styles.container, { paddingTop: insets.top }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={{ width: 40 }} />
                </View>

                {/* Icon */}
                <View style={styles.iconCircle}>
                    <Ionicons name="lock-closed-outline" size={40} color="#E66386" />
                </View>

                <Text style={styles.title}>{tx.title}</Text>
                <Text style={styles.subtitle}>{tx.subtitle}</Text>

                {/* Form */}
                <NUICard style={styles.formBox}>
                    <form.Field name="phone">
                        {(field) => (
                            <NUIFormField
                                {...inputTraits.phone}
                                label={tx.phoneLabel}
                                error={fieldError(field, showErrors)}
                                placeholder={tx.phonePlaceholder}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChangeText={(text) =>
                                    field.handleChange(text.replace(/[^0-9\s-]/g, ''))
                                }
                                maxLength={12}
                                leading={
                                    <NUICountryCodePicker
                                        selectedCountry={selectedCountry}
                                        onSelect={setSelectedCountry}
                                        language={language}
                                    />
                                }
                            />
                        )}
                    </form.Field>

                    <NUIButton
                        title={tx.sendCode}
                        // No `disabled`: pressing validates and shows the
                        // reason inline. See login.tsx.
                        onPress={() => form.handleSubmit()}
                        loading={isRequestingReset}
                        style={styles.sendButton}
                    />
                </NUICard>

                {/* Back to login */}
                <TouchableOpacity style={styles.backToLogin} onPress={() => router.back()}>
                    <Ionicons name="arrow-back-outline" size={16} color="#E66386" />
                    <Text style={styles.backToLoginText}>{tx.backToLogin}</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface.app,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingBottom: PAGE_BOTTOM_PADDING,
        alignItems: 'center',
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    iconCircle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: colors.surface.tint,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        marginBottom: 24,
    },
    title: {
      ...typography.title,
        fontWeight: '600',
        color: colors.text.primary,
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
      ...typography.caption,
        fontWeight: '400',
        color: colors.text.secondary,
        textAlign: 'center',
        marginBottom: 32,
        paddingHorizontal: 8,
    },
    formBox: {
        width: '100%',
        marginBottom: 24,
    },
    sendButton: {
        // Layout only — the primary tier supplies fill, radius and padding.
        marginTop: 16,
    },
    backToLogin: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    backToLoginText: {
      ...typography.caption,
        color: colors.brand.text,
        fontWeight: '600',
    },
});