// Visitor home: the top bar, the "Explore the wild" card, and the bottom bar.
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import VisitorHeader from '../components/VisitorHeader';
import AppBottomNav from '../components/AppBottomNav';
import { useTheme } from '../theme/ThemeContext';

const PALETTES = {
  dark: { bg: '#0B1712' },
  light: { bg: '#F7F8F5' },
};

// The hero card keeps its deep-forest look in both themes.
const HERO = {
  text: '#F2F6EE',
  green: '#B8E986',
  dark: '#0B1712',
};

export default function VisitorHomeScreen({ navigation }) {
  const { mode } = useTheme();
  const COLORS = PALETTES[mode];
  const styles = useMemo(() => createStyles(COLORS), [mode]);

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
        <VisitorHeader />

        <View style={styles.hero}>
          <View style={styles.heroGlow} />

          <View style={styles.heroTag}>
            <View style={styles.liveDot} />
            <Text style={styles.heroTagText}>EXPLORE THE WILD</Text>
          </View>

          <Text style={styles.heroTitle}>
            Nature is{'\n'}
            <Text style={styles.heroTitleAccent}>waiting.</Text>
          </Text>

          <Text style={styles.heroDescription}>
            Discover the remarkable plant life of Niah through every leaf,
            trail and discovery.
          </Text>

          <Pressable
            style={styles.heroButton}
            onPress={() => navigation.navigate('Explore')}
          >
            <Text style={styles.heroButtonText}>Explore plants</Text>
            <Ionicons name="arrow-forward" size={18} color={HERO.dark} />
          </Pressable>

          <View style={styles.heroDecoration}>
            <Ionicons name="leaf-outline" size={130} color="#B8E986" />
          </View>
        </View>
      </ScrollView>

      <AppBottomNav active="home" />
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
      paddingHorizontal: 18,
      paddingTop: 13,
      paddingBottom: 24,
    },

    // To make the card taller or shorter, change minHeight.
    hero: {
      backgroundColor: '#1B3525',
      borderRadius: 26,
      padding: 26,
      minHeight: 440,
      overflow: 'hidden',
      justifyContent: 'center',
    },

    heroGlow: {
      position: 'absolute',
      width: 260,
      height: 260,
      borderRadius: 130,
      backgroundColor: '#294B32',
      right: -90,
      top: -60,
    },

    heroTag: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      backgroundColor: '#0D2118',
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 20,
      marginBottom: 20,
    },

    liveDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: HERO.green,
    },

    heroTagText: {
      color: HERO.green,
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 1.3,
    },

    heroTitle: {
      color: HERO.text,
      fontSize: 44,
      lineHeight: 48,
      fontWeight: '900',
      letterSpacing: -1.4,
    },

    heroTitleAccent: {
      color: HERO.green,
    },

    heroDescription: {
      color: '#C0D0C2',
      fontSize: 13,
      lineHeight: 21,
      marginTop: 14,
      maxWidth: '82%',
    },

    heroButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 10,
      backgroundColor: HERO.green,
      paddingHorizontal: 18,
      paddingVertical: 14,
      borderRadius: 14,
      marginTop: 26,
    },

    heroButtonText: {
      color: HERO.dark,
      fontSize: 13,
      fontWeight: '800',
    },

    heroDecoration: {
      position: 'absolute',
      right: -16,
      bottom: 10,
      opacity: 0.18,
      transform: [{ rotate: '-25deg' }],
    },
  });
