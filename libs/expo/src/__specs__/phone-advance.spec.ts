import {
  COUNTRIES,
  nationalNumberLength,
  isPhoneNumberComplete,
} from '../nui-country-code-picker.component';

const country = (code: string) => {
  const found = COUNTRIES.find((c) => c.code === code);
  if (!found) throw new Error(`no such country: ${code}`);
  return found;
};

describe('nationalNumberLength', () => {
  // The app defaults to Tanzania and its placeholder is a nine-digit number.
  it('knows the app’s own audience', () => {
    expect(nationalNumberLength(country('TZ'))).toBe(9);
    expect(nationalNumberLength(country('KE'))).toBe(9);
  });

  it('is undefined where there is no single answer', () => {
    expect(nationalNumberLength(country('AF'))).toBeUndefined();
  });

  it('only lists lengths that are plausible national numbers', () => {
    for (const [code, length] of Object.entries(
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('../nui-country-code-picker.component').NATIONAL_NUMBER_LENGTH
    )) {
      expect(COUNTRIES.some((c) => c.code === code)).toBe(true);
      expect(length as number).toBeGreaterThanOrEqual(6);
      expect(length as number).toBeLessThanOrEqual(12);
    }
  });
});

describe('isPhoneNumberComplete', () => {
  const TZ = nationalNumberLength(country('TZ'));

  it('advances once the national number is complete', () => {
    expect(isPhoneNumberComplete('712345678', TZ)).toBe(true);
  });

  it('does not advance while the number is short', () => {
    expect(isPhoneNumberComplete('71234567', TZ)).toBe(false);
  });

  // The regression this replaces: the old check compared against the field's
  // maximum of 12, so a nine-digit number never handed off at all.
  it('does not wait for the field maximum', () => {
    expect(isPhoneNumberComplete('712345678', 12)).toBe(false);
    expect(isPhoneNumberComplete('712345678', TZ)).toBe(true);
  });

  it('ignores spaces and dashes', () => {
    expect(isPhoneNumberComplete('712 345 678', TZ)).toBe(true);
    expect(isPhoneNumberComplete('712-345-678', TZ)).toBe(true);
  });

  // Typing 0712345678 must not lose the keyboard at the ninth digit.
  it('leaves a trunk-prefixed number alone', () => {
    expect(isPhoneNumberComplete('071234567', TZ)).toBe(false);
    expect(isPhoneNumberComplete('0712345678', TZ)).toBe(false);
  });

  it('never advances for a country with no known length', () => {
    expect(isPhoneNumberComplete('712345678', undefined)).toBe(false);
  });

  it('does not advance on an empty field', () => {
    expect(isPhoneNumberComplete('', TZ)).toBe(false);
  });
});
