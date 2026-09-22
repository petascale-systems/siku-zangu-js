import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing } from './theme';
import { typography } from './typography';

type Props = {
  placeholder: string;
  value: string;
  onChangeText: (val: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
  label?: string;
  error?: string;
  accessibilityLabel?: string;
};

/**
 * Shared text input.
 *
 * The border was `#ddd` at 1.36:1 against white — below the 3:1 required for a
 * control boundary (SC 1.4.11), so the field edge was barely perceptible. The
 * placeholder colour was left to the platform default, which is lighter still.
 */
export const NUIInputField: React.FC<Props> = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  label,
  error,
  accessibilityLabel,
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.text.placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        // See NUIFormField: the app is light-only, so the keyboard is too.
        keyboardAppearance="light"
        style={[styles.input, !!error && styles.inputError]}
        accessibilityLabel={accessibilityLabel ?? label ?? placeholder}
      />
      {/* Errors carry text, not just a border colour (SC 1.4.1). */}
      {!!error && (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm + 2,
  },
  label: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.sm + 2,
    padding: spacing.sm + 4,
    ...typography.body,
    color: colors.text.primary,
    backgroundColor: colors.surface.card,
  },
  inputError: {
    borderColor: colors.border.error,
    borderWidth: 2,
  },
  error: {
    ...typography.caption,
    color: colors.state.error,
    marginTop: spacing.xs,
  },
});
