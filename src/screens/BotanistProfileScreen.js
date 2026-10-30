
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import BackButton from '../components/BackButton';
import { useUser } from '../context/UserContext';
import { useTheme } from '../theme/ThemeContext';

// The details come from the account that logged in.
function buildProfileFields(user) {
  return [
    { label: 'Staff ID', value: user?.id || 'Not set up yet', icon: 'id-card-outline' },
    { label: 'Email', value: user?.email || 'Not set up yet', icon: 'mail-outline' },
    { label: 'Phone Number', value: user?.phone || 'Not added', icon: 'call-outline' },
    { label: 'Unit', value: user?.unit || 'Not assigned', icon: 'people-outline' },
    { label: 'Department', value: user?.department || 'Not assigned', icon: 'business-outline' },
  ];
}

const PALETTES = {
  dark: {
    bg: '#0B1712',
    surface: '#14251B',
    surfaceLight: '#1C3023',
    green: '#B8E986',
    text: '#F2F6EE',
    muted: '#9BAE9F',
    border: '#2A4031',
  },
  light: {
    bg: '#F7F8F5',
    surface: '#FFFFFF',
    surfaceLight: '#E3F1E6',
    green: '#2A7A45',
    text: '#17261C',
    muted: '#5E7062',
    border: '#D3DFCF',
  },
};

export default function BotanistProfileScreen({ navigation }) {
  const { styles, COLORS, mode, pick } = useStyles();

  const { user } = useUser();
  const profileFields = buildProfileFields(user);

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <StatusBar
        barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={COLORS.bg}
      />

      {/* Back button */}
      <View style={styles.topBar}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>

      {/* Profile heading */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons
            name="person"
            size={43}
            color={pick('#54B5F4', '#1F6FB0')}
          />
        </View>

        <Text style={styles.title}>Botanist Profile</Text>

        <Text style={styles.subtitle}>
          Your Account Information
        </Text>

        <View style={styles.roleBadge}>
          <Ionicons
            name="leaf-outline"
            size={16}
            color={pick('#54B5F4', '#1F6FB0')}
          />
          <Text style={styles.roleBadgeText}>BOTANIST</Text>
        </View>
      </View>

      {/* Profile information */}
      <View style={styles.infoCard}>
        {profileFields.map((field, index) => (
          <View
            key={field.label}
            style={[
              styles.infoRow,
              index !== profileFields.length - 1 &&
                styles.infoRowBorder,
            ]}
          >
            <View style={styles.fieldIcon}>
              <Ionicons
                name={field.icon}
                size={23}
                color={pick('#54B5F4', '#1F6FB0')}
              />
            </View>

            <View style={styles.fieldContent}>
              <Text style={styles.label}>{field.label}</Text>
              <Text style={styles.value} numberOfLines={1}>
                {field.value}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color={COLORS.muted}
            />
          </View>
        ))}
      </View>
    </SafeAreaView>
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
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 12,
  },

  topBar: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 4,
  },

  header: {
    alignItems: 'center',
    marginBottom: 22,
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: pick('#06432F', '#DDEFE2'),
    borderWidth: 2,
    borderColor: pick('#397A56', '#9CC9A8'),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  title: {
    fontSize: 25,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 5,
    textAlign: 'center',
  },

  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: pick('#0D2C20', '#E7F2E9'),
    borderWidth: 1,
    borderColor: pick('#23734A', '#A9D2B4'),
  },

  roleBadgeText: {
    color: pick('#54B5F4', '#1F6FB0'),
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 15,
    paddingVertical: 3,
    marginBottom: 18,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    gap: 13,
    minHeight: 76,
  },

  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  fieldIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  fieldContent: {
    flex: 1,
    minWidth: 0,
  },

  label: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 5,
  },

  value: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },



});
