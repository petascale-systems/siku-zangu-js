import React, {useMemo, useRef, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  colors,
  typography,
  useLanguage,
  useTranslate,
  useToast,
  PAGE_BOTTOM_PADDING,
  inputTraits,
  layout,
  spacing,
  NUIFormField,
  fieldError,
  newPinField,
  pinField,
  withMatchingPins,
  WEAK_PINS as SHARED_WEAK_PINS,
  NUIButton,
  NUIPressable,
  NUICard
} from '@siku-zangu/expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, useStore, revalidateLogic } from '@tanstack/react-form';
import { z } from 'zod';
import {useUser} from '@siku-zangu/react-native';

const PIN_LENGTH = 4;


const t = {
    en: {
        title: 'Set New PIN',
        subtitle: "Choose a new 4-digit PIN for your account. Make sure it's memorable but hard to guess.",
        newPinLabel: 'New PIN',
        confirmPinLabel: 'Confirm PIN',
        placeholder: '••••',
        save: 'Save New PIN',
        errorTitle: 'Error',
        errorRequired: 'Please enter a PIN',
        errorLength: 'PIN must be exactly 4 digits',
        errorMatch: 'PINs do not match',
        errorWeak: 'This PIN is too weak. Please choose a different PIN.',
        errorSameAsOld: 'New PIN must be different from your current PIN',
        successTitle: 'Success!',
        successMsg: 'Your PIN has been reset successfully.',
        securityTips: 'Security Tips:',
        tip1: 'Use a PIN you can remember but others cannot guess',
        tip2: 'Avoid simple PINs like 1234 or 0000',
        tip3: 'Never share your PIN with anyone',
        tip4: 'Change your PIN regularly for added security',
    },
    sw: {
        title: 'Weka PIN Mpya',
        subtitle: 'Chagua PIN mpya ya tarakimu 4 kwa akaunti yako. Hakikisha inakumbukwa lakini ni ngumu kukisia.',
        newPinLabel: 'PIN Mpya',
        confirmPinLabel: 'Thibitisha PIN',
        placeholder: '••••',
        save: 'Hifadhi PIN Mpya',
        errorTitle: 'Hitilafu',
        errorRequired: 'Tafadhali weka PIN',
        errorLength: 'PIN lazima iwe tarakimu 4 haswa',
        errorMatch: 'PIN hazifanani',
        errorWeak: 'PIN hii ni dhaifu sana. Tafadhali chagua PIN tofauti.',
        errorSameAsOld: 'PIN mpya lazima iwe tofauti na PIN yako ya sasa',
        successTitle: 'Mafanikio!',
        successMsg: 'PIN yako imebadilishwa kwa mafanikio.',
        securityTips: 'Vidokezo vya Usalama:',
        tip1: 'Tumia PIN unayoweza kukumbuka lakini wengine hawawezi kukisia',
        tip2: 'Epuka PIN rahisi kama 1234 au 0000',
        tip3: 'Usishiriki PIN yako na mtu yeyote',
        tip4: 'Badilisha PIN yako mara kwa mara kwa usalama zaidi',
    },
};


export default function ResetPinScreen() {
  const { showError, showSuccess } = useToast();
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();

  // Language comes from the shared store, not the route param: a param is
  // frozen per screen, so switching language left every screen already on
  // the stack rendering the old one.
  const language = useLanguage();
  const translate = useTranslate();
    const tx = t[language];

    const storagePhone = params.storagePhone as string;
    const resetToken = params.resetToken as string;

    const { submitNewPin, isResettingPin } = useUser();

    const confirmPinRef = useRef<TextInput>(null);
    const [secureNew, setSecureNew] = useState(true);
    const [secureConfirm, setSecureConfirm] = useState(true);


    /**
     * One schema behind the inline errors and the submit.
     *
     * The mismatch is a cross-field rule, so it hangs off the object and is
     * reported against `confirmPin` — the field the user would change. It used
     * to live only in the submit handler, which is why the confirm box could
     * sit visibly wrong with nothing said until the button was pressed.
     */
    const resetSchema = useMemo(
        () =>
            withMatchingPins(
                z.object({
                    newPin: newPinField({
                        required: tx.errorRequired,
                        length: tx.errorLength,
                        weak: tx.errorWeak,
                    }),
                    confirmPin: pinField({
                        required: tx.errorRequired,
                        length: tx.errorLength,
                    }),
                }),
                { pin: 'newPin', confirm: 'confirmPin' },
                tx.errorMatch
            ),
        [tx]
    );

    const form = useForm({
        defaultValues: { newPin: '', confirmPin: '' },
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
        validators: { onDynamic: resetSchema },
        onSubmit: async ({ value }) => {
            await handleSubmit(value);
        },
    });

    // A failed submit reveals every field's error at once, including fields
    // the user never visited — otherwise pressing the button on an untouched
    // form would do nothing visible.
    const showErrors = useStore(form.store, (s) => s.submissionAttempts > 0);

    const handleSubmit = async ({ newPin }: { newPin: string; confirmPin: string }) => {
        // Validation lives in `resetSchema`; what is left here is the request.
        try {
            await submitNewPin(storagePhone, resetToken, newPin);
            showSuccess(tx.successMsg);
            router.replace({
                pathname: '/auth/login',
                params: { lang: language },
            });
        } catch (e: any) {
            let msg = e?.message;
            if (e?.status === 400 && msg?.includes('different')) {
                msg = tx.errorSameAsOld;
            } else if (e?.status === 400) {
                msg = tx.errorWeak;
            } else if (!msg) {
                msg = translate('reset_pin.failedToResetPinPlease');
            }
            showError(msg);
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
                    <Ionicons name="key-outline" size={40} color="#E66386" />
                </View>

                <Text style={styles.title}>{tx.title}</Text>
                <Text style={styles.subtitle}>{tx.subtitle}</Text>

                <NUICard style={styles.formBox}>
                    <form.Field name="newPin">
                        {(field) => (
                            <View style={styles.fieldWrapper}>
                                <NUIFormField
                                    {...inputTraits.pin}
                                    label={tx.newPinLabel}
                                    error={fieldError(field, showErrors)}
                                    placeholder={tx.placeholder}
                                    secureTextEntry={secureNew}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChangeText={(text) => {
                                        const next = text.replace(/\D/g, '');
                                        field.handleChange(next);
                                        // iOS number pads have no return key, so
                                        // `returnKeyType: 'next'` on this field is
                                        // never drawn and the hand-off has to be
                                        // driven by length instead.
                                        if (next.length === PIN_LENGTH) {
                                            confirmPinRef.current?.focus();
                                        }
                                    }}
                                    maxLength={PIN_LENGTH}
                                    trailing={
                                        <NUIPressable
                                            borderless
                                            onPress={() => setSecureNew(!secureNew)}
                                            accessibilityRole="switch"
                                            accessibilityState={{ checked: secureNew }}
                                            accessibilityLabel={
                                                language === 'sw' ? 'Onyesha PIN mpya' : 'Show new PIN'
                                            }
                                        >
                                            <Ionicons
                                                name={secureNew ? 'eye-off-outline' : 'eye-outline'}
                                                size={22}
                                                color="gray"
                                            />
                                        </NUIPressable>
                                    }
                                />
                                <View style={styles.strengthIndicator}>
                                    {[1, 2, 3, 4].map((dot) => (
                                        <View
                                            key={dot}
                                            style={[
                                                styles.strengthDot,
                                                field.state.value.length >= dot &&
                                                    styles.strengthDotFilled,
                                                field.state.value.length === PIN_LENGTH &&
                                                    SHARED_WEAK_PINS.includes(field.state.value) &&
                                                    styles.strengthDotWeak,
                                            ]}
                                        />
                                    ))}
                                </View>
                            </View>
                        )}
                    </form.Field>

                    <form.Field name="confirmPin">
                        {(field) => (
                            <View style={styles.fieldWrapper}>
                                <NUIFormField
                                    {...inputTraits.pinLast}
                                    ref={confirmPinRef}
                                    label={tx.confirmPinLabel}
                                    error={fieldError(field, showErrors)}
                                    placeholder={tx.placeholder}
                                    secureTextEntry={secureConfirm}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChangeText={(text) =>
                                        field.handleChange(text.replace(/\D/g, ''))
                                    }
                                    onSubmitEditing={() => form.handleSubmit()}
                                    maxLength={PIN_LENGTH}
                                    trailing={
                                        <NUIPressable
                                            borderless
                                            onPress={() => setSecureConfirm(!secureConfirm)}
                                            accessibilityRole="switch"
                                            accessibilityState={{ checked: secureConfirm }}
                                            accessibilityLabel={
                                                language === 'sw'
                                                    ? 'Onyesha uthibitisho wa PIN'
                                                    : 'Show PIN confirmation'
                                            }
                                        >
                                            <Ionicons
                                                name={secureConfirm ? 'eye-off-outline' : 'eye-outline'}
                                                size={22}
                                                color="gray"
                                            />
                                        </NUIPressable>
                                    }
                                />
                                {/* The affirmative half of the match rule. The
                                    mismatch already surfaces as this field's
                                    inline error, but a green tick confirming a
                                    match is something an error cannot say. */}
                                <form.Subscribe selector={(state) => state.values.newPin}>
                                    {(newPin) =>
                                        field.state.value.length === PIN_LENGTH &&
                                        newPin === field.state.value ? (
                                            <View style={styles.matchIndicator}>
                                                <Ionicons
                                                    name="checkmark-circle"
                                                    size={18}
                                                    color="#4CAF50"
                                                />
                                                <Text
                                                    style={[styles.matchText, styles.matchTextSuccess]}
                                                >
                                                    {translate('reset_pin.pinsMatch')}
                                                </Text>
                                            </View>
                                        ) : null
                                    }
                                </form.Subscribe>
                            </View>
                        )}
                    </form.Field>

                    <NUIButton
                        title={tx.save}
                        // No `disabled`: pressing validates and names which of
                        // the four problems it is, inline. See login.tsx.
                        onPress={() => form.handleSubmit()}
                        loading={isResettingPin}
                        style={styles.saveButton}
                    />
                </NUICard>

                <View style={styles.tipsBox}>
                    <Text style={styles.tipsTitle}>{tx.securityTips}</Text>
                    <View style={styles.tipRow}>
                        <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                        <Text style={styles.tipText}>{tx.tip1}</Text>
                    </View>
                    <View style={styles.tipRow}>
                        <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                        <Text style={styles.tipText}>{tx.tip2}</Text>
                    </View>
                    <View style={styles.tipRow}>
                        <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                        <Text style={styles.tipText}>{tx.tip3}</Text>
                    </View>
                    <View style={styles.tipRow}>
                        <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                        <Text style={styles.tipText}>{tx.tip4}</Text>
                    </View>
                </View>
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
        gap: layout.fieldGap,
    },
    // The field plus whatever hangs under it — the strength dots, the match
    // tick. `formBox`'s gap spaces these from each other.
    fieldWrapper: {
        gap: spacing.sm,
    },
    strengthIndicator: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    strengthDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#E0E0E0',
    },
    strengthDotFilled: {
        backgroundColor: '#4CAF50',
    },
    strengthDotWeak: {
        backgroundColor: colors.brand.base,
    },
    matchIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
    },
    matchText: {
      ...typography.label,
        fontWeight: '500',
    },
    matchTextSuccess: {
        color: colors.state.success,
    },
    saveButton: {
        // Layout only — the primary tier supplies fill, radius and padding.
        marginTop: 8,
    },
    tipsBox: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
        width: '100%',
        gap: 12,
    },
    tipsTitle: {
      ...typography.caption,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: 4,
    },
    tipRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    tipText: {
      ...typography.caption,
        flex: 1,
        color: colors.text.secondary,
    },
});