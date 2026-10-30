// Secondary button with a border, used next to a PrimaryButton
// (e.g. "New plant record" next to "Scan QR tag")
import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function OutlineButton({ title, onPress, icon, style }) {
  const { styles } = useStyles();

  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress} activeOpacity={0.8}>
      {icon}
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
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
  button: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    color: colors.textPrimary,
    fontSize: 13,
  },
});
