import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import VisitorHeader from '../components/VisitorHeader';
import AppBottomNav from '../components/AppBottomNav';
import { useTheme } from '../theme/ThemeContext';

const FOREST_IMAGE = require('../../assets/images/niah-forest.jpg');
const CAVE_IMAGE = require('../../assets/images/niah-cave.jpeg');

const GREEN = {
  dark: '#0B1712',
  light: '#B8E986',
};

export default function AboutNiahScreen({ navigation }) {
  const { mode, colors } = useTheme();

  const styles = useMemo(
    () => createStyles(colors),
    [colors]
  );

  const buttonGreen = mode === 'dark' ? GREEN.light : '#2A7A45';
  const buttonText = mode === 'dark' ? GREEN.dark : '#FFFFFF';

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
        {/* Back button shares the header row */}
        <VisitorHeader onBack={() => navigation.goBack()} />

        <Text style={styles.eyebrow}>
          DISCOVER SARAWAK
        </Text>

        <Text style={styles.title}>
          About Niah
        </Text>

        <Text style={styles.intro}>
          A remarkable landscape where ancient caves,
          tropical rainforest and biodiversity come together.
        </Text>

        <Image
          source={FOREST_IMAGE}
          style={styles.heroImage}
          resizeMode="cover"
          accessibilityLabel="Rainforest landscape in Niah"
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            A place of natural heritage
          </Text>

          <Text style={styles.paragraph}>
            Niah National Park is located in Sarawak, Malaysian
            Borneo. It is known for its limestone cave system,
            surrounding rainforest and important archaeological
            heritage. The Niah Caves preserve evidence of human
            history stretching back tens of thousands of years.
          </Text>

          <Text style={styles.paragraph}>
            In July 2024, the Niah Caves Complex was inscribed
            on the UNESCO World Heritage List in recognition of
            its outstanding cultural significance.
          </Text>
        </View>

        <Image
          source={CAVE_IMAGE}
          style={styles.sectionImage}
          resizeMode="cover"
          accessibilityLabel="Limestone cave landscape at Niah"
        />

        <View style={styles.section}>
          <View style={styles.sectionHeadingRow}>
            <Ionicons
              name="leaf-outline"
              size={24}
              color={colors.buttonBg}
            />

            <Text style={styles.sectionTitle}>
              Rich biodiversity
            </Text>
          </View>

          <Text style={styles.paragraph}>
            The rainforest around Niah supports diverse plant
            life and wildlife. Trees, ferns, orchids and other
            forest plants form habitats that support many
            organisms. Each species plays a role in maintaining
            the balance of the ecosystem.
          </Text>

          <Text style={styles.paragraph}>
            Exploring and documenting plant species helps
            visitors learn about this natural environment and
            understand why protecting biodiversity matters.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Ionicons
            name="shield-checkmark-outline"
            size={28}
            color={colors.buttonBg}
          />

          <Text style={styles.infoTitle}>
            Protecting Niah
          </Text>

          <Text style={styles.paragraph}>
            Responsible tourism and conservation help protect
            Niah's forests, caves, wildlife and cultural heritage.
            Visitors can help by staying on designated paths,
            avoiding damage to plants and wildlife, and taking
            all rubbish with them.
          </Text>
        </View>

        <View style={styles.exploreCard}>
          <Text style={styles.exploreTitle}>
            Ready to discover plant life?
          </Text>

          <Text style={styles.exploreDescription}>
            Explore the plant records available in Niah Biodiversity.
          </Text>

          <Pressable
            style={[
              styles.exploreButton,
              { backgroundColor: buttonGreen },
            ]}
            onPress={() => navigation.navigate('Explore')}
            accessibilityRole="button"
            accessibilityLabel="Explore plants"
          >
            <Text
              style={[
                styles.exploreButtonText,
                { color: buttonText },
              ]}
            >
              Explore plants
            </Text>

            <Ionicons
              name="arrow-forward"
              size={18}
              color={buttonText}
            />
          </Pressable>
        </View>
      </ScrollView>

      <AppBottomNav active="" />
    </SafeAreaView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },

    content: {
      paddingHorizontal: 18,
      paddingTop: 13,
      paddingBottom: 30,
    },

    eyebrow: {
      color: colors.buttonBg,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 2,
      marginBottom: 8,
    },

    title: {
      color: colors.textPrimary,
      fontSize: 34,
      lineHeight: 40,
      fontWeight: '900',
      letterSpacing: -0.8,
    },

    intro: {
      color: colors.textSecondary,
      fontSize: 15,
      lineHeight: 24,
      marginTop: 12,
      marginBottom: 22,
    },

    heroImage: {
      width: '100%',
      height: 220,
      borderRadius: 22,
      backgroundColor: colors.surfaceAlt,
    },

    section: {
      marginTop: 26,
    },

    sectionHeadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12,
    },

    sectionTitle: {
      color: colors.textPrimary,
      fontSize: 21,
      lineHeight: 28,
      fontWeight: '800',
      marginBottom: 12,
      flexShrink: 1,
    },

    paragraph: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 23,
      marginBottom: 13,
    },

    sectionImage: {
      width: '100%',
      height: 210,
      borderRadius: 20,
      marginTop: 12,
      backgroundColor: colors.surfaceAlt,
    },

    infoCard: {
      marginTop: 24,
      padding: 20,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },

    infoTitle: {
      color: colors.textPrimary,
      fontSize: 19,
      fontWeight: '800',
      marginTop: 12,
      marginBottom: 10,
    },

    exploreCard: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: 22,
      padding: 22,
      marginTop: 24,
    },

    exploreTitle: {
      color: colors.textPrimary,
      fontSize: 21,
      lineHeight: 28,
      fontWeight: '800',
    },

    exploreDescription: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 22,
      marginTop: 8,
    },

    exploreButton: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 17,
      paddingVertical: 13,
      borderRadius: 13,
      marginTop: 18,
    },

    exploreButtonText: {
      fontSize: 13,
      fontWeight: '800',
    },
  });