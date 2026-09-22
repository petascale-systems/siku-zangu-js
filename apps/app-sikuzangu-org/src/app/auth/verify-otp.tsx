import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, useStore, revalidateLogic } from '@tanstack/react-form';
import { z } from 'zod';
import {useUser} from '@siku-zangu/react-native';
import {
  COUNTRIES,
  colors,
  typography,
  useLanguage,
  useTranslate,
  useToast,
  PAGE_BOTTOM_PADDING,
  inputTraits,
  spacing,
  fieldErrorMessage,
  otpField,
  NUIButton,
  NUICard
} from '@siku-zangu/expo';


const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SEC = 60;

export default function VerifyOtpScreen() {
  const { showError, showSuccess } = useToast();
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();

  // Language comes from the shared store, not the route param: a param is
  // frozen per screen, so switching language left every screen already on
  // the stack rendering the old one.
  const language = useLanguage();
  const translate = useTranslate();
    const phone = params.phone as string;
    const storagePhone = params.storagePhone as string; // "KE 716899396" or "TZ 712345678"

    // Get country info from storagePhone
    // Guarded: any deep link or restored route without this param crashed.
  const [countryCode] = (storagePhone ?? '').split(' ');
    const selectedCountry = COUNTRIES.find(c => c.code === countryCode) || COUNTRIES[0];

    const t = {
        en: {
            title: 'Verify Code',
            subtitle: `Enter the 6-digit code sent to ${selectedCountry.dialCode} ${phone}`,
            verify: 'Verify',
            resendIn: (sec: number) => `Resend code in ${sec}s`,
            resend: 'Resend Code',
            changeNumber: 'Change number',
            errorTitle: 'Error',
            errorIncomplete: 'Please enter the complete 6-digit code',
            errorWrong: 'Incorrect code. Please try again.',
            errorExpired: 'Code has expired. Please request a new one.',
            errorGeneric: 'Verification failed. Please try again.',
            resendSuccessTitle: 'Code Sent!',
            resendSuccessMsg: 'A new verification code has been sent.',
        },
        sw: {
            title: 'Thibitisha Nambari',
            subtitle: `Weka nambari ya tarakimu 6 iliyotumwa kwa ${selectedCountry.dialCode} ${phone}`,
            verify: 'Thibitisha',
            resendIn: (sec: number) => `Tuma tena baada ya sekunde ${sec}`,
            resend: 'Tuma Tena Nambari',
            changeNumber: 'Badilisha namba',
            errorTitle: 'Hitilafu',
            errorIncomplete: 'Tafadhali weka nambari kamili ya tarakimu 6',
            errorWrong: 'Nambari si sahihi. Tafadhali jaribu tena.',
            errorExpired: 'Nambari imeisha muda. Tafadhali omba mpya.',
            errorGeneric: 'Uthibitisho umeshindwa. Tafadhali jaribu tena.',
            resendSuccessTitle: 'Nambari Imetumwa!',
            resendSuccessMsg: 'Nambari mpya ya uthibitisho imetumwa.',
        },
    };

    const tx = t[language];
    const { verifyResetCode, sendResetCode, isVerifyingOtp, isRequestingReset } = useUser();

    const [cooldown, setCooldown] = useState(0);
    const inputs = useRef<Array<TextInput | null>>([]);


    // Cooldown timer
    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    // Auto-focus first input
    useEffect(() => {
        inputs.current[0]?.focus();
    }, []);

    /** One schema behind the inline error and the submit. See login.tsx. */
    const otpSchema = useMemo(
        () => z.object({ otp: otpField({ required: tx.errorIncomplete, length: tx.errorIncomplete }) }),
        [tx]
    );

    const form = useForm({
        defaultValues: { otp: '' },
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
        validators: { onDynamic: otpSchema },
        onSubmit: async ({ value }) => {
            await handleVerify(value.otp);
        },
    });

    // A failed submit reveals every field's error at once, including fields
    // the user never visited — otherwise pressing the button on an untouched
    // form would do nothing visible.
    const showErrors = useStore(form.store, (s) => s.submissionAttempts > 0);

    /** The code as six slots, which is how it is drawn. */
    const digitsOf = (code: string): string[] =>
        Array.from({ length: OTP_LENGTH }, (_, i) => code[i] ?? '');

    /** Replaces one slot and hands back the whole code. */
    const withDigit = (code: string, index: number, digit: string): string =>
        digitsOf(code)
            .map((d, i) => (i === index ? digit : d))
            .join('')
            .replace(/\s/g, '');

    const handlePaste = (text: string) => {
        const digits = text.replace(/\D/g, '').slice(0, OTP_LENGTH);
        form.setFieldValue('otp', digits);
        const nextIndex = Math.min(digits.length, OTP_LENGTH - 1);
        inputs.current[nextIndex]?.focus();
    };

    const handleChange = (value: string, index: number) => {
        if (!/^\d*$/.test(value)) return;
        // A paste or an SMS autofill delivers the whole code to one box. The
        // old code kept only the last digit of it, and the `onPaste` prop that
        // was meant to catch this does not exist on React Native's TextInput,
        // so it never fired.
        if (value.length > 1) {
            handlePaste(value);
            return;
        }
        const code = form.getFieldValue('otp');
        form.setFieldValue('otp', withDigit(code, index, value.slice(-1)));
        if (value && index < OTP_LENGTH - 1) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (key: string, index: number) => {
        const code = form.getFieldValue('otp');
        if (key === 'Backspace' && !digitsOf(code)[index] && index > 0) {
            form.setFieldValue('otp', withDigit(code, index - 1, ''));
            inputs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async (otpValue: string) => {
        // Completeness is `otpSchema`'s job now; this is just the request.
        try {
            const { reset_token } = await verifyResetCode(storagePhone, otpValue);
            router.replace({
                pathname: '/auth/reset-pin',
                params: {
                    lang: language,
                    phone,
                    storagePhone,
                    resetToken: reset_token,
                },
            });
        } catch (e: any) {
            let msg = tx.errorGeneric;
            if (e?.status === 400) msg = tx.errorWrong;
            if (e?.status === 410) msg = tx.errorExpired;
            else if (e?.message) msg = e.message;
            showError(msg);
        }
    };

    const handleResend = async () => {
        if (cooldown > 0 || isRequestingReset) return;
        try {
            await sendResetCode(storagePhone);
            form.setFieldValue('otp', '');
            inputs.current[0]?.focus();
            setCooldown(RESEND_COOLDOWN_SEC);
            showSuccess(tx.resendSuccessMsg);
        } catch (e: any) {
            showError(e?.message ?? (translate('verify_otp.failedToResendCodePlease')));
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
                <View style={styles.header}>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.iconCircle}>
                    <Ionicons name="chatbox-ellipses-outline" size={40} color="#E66386" />
                </View>

                <Text style={styles.title}>{tx.title}</Text>
                <Text style={styles.subtitle}>{tx.subtitle}</Text>

                <NUICard style={styles.formBox}>
                    <form.Field name="otp">
                        {(field) => {
                            // Submit only, not `fieldError`: focus hops
                            // between the six boxes constantly, so every
                            // hop is a blur and the message would appear
                            // while the code is still being entered.
                            const error = showErrors
                                ? fieldErrorMessage(field.state.meta.errors)
                                : undefined;
                            return (
                                <View>
                                    <View style={styles.otpContainer}>
                                        {digitsOf(field.state.value).map((digit, index) => (
                                            <TextInput
                                                key={index}
                                                ref={(ref) => {
                                                    inputs.current[index] = ref;
                                                }}
                                                style={[
                                                    styles.otpBox,
                                                    digit && styles.otpBoxFilled,
                                                    error && styles.otpBoxError,
                                                ]}
                                                value={digit}
                                                onChangeText={(val) => handleChange(val, index)}
                                                onKeyPress={({ nativeEvent }) =>
                                                    handleKeyPress(nativeEvent.key, index)
                                                }
                                                // `one-time-code` is the portable spelling: it
                                                // maps to iOS oneTimeCode and Android sms-otp on
                                                // its own. Only the first box offers it, and it
                                                // accepts the whole code so a paste or SMS
                                                // autofill is not truncated to one character.
                                                {...(index === 0
                                                    ? inputTraits.otpFirst
                                                    : inputTraits.otpRest)}
                                                maxLength={index === 0 ? OTP_LENGTH : 1}
                                                selectTextOnFocus
                                                accessibilityLabel={`Digit ${index + 1}`}
                                            />
                                        ))}
                                    </View>
                                    {/* One message for the row, not per box —
                                        the code is a single value. */}
                                    {error ? (
                                        <Text style={styles.otpError} accessibilityRole="alert">
                                            {error}
                                        </Text>
                                    ) : null}
                                </View>
                            );
                        }}
                    </form.Field>

                    <NUIButton
                        title={tx.verify}
                        // No `disabled`: pressing validates and shows the
                        // reason under the boxes. See login.tsx.
                        onPress={() => form.handleSubmit()}
                        loading={isVerifyingOtp}
                        style={styles.verifyButton}
                    />

                    <View style={styles.resendContainer}>
                        {cooldown > 0 ? (
                            <Text style={styles.cooldownText}>{tx.resendIn(cooldown)}</Text>
                        ) : (
                            <NUIButton
                                variant="tertiary"
                                title={tx.resend}
                                onPress={handleResend}
                                loading={isRequestingReset}
                                fullWidth={false}
                                style={styles.resendButton}
                            />
                        )}
                    </View>
                </NUICard>

                <TouchableOpacity style={styles.changeNumber} onPress={() => router.back()}>
                    <Ionicons name="arrow-back-outline" size={16} color="#E66386" />
                    <Text style={styles.changeNumberText}>{tx.changeNumber}</Text>
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
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 8,
    },
    // The row's single error message, and the border that goes with it.
    otpError: {
      ...typography.label,
        fontWeight: '400',
        color: colors.state.error,
        marginTop: spacing.sm,
        textAlign: 'center',
    },
    otpBoxError: {
        borderColor: colors.state.error,
    },
    otpBox: {
      ...typography.title,
        flex: 1,
        // minHeight, not height: this is the only style in the app that pinned a
        // height AND set a fontSize, so the digit clipped as soon as the reader
        // raised their text size.
        minHeight: 56,
        borderWidth: 2,
        borderColor: colors.border.brand,
        borderRadius: 12,
        fontWeight: '600',
        color: colors.text.primary,
        textAlign: 'center',
        backgroundColor: colors.surface.muted,
    },
    otpBoxFilled: {
        borderColor: colors.brand.base,
        backgroundColor: colors.surface.card,
    },
    verifyButton: {
        // Layout only — the primary tier supplies fill, radius and padding.
        marginTop: 8,
    },
    resendContainer: {
        alignItems: 'center',
        minHeight: 40,
        justifyContent: 'center',
    },
    resendButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    cooldownText: {
      ...typography.caption,
        color: colors.text.muted,
    },
    changeNumber: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    changeNumberText: {
      ...typography.caption,
        color: colors.brand.text,
        fontWeight: '600',
    },
});