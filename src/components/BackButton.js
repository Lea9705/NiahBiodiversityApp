
import React, { useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

const PALETTES = {
  dark: {
    surface: '#14251B',
    green: '#B8E986',
    border: '#2A4031',
  },
  light: {
    surface: '#FFFFFF',
    green: '#2A7A45',
    border: '#D3DFCF',
  },
};

export default function BackButton({ onPress }) {
  const { styles, COLORS } = useStyles();

  return (
    <Pressable
      style={styles.button}
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel="Go back"
    >
      <Ionicons
        name="return-up-back"
        size={21}
        color={COLORS.green}
      />
    </Pressable>
  );
}

// Styles are rebuilt whenever the light/dark mode changes.
function useStyles() {
  const { mode, pick, colors } = useTheme();
  const COLORS = PALETTES[mode];
  const styles = useMemo(
    () => createStyles(COLORS, pick, colors),
    [mode]
  );

  return { COLORS, colors, styles, mode, pick };
}

const createStyles = (COLORS, pick, colors) => StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
