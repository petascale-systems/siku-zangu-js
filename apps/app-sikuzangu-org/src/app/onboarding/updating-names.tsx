import React, {useEffect, useMemo, useRef} from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import {useUser} from '@siku-zangu/react-native';
import {User} from '@siku-zangu/core';
import {
  colors,
  typography,
  useLanguage,
  useTranslate,
  useToast,
  PAGE_BOTTOM_PADDING,
  inputTraits,
  layout,
  NUIFormField,
  fieldError,
  nameField,
  MAX_NAME_LENGTH,
  NUIPressable,
  NUIButton
} from '@siku-zangu/expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, useStore, revalidateLogic } from '@tanstack/react-form';
import { z } from 'zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function UpdatingNamesScreen() {
  const { showError } = useToast();
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  // Language comes from the shared store, not the route param: a param is
  // frozen per screen, so switching language left every screen already on
  // the stack rendering the old one.
  const language = useLanguage();
  const t = useTranslate();
  const userId = params.userId as string;
  const { updateCurrentUser, isUpsertingUser, error, user, isFetchingUser } =
      useUser(userId);

  // The family-name field, so the given-name field's "next" key has
  // somewhere to go. `submitBehavior: 'submit'` keeps the keyboard up
  // across the move; the default blurs first and it visibly flickers.
  const lastNameRef = useRef<TextInput>(null);

  /** One schema behind both inline errors and the submit. See login.tsx. */
  const namesSchema = useMemo(
      () =>
          z.object({
            firstName: nameField({
              required: t('updating_names.firstNameIsRequired'),
              tooLong:
                  language === 'en'
                      ? `First name must be at most ${MAX_NAME_LENGTH} characters`
                      : `Jina la kwanza linapaswa kuwa hadi herufi ${MAX_NAME_LENGTH}`,
            }),
            // No `required`: the surname is optional.
            lastName: nameField({
              tooLong:
                  language === 'en'
                      ? `Last name must be at most ${MAX_NAME_LENGTH} characters`
                      : `Jina la mwisho linapaswa kuwa hadi herufi ${MAX_NAME_LENGTH}`,
            }),
          }),
      [t, language]
  );

  const form = useForm({
    defaultValues: { firstName: '', lastName: '' },
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
    validators: { onDynamic: namesSchema },
    onSubmit: async ({ value }) => {
      await handleSave(value);
    },
  });

  // A failed submit reveals every field's error at once, including fields
  // the user never visited — otherwise pressing the button on an untouched
  // form would do nothing visible.
  const showErrors = useStore(form.store, (s) => s.submissionAttempts > 0);

  // Seeds once from the stored profile, and only while the fields are still
  // untouched, so a re-fetch cannot overwrite what the user is typing.
  useEffect(() => {
    if (user && !isFetchingUser && !form.state.isDirty) {
      form.setFieldValue('firstName', user.kv?.first_name || '');
      form.setFieldValue('lastName', user.kv?.last_name || '');
    }
  }, [user, isFetchingUser]);

  const handleSave = async ({
    firstName,
    lastName,
  }: {
    firstName: string;
    lastName: string;
  }) => {
    // Names are validated by `namesSchema`; only the session check is left,
    // because it is about the app's state rather than the user's input.
    if (!userId) {
      showError(t('updating_names.userIdNotAvailable'));
      return;
    }

    try {
      const updateData: User = {
        kv: {
          first_name: firstName.trim(),
        },
      };

      if (lastName.trim()) {
        updateData.kv!.last_name = lastName.trim();
      }
      await updateCurrentUser(updateData);
      router.push({
        pathname: '/onboarding/updating-dob',
        params: {
          lang: language,
          userId: userId,
        },
      });
    } catch (e: any) {
      const errorMessage =
          e.message ||
          (t('updating_names.failedToUpdateNames'));
      showError(errorMessage);
    }
  };

  if (isFetchingUser) {
    return (
        <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
          <ActivityIndicator size="large" color="#FF4081" />
          <Text style={styles.loadingText}>
            {t('updating_names.loading')}
          </Text>
        </View>
    );
  }

  return (
      <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.container, { paddingTop: insets.top + 20 }]}>

            <Text style={styles.title}>
              {t('updating_names.setUpYourProfile')}
            </Text>
            <Text style={styles.subtitle}>
              {language === 'en'
                  ? "Let's get to know you better!"
                  : 'Tukujue vizuri zaidi!'}
            </Text>

            <View style={styles.formContainer}>
              <form.Field name="firstName">
                {(field) => (
                    <NUIFormField
                        {...inputTraits.givenName}
                        label={t('updating_names.firstNameRequired')}
                        error={fieldError(field, showErrors)}
                        placeholder={t('updating_names.enterFirstName')}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChangeText={field.handleChange}
                        onSubmitEditing={() => lastNameRef.current?.focus()}
                        submitBehavior="submit"
                        maxLength={MAX_NAME_LENGTH}
                        editable={!isUpsertingUser}
                    />
                )}
              </form.Field>

              <form.Field name="lastName">
                {(field) => (
                    <NUIFormField
                        {...inputTraits.familyName}
                        ref={lastNameRef}
                        label={t('updating_names.lastNameOptional')}
                        error={fieldError(field, showErrors)}
                        placeholder={t('updating_names.enterLastName')}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChangeText={field.handleChange}
                        onSubmitEditing={() => form.handleSubmit()}
                        maxLength={MAX_NAME_LENGTH}
                        editable={!isUpsertingUser}
                    />
                )}
              </form.Field>
            </View>

            <Text style={styles.privacyText}>
              {language === 'en'
                  ? "We know how much privacy matters to you. That's why we never share data without consent."
                  : 'Tujua jinsi faragha inavyokuwa muhimu kwako. Ndiyo maana hatutoi data bila idhini.'}
            </Text>
            {/* The onPress used to sit on the Text inside an onPress-less
                TouchableOpacity, so the control was inert and only the glyphs
                themselves were tappable. */}
            <NUIPressable
                accessibilityRole="link"
                accessibilityLabel={t('updating_names.privacyPolicy')}
                hitSlop={8}
                onPress={() =>
                    Linking.openURL('https://sikuzangu.org/privacy-policy').catch(
                        () => undefined
                    )
                }
            >
              <Text style={styles.privacyLink}>
                {t('updating_names.privacyPolicy')}
              </Text>
            </NUIPressable>

            <NUIButton
              title={t('updating_names.next')}
              onPress={() => form.handleSubmit()}
              loading={isUpsertingUser}
              // No `disabled`. `handleSave` re-validates both names and the
              // session, and names what is wrong rather than going grey.
              trailingIcon="arrow-forward"
              accessibilityLabel={t('updating_names.next')}
              style={styles.nextButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: colors.surface.app,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: PAGE_BOTTOM_PADDING,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    marginTop: 10,
    color: colors.text.muted,
  },
  title: {
    ...typography.headingSm,
    fontStyle: 'normal',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 51,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.caption,
    fontStyle: 'normal',
    fontWeight: '400',
    textAlign: 'center',
    color: colors.text.primary,
    marginBottom: 40,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginTop: 80,
    gap: layout.fieldGap,
  },
  privacyText: {
    ...typography.label,
    marginTop: 80,
    fontStyle: 'normal',
    fontWeight: '400',
    color: colors.text.secondary,
    textAlign: 'center',
  },
  privacyLink: {
    ...typography.label,
    color: colors.brand.text,
    fontStyle: 'normal',
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 10,
    textDecorationLine: 'underline',
  },
  nextButton: {
    // Layout only — fill, radius, padding and the disabled overlay come from
    // the primary tier in `controls`.
    marginTop: 30,
  },
});