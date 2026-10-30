// A single row in a list of plant records or species - icon, title,
// subtitle, and an optional chevron for navigating to a detail screen.
import React, { useMemo } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

export default function RecordListItem({ title, subtitle, iconName, iconColor, iconBg, onPress, showChevron }) {
  const { styles, colors } = useStyles();

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7} disabled={!onPress}>
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={iconName} size={16} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {showChevron ? <Ionicons name="chevron-forward" size={16} color={colors.textMuted} /> : null}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderTopColor: colors.borderSubtle,
  },
  iconWrap: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  subtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
});
