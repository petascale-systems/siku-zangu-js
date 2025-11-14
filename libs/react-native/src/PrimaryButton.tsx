import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
};

export const PrimaryButton: React.FC<Props> = ({
  title,
  onPress,
  disabled,
  accessibilityLabel,
}) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text style={styles.text}>{title}</Text>
  </TouchableOpacity>
);
const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FD5A7E',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 48,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 16,
  },
});
