import React from 'react';
import { Text } from 'react-native';
import { useForm, useStore, revalidateLogic } from '@tanstack/react-form';
import { z } from 'zod';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { NUIFormField, fieldError } from '../nui-form-field.component';
import { phoneField, pinField } from '../form-schemas';

/**
 * The sign-in form's shape, reduced to the part that broke.
 *
 * TanStack keeps an error per SOURCE — `errorMap.onBlur`, `errorMap.onChange`,
 * `errorMap.onSubmit` — and a validation pass only replaces its own entry. With
 * a validator registered per event, an error written by one event could not be
 * cleared by another, so a message outlived the value that caused it. These
 * tests are the two ways a user actually hit that.
 */
function SignIn() {
  const schema = z.object({
    phone: phoneField({
      required: 'Phone number is required',
      length: 'Enter 6-12 digits',
      charset: 'Only digits, spaces, or dashes allowed',
    }),
    pin: pinField({ required: 'PIN is required', length: 'Enter exactly 4 digits' }),
  });
  const form = useForm({
    defaultValues: { phone: '', pin: '' },
    validationLogic: revalidateLogic({ mode: 'change', modeAfterSubmission: 'change' }),
    validators: { onDynamic: schema },
    onSubmit: async () => undefined,
  });
  const showErrors = useStore(form.store, (s) => s.submissionAttempts > 0);
  return (
    <>
      <form.Field name="phone">
        {(field) => (
          <NUIFormField
            label="Phone number"
            error={fieldError(field, showErrors)}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChangeText={(t) => field.handleChange(t.replace(/[^0-9\s-]/g, ''))}
          />
        )}
      </form.Field>
      <form.Field name="pin">
        {(field) => (
          <NUIFormField
            label="PIN"
            error={fieldError(field, showErrors)}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChangeText={(t) => field.handleChange(t.replace(/\D/g, ''))}
          />
        )}
      </form.Field>
      <Text accessibilityRole="button" onPress={() => form.handleSubmit()}>
        Ingia
      </Text>
    </>
  );
}

describe('validation staleness', () => {
  // How it was actually hit: the phone field's blur runs the FORM-level
  // validator, which sees the still-empty PIN and stamps "PIN is required" on
  // it. Typing the PIN then has to clear that, or pressing Login reveals a
  // message about a field that is now filled in.
  it('does not keep a PIN error stamped by the phone field losing focus', async () => {
    render(<SignIn />);
    fireEvent.changeText(screen.getByLabelText('Phone number'), '712345678');
    fireEvent(screen.getByLabelText('Phone number'), 'blur');
    fireEvent.changeText(screen.getByLabelText('PIN'), '1234');
    fireEvent.press(screen.getByText('Ingia'));
    await waitFor(() => {
      expect(screen.queryByText('PIN is required')).toBeNull();
      expect(screen.queryByText('Enter exactly 4 digits')).toBeNull();
    });
  });

  // The other route in: submit on an empty form, then fill it.
  it('clears a submit-time error once the value is corrected', async () => {
    render(<SignIn />);
    fireEvent.press(screen.getByText('Ingia'));
    await waitFor(() => expect(screen.queryByText('PIN is required')).toBeTruthy());
    fireEvent.changeText(screen.getByLabelText('PIN'), '1234');
    await waitFor(() => expect(screen.queryByText('PIN is required')).toBeNull());
  });

  // The reveal rule still holds: no scolding before the user leaves the field.
  it('says nothing while the first field is still being typed in', () => {
    render(<SignIn />);
    fireEvent.changeText(screen.getByLabelText('Phone number'), '71');
    expect(screen.queryByText('Enter 6-12 digits')).toBeNull();
  });

  it('still reports a genuinely empty form when Login is pressed', async () => {
    render(<SignIn />);
    fireEvent.press(screen.getByText('Ingia'));
    await waitFor(() => {
      expect(screen.getByText('Phone number is required')).toBeTruthy();
      expect(screen.getByText('PIN is required')).toBeTruthy();
    });
  });
});
