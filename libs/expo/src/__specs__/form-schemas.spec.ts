import { z } from 'zod';
import {
  MAX_NAME_LENGTH,
  nameField,
  newPinField,
  otpField,
  phoneDigits,
  phoneField,
  pinField,
  withMatchingPins,
} from '../form-schemas';

const msg = (schema: z.ZodTypeAny, value: unknown): string | undefined => {
  const result = schema.safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
};

const phone = phoneField({
  required: 'Phone number is required',
  length: 'Enter 6-12 digits',
  charset: 'Only digits, spaces, or dashes allowed',
});

describe('phoneField', () => {
  it('accepts a national number', () => {
    expect(msg(phone, '712345678')).toBeUndefined();
  });

  // People type them this way and the country picker supplies the dial code.
  it('accepts separators, which do not count toward the length', () => {
    expect(msg(phone, '712 345 678')).toBeUndefined();
    expect(msg(phone, '712-345-678')).toBeUndefined();
  });

  it('names an empty field as required rather than as the wrong length', () => {
    expect(msg(phone, '')).toBe('Phone number is required');
  });

  it('rejects too few and too many digits', () => {
    expect(msg(phone, '12345')).toBe('Enter 6-12 digits');
    expect(msg(phone, '1234567890123')).toBe('Enter 6-12 digits');
  });

  // A leading + is what Android autofill supplies.
  it('reports a stray character as a charset problem, not a length one', () => {
    expect(msg(phone, '+254712345678')).toBe('Only digits, spaces, or dashes allowed');
  });
});

const pin = pinField({ required: 'PIN is required', length: 'Enter exactly 4 digits' });

describe('pinField', () => {
  it('accepts four digits', () => {
    expect(msg(pin, '5839')).toBeUndefined();
  });

  it('distinguishes empty from wrong length', () => {
    expect(msg(pin, '')).toBe('PIN is required');
    expect(msg(pin, '583')).toBe('Enter exactly 4 digits');
  });

  it('rejects non-digits', () => {
    expect(msg(pin, '58a9')).toBe('Enter exactly 4 digits');
  });

  // The sign-in field accepts any existing PIN, including a weak one chosen
  // before the rule existed — only choosing a NEW one is restricted.
  it('allows a weak PIN, because signing in is not choosing one', () => {
    expect(msg(pin, '1234')).toBeUndefined();
  });
});

describe('newPinField', () => {
  const newPin = newPinField({
    required: 'PIN is required',
    length: 'Enter exactly 4 digits',
    weak: 'Choose a less predictable PIN',
  });

  it('accepts a non-obvious PIN', () => {
    expect(msg(newPin, '5839')).toBeUndefined();
  });

  it('rejects repeats and runs', () => {
    expect(msg(newPin, '1111')).toBe('Choose a less predictable PIN');
    expect(msg(newPin, '1234')).toBe('Choose a less predictable PIN');
    expect(msg(newPin, '4321')).toBe('Choose a less predictable PIN');
  });
});

describe('otpField', () => {
  const otp = otpField({ required: 'Enter the code', length: 'The code is 6 digits' });

  it('accepts six digits', () => {
    expect(msg(otp, '123456')).toBeUndefined();
  });

  it('rejects a partial code', () => {
    expect(msg(otp, '12345')).toBe('The code is 6 digits');
  });
});

describe('nameField', () => {
  const first = nameField({ required: 'First name is required', tooLong: 'Too long' });
  const last = nameField({ tooLong: 'Too long' });

  it('requires a name only when asked to', () => {
    expect(msg(first, '')).toBe('First name is required');
    expect(msg(last, '')).toBeUndefined();
  });

  // Whitespace is not a name.
  it('treats a blank-only value as empty', () => {
    expect(msg(first, '   ')).toBe('First name is required');
  });

  it('caps the length', () => {
    expect(msg(first, 'a'.repeat(MAX_NAME_LENGTH))).toBeUndefined();
    expect(msg(first, 'a'.repeat(MAX_NAME_LENGTH + 1))).toBe('Too long');
  });
});

describe('withMatchingPins', () => {
  const schema = withMatchingPins(
    z.object({ newPin: z.string(), confirmPin: z.string() }),
    { pin: 'newPin', confirm: 'confirmPin' },
    'PINs do not match'
  );

  it('accepts a matching pair', () => {
    expect(schema.safeParse({ newPin: '5839', confirmPin: '5839' }).success).toBe(true);
  });

  it('reports the mismatch against the confirm field', () => {
    const result = schema.safeParse({ newPin: '5839', confirmPin: '5830' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['confirmPin']);
      expect(result.error.issues[0].message).toBe('PINs do not match');
    }
  });

  // Otherwise the mismatch fires on the first keystroke of the confirm box,
  // telling the user they are wrong before they have finished being right.
  it('stays quiet while the confirm field is still empty', () => {
    expect(schema.safeParse({ newPin: '5839', confirmPin: '' }).success).toBe(true);
  });
});

describe('phoneDigits', () => {
  it('keeps only digits', () => {
    expect(phoneDigits('+254 712-345 678')).toBe('254712345678');
  });
});
