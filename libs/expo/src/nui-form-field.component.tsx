import React, { forwardRef } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { colors, fields, radius, spacing } from './theme';
import { MAX_FONT_SCALE, typography } from './typography';

/**
 * Pulls the message out of a TanStack Form field's `meta.errors`.
 *
 * The array holds whatever the validator produced. A Standard Schema issue —
 * which is what zod 4 emits — is an object with `message`; a plain function
 * validator may return a bare string. Only the first is shown: a field with
 * three problems still only needs the user to fix one thing next.
 */
export const fieldErrorMessage = (
  errors: readonly unknown[] | undefined
): string | undefined => {
  const first = errors?.[0];
  if (!first) return undefined;
  if (typeof first === 'string') return first;
  const message = (first as { message?: unknown }).message;
  return typeof message === 'string' ? message : undefined;
};

/** The shape this module needs from a TanStack Form field. */
type FieldLike = {
  state: { meta: { errors: readonly unknown[]; isBlurred: boolean } };
};

/**
 * The message a field should be SHOWING — which is not the same as the message
 * it has.
 *
 * Validators run on every keystroke, so the error a field holds always
 * reflects the value in it right now. That matters: validating only on blur
 * left a message on screen after the value had been corrected, because nothing
 * re-ran until the field was blurred again. The user saw an error on a form
 * that was already fine.
 *
 * Computing eagerly and *revealing* late is what gives both halves: no
 * scolding someone halfway through typing their first digit, and no stale
 * message once they have fixed it. A field reveals its error once the user has
 * left it, and `showAll` reveals every field's at once — pass
 * `submissionAttempts > 0`, so pressing the button on an untouched form still
 * explains itself.
 */
export const fieldError = (
  field: FieldLike,
  showAll = false
): string | undefined =>
  showAll || field.state.meta.isBlurred
    ? fieldErrorMessage(field.state.meta.errors)
    : undefined;

export type NUIFormFieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
  /** The message to show beneath the field, or nothing when it is valid. */
  error?: string;
  /** Sits inside the field's border, e.g. a PIN visibility toggle. */
  trailing?: React.ReactNode;
  /** Sits inside the border before the input, e.g. a dial-code picker. */
  leading?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  /** Applies to the `TextInput` itself, e.g. letter spacing on a PIN. */
  inputStyle?: StyleProp<TextStyle>;
};

/**
 * A labelled text field with its error message inline, beneath it.
 *
 * Every form in the app used to build this by hand: a label `Text`, a wrapper
 * `View` toggling a red border, a `TextInput`, and a conditional error `Text` —
 * nine times, with the spacing and the error colour drifting between them.
 *
 * Deliberately presentational. It takes a value, a change handler and an error
 * string, so it works with TanStack Form (`field.state.value`,
 * `field.handleChange`, `fieldErrorMessage(field.state.meta.errors)`) without
 * this library having to know the form generics, and it stays usable for the
 * few inputs that are not part of a form.
 *
 * The error is wired to `accessibilityLabel` on the message and the field is
 * marked invalid, so a screen reader reaches the reason rather than announcing
 * an unexplained text box.
 */
export const NUIFormField = forwardRef<TextInput, NUIFormFieldProps>(
  (
    { label, error, trailing, leading, containerStyle, inputStyle, ...input },
    ref
  ) => {
    const hasError = !!error;
    return (
      <View style={[styles.container, containerStyle]}>
        <Text style={styles.label} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {label}
        </Text>
        <View style={[styles.wrapper, hasError && styles.wrapperError]}>
          {leading}
          <TextInput
            ref={ref}
            style={[styles.input, inputStyle]}
            placeholderTextColor={colors.text.placeholder}
            // The app ships one palette, so the keyboard is pinned to match it
            // rather than following the OS. Every call site also carries this
            // via `inputTraits`; it is defaulted here so a field that spreads
            // no trait cannot be the one that comes up dark.
            keyboardAppearance="light"
            accessibilityLabel={label}
            // Announces the field as invalid, so the message below is not the
            // only signal that something is wrong.
            aria-invalid={hasError}
            {...input}
          />
          {trailing}
        </View>
        {hasError ? (
          <Text
            style={styles.error}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
            accessibilityRole="alert"
          >
            {error}
          </Text>
        ) : null}
      </View>
    );
  }
);

NUIFormField.displayName = 'NUIFormField';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    // Label, box and error sit close together so they read as one field. The
    // distance to the NEXT field comes from the form's `layout.fieldGap`,
    // which is wider — otherwise this field's error looks like the next
    // field's label.
    gap: spacing.xs + 2,
  },
  label: {
    ...typography.caption,
    fontWeight: '400',
    color: colors.text.primary,
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderRadius: radius.sm + 2,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    // Matches `fields.base`, so a field with an icon lines up with one without.
    paddingHorizontal: fields.base.paddingHorizontal,
    // Separates the leading and trailing slots from the text. The input itself
    // has `paddingHorizontal: 0` so those slots sit inside the same border, so
    // without this the phone number ran straight into the dial-code picker and
    // a PIN ran into the visibility toggle.
    gap: spacing.sm + 4,
  },
  // The error border is the state.error red, not the brand pink the screens
  // were using — a validation failure should not read as an accent.
  wrapperError: {
    borderColor: colors.state.error,
    borderWidth: 2,
  },
  input: {
    ...fields.base,
    ...typography.body,
    flex: 1,
    // The wrapper owns the horizontal padding and the corners, so leading and
    // trailing content sits inside the same border as the text. `fields.base`
    // supplies the vertical padding and the 48pt minimum height, which is what
    // keeps the touch target legal at any text size.
    paddingHorizontal: 0,
    borderRadius: 0,
    color: colors.text.primary,
  },
  error: {
    ...typography.label,
    fontWeight: '400',
    color: colors.state.error,
  },
});
