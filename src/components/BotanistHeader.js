// Top bar for the Home and Explore screens: profile icon, greeting,
// the light / dark switch and logout.
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import { useRecords } from '../context/RecordsContext';
import { useTheme } from '../theme/ThemeContext';

const PALETTES = {
  dark: {
    surfaceLight: '#1C3023',
    green: '#B8E986',
    text: '#F2F6EE',
    muted: '#9BAE9F',
    border: '#2A4031',
    error: '#F08C86',
    errorBg: '#251B19',
    errorBorder: '#713A38',
  },
  light: {
    surfaceLight: '#E3F1E6',
    green: '#2A7A45',
    text: '#17261C',
    muted: '#5E7062',
    border: '#D3DFCF',
    error: '#B3392F',
    errorBg: '#FCE9E7',
    errorBorder: '#F0BDB8',
  },
};

export default function BotanistHeader() {
  const navigation = useNavigation();
  const { userName, logout, user } = useUser();
  const { records } = useRecords();

  // Records this account made that have not been sent yet.
  const unsent = records.filter(
    (r) =>
      r.status === 'pending' &&
      (!r.ownerId || String(r.ownerId) === String(user?.id))
  ).length;
  const { mode, isDark, toggleTheme } = useTheme();

  const COLORS = PALETTES[mode];
  const styles = useMemo(() => createStyles(COLORS), [mode]);

  const handleLogout = () => {
    Alert.alert(
      'Log out?',
      unsent > 0
        ? `You have ${unsent} record${unsent === 1 ? '' : 's'} not sent yet. ${
            unsent === 1 ? 'It stays' : 'They stay'
          } on this phone and ${
            unsent === 1 ? 'is' : 'are'
          } sent automatically as soon as the phone has internet, even after you log out. Other phones can see ${
            unsent === 1 ? 'it' : 'them'
          } only after that. (If the phone has no internet for more than 24 hours, log in again to send ${
            unsent === 1 ? 'it' : 'them'
          }.)`
        : 'You will return to the start screen. Records saved on this phone stay on this phone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'VisitorHome' }],
            });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={styles.avatar}
        onPress={() => navigation.navigate('BotanistProfile')}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Open profile"
      >
        <Ionicons name="person" size={22} color={COLORS.green} />
      </TouchableOpacity>

      <Text style={styles.hello} numberOfLines={1}>
        Hello, <Text style={styles.name}>{userName || 'Botanist'}</Text>
      </Text>

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
        onPress={handleLogout}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Log out"
      >
        <View style={styles.logout}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
        </View>
        <Text style={styles.logoutLabel}>Logout</Text>
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

    avatar: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: COLORS.surfaceLight,
      borderWidth: 1,
      borderColor: COLORS.border,
      alignItems: 'center',
      justifyContent: 'center',
    },

    hello: {
      flex: 1,
      color: COLORS.muted,
      fontSize: 16,
    },

    name: {
      color: COLORS.text,
      fontWeight: '800',
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

    logout: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: COLORS.errorBg,
      borderWidth: 1,
      borderColor: COLORS.errorBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },

    logoutLabel: {
      color: COLORS.error,
      fontSize: 10,
      fontWeight: '700',
    },
  });
