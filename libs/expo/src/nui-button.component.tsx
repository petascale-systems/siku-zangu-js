import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NUIPressable } from './nui-pressable.component';
import { controls } from './theme';
import { MAX_FONT_SCALE, typography } from './typography';

export type NUIButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'destructive';

type Props = {
  title: string;
  onPress: () => void;
  variant?: NUIButtonVariant;
  disabled?: boolean;
  /**
   * In-flight. Shows a spinner in place of the label and blocks further taps,
   * so a slow request cannot be submitted twice.
   */
  loading?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  /** Full-width by default; opt out for buttons sharing a row. */
  fullWidth?: boolean;
  /**
   * Named rather than passed as an element so the glyph takes its colour from
   * the tier, including when disabled. The onboarding CTAs each hardcoded
   * `#FFFFFF`, which stayed white on the pale disabled fill.
   */
  trailingIcon?: React.ComponentProps<typeof Ionicons>['name'];
};

/**
 * The app's button, in the four tiers the design system already defines.
 *
 * `controls` in `theme.ts` has carried these tiers all along, but roughly thirty
 * calls to action re-implemented them by hand — each with its own
 * `TouchableOpacity` + `Text` + `ActivityIndicator` and its own idea of what
 * disabled looks like. This is that shape, once.
 *
 * The disabled tier is an overlay: it carries only fill and border, so it is
 * spread *after* a tier rather than replacing it.
 */
export const NUIButton: React.FC<Props> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  accessibilityLabel,
  style,
  fullWidth = true,
  trailingIcon,
}) => {
  const isBlocked = disabled || loading;
  const labelColor = disabled
    ? controls.disabledLabel.color
    : controls[`${variant}Label`].color;

  return (
    <NUIPressable
      onPress={onPress}
      disabled={isBlocked}
      accessibilityLabel={accessibilityLabel ?? title}
      // `busy` is what announces the wait; `disabled` alone would just read as
      // unavailable.
      accessibilityState={{ disabled: isBlocked, busy: loading }}
      style={[
        controls[variant],
        fullWidth && styles.fullWidth,
        trailingIcon && styles.withIcon,
        disabled && controls.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={labelColor} />
      ) : (
        <>
          <Text
            style={[styles.label, { color: labelColor }]}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          >
            {title}
          </Text>
          {trailingIcon ? (
            <Ionicons name={trailingIcon} size={20} color={labelColor} />
          ) : null}
        </>
      )}
    </NUIPressable>
  );
};

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  withIcon: {
    flexDirection: 'row',
    gap: 8,
  },
  label: {
    ...typography.button,
    textAlign: 'center',
  },
});
