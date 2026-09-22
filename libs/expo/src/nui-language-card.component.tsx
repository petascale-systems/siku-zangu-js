import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from './theme';
import { typography } from './typography';

type Props = {
  flag: any;
  title: string;
  subtitle: string;
  selected?: boolean;
  onPress: () => void;
};

/**
 * Language chooser card.
 *
 * Fixes carried over from the audit: `fontWeight: 'medium'` / `'regular'` are
 * iOS-only names that silently render as 400 on Android, which collapsed the
 * title/subtitle hierarchy entirely; `fontFamily` was lowercase ('inter',
 * 'poppins') and would not match the registered families; and `height: 131`
 * clipped the text stack once OS font scaling was raised.
 */
export const NUILanguageCard: React.FC<Props> = ({
  flag,
  title,
  subtitle,
  selected = false,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.selected]}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${title}. ${subtitle}`}
    >
      <Image source={flag} style={styles.flag} />
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {selected && (
        <Ionicons
          name="checkmark-circle"
          size={24}
          color={colors.brand.strong}
          accessibilityElementsHidden
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    // An unselected card is a plain card on the neutral canvas. It used to be
    // pink in both states, differing only in shade, so both options looked
    // chosen and neither read as the current one.
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginVertical: spacing.xs,
    gap: spacing.md,
    alignSelf: 'stretch',
    // minHeight, not height: the stack must be able to grow with font scaling.
    // 112 was tall enough to look like a banner rather than a choice.
    minHeight: 72,
    borderWidth: 2,
    // Reserve the border in both states so selecting doesn't shift layout.
    borderColor: colors.border.subtle,
  },
  selected: {
    borderColor: colors.brand.base,
    backgroundColor: colors.surface.tint,
  },
  flag: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  copy: {
    flex: 1,
    flexShrink: 1,
  },
  title: {
    ...typography.subheading,
    fontWeight: '600',
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.text.secondary,
  },
});
