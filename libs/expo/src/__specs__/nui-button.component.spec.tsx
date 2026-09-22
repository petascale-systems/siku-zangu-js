import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { NUIButton, NUIButtonVariant } from '../nui-button.component';
import { controls } from '../theme';

const VARIANTS: NUIButtonVariant[] = [
  'primary',
  'secondary',
  'tertiary',
  'destructive',
];

const flatten = (style: unknown): Record<string, unknown> =>
  Object.assign({}, ...[style].flat(Infinity).filter(Boolean));

describe('NUIButton', () => {
  it.each(VARIANTS)('renders its title in the %s tier', (variant) => {
    render(<NUIButton title="Save" onPress={() => undefined} variant={variant} />);
    expect(screen.getByText('Save')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<NUIButton title="Save" onPress={onPress} />);
    fireEvent.press(screen.getByText('Save'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    render(<NUIButton title="Save" onPress={onPress} disabled />);
    fireEvent.press(screen.getByText('Save'));
    expect(onPress).not.toHaveBeenCalled();
  });

  describe('loading', () => {
    it('replaces the label with a spinner', () => {
      render(<NUIButton title="Save" onPress={() => undefined} loading />);
      expect(screen.queryByText('Save')).toBeNull();
      expect(screen.getByRole('button')).toBeTruthy();
    });

    // A slow request must not be submittable twice.
    it('blocks presses while in flight', () => {
      const onPress = jest.fn();
      render(<NUIButton title="Save" onPress={onPress} loading />);
      fireEvent.press(screen.getByRole('button'));
      expect(onPress).not.toHaveBeenCalled();
    });

    it('announces itself as busy, not merely unavailable', () => {
      render(<NUIButton title="Save" onPress={() => undefined} loading />);
      const state = screen.getByRole('button').props.accessibilityState;
      expect(state.busy).toBe(true);
      expect(state.disabled).toBe(true);
    });

    it('is not busy when simply disabled', () => {
      render(<NUIButton title="Save" onPress={() => undefined} disabled />);
      expect(screen.getByRole('button').props.accessibilityState.busy).toBe(
        false
      );
    });

    it('keeps the accessible label while loading', () => {
      render(
        <NUIButton
          title="Save"
          onPress={() => undefined}
          loading
          accessibilityLabel="Save changes"
        />
      );
      expect(screen.getByLabelText('Save changes')).toBeTruthy();
    });
  });

  // The tiers already existed in the theme; ~30 call sites re-implemented them
  // by hand. These assert the button actually draws from the tokens.
  describe('tiers come from the design system', () => {
    it('fills the destructive tier with the error colour, not the brand', () => {
      render(
        <NUIButton title="Delete" onPress={() => undefined} variant="destructive" />
      );
      const style = flatten(screen.getByRole('button').props.style);
      expect(style.backgroundColor).toBe(controls.destructive.backgroundColor);
      expect(style.backgroundColor).not.toBe(controls.primary.backgroundColor);
    });

    it('draws the secondary tier as an outline, not a fill', () => {
      render(
        <NUIButton title="Cancel" onPress={() => undefined} variant="secondary" />
      );
      const style = flatten(screen.getByRole('button').props.style);
      expect(style.backgroundColor).toBe('transparent');
      expect(style.borderWidth).toBeGreaterThan(0);
    });

    it('swaps to the disabled fill and its darker label', () => {
      render(<NUIButton title="Save" onPress={() => undefined} disabled />);
      const style = flatten(screen.getByRole('button').props.style);
      expect(style.backgroundColor).toBe(controls.disabled.backgroundColor);
      // White on the pale disabled fill was 1.65:1 — effectively invisible.
      const label = flatten(screen.getByText('Save').props.style);
      expect(label.color).toBe(controls.disabledLabel.color);
    });
  });
});
