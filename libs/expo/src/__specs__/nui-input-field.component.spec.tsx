import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { NUIInputField } from '../nui-input-field.component';
import { colors } from '../theme';

describe('NUIInputField', () => {
  const noop = () => undefined;

  it('renders the placeholder and an optional label', () => {
    render(
      <NUIInputField
        label="Email"
        placeholder="you@example.com"
        value=""
        onChangeText={noop}
      />
    );
    expect(screen.getByText('Email')).toBeTruthy();
    expect(screen.getByPlaceholderText('you@example.com')).toBeTruthy();
  });

  it('reports typing back to the caller', () => {
    const onChangeText = jest.fn();
    render(
      <NUIInputField placeholder="Name" value="" onChangeText={onChangeText} />
    );
    fireEvent.changeText(screen.getByPlaceholderText('Name'), 'Amina');
    expect(onChangeText).toHaveBeenCalledWith('Amina');
  });

  // Errors must carry text, not just a border colour (WCAG 1.4.1).
  it('renders error text, not only a coloured border', () => {
    render(
      <NUIInputField
        placeholder="Email"
        value="nope"
        onChangeText={noop}
        error="Enter a valid email address"
      />
    );
    expect(screen.getByText('Enter a valid email address')).toBeTruthy();
  });

  it('has no error text when no error is given', () => {
    render(
      <NUIInputField placeholder="Email" value="" onChangeText={noop} />
    );
    expect(screen.queryByRole('alert')).toBeNull();
  });

  // The placeholder used to inherit the platform default, which is far lighter
  // than the 4.5:1 floor.
  it('sets an explicit placeholder colour from the tokens', () => {
    render(
      <NUIInputField placeholder="Email" value="" onChangeText={noop} />
    );
    expect(
      screen.getByPlaceholderText('Email').props.placeholderTextColor
    ).toBe(colors.text.placeholder);
  });
});
