import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { NUICard } from '../nui-card.component';
import { surfaces } from '../theme';

const flatten = (style: unknown): Record<string, unknown> =>
  Object.assign({}, ...[style].flat(Infinity).filter(Boolean));

describe('NUICard', () => {
  it('renders its children', () => {
    render(
      <NUICard>
        <Text>Your Log</Text>
      </NUICard>
    );
    expect(screen.getByText('Your Log')).toBeTruthy();
  });

  // A plain card is not a control, so it must not announce as one.
  it('is not a button when it has no onPress', () => {
    render(
      <NUICard>
        <Text>Your Log</Text>
      </NUICard>
    );
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('becomes a real control when given onPress', () => {
    const onPress = jest.fn();
    render(
      <NUICard onPress={onPress} accessibilityLabel="Open log">
        <Text>Your Log</Text>
      </NUICard>
    );
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Open log')).toBeTruthy();
  });

  describe('surfaces come from the design system', () => {
    it('uses the plain card surface by default', () => {
      render(
        <NUICard testID="c">
          <Text>x</Text>
        </NUICard>
      );
      const style = flatten(screen.getByTestId('c').props.style);
      expect(style.backgroundColor).toBe(surfaces.card.backgroundColor);
      expect(style.borderRadius).toBe(surfaces.card.borderRadius);
    });

    it('adds a border for the outlined variant', () => {
      render(
        <NUICard variant="cardOutlined" testID="c">
          <Text>x</Text>
        </NUICard>
      );
      const style = flatten(screen.getByTestId('c').props.style);
      expect(style.borderWidth).toBeGreaterThan(0);
    });

    // The one shadow recipe in the system; anything else is a divergence.
    it('is the only variant that carries a shadow', () => {
      render(
        <>
          <NUICard variant="elevated" testID="e">
            <Text>x</Text>
          </NUICard>
          <NUICard testID="p">
            <Text>x</Text>
          </NUICard>
        </>
      );
      expect(flatten(screen.getByTestId('e').props.style).shadowOpacity).toBe(
        surfaces.elevated.shadowOpacity
      );
      expect(
        flatten(screen.getByTestId('p').props.style).shadowOpacity
      ).toBeUndefined();
    });
  });

  it('lets a card opt out of the default padding', () => {
    render(
      <NUICard padded={false} testID="c">
        <Text>x</Text>
      </NUICard>
    );
    expect(flatten(screen.getByTestId('c').props.style).padding).toBeUndefined();
  });
});
