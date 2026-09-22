import { TextInputProps } from 'react-native';

type Trait = Pick<
  TextInputProps,
  | 'keyboardType'
  | 'autoComplete'
  | 'textContentType'
  | 'returnKeyType'
  | 'autoCapitalize'
  | 'autoCorrect'
  | 'spellCheck'
>;

/**
 * Native keyboard and autofill traits, per kind of field.
 *
 * Every input in the app was missing these: 15 of 17 declared no `autoComplete`
 * and no `textContentType`, and not one anywhere set `returnKeyType` or
 * `autoCapitalize`. The platform was left to guess, so phone and name fields
 * never offered to autofill.
 *
 * Kept as data rather than spread by hand across the screens so the matrix can
 * be asserted in one place — the app itself has no test harness.
 *
 * React Native derives iOS `textContentType` from `autoComplete` when it can
 * (see `TextInput.js`), so `textContentType` is only stated where the
 * web-standard value has no iOS equivalent.
 */
export const inputTraits = {
  /**
   * The dial code lives in a separate picker beside the field, so this asks for
   * the national number only — `tel` invites Android to fill `+254712…` into a
   * field that already has `+254` next to it. `tel-national` has no iOS
   * mapping, hence the explicit `textContentType`.
   */
  phone: {
    keyboardType: 'phone-pad',
    autoComplete: 'tel-national',
    textContentType: 'telephoneNumber',
    returnKeyType: 'next',
    autoCapitalize: 'none',
    autoCorrect: false,
  },

  /**
   * PIN fields deliberately opt out of autofill.
   *
   * A 4-digit app PIN is not a credential a password manager should own, and
   * `textContentType: 'newPassword'` makes iOS offer to generate a strong
   * password — which can never satisfy a `maxLength={4}` numeric field. Note
   * `autoComplete: 'off'` is not a no-op: it maps to Android `off` and iOS
   * `none`, actively suppressing the prompt rather than leaving it to chance.
   *
   * `number-pad` rather than `numeric`: `numeric` gives iOS a decimal separator
   * and a sign key that a PIN can never use.
   */
  pin: {
    keyboardType: 'number-pad',
    autoComplete: 'off',
    textContentType: 'none',
    returnKeyType: 'next',
    autoCapitalize: 'none',
    autoCorrect: false,
  },

  /** The last PIN in a form — submits rather than advancing. */
  pinLast: {
    keyboardType: 'number-pad',
    autoComplete: 'off',
    textContentType: 'none',
    returnKeyType: 'done',
    autoCapitalize: 'none',
    autoCorrect: false,
  },

  givenName: {
    keyboardType: 'default',
    autoComplete: 'given-name',
    returnKeyType: 'next',
    autoCapitalize: 'words',
    // A name is not a dictionary word; autocorrect rewrites uncommon ones.
    autoCorrect: false,
    spellCheck: false,
  },

  familyName: {
    keyboardType: 'default',
    autoComplete: 'family-name',
    returnKeyType: 'done',
    autoCapitalize: 'words',
    autoCorrect: false,
    spellCheck: false,
  },

  /**
   * The first OTP box accepts the whole code so an SMS autofill is not cut to
   * one character. `one-time-code` is the portable spelling — it maps to iOS
   * `oneTimeCode` and Android `sms-otp` on its own.
   */
  otpFirst: {
    keyboardType: 'number-pad',
    autoComplete: 'one-time-code',
    autoCapitalize: 'none',
    autoCorrect: false,
  },

  /** The remaining boxes must not each offer the code again. */
  otpRest: {
    keyboardType: 'number-pad',
    autoComplete: 'off',
    textContentType: 'none',
    autoCapitalize: 'none',
    autoCorrect: false,
  },

  search: {
    keyboardType: 'default',
    autoComplete: 'off',
    textContentType: 'none',
    returnKeyType: 'search',
    autoCapitalize: 'none',
    autoCorrect: false,
  },
} as const satisfies Record<string, Trait>;

export type InputTraitKey = keyof typeof inputTraits;
