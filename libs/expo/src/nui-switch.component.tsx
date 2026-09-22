import React from 'react';
import { Platform, StyleSheet, Switch, Text, View } from 'react-native';
import { colors, spacing } from './theme';
import { MAX_FONT_SCALE, typography } from './typography';

type Props = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  /** Also the accessible name — a bare Switch announces only its state. */
  label: string;
  description?: string;
  disabled?: boolean;
  /** Optional icon or badge shown before the label. */
  leading?: React.ReactNode;
  testID?: string;
};

/**
 * A labelled setting backed by the platform switch.
 *
 * The control itself is React Native's `Switch`, which is already the real
 * `UISwitch` / `SwitchMaterial` — there is nothing to replace. What was missing
 * is everything around it: the only switch in the app hardcoded its track
 * colours to values outside the brand ramp, and put its label in a sibling
 * `View`, so VoiceOver and TalkBack announced "switch, on" with no indication
 * of what had been turned on.
 *
 * Interaction stays on the switch rather than the whole row, which is what iOS
 * Settings does; making the row tappable as well would nest one touch target
 * inside another.
 */
export const NUISwitch: React.FC<Props> = ({
  value,
  onValueChange,
  label,
  description,
  disabled = false,
  leading,
  testID,
}) => (
  <View style={styles.row}>
    {leading ? <View style={styles.leading}>{leading}</View> : null}
    <View style={styles.copy}>
      <Text style={styles.label} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {label}
      </Text>
      {description ? (
        <Text
          style={styles.description}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          {description}
        </Text>
      ) : null}
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      accessibilityLabel={label}
      accessibilityHint={description}
      trackColor={{ false: colors.border.subtle, true: colors.brand.base }}
      thumbColor={Platform.OS === 'android' ? colors.surface.card : undefined}
      ios_backgroundColor={colors.border.subtle}
      // The thumb is only ~31pt tall; this brings the target to the 44pt floor.
      hitSlop={8}
      testID={testID}
    />
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  leading: {
    marginRight: spacing.sm + 4,
  },
  copy: {
    flex: 1,
    flexShrink: 1,
  },
  label: {
    ...typography.body,
    fontWeight: '500',
    color: colors.text.primary,
  },
  description: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
});
