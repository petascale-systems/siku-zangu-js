import {useRouter} from 'expo-router';
import { useForm, useStore, revalidateLogic } from '@tanstack/react-form';
import { z } from 'zod';
import React, {useState, useMemo, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import {
  NUIPrimaryButton,
  colors,
  typography,
  useLanguage,
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
import { Ionicons } from '@expo/vector-icons';
import {useUser} from '@siku-zangu/react-native';
import {NUICountryCodePicker, COUNTRIES, Country, isPhoneNumberComplete, nationalNumberLength} from '@siku-zangu/expo';

export default function RegisterScreen() {
  const { showError, showSuccess } = useToast();
  const router = useRouter();
  const { upsertUser, isUpsertingUser, error } = useUser();
  const [secure, setSecure] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES.find(c => c.code === 'TZ') ?? COUNTRIES[0]);
  const pinRef = useRef<TextInput>(null);
  // How many digits count as a finished number depends on the country; see
  // `nationalNumberLength`. Unknown countries get no hand-off rather than a
  // guess that would steal the keyboard mid-number.
  const expectedPhoneLength = nationalNumberLength(selectedCountry);

  // Language comes from the shared store, not the route param: a param is
  // frozen per screen, so switching language left every screen already on
  // the stack rendering the old one.
  const language = useLanguage();
  const t = useTranslate();


  /** One schema behind the inline errors and the submit. See login.tsx. */
  const registerSchema = useMemo(
      () =>
          z.object({
            phone: phoneField({
              required: t('register.phoneNumberIsRequired'),
              length: t('register.enter612Digits'),
              charset: t('register.onlyDigitsSpacesOrDashes'),
            }),
            pin: pinField({
              required: t('register.pinIsRequired'),
              length: t('register.enterExactly4Digits'),
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
    validators: { onDynamic: registerSchema },
    onSubmit: async ({ value }) => {
      await handleRegister(value);
    },
  });

  // A failed submit reveals every field's error at once, including fields
  // the user never visited — otherwise pressing the button on an untouched
  // form would do nothing visible.
  const showErrors = useStore(form.store, (s) => s.submissionAttempts > 0);

  const handleRegister = async ({ phone, pin }: { phone: string; pin: string }) => {
    const storedPhoneNumber = `${selectedCountry.code} ${phoneDigits(phone)}`;
    // Validation lives in `registerSchema`; what is left here is the request.
    try {
      const payload = {
        kv: {
          phone_number: storedPhoneNumber,
          pin,
          language,
          status: 'active' as const,
        },
      };
      await upsertUser(payload);
      showSuccess(t('register.accountCreated'));
      router.replace({
        pathname: '/auth/login',
        params: {
          lang: language,
        },
      });
    } catch (e: any) {
      let errorMessage = '';
      if (e.status === 400) {
        errorMessage = t('register.invalidInputFormat');
      } else if (e.status === 409) {
        errorMessage = t('register.phoneNumberAlreadyTaken');
      } else if (e.details) {
        errorMessage = e.details;
      } else if (e.message) {
        errorMessage = e.message;
      } else {
        errorMessage = t('register.registrationFailedPleaseTryAgain');
      }

      showError(errorMessage);
    }
  };

  const goToLogin = () => {
    Keyboard.dismiss();
    // Login is this stack's root, reached by popping rather than by pushing a
    // second copy of it on top of Register.
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace({
      pathname: '/auth/login',
      params: { lang: language },
    });
  };

  return (
      <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>
            {t('register.register')}
          </Text>
          <Text style={styles.subtitle}>
            {t('register.createYourAccountToStart')}
          </Text>
          <NUICard style={styles.formBox}>
            <form.Field name="phone">
              {(field) => (
                  <NUIFormField
                      {...inputTraits.phone}
                      label={t('register.phoneNumber')}
                      error={fieldError(field, showErrors)}
                      placeholder={t('register.k712345678')}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChangeText={(text) => {
                        // Sanitize, never reject: see the note in login.tsx.
                        const next = text.replace(/[^0-9\s-]/g, '');
                        field.handleChange(next);
                        // iOS number pads have no return key, so the hand-off to
                        // the PIN is driven by length, as on the sign-in form.
                        if (isPhoneNumberComplete(next, expectedPhoneLength)) {
                          pinRef.current?.focus();
                        }
                      }}
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

            <form.Field name="pin">
              {(field) => (
                  <NUIFormField
                      {...inputTraits.pinLast}
                      ref={pinRef}
                      label={t('register.pin')}
                      error={fieldError(field, showErrors)}
                      placeholder={t('register.enter4DigitPin')}
                      secureTextEntry={secure}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChangeText={(text) => field.handleChange(text.replace(/\D/g, ''))}
                      onSubmitEditing={() => form.handleSubmit()}
                      maxLength={4}
                      trailing={
                        <NUIPressable
                            borderless
                            onPress={() => setSecure(!secure)}
                            accessibilityRole="switch"
                            accessibilityState={{ checked: !secure }}
                            accessibilityLabel={t('register.togglePinVisibility')}
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

            <NUIPrimaryButton
                title={t('register.register')}
                // No `disabled`: pressing runs the validators and lights up the
                // offending field. See the note in login.tsx.
                onPress={() => form.handleSubmit()}
                loading={isUpsertingUser}
                accessibilityLabel={t('register.register')}
            />
          </NUICard>
          <View style={styles.footerContainer}>
            <Text style={styles.footer}>
              {t('register.alreadyHaveAnAccount')}
            </Text>
            <NUIPressable
                onPress={goToLogin}
                accessibilityRole="link"
                accessibilityLabel={t('register.logIn')}
            >
              <Text style={styles.loginLink}>
                {t('register.logIn')}
              </Text>
            </NUIPressable>
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
    fontStyle: 'normal',
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
    alignItems: 'center',
    gap: layout.fieldGap,
    alignSelf: 'stretch',
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