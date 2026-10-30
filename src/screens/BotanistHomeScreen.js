// Botanist home: greeting header, connection status, New plant record,
// and the botanist's own submissions (My Activities) right below it.
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import OutlineButton from '../components/OutlineButton';
import BotanistHeader from '../components/BotanistHeader';
import BotanistBottomNav from '../components/BotanistBottomNav';
import MyActivitiesSection from '../components/MyActivitiesSection';
import { useRecords } from '../context/RecordsContext';
import { useTheme } from '../theme/ThemeContext';

const PALETTES = {
  dark: {
    bg: '#0B1712',
    green: '#B8E986',
    border: '#2A4031',
    warning: '#F2C879',
    warningBg: '#3B3020',
    successBg: '#203B2A',
  },
  light: {
    bg: '#F7F8F5',
    green: '#2A7A45',
    border: '#D3DFCF',
    warning: '#8A5A00',
    warningBg: '#FBEED0',
    successBg: '#E8F5EB',
  },
};

export default function BotanistHomeScreen({ navigation }) {
  const { styles, COLORS, mode } = useStyles();

  const { records, isOnline } = useRecords();

  const pendingCount = records.filter(
    (record) => record.status === 'pending'
  ).length;

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right']}
    >
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={COLORS.bg} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <BotanistHeader />

        {/* Connection status */}
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusBadge,
              isOnline ? styles.badgeOnline : styles.badgeOffline,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                isOnline ? styles.dotOnline : styles.dotOffline,
              ]}
            />

            <Ionicons
              name={isOnline ? 'cloud-outline' : 'cloud-offline-outline'}
              size={15}
              color={isOnline ? COLORS.green : COLORS.warning}
            />

            <Text
              style={[
                styles.statusText,
                isOnline ? styles.textOnline : styles.textOffline,
              ]}
            >
              {isOnline
                ? pendingCount > 0
                  ? `Online · ${pendingCount} pending sync`
                  : 'Online'
                : pendingCount > 0
                  ? `Offline · ${pendingCount} pending sync`
                  : 'Offline'}
            </Text>
          </View>
        </View>

        {/* New plant record */}
        <View style={styles.actionGrid}>
          <View style={styles.actionItem}>
            <OutlineButton
              title="New plant record"
              icon={<Ionicons name="add" size={22} color={COLORS.green} />}
              onPress={() => navigation.navigate('NewPlantRecord')}
              style={styles.gridButton}
            />
          </View>
        </View>

        {/* My Activities, shown directly on the page */}
        <MyActivitiesSection />
      </ScrollView>

      <BotanistBottomNav active="home" />
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
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 13,
    paddingBottom: 24,
  },

  statusRow: {
    alignItems: 'flex-start',
    marginBottom: 24,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 11,
    borderWidth: 1,
  },

  badgeOnline: {
    backgroundColor: COLORS.successBg,
    borderColor: COLORS.border,
  },

  badgeOffline: {
    backgroundColor: COLORS.warningBg,
    borderColor: pick('#57472C', '#E3CD94'),
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  dotOnline: {
    backgroundColor: COLORS.green,
  },

  dotOffline: {
    backgroundColor: COLORS.warning,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },

  textOnline: {
    color: COLORS.green,
  },

  textOffline: {
    color: COLORS.warning,
  },

  actionGrid: {
    flexDirection: 'row',
    gap: 11,
    marginBottom: 28,
  },

  actionItem: {
    flex: 1,
    minWidth: 0,
  },

  gridButton: {
    flex: 1,
    minHeight: 105,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 17,
    borderRadius: 17,
  },
});
