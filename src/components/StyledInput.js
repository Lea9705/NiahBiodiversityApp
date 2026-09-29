// A labeled text input with an optional inline error message underneath,
// styled to match the dark theme. Same idea as your Lab8 error pattern,
// just packaged as a reusable component.
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function StyledInput({ label, error, style, containerStyle, ...props }) {
  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={colors.textMuted}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 14, width: '100%' },
  label: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  input: {
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceAlt,
  },
  error: { color: colors.errorText, fontSize: 12, marginTop: 4 },
});
