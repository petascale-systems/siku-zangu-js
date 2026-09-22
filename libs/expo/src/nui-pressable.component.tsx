import React from 'react';
import {
  Platform,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from 'react-native';

/**
 * Ripple tint. Deliberately local rather than a `colors` token: every value in
 * the theme is asserted to be a 6-digit hex by `theme.spec.ts`, and a ripple
 * needs alpha.
 */
const RIPPLE_COLOR = 'rgba(0, 0, 0, 0.12)';

/** What iOS does instead of a ripple. */
const PRESSED_OPACITY = 0.6;

type Props = Omit<PressableProps, 'style'> & {
  /**
   * A plain style, never the `({ pressed }) => …` form. The pressed state is
   * resolved internally so call sites can keep passing `StyleSheet` arrays
   * exactly as they did to `TouchableOpacity`; the function form does not
   * compose with array spreads without casts.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Icon-only controls, where the ripple should spill past the glyph rather
   * than being boxed to it.
   */
  borderless?: boolean;
  rippleRadius?: number;
  rippleColor?: string;
};

/**
 * Default touch padding. An icon button is typically 22-34pt of glyph and
 * padding, under the 44pt floor; `hitSlop` closes the gap without changing how
 * the control lays out.
 */
const DEFAULT_HIT_SLOP = 8;

/**
 * The app's touch primitive.
 *
 * Replaces `TouchableOpacity`, whose uniform fade is not how either platform
 * responds to a touch: Android draws a Material ripple from the contact point,
 * iOS dims the control. `Pressable` is the primitive React Native actually
 * recommends, and it is the only one that can express both.
 *
 * `overflow: 'hidden'` is applied here rather than left to call sites, because
 * an Android ripple ignores `borderRadius` on its own and spills square out of
 * every pill-shaped button in the app.
 *
 * Defaults `accessibilityRole` to "button" — it was set on only 20 of the 84
 * touchables this replaced.
 */
export const NUIPressable: React.FC<Props> = ({
  style,
  borderless = false,
  rippleRadius,
  rippleColor = RIPPLE_COLOR,
  disabled,
  accessibilityRole = 'button',
  accessibilityState,
  hitSlop = DEFAULT_HIT_SLOP,
  children,
  ...rest
}) => (
  <Pressable
    {...rest}
    hitSlop={hitSlop}
    disabled={disabled}
    // Pressable defaults `focusable` to true regardless of `disabled`, unlike
    // TouchableOpacity which derives it. Without this, TalkBack and keyboard
    // navigation still stop on a dead button.
    focusable={!disabled}
    accessibilityRole={accessibilityRole}
    accessibilityState={{ disabled: !!disabled, ...accessibilityState }}
    android_ripple={{
      color: rippleColor,
      borderless,
      ...(rippleRadius != null ? { radius: rippleRadius } : {}),
    }}
    style={({ pressed }) => [
      // Clips the ripple to the control's own corners. Skipped when
      // borderless, where spilling past the bounds is the point.
      !borderless && { overflow: 'hidden' as const },
      style,
      // Android already signals the press with the ripple; doubling it with
      // an opacity change looks wrong.
      pressed && Platform.OS !== 'android' && !disabled
        ? { opacity: PRESSED_OPACITY }
        : null,
    ]}
  >
    {children}
  </Pressable>
);
