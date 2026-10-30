// A labeled text input with an optional inline error message underneath,
// styled to match the dark theme. Same idea as your Lab8 error pattern,
// just packaged as a reusable component.
import React, { useMemo } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function StyledInput({ label, error, style, containerStyle, ...props }) {
  const { styles, colors } = useStyles();

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

// Styles are rebuilt whenever the light/dark mode changes.
function useStyles() {
  const { mode, pick, colors } = useTheme();
  const styles = useMemo(
    () => createStyles(null, pick, colors),
    [mode]
  );

  return { colors, styles, mode, pick };
}

const createStyles = (_palette, pick, colors) => StyleSheet.create({
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
