import React, {useEffect, useMemo, useRef, useState} from 'react';
import {StyleSheet, Text, TextInput, TouchableOpacity, View, Keyboard, ScrollView, KeyboardAvoidingView, Platform, BackHandler} from 'react-native';
import {useRouter} from 'expo-router';
import { useForm, useStore, revalidateLogic } from '@tanstack/react-form';
import {z} from 'zod';
import {
  NUIPrimaryButton,
  colors,
  typography,
  useLanguage,
  useSession,
  useTranslate,
  useToast,
  inputTraits,
  layout,
  NUIFormField,
  fieldError,
  phoneField,
  pinField,
  phoneDigits,
  NUIPressable,
  NUICard
} from '@siku-zangu/expo';
import {Ionicons} from '@expo/vector-icons';
import {APIError} from '@siku-zangu/core';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {NUICountryCodePicker, COUNTRIES, Country, nationalNumberLength, isPhoneNumberComplete} from '@siku-zangu/expo';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const PHONE_LENGTH = 12;
const PIN_LENGTH = 4;

export default function LoginScreen() {
    const pinRef = useRef<TextInput>(null);
  const { showError } = useToast();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    // Through the session store so a sign-in is immediately visible app-wide.
    const {loginUser, isLoggingIn, error} = useSession();
    const [secure, setSecure] = useState(true);
    const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES.find(c => c.code === 'TZ') ?? COUNTRIES[0]);
    // What "finished typing the number" means depends on the country. This
    // used to compare against PHONE_LENGTH, which is the field's *maximum*
    // (12) rather than any real number's length — so for the 9-digit numbers
    // this app actually serves, the hand-off never fired at all.
    const expectedPhoneLength = nationalNumberLength(selectedCountry);

  // Language comes from the shared store, not the route param: a param is
  // frozen per screen, so switching language left every screen already on
  // the stack rendering the old one.
  const language = useLanguage();
  const t = useTranslate();
    const LANGUAGE_KEY = 'language';

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            return true;
        });

        return () => backHandler.remove();
    }, []);

    useEffect(() => {
        const saveLanguage = async () => {
            try {
                await AsyncStorage.setItem(LANGUAGE_KEY, language);
            } catch (error) {
                console.error('Failed to save language:', error);
            }
        };
        saveLanguage();
    }, [language]);


    const goToForgotPin = () => {
        Keyboard.dismiss();
        router.push({
            pathname: '/auth/forgot-pin',
            params: { lang: language },
        });
    };

    /**
     * One schema, rebuilt when the language changes so the messages follow it.
     *
     * This is the whole reason for the form library: `canSubmit`, the inline
     * error under each field and the check that runs on submit all come from
     * THIS object. The screen used to hold three hand-written copies of these
     * rules that could — and did — disagree.
     */
    const loginSchema = useMemo(
        () =>
            z.object({
                phone: phoneField({
                    required: t('login.phoneNumberIsRequired'),
                    length: t('login.enter612Digits'),
                    charset: t('login.onlyDigitsSpacesOrDashes'),
                }),
                pin: pinField({
                    required: t('login.pinIsRequired'),
                    length: t('login.enterExactly4Digits'),
                }),
            }),
        [t]
    );

    const form = useForm({
        defaultValues: { phone: '', pin: '' },
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
        validators: { onDynamic: loginSchema },
        onSubmit: async ({ value }) => {
            await handleLogin(value);
        },
    });

    // A failed submit reveals every field's error at once, including fields
    // the user never visited — otherwise pressing the button on an untouched
    // form would do nothing visible.
    const showErrors = useStore(form.store, (s) => s.submissionAttempts > 0);

    const handleLogin = async ({ phone, pin }: { phone: string; pin: string }) => {
        const storedPhoneNumber = `${selectedCountry.code} ${phoneDigits(phone)}`;
        // No validation here any more. Anything reaching this point already
        // satisfied `loginSchema`; what is left is the request and its errors,
        // which are the server's to report and belong in a toast rather than
        // under a field.
        try {
            const accessToken = await loginUser({
                phone_number: storedPhoneNumber,
                pin,
            });
            if (!accessToken?.user?.user_id) {
                throw {
                    status: 500,
                    message:
                        t('login.userIdNotFoundIn'),
                } as APIError;
            }
            const userId = accessToken.user.user_id;
            await AsyncStorage.setItem(LANGUAGE_KEY, language);

            router.replace({
                pathname: '/language',
                params: {
                    lang: language,
                    userId: userId,
                },
            });
        } catch (e: any) {
            let errorMessage = '';
            const apiMessage = (e as APIError).message;
            if (e.status === 401) {
                errorMessage = t('login.invalidPhoneNumberOrPin');
            } else if (e.status === 400) {
                errorMessage = t('login.invalidInputFormat');
            } else if ((e as APIError).issues?.length) {
                errorMessage = ((e as APIError).issues ?? [])
                    .map((issue: any) => issue.message)
                    .join(', ');
            } else if (apiMessage) {
                // Bound to a const so the truthiness check narrows it; reading
                // `(e as APIError).message` twice re-widens to string|undefined.
                errorMessage = apiMessage;
            } else {
                errorMessage = t('login.loginFailedPleaseTryAgain');
            }

            showError(errorMessage);
        }
    };

    const goToRegister = () => {
        Keyboard.dismiss();
        router.push({
            pathname: '/auth/register',
            params: {lang: language},
        });
    };

    return (
        // Login declares `headerShown: false`, so nothing above it reserves
        // room for the status bar or the camera cutout under Android's
        // edge-to-edge window. It has to inset itself.
        <KeyboardAvoidingView
            style={[styles.container, {paddingTop: insets.top}]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>{t('login.login')}</Text>
                <Text style={styles.subtitle}>
                    {t('login.welcomeBackTrackYourMenstrual')}
                </Text>

                <NUICard style={styles.formBox}>
                    <form.Field name="phone">
                        {(field) => (
                            <NUIFormField
                                {...inputTraits.phone}
                                label={t('login.phoneNumber')}
                                error={fieldError(field, showErrors)}
                                placeholder={t('login.k712345678')}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChangeText={(text) => {
                                    // Strip what we cannot accept rather than
                                    // rejecting the whole change. The gate used
                                    // to be `if (regex.test(text)) setPhone(text)`,
                                    // which drops the edit entirely the moment a
                                    // single stray character appears — a leading
                                    // `+` from Android autofill, say, since
                                    // `autoComplete: 'tel-national'` invites the
                                    // platform to fill this field.
                                    const next = text.replace(/[^0-9\s-]/g, '');
                                    field.handleChange(next);
                                    // iOS number pads have no return key, so
                                    // the hand-off is driven by length.
                                    if (isPhoneNumberComplete(next, expectedPhoneLength)) {
                                        pinRef.current?.focus();
                                    }
                                }}
                                maxLength={PHONE_LENGTH}
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

                    <form.Field name="pin">
                        {(field) => (
                            <NUIFormField
                                {...inputTraits.pinLast}
                                ref={pinRef}
                                label={t('login.pin')}
                                error={fieldError(field, showErrors)}
                                placeholder={t('login.enter4DigitPin')}
                                secureTextEntry={secure}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChangeText={(text) =>
                                    field.handleChange(text.replace(/\D/g, ''))
                                }
                                onSubmitEditing={() => form.handleSubmit()}
                                maxLength={PIN_LENGTH}
                                trailing={
                                    <NUIPressable
                                        onPress={() => setSecure(!secure)}
                                        borderless
                                        accessibilityLabel={t('login.togglePinVisibility')}
                                        accessibilityState={{ checked: !secure }}
                                        accessibilityRole="switch"
                                    >
                                        <Ionicons
                                            name={secure ? 'eye-off-outline' : 'eye-outline'}
                                            size={22}
                                            color={colors.text.secondary}
                                        />
                                    </NUIPressable>
                                }
                            />
                        )}
                    </form.Field>

                    <TouchableOpacity onPress={goToForgotPin}>
                        <Text style={styles.forgotLink}>
                            {t('login.forgotPin')}
                        </Text>
                    </TouchableOpacity>

                    <NUIPrimaryButton
                        title={t('login.login')}
                        // Still no `disabled`. `canSubmit` would now be honest —
                        // it comes from the same schema the submit runs — but a
                        // greyed button still cannot say WHY. Pressing runs the
                        // validators and lights up the offending field, which
                        // is the whole point of inline errors.
                        onPress={() => form.handleSubmit()}
                        loading={isLoggingIn}
                        accessibilityLabel={t('login.login')}
                    />
                </NUICard>
                <View style={styles.footerContainer}>
                    <Text style={styles.footer}>
                        {language === 'en' ? "Don't have an Account?" : 'Huna akaunti?'}
                    </Text>
                    <TouchableOpacity onPress={goToRegister}>
                        <Text style={styles.loginLink}>
                            {t('login.register')}
                        </Text>
                    </TouchableOpacity>
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
        // flexGrow keeps the content centred on a tall screen and
        // still lets it scroll once the keyboard shrinks the viewport.
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        gap: 32,
    },
    title: {
      ...typography.title,
        fontWeight: '500',
        color: colors.text.primary,
        textAlign: 'center',
    },
    subtitle: {
      ...typography.body,
        fontStyle: 'normal',
        fontWeight: '500',
        textAlign: 'center',
        color: colors.text.primary,
    },
    formBox: {
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: layout.fieldGap,
        alignSelf: 'stretch',
    },
    forgotLink: {
      ...typography.caption,
        color: colors.brand.text,
        fontWeight: '600',
        alignSelf: 'flex-end',
        marginBottom: 10,
    },
    footerContainer: {
        alignItems: 'center',
        gap: 4,
    },
    footer: {
      ...typography.caption,
        fontWeight: '500',
        textAlign: 'center',
        color: colors.text.secondary,
    },
    loginLink: {
      ...typography.caption,
        color: colors.brand.text,
        fontWeight: '700',
    },
});