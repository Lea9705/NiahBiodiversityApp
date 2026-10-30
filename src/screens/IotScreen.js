// IoT page, for staff only. Nothing here yet. It has the same top bar and
// bottom bar as the other staff pages, so it is ready to fill in later.
import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import BotanistHeader from '../components/BotanistHeader';
import AppBottomNav from '../components/AppBottomNav';
import { useUser } from '../context/UserContext';
import { useTheme } from '../theme/ThemeContext';

const PALETTES = {
  dark: {
    bg: '#0B1712',
    green: '#B8E986',
    text: '#F2F6EE',
    muted: '#9BAE9F',
    surface: '#14251B',
    border: '#2A4031',
  },
  light: {
    bg: '#F7F8F5',
    green: '#2A7A45',
    text: '#17261C',
    muted: '#5E7062',
    surface: '#FFFFFF',
    border: '#D3DFCF',
  },
};

export default function IotScreen() {
  const navigation = useNavigation();
  const { isLoggedIn } = useUser();
  const { mode } = useTheme();

  const COLORS = PALETTES[mode];
  const styles = useMemo(() => createStyles(COLORS), [mode]);

  // Visitors have no IoT page. If anyone gets here without logging in,
  // send them back to the visitor home.
  useEffect(() => {
    if (!isLoggedIn) {
      navigation.reset({ index: 0, routes: [{ name: 'VisitorHome' }] });
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) return null;

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={COLORS.bg}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <BotanistHeader />

        {/* Nothing here yet. Delete this block when the page gets its content. */}
        <View style={styles.placeholder}>
          <View style={styles.placeholderIcon}>
            <Ionicons name="hardware-chip-outline" size={30} color={COLORS.green} />
          </View>
          <Text style={styles.placeholderTitle}>IoT</Text>
          <Text style={styles.placeholderText}>Coming soon</Text>
        </View>
      </ScrollView>

      <AppBottomNav active="iot" />
    </SafeAreaView>
  );
}

const createStyles = (COLORS) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.bg,
    },

    content: {
      flexGrow: 1,
      paddingHorizontal: 18,
      paddingTop: 13,
      paddingBottom: 24,
    },

    placeholder: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 80,
    },

    placeholderIcon: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },

    placeholderTitle: {
      color: COLORS.text,
      fontSize: 16,
      fontWeight: '800',
    },

    placeholderText: {
      color: COLORS.muted,
      fontSize: 12,
      marginTop: 5,
    },
  });
