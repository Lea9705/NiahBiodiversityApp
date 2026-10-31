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

const HERO = {
  background: '#00452F',
  backgroundAccent: '#07583D',
  text: '#F2F6EE',
  muted: '#D2E2D4',
  green: '#B8E986',
  dark: '#0B1712',
};

export default function VisitorHomeScreen({ navigation }) {
  const { mode, colors } = useTheme();

  const styles = useMemo(
    () => createStyles(colors, mode),
    [colors, mode]
  );

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bg}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <VisitorHeader />

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroGlow} />

          <View style={styles.heroTag}>
            <View style={styles.liveDot} />
            <Text style={styles.heroTagText}>
              NIAH NATIONAL PARK
            </Text>
          </View>

          <Text style={styles.heroTitle}>
            Discover{'\n'}
            <Text style={styles.heroTitleAccent}>
              The Wild.
            </Text>
          </Text>

          <Text style={styles.heroDescription}>
            Explore Niah's remarkable rainforest, ancient caves
            and rich biodiversity.
          </Text>

          <Pressable
            style={styles.heroButton}
            onPress={() => navigation.navigate('AboutNiah')}
            accessibilityRole="button"
            accessibilityLabel="Learn about Niah"
          >
            <Text style={styles.heroButtonText}>
              Learn About Niah
            </Text>

            <Ionicons
              name="arrow-forward"
              size={18}
              color={HERO.dark}
            />
          </Pressable>

          <View style={styles.heroDecoration}>
            <Ionicons
              name="leaf-outline"
              size={145}
              color={HERO.green}
            />
          </View>
        </View>

        {/* Did You Know? */}
        <View style={styles.factCard}>
          <View style={styles.factTopRow}>
            <View style={styles.factIcon}>
              <Ionicons
                name="sparkles-outline"
                size={20}
                color={colors.buttonBg}
              />
            </View>

            <Text style={styles.factEyebrow}>
              DID YOU KNOW?
            </Text>
          </View>

          <Text style={styles.factTitle}>
            A window into ancient history
          </Text>

          <Text style={styles.factDescription}>
            Niah Caves Complex contains archaeological evidence of human interaction with rainforests spanning at least 50,000 years. These discoveries help researchers understand how ancient humans lived and adapted to their environment.
          </Text>

          <View style={styles.factFooter}>
            <View style={styles.factFooterLine} />
            <Text style={styles.factCategory}>
              UNESCO WORLD HERITAGE SITE · 2024
            </Text>
          </View>
        </View>

        {/* Conservation message */}
        <View style={styles.conservationCard}>
          <Ionicons
            name="earth-outline"
            size={25}
            color={colors.buttonBg}
          />

          <View style={styles.conservationTextWrap}>
            <Text style={styles.conservationTitle}>
              Discover. Learn. Protect.
            </Text>

            <Text style={styles.conservationDescription}>
              Understanding biodiversity is an important step
              towards protecting our natural heritage.
            </Text>
          </View>
        </View>
      </ScrollView>

      <AppBottomNav active="home" />
    </SafeAreaView>
  );
}

const createStyles = (colors, mode) => {
  const isDark = mode === 'dark';

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },

    content: {
      paddingHorizontal: 18,
      paddingTop: 13,
      paddingBottom: 28,
    },

    // Hero
    hero: {
      backgroundColor: HERO.background,
      borderRadius: 26,
      padding: 25,
      minHeight: 370,
      overflow: 'hidden',
      justifyContent: 'center',
    },

    heroGlow: {
      position: 'absolute',
      width: 250,
      height: 250,
      borderRadius: 125,
      backgroundColor: HERO.backgroundAccent,
      right: -100,
      top: -75,
    },

    heroTag: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: '#003522',
      paddingHorizontal: 11,
      paddingVertical: 8,
      borderRadius: 20,
      marginBottom: 23,
    },

    liveDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: HERO.green,
    },

    heroTagText: {
      color: HERO.green,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.2,
    },

    heroTitle: {
      color: HERO.text,
      fontSize: 43,
      lineHeight: 49,
      fontWeight: '900',
      letterSpacing: -1,
    },

    heroTitleAccent: {
      color: HERO.green,
    },

    heroDescription: {
      color: HERO.muted,
      fontSize: 14,
      lineHeight: 22,
      marginTop: 14,
      maxWidth: '90%',
    },

    heroButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 10,
      backgroundColor: HERO.green,
      paddingHorizontal: 17,
      paddingVertical: 14,
      borderRadius: 14,
      marginTop: 24,
    },

    heroButtonText: {
      color: HERO.dark,
      fontSize: 13,
      fontWeight: '800',
    },

    heroDecoration: {
      position: 'absolute',
      right: -24,
      bottom: 5,
      opacity: 0.15,
      transform: [{ rotate: '-25deg' }],
    },

    // Did You Know?
    factCard: {
      backgroundColor: isDark ? '#1D2B20' : '#FFFFFF',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: isDark ? '#344737' : '#DFE9DC',
      padding: 20,
      marginTop: 20,
    },

    factTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 14,
    },

    factIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: isDark ? '#293D2B' : '#E6F3E4',
      alignItems: 'center',
      justifyContent: 'center',
    },

    factEyebrow: {
      color: colors.buttonBg,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1.8,
    },

    factTitle: {
      color: colors.textPrimary,
      fontSize: 19,
      lineHeight: 25,
      fontWeight: '800',
    },

    factDescription: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 21,
      marginTop: 9,
    },

    factFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
      marginTop: 17,
    },

    factFooterLine: {
      width: 22,
      height: 3,
      borderRadius: 2,
      backgroundColor: colors.buttonBg,
    },

    factCategory: {
      color: colors.textSecondary,
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 1.3,
    },

    // Conservation message
    conservationCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 13,
      backgroundColor: colors.surfaceAlt,
      borderRadius: 19,
      padding: 18,
      marginTop: 16,
    },

    conservationTextWrap: {
      flex: 1,
    },

    conservationTitle: {
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: '800',
    },

    conservationDescription: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 20,
      marginTop: 6,
    },
  });
};