// Botanist home: greeting header, connection status, New plant record,
// and My Activities.
import React, { useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
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
import { authFetch } from '../utils/session';

const COLORS = {
  bg: '#F7F8F5',
  surface: '#FFFFFF',
  surfaceLight: '#E3F1E6',
  green: '#2A7A45',
  text: '#17261C',
  muted: '#5E7062',
  border: '#D3DFCF',
  warning: '#8A5A00',
  warningBg: '#FBEED0',
  successBg: '#E8F5EB',
};

export default function BotanistHomeScreen({ navigation }) {
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);

  const { records, isOnline } = useRecords();

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const fetchPendingApprovals = async () => {
        try {
          const token = await SecureStore.getItemAsync('authToken');
          const userJson = await SecureStore.getItemAsync('authUser');

          if (!token || !userJson) {
            throw new Error('You are not signed in. Please log in again.');
          }

          const currentUser = JSON.parse(userJson);
          const userId = currentUser?.id;

          if (userId === undefined || userId === null) {
            throw new Error('Your login session has no user ID. Please log in again.');
          }

          const response = await authFetch('http://52.62.125.146/api/plants', {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          });

          const responseText = await response.text();
          let data;

          try {
            data = responseText ? JSON.parse(responseText) : [];
          } catch {
            throw new Error(`The server returned an invalid response (HTTP ${response.status}).`);
          }

          if (!response.ok) {
            throw new Error(data?.error || `Request failed (HTTP ${response.status}).`);
          }

          if (!Array.isArray(data)) {
            throw new Error('The plants API did not return a list.');
          }

          // Only count records submitted by this logged-in botanist.
          const count = data.filter((plant) => {
            const belongsToCurrentUser =
              String(plant.submitted_by) === String(userId);
            const isPending =
              String(plant.plant_status || '').trim().toLowerCase() === 'pending';

            return belongsToCurrentUser && isPending;
          }).length;

          if (active) setPendingApprovalCount(count);
        } catch (error) {
          console.error('Failed to fetch my pending approvals:', error.message);
          // Keep the previous count rather than incorrectly replacing it with 0.
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
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

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
    borderColor: '#E3CD94',
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