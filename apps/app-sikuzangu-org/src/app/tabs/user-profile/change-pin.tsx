import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {useUser} from '@siku-zangu/react-native';
import {
  colors,
  typography,
  useLanguage,
  useTabContentInset,
  useToast,
  PAGE_BOTTOM_PADDING,
  useResetStackOnBlur,
  inputTraits,
  NUIFormField,
  fieldError,
  newPinField,
  pinField,
  withMatchingPins,
  NUIButton,
  NUIPressable,
  layout,
  spacing,
  radius
} from '@siku-zangu/expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, useStore, revalidateLogic } from '@tanstack/react-form';
import { z } from 'zod';

const PIN_LENGTH = 4;

export default function ChangePinScreen() {
  // Leaving the Profile tab returns it to the Profile screen.
  useResetStackOnBlur();
  const { showError, showSuccess } = useToast();
  const tabInset = useTabContentInset();
  const router = useRouter();
  const params = useLocalSearchParams();

  // Language comes from the shared store, not the route param: a param is
  // frozen per screen, so switching language left every screen already on
  // the stack rendering the old one.
  const language = useLanguage();
  const userId = params.userId as string;
  const { changePin, isChangingPin } = useUser(userId);
  // Three numeric fields in a row. iOS number pads have no return key,
  // so `returnKeyType: 'next'` never appears and each field has to hand
  // focus on itself once it is full.
  const newPinRef = useRef<TextInput>(null);
  const confirmPinRef = useRef<TextInput>(null);
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  /**
   * One schema behind the three inline errors and the submit. The messages
   * were inline ternaries on `language`; they stay that way rather than being
   * moved to screen-copy, which is a separate change.
   */
  const sw = language === 'sw';
  const changePinSchema = useMemo(
      () =>
          withMatchingPins(
              z.object({
                currentPin: pinField({
                  required: sw ? 'Weka PIN yako ya sasa.' : 'Enter your current PIN.',
                  length: sw
                      ? 'PIN ya sasa lazima iwe na tarakimu 4.'
                      : 'Current PIN must be exactly 4 digits.',
                }),
                newPin: newPinField({
                  required: sw ? 'Weka PIN mpya.' : 'Enter a new PIN.',
                  length: sw
                      ? 'PIN mpya lazima iwe na tarakimu 4.'
                      : 'New PIN must be exactly 4 digits.',
                  weak: sw
                      ? 'Tafadhali chagua PIN ambayo haiwezi kukisiwa rahisi.'
                      : 'Please choose a PIN that is not easy to guess.',
                }),
                confirmPin: pinField({
                  required: sw ? 'Thibitisha PIN yako mpya.' : 'Confirm your new PIN.',
                  length: sw
                      ? 'PIN mpya lazima iwe na tarakimu 4.'
                      : 'New PIN must be exactly 4 digits.',
                }),
              }),
              { pin: 'newPin', confirm: 'confirmPin' },
              sw
                  ? 'Tafadhali hakikisha PIN zote mbili ni sawa.'
                  : 'Please ensure both PINs are the same.'
          ),
      [sw]
  );

  const form = useForm({
    defaultValues: { currentPin: '', newPin: '', confirmPin: '' },
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
    validators: { onDynamic: changePinSchema },
    onSubmit: async ({ value }) => {
      await handleSavePin(value);
    },
  });

  // A failed submit reveals every field's error at once, including fields
  // the user never visited — otherwise pressing the button on an untouched
  // form would do nothing visible.
  const showErrors = useStore(form.store, (s) => s.submissionAttempts > 0);

  const handleSavePin = async ({
    currentPin,
    newPin,
  }: {
    currentPin: string;
    newPin: string;
    confirmPin: string;
  }) => {
    try {
      await changePin(currentPin, newPin);
      showSuccess(
        language === 'sw'
          ? 'PIN yako imebadilishwa kikamilifu!'
          : 'Your PIN has been changed successfully!'
      );
      form.reset();
      router.replace({
        pathname: '/auth/login',
        params: { lang: language },
      });
    } catch (e: any) {
      let errorMessage = '';
      if (e.status === 401) {
        errorMessage =
          language === 'sw'
            ? 'PIN ya sasa si sahihi.'
            : 'Current PIN is incorrect.';
      } else if (e.status === 400 && e.message?.includes('different')) {
        errorMessage =
          language === 'sw'
            ? 'PIN mpya haiwezi kuwa sawa na PIN ya sasa.'
            : 'New PIN must be different from current PIN.';
      } else if (e.status === 400 && e.message?.includes('weak')) {
        errorMessage =
          language === 'sw'
            ? 'PIN hii ni dhaifu. Tafadhali chagua PIN tofauti.'
            : 'This PIN is too weak. Please choose a different PIN.';
      } else {
        errorMessage =
          e.message ||
          (language === 'sw'
            ? 'Imeshindwa kubadilisha PIN. Tafadhali jaribu tena.'
            : 'Failed to change PIN. Please try again.');
      }
      showError(errorMessage);
    }
  };
  return (
    <View style={styles.container}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: tabInset }]}
      >
        <Text style={styles.subtitle}>
          {language === 'sw'
            ? 'Weka PIN yako ya sasa na utengeneze mpya'
            : "Enter your new PIN for your account. Ensure it's not easy to guess and unique to enhance security."}
        </Text>
        <View style={styles.form}>
          <form.Field name="currentPin">
            {(field) => (
                <NUIFormField
                    {...inputTraits.pin}
                    label={sw ? 'PIN YA SASA' : 'CURRENT PIN'}
                    error={fieldError(field, showErrors)}
                    placeholder="****"
                    secureTextEntry={!showCurrentPin}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChangeText={(text) => {
                      const next = text.replace(/\D/g, '');
                      field.handleChange(next);
                      if (next.length === PIN_LENGTH) newPinRef.current?.focus();
                    }}
                    maxLength={PIN_LENGTH}
                    inputStyle={styles.pinInput}
                    trailing={
                      <NUIPressable
                        borderless
                        style={styles.eyeButton}
                        onPress={() => setShowCurrentPin(!showCurrentPin)}
                        accessibilityRole="switch"
                        accessibilityState={{ checked: showCurrentPin }}
                        accessibilityLabel={sw ? 'Onyesha PIN ya sasa' : 'Show current PIN'}
                      >
                        <Ionicons
                          name={showCurrentPin ? 'eye-outline' : 'eye-off-outline'}
                          size={22}
                          color="#999"
                        />
                      </NUIPressable>
                    }
                />
            )}
          </form.Field>

          <form.Field name="newPin">
            {(field) => (
                <NUIFormField
                    {...inputTraits.pin}
                    ref={newPinRef}
                    label={sw ? 'UNDA PIN MPYA' : 'CREATE NEW PIN'}
                    error={fieldError(field, showErrors)}
                    placeholder="****"
                    secureTextEntry={!showNewPin}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChangeText={(text) => {
                      const next = text.replace(/\D/g, '');
                      field.handleChange(next);
                      if (next.length === PIN_LENGTH) confirmPinRef.current?.focus();
                    }}
                    maxLength={PIN_LENGTH}
                    inputStyle={styles.pinInput}
                    trailing={
                      <NUIPressable
                        borderless
                        style={styles.eyeButton}
                        onPress={() => setShowNewPin(!showNewPin)}
                        accessibilityRole="switch"
                        accessibilityState={{ checked: showNewPin }}
                        accessibilityLabel={sw ? 'Onyesha PIN mpya' : 'Show new PIN'}
                      >
                        <Ionicons
                          name={showNewPin ? 'eye-outline' : 'eye-off-outline'}
                          size={22}
                          color="#999"
                        />
                      </NUIPressable>
                    }
                />
            )}
          </form.Field>

          <form.Field name="confirmPin">
            {(field) => (
                <NUIFormField
                    {...inputTraits.pinLast}
                    ref={confirmPinRef}
                    label={sw ? 'THIBITISHA PIN MPYA' : 'CONFIRM NEW PIN'}
                    error={fieldError(field, showErrors)}
                    placeholder="****"
                    secureTextEntry={!showConfirmPin}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChangeText={(text) => field.handleChange(text.replace(/\D/g, ''))}
                    onSubmitEditing={() => form.handleSubmit()}
                    maxLength={PIN_LENGTH}
                    inputStyle={styles.pinInput}
                    trailing={
                      <NUIPressable
                        borderless
                        style={styles.eyeButton}
                        onPress={() => setShowConfirmPin(!showConfirmPin)}
                        accessibilityRole="switch"
                        accessibilityState={{ checked: showConfirmPin }}
                        accessibilityLabel={sw ? 'Onyesha uthibitisho wa PIN' : 'Show PIN confirmation'}
                      >
                        <Ionicons
                          name={showConfirmPin ? 'eye-outline' : 'eye-off-outline'}
                          size={22}
                          color="#999"
                        />
                      </NUIPressable>
                    }
                />
            )}
          </form.Field>
        </View>
        <NUIButton
          title={language === 'sw' ? 'HIFADHI PIN MPYA' : 'SAVE NEW PIN'}
          // No `disabled`: pressing validates and names the problem
          // inline, per field. See login.tsx.
          onPress={() => form.handleSubmit()}
          loading={isChangingPin}
          style={styles.saveButton}
        />
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>
            {language === 'sw' ? 'Vidokezo vya Usalama:' : 'Security Tips:'}
          </Text>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.tipText}>
              {language === 'sw'
                ? 'Tumia PIN ambayo huwezi kusahau lakini haiwezi kukisiwa'
                : 'Use a PIN you can remember but others cannot guess'}
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.tipText}>
              {language === 'sw'
                ? 'Epuka PIN rahisi kama 1234 au 0000'
                : 'Avoid simple PINs like 1234 or 0000'}
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.tipText}>
              {language === 'sw'
                ? 'Usimshirikishe mtu yeyote PIN yako'
                : 'Never share your PIN with anyone'}
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.tipText}>
              {language === 'sw'
                ? 'PIN mpya lazima iwe tofauti na PIN ya sasa'
                : 'New PIN must be different from your current PIN'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.app,
  },
  content: {
    paddingHorizontal: layout.screenGutter,
    paddingTop: spacing.lg,
    paddingBottom: PAGE_BOTTOM_PADDING,
  },
  subtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    fontWeight: '400',
    textAlign: 'center',
  },
  form: {
    gap: layout.fieldGap,
    marginBottom: layout.sectionGap,
    // No padding. `form` draws nothing — no background, no border — so its
    // padding only inset the three inputs by spacing.md on each side while
    // the Save button below sat outside it, at the full content width. Both
    // are now bounded by `content`'s gutter alone, so they line up.
  },
  pinInput: {
    letterSpacing: 2,
  },
  eyeButton: {
    padding: spacing.sm,
  },
  saveButton: {
    // Layout only. This used to spread `controls.primary` and bundle the margin
    // in with it, so migrating had to keep the margin and drop the rest.
    marginBottom: layout.sectionGap,
  },
  tipsContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: radius.sm + 4,
    padding: spacing.md,
    gap: spacing.sm + 4,
  },
  tipsTitle: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.state.success,
    marginBottom: spacing.xs,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  tipText: {
    ...typography.caption,
    color: colors.state.success,
    flex: 1,
    fontWeight: '400',
  },
});
