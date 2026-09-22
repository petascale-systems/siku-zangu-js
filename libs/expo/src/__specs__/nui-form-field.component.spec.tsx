import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import {
  NUIFormField,
  fieldError,
  fieldErrorMessage,
} from '../nui-form-field.component';
import { colors, fields } from '../theme';
import { TOUCH_TARGET } from '../theme';

describe('fieldErrorMessage', () => {
  // zod 4 emits Standard Schema issues, which are objects with `message`.
  it('reads a Standard Schema issue', () => {
    expect(fieldErrorMessage([{ message: 'Phone number is required' }])).toBe(
      'Phone number is required'
    );
  });

  it('reads a bare string from a plain validator', () => {
    expect(fieldErrorMessage(['Too short'])).toBe('Too short');
  });

  it('is undefined when the field is valid', () => {
    expect(fieldErrorMessage([])).toBeUndefined();
    expect(fieldErrorMessage(undefined)).toBeUndefined();
  });

  // One problem at a time: the user only has to fix the first anyway.
  it('shows only the first of several', () => {
    expect(fieldErrorMessage([{ message: 'A' }, { message: 'B' }])).toBe('A');
  });

  it('ignores an issue with no message rather than rendering "undefined"', () => {
    expect(fieldErrorMessage([{ code: 'custom' }])).toBeUndefined();
  });
});

describe('fieldError', () => {
  const field = (errors: unknown[], isBlurred: boolean) => ({
    state: { meta: { errors, isBlurred } },
  });

  it('says nothing while the user is still in the field', () => {
    expect(fieldError(field([{ message: 'Enter 6-12 digits' }], false))).toBeUndefined();
  });

  it('reveals the message once they leave it', () => {
    expect(fieldError(field([{ message: 'Enter 6-12 digits' }], true))).toBe(
      'Enter 6-12 digits'
    );
  });

  // The regression this exists for. Validating only on blur left the message
  // up after the value had been corrected, because nothing re-ran until the
  // next blur — an error on a form that was already fine.
  it('clears as soon as the value is valid, without waiting for another blur', () => {
    const blurredAndNowValid = field([], true);
    expect(fieldError(blurredAndNowValid)).toBeUndefined();
  });

  it('reveals everything at once for a failed submit', () => {
    // Never visited, so `isBlurred` is false — but the button was pressed.
    expect(fieldError(field([{ message: 'PIN is required' }], false), true)).toBe(
      'PIN is required'
    );
  });

  it('still says nothing on submit when the field is valid', () => {
    expect(fieldError(field([], false), true)).toBeUndefined();
  });
});

describe('NUIFormField', () => {
  it('labels the input, so the label is also its accessible name', () => {
    render(<NUIFormField label="Phone number" value="" onChangeText={jest.fn()} />);
    expect(screen.getByLabelText('Phone number')).toBeTruthy();
  });

  it('shows no message while the field is valid', () => {
    render(<NUIFormField label="PIN" value="" onChangeText={jest.fn()} />);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  // Inline, under the field — not a toast.
  it('renders the error beneath the field as an alert', () => {
    render(
      <NUIFormField label="PIN" value="" onChangeText={jest.fn()} error="Enter exactly 4 digits" />
    );
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText('Enter exactly 4 digits')).toBeTruthy();
  });

  it('marks the input invalid so the message is not the only signal', () => {
    render(<NUIFormField label="PIN" value="" onChangeText={jest.fn()} error="Required" />);
    expect(screen.getByLabelText('PIN').props['aria-invalid']).toBe(true);
  });

  it('keeps the touch target at the platform floor', () => {
    render(<NUIFormField label="PIN" value="" onChangeText={jest.fn()} />);
    const style = StyleSheet.flatten(screen.getByLabelText('PIN').props.style);
    expect(style.minHeight).toBe(fields.base.minHeight);
    expect(style.minHeight).toBeGreaterThanOrEqual(TOUCH_TARGET);
  });

  // The wrapper owns the horizontal padding so an icon sits inside the border.
  it('leaves horizontal padding to the wrapper', () => {
    render(<NUIFormField label="PIN" value="" onChangeText={jest.fn()} />);
    const style = StyleSheet.flatten(screen.getByLabelText('PIN').props.style);
    expect(style.paddingHorizontal).toBe(0);
    expect(style.paddingVertical).toBe(fields.base.paddingVertical);
  });

  // The regression: with `paddingHorizontal: 0` on the input, the phone number
  // ran straight into the dial-code picker beside it.
  it('separates leading and trailing content from the text', () => {
    render(
      <NUIFormField
        label="Phone number"
        value=""
        onChangeText={jest.fn()}
        leading={<Text>+255</Text>}
      />
    );
    // The wrapper is the first ancestor carrying the field's own padding;
    // the tree between it and the input is the renderer's business.
    let node = screen.getByLabelText('Phone number').parent;
    let style: Record<string, number> | undefined;
    while (node) {
      const flat = StyleSheet.flatten(node.props?.style) as Record<string, number>;
      if (flat?.paddingHorizontal === fields.base.paddingHorizontal) {
        style = flat;
        break;
      }
      node = node.parent;
    }
    expect(style).toBeDefined();
    expect(style?.gap).toBeGreaterThan(0);
  });

  it('renders leading and trailing content', () => {
    render(
      <NUIFormField
        label="Phone number"
        value=""
        onChangeText={jest.fn()}
        leading={<Text>+255</Text>}
        trailing={<Text>eye</Text>}
      />
    );
    expect(screen.getByText('+255')).toBeTruthy();
    expect(screen.getByText('eye')).toBeTruthy();
  });

  // A validation failure is not an accent colour.
  it('uses the error colour, not the brand, for the message', () => {
    render(<NUIFormField label="PIN" value="" onChangeText={jest.fn()} error="Required" />);
    const style = StyleSheet.flatten(screen.getByText('Required').props.style);
    expect(style.color).toBe(colors.state.error);
  });
});
