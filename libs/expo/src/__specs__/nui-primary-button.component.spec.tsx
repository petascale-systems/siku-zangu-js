import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { NUIPrimaryButton } from '../nui-primary-button.component';

describe('NUIPrimaryButton', () => {
  it('renders its title', () => {
    render(<NUIPrimaryButton title="Save" onPress={() => undefined} />);
    expect(screen.getByText('Save')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<NUIPrimaryButton title="Save" onPress={onPress} />);
    fireEvent.press(screen.getByText('Save'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  // `disabled` was accepted and then ignored, so a disabled button still fired.
  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    render(<NUIPrimaryButton title="Save" onPress={onPress} disabled />);
    fireEvent.press(screen.getByText('Save'));
    expect(onPress).not.toHaveBeenCalled();
  });

  describe('loading', () => {
    it('replaces the label with a spinner', () => {
      render(<NUIPrimaryButton title="Save" onPress={() => undefined} loading />);
      expect(screen.queryByText('Save')).toBeNull();
      expect(screen.getByRole('button')).toBeTruthy();
    });

    // The point of the prop: a slow request must not be submittable twice.
    it('blocks presses while in flight', () => {
      const onPress = jest.fn();
      render(<NUIPrimaryButton title="Save" onPress={onPress} loading />);
      fireEvent.press(screen.getByRole('button'));
      expect(onPress).not.toHaveBeenCalled();
    });

    it('announces itself as busy, not merely unavailable', () => {
      render(<NUIPrimaryButton title="Save" onPress={() => undefined} loading />);
      const state = screen.getByRole('button').props.accessibilityState;
      expect(state.busy).toBe(true);
      expect(state.disabled).toBe(true);
    });

    it('is not busy when simply disabled', () => {
      render(<NUIPrimaryButton title="Save" onPress={() => undefined} disabled />);
      const state = screen.getByRole('button').props.accessibilityState;
      expect(state.busy).toBe(false);
      expect(screen.getByText('Save')).toBeTruthy();
    });

    it('keeps the accessible label while loading', () => {
      render(
        <NUIPrimaryButton
          title="Save"
          onPress={() => undefined}
          loading
          accessibilityLabel="Save changes"
        />
      );
      expect(screen.getByLabelText('Save changes')).toBeTruthy();
    });
  });
});
