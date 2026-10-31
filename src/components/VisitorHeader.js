import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../theme/ThemeContext';
import BackButton from './BackButton';

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

export default function VisitorHeader({ onBack }) {
  const navigation = useNavigation();
  const { mode, isDark, toggleTheme } = useTheme();

  const COLORS = PALETTES[mode];

  const styles = useMemo(
    () => createStyles(COLORS, Boolean(onBack)),
    [mode, onBack]
  );

  return (
    <View style={styles.row}>
      {/* Only displayed on screens that pass onBack */}
      {onBack ? (
        <BackButton onPress={onBack} />
      ) : null}

      <View style={styles.brandRow}>
        <View style={styles.logo}>
          <Ionicons
            name="leaf"
            size={22}
            color={COLORS.green}
          />
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
        accessibilityLabel={
          isDark ? 'Switch to light mode' : 'Switch to dark mode'
        }
      >
        <View style={styles.themeButton}>
          <Ionicons
            name={isDark ? 'sunny-outline' : 'moon-outline'}
            size={22}
            color={COLORS.green}
          />
        </View>

        <Text style={styles.themeLabel}>
          {isDark ? 'Light' : 'Dark'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionWrap}
        onPress={() => navigation.navigate('BotanistLogin')}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Staff login"
      >
        <View style={styles.loginButton}>
          <Ionicons
            name="log-in-outline"
            size={22}
            color={COLORS.bg}
          />
        </View>

        <Text style={styles.loginLabel}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (COLORS, hasBackButton) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: hasBackButton ? 7 : 10,
      marginBottom: 20,
    },

    brandRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      minWidth: 0,
    },

    logo: {
      width: hasBackButton ? 40 : 46,
      height: hasBackButton ? 40 : 46,
      borderRadius: 14,
      backgroundColor: COLORS.surfaceLight,
      alignItems: 'center',
      justifyContent: 'center',
    },

    brand: {
      color: COLORS.text,
      fontSize: hasBackButton ? 15 : 17,
      fontWeight: '900',
      letterSpacing: hasBackButton ? 1.5 : 2,
    },

    brandSub: {
      color: COLORS.muted,
      fontSize: hasBackButton ? 8 : 9,
      fontWeight: '700',
      letterSpacing: hasBackButton ? 1.7 : 2.5,
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