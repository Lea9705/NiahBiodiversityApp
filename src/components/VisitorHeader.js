// Top bar for visitors (people who have not logged in).
// It matches the staff top bar, but has the Niah Biodiversity name instead of
// the profile icon and greeting, and a Login button (for staff) instead of Logout.
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';

const PALETTES = {
  dark: {
    bg: '#0B1712',
    surfaceLight: '#1C3023',
    green: '#B8E986',
    text: '#F2F6EE',
    muted: '#9BAE9F',
    border: '#2A4031',
  },
  light: {
    bg: '#F7F8F5',
    surfaceLight: '#E3F1E6',
    green: '#2A7A45',
    text: '#17261C',
    muted: '#5E7062',
    border: '#D3DFCF',
  },
};

export default function VisitorHeader() {
  const navigation = useNavigation();
  const { mode, isDark, toggleTheme } = useTheme();

  const COLORS = PALETTES[mode];
  const styles = useMemo(() => createStyles(COLORS), [mode]);

  return (
    <View style={styles.row}>
      <View style={styles.brandRow}>
        <View style={styles.logo}>
          <Ionicons name="leaf" size={22} color={COLORS.green} />
        </View>

        <View>
          <Text style={styles.brand}>NIAH</Text>
          <Text style={styles.brandSub}>BIODIVERSITY</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.actionWrap}
        onPress={toggleTheme}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <View style={styles.themeButton}>
          <Ionicons
            name={isDark ? 'sunny-outline' : 'moon-outline'}
            size={22}
            color={COLORS.green}
          />
        </View>
        <Text style={styles.themeLabel}>{isDark ? 'Light' : 'Dark'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionWrap}
        onPress={() => navigation.navigate('BotanistLogin')}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Staff login"
      >
        <View style={styles.loginButton}>
          <Ionicons name="log-in-outline" size={22} color={COLORS.bg} />
        </View>
        <Text style={styles.loginLabel}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (COLORS) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 20,
    },

    brandRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    logo: {
      width: 46,
      height: 46,
      borderRadius: 15,
      backgroundColor: COLORS.surfaceLight,
      alignItems: 'center',
      justifyContent: 'center',
    },

    brand: {
      color: COLORS.text,
      fontSize: 17,
      fontWeight: '900',
      letterSpacing: 2,
    },

    brandSub: {
      color: COLORS.muted,
      fontSize: 9,
      fontWeight: '700',
      letterSpacing: 2.5,
      marginTop: 2,
    },

    actionWrap: {
      alignItems: 'center',
      gap: 4,
    },

    themeButton: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: COLORS.surfaceLight,
      borderWidth: 1,
      borderColor: COLORS.border,
      alignItems: 'center',
      justifyContent: 'center',
    },

    themeLabel: {
      color: COLORS.green,
      fontSize: 10,
      fontWeight: '700',
    },

    loginButton: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: COLORS.green,
      alignItems: 'center',
      justifyContent: 'center',
    },

    loginLabel: {
      color: COLORS.green,
      fontSize: 10,
      fontWeight: '700',
    },
  });
