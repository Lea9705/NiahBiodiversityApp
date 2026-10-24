// Botanist home: greeting header, connection status, New plant record,
// and My Activities.
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import OutlineButton from '../components/OutlineButton';
import BotanistHeader from '../components/BotanistHeader';
import BotanistBottomNav from '../components/BotanistBottomNav';
import { useRecords } from '../context/RecordsContext';

const COLORS = {
  bg: '#0B1712',
  surface: '#14251B',
  surfaceLight: '#1C3023',
  green: '#B8E986',
  text: '#F2F6EE',
  muted: '#9BAE9F',
  border: '#2A4031',
  warning: '#F2C879',
  warningBg: '#3B3020',
  successBg: '#203B2A',
};

export default function BotanistHomeScreen({ navigation }) {
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);

  const { records, isOnline } = useRecords();

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const fetchPendingApprovals = async () => {
        try {
          const response = await fetch('http://52.62.125.146/api/plants');

          if (!response.ok) {
            throw new Error('Failed to fetch plant records');
          }

          const data = await response.json();
          const plants = Array.isArray(data) ? data : [];

          const count = plants.filter(
            (plant) =>
              String(plant.plant_status || 'Pending')
                .trim()
                .toLowerCase() === 'pending'
          ).length;

          if (active) {
            setPendingApprovalCount(count);
          }
        } catch (error) {
          console.error('Failed to fetch pending approvals:', error);
        }
      };

      fetchPendingApprovals();

      return () => {
        active = false;
      };
    }, [])
  );

  const pendingCount = records.filter(
    (record) => record.status === 'pending'
  ).length;

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right']}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

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

        {/* My activities */}
        <TouchableOpacity
          style={styles.activitiesCard}
          onPress={() => navigation.navigate('Activities')}
          activeOpacity={0.8}
        >
          <View style={styles.activitiesIcon}>
            <Ionicons
              name="clipboard-outline"
              size={23}
              color={COLORS.green}
            />
          </View>

          <View style={styles.activitiesCopy}>
            <Text style={styles.activitiesTitle}>My Activities</Text>
            <Text style={styles.activitiesSubtitle}>
              {pendingApprovalCount} pending submission
              {pendingApprovalCount !== 1 ? 's' : ''}
            </Text>
            <Text style={styles.activitiesHint}>
              View your submission activity
            </Text>
          </View>

          <View style={styles.chevronCircle}>
            <Ionicons
              name="chevron-forward"
              size={17}
              color={COLORS.green}
            />
          </View>
        </TouchableOpacity>
      </ScrollView>

      <BotanistBottomNav active="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    borderColor: '#57472C',
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

  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },

  sectionHint: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },

  actionGrid: {
    flexDirection: 'row',
    gap: 11,
    marginBottom: 20,
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

  activitiesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
  },

  activitiesIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activitiesCopy: {
    flex: 1,
  },

  activitiesTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
  },

  activitiesSubtitle: {
    color: COLORS.green,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 5,
  },

  activitiesHint: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 4,
  },

  chevronCircle: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});