import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { NUIPressable } from '../nui-pressable.component';

describe('NUIPressable', () => {
  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(
      <NUIPressable onPress={onPress}>
        <Text>Tap</Text>
      </NUIPressable>
    );
    fireEvent.press(screen.getByText('Tap'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    render(
      <NUIPressable onPress={onPress} disabled>
        <Text>Tap</Text>
      </NUIPressable>
    );
    fireEvent.press(screen.getByText('Tap'));
    expect(onPress).not.toHaveBeenCalled();
  });

  // It replaced 84 touchables, only 20 of which declared a role.
  it('announces as a button by default', () => {
    render(
      <NUIPressable onPress={() => undefined}>
        <Text>Tap</Text>
      </NUIPressable>
    );
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('lets the role be overridden for non-button controls', () => {
    render(
      <NUIPressable onPress={() => undefined} accessibilityRole="radio">
        <Text>Pick</Text>
      </NUIPressable>
    );
    expect(screen.getByRole('radio')).toBeTruthy();
  });

  it('reports disabled to assistive tech, not just visually', () => {
    render(
      <NUIPressable onPress={() => undefined} disabled>
        <Text>Tap</Text>
      </NUIPressable>
    );
    expect(screen.getByRole('button').props.accessibilityState.disabled).toBe(
      true
    );
  });

  // Pressable defaults focusable to true regardless of `disabled`, where
  // TouchableOpacity derived it. Without the override, assistive tech stops on
  // a button that cannot be pressed.
  it('is not focusable when disabled', () => {
    render(
      <NUIPressable onPress={() => undefined} disabled>
        <Text>Tap</Text>
      </NUIPressable>
    );
    expect(screen.getByRole('button').props.focusable).toBe(false);
  });

  it('is focusable when enabled', () => {
    render(
      <NUIPressable onPress={() => undefined}>
        <Text>Tap</Text>
      </NUIPressable>
    );
    expect(screen.getByRole('button').props.focusable).toBe(true);
  });

  it('keeps caller-supplied accessibility state alongside disabled', () => {
    render(
      <NUIPressable
        onPress={() => undefined}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: true }}
      >
        <Text>Symptom</Text>
      </NUIPressable>
    );
    const state = screen.getByRole('checkbox').props.accessibilityState;
    expect(state.checked).toBe(true);
    expect(state.disabled).toBe(false);
  });
});
