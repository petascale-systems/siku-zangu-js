import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { NUIPressable } from './nui-pressable.component';
import { spacing, surfaces } from './theme';

export type NUICardVariant = 'card' | 'cardOutlined' | 'elevated';

type Props = {
  children: React.ReactNode;
  variant?: NUICardVariant;
  /** Layout only — margins and widths. The surface comes from the variant. */
  style?: StyleProp<ViewStyle>;
  /** Inner padding; pass `false` for a card that manages its own. */
  padded?: boolean;
  /**
   * Makes the whole card the touch target. A card with a tappable row inside it
   * should leave this unset and put the control inside instead, so the target
   * is not nested inside another one.
   */
  onPress?: () => void;
  accessibilityLabel?: string;
  testID?: string;
};

/**
 * A surface.
 *
 * `surfaces` in `theme.ts` has defined these three all along, but the screens
 * each rebuilt them: a background, a radius and — in the elevated case — a
 * shadow recipe, repeated with slightly different numbers each time.
 *
 * `elevated` is the only variant that carries a shadow, and it is the one
 * recipe in the design system; anything drawing its own `shadowOpacity` is
 * diverging from it.
 *
 * A pressable card routes through `NUIPressable`, so it ripples on Android and
 * dims on iOS like every other control rather than being a silent rectangle.
 */
export const NUICard: React.FC<Props> = ({
  children,
  variant = 'card',
  style,
  padded = true,
  onPress,
  accessibilityLabel,
  testID,
}) => {
  const composed = [surfaces[variant], padded && styles.padded, style];

  if (!onPress) {
    return (
      <View style={composed} testID={testID}>
        {children}
      </View>
    );
  }

  return (
    <NUIPressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={composed}
    >
      {children}
    </NUIPressable>
  );
};

const styles = StyleSheet.create({
  padded: {
    padding: spacing.md,
  },
});
