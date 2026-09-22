import { inputTraits } from '../input-traits';

const ALL = Object.entries(inputTraits);
const PIN_KEYS = ['pin', 'pinLast'] as const;

describe('inputTraits', () => {
  it.each(ALL)('%s never sets inputMode alongside keyboardType', (_k, trait) => {
    // React Native gives inputMode precedence and silently drops keyboardType.
    expect(trait).not.toHaveProperty('inputMode');
  });

  it.each(ALL)('%s turns autocorrect off', (_k, trait) => {
    expect(trait.autoCorrect).toBe(false);
  });

  // The app ships one palette. `keyboardAppearance` defaults to 'default',
  // which means "follow the iOS trait collection" — so a field that omits it
  // would raise a dark keyboard under a light app the moment the native pin in
  // ios/Sikuzangu/Info.plist is relaxed. Asserting it per kind is what stops a
  // newly added trait from being the one that forgets.
  it.each(ALL)('%s pins the keyboard to the light appearance', (_k, trait) => {
    expect(trait.keyboardAppearance).toBe('light');
  });

  describe('phone', () => {
    // `tel-national` has no iOS mapping, so textContentType cannot be derived.
    it('states textContentType explicitly', () => {
      expect(inputTraits.phone.autoComplete).toBe('tel-national');
      expect(inputTraits.phone.textContentType).toBe('telephoneNumber');
    });

    // `tel` would have Android fill the dial code into a field that already
    // sits next to a country picker.
    it('asks for the national number, not the full one', () => {
      expect(inputTraits.phone.autoComplete).not.toBe('tel');
    });
  });

  describe('PIN', () => {
    it.each(PIN_KEYS)('%s suppresses autofill entirely', (key) => {
      // 'off' is not a no-op: it maps to Android `off` / iOS `none`. Leaving it
      // unset lets the platform guess, which is what every field did before.
      expect(inputTraits[key].autoComplete).toBe('off');
      expect(inputTraits[key].textContentType).toBe('none');
    });

    // newPassword makes iOS offer a generated strong password for a 4-digit
    // numeric field it can never satisfy.
    it.each(PIN_KEYS)('%s never asks for a new password', (key) => {
      expect(inputTraits[key].textContentType).not.toBe('newPassword');
    });

    // `numeric` gives iOS a decimal separator and a sign key.
    it.each(PIN_KEYS)('%s uses a digits-only keypad', (key) => {
      expect(inputTraits[key].keyboardType).toBe('number-pad');
    });

    it('advances mid-form and submits at the end', () => {
      expect(inputTraits.pin.returnKeyType).toBe('next');
      expect(inputTraits.pinLast.returnKeyType).toBe('done');
    });
  });

  describe('names', () => {
    it('capitalises words but does not autocorrect them', () => {
      for (const key of ['givenName', 'familyName'] as const) {
        expect(inputTraits[key].autoCapitalize).toBe('words');
        expect(inputTraits[key].spellCheck).toBe(false);
      }
    });

    it('offers the right half of the name to autofill', () => {
      expect(inputTraits.givenName.autoComplete).toBe('given-name');
      expect(inputTraits.familyName.autoComplete).toBe('family-name');
    });
  });

  describe('OTP', () => {
    // The portable spelling: it maps to iOS oneTimeCode and Android sms-otp on
    // its own, so neither needs stating.
    it('offers the code on the first box only', () => {
      expect(inputTraits.otpFirst.autoComplete).toBe('one-time-code');
      expect(inputTraits.otpRest.autoComplete).toBe('off');
    });
  });
});
