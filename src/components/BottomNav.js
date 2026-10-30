
import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

export default function BottomNav({
  items,
  activeIndex,
  onPress,
  variant = 'default',
}) {
  const { styles, colors } = useStyles();

  const botanist = variant === 'botanist';

  return (
    <View
      style={[
        styles.nav,
        botanist ? styles.botanistNav : styles.visitorNav,
      ]}
    >
      {items.map((item, index) => {
        const active = index === activeIndex;
        const color = active
          ? colors.accentText
          : colors.textMuted;

        return (
          <TouchableOpacity
            key={item.label}
            style={styles.item}
            onPress={() => onPress && onPress(index)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: active }}
          >
            <Ionicons
              name={item.icon}
              size={20}
              color={color}
            />

            <Text style={[styles.label, { color }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
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
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: colors.borderSubtle,
  },

  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 3,
  },

  label: {
    fontSize: 11,
    lineHeight: 15,
  },

  // Visitor: lower the tab content slightly
  visitorNav: {
    marginTop: 0,
    paddingTop: 8,
    paddingBottom: 12,
  },

  // Botanist: keep the navigation compact
  botanistNav: {
    marginTop: 0,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: pick('#071711', '#FFFFFF'),
    marginBottom: 8,
  },
});
