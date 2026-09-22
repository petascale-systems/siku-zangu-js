import { z } from 'zod';

/**
 * Field rules shared by the app's forms.
 *
 * These exist so a rule is written once and then drives *both* the inline
 * error and the submit check. Every screen used to hold two hand-written
 * copies — a `useEffect` that set an error string, and a separate set of `if`s
 * inside the submit handler — and when the two drifted apart the form either
 * refused a valid entry or accepted an invalid one with no message.
 *
 * Messages are passed in rather than looked up here: the copy lives in
 * `i18n/screen-copy.ts` under a per-screen namespace, and this library has no
 * business knowing those keys. Build a schema inside the component with the
 * screen's own `t(...)` and memoise it on the language.
 */

/** The digits of a phone number, ignoring the spaces and dashes people type. */
export const phoneDigits = (value: string): string => value.replace(/\D/g, '');

export const PIN_LENGTH = 4;
export const OTP_LENGTH = 6;

/**
 * PINs a user must not be allowed to choose. Repeats and straight runs are the
 * first things guessed, and a 4-digit space is small enough that it matters.
 */
export const WEAK_PINS: readonly string[] = [
  '0000', '1111', '2222', '3333', '4444',
  '5555', '6666', '7777', '8888', '9999',
  '1234', '4321', '1122', '2211',
];

export type PhoneMessages = {
  required: string;
  /** Shown when the digit count is outside 6–12. */
  length: string;
  /** Shown when the raw text holds anything but digits, spaces and dashes. */
  charset: string;
};

/**
 * A national subscriber number, without the dial code — the country picker
 * beside the field supplies that.
 */
export const phoneField = (messages: PhoneMessages) =>
  z
    .string()
    .min(1, messages.required)
    .refine((value) => !/[^0-9\s-]/.test(value), messages.charset)
    .refine((value) => /^\d{6,12}$/.test(phoneDigits(value)), messages.length);

export type PinMessages = {
  required: string;
  /** Shown when the PIN is not exactly four digits. */
  length: string;
};

export const pinField = (messages: PinMessages) =>
  z
    .string()
    .min(1, messages.required)
    .refine((value) => new RegExp(`^\\d{${PIN_LENGTH}}$`).test(value), messages.length);

/** A PIN that must also not be trivially guessable. Used when choosing a new one. */
export const newPinField = (messages: PinMessages & { weak: string }) =>
  pinField(messages).refine((value) => !WEAK_PINS.includes(value), messages.weak);

export const otpField = (messages: { required: string; length: string }) =>
  z
    .string()
    .min(1, messages.required)
    .refine((value) => new RegExp(`^\\d{${OTP_LENGTH}}$`).test(value), messages.length);

export type NameMessages = { required?: string; tooLong: string };

export const MAX_NAME_LENGTH = 50;

/**
 * A person's name. `required` is optional because the surname is not: pass it
 * for a field that must be filled, leave it out for one that may be blank.
 */
export const nameField = (messages: NameMessages) => {
  const base = z.string().trim().max(MAX_NAME_LENGTH, messages.tooLong);
  return messages.required ? base.min(1, messages.required) : base;
};

/**
 * Attaches "these two must match" to a two-PIN form.
 *
 * A cross-field rule cannot live on either field's own schema, and putting it
 * only in the submit handler is what let the confirm box sit silently wrong
 * until the user pressed the button.
 */
export const withMatchingPins = <T extends z.ZodTypeAny>(
  schema: T,
  fields: { pin: string; confirm: string },
  message: string
) =>
  schema.refine(
    (values) =>
      (values as Record<string, string>)[fields.confirm].length === 0 ||
      (values as Record<string, string>)[fields.pin] ===
        (values as Record<string, string>)[fields.confirm],
    { message, path: [fields.confirm] }
  );
