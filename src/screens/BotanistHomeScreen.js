
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import StyledInput from '../components/StyledInput';
import PrimaryButton from '../components/PrimaryButton';
import OutlineButton from '../components/OutlineButton';
import RecordListItem from '../components/RecordListItem';
import BottomNav from '../components/BottomNav';
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
  const [search, setSearch] = useState('');
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);

  const { records, isOnline } = useRecords();

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const fetchPendingApprovals = async () => {
        try {
          const response = await fetch(
            'http://52.62.125.146/api/plants'
          );

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
          console.error(
            'Failed to fetch pending approvals:',
            error
          );
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

  const filtered = records.filter((record) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    const scientificName = (
      record.scientificName || ''
    ).toLowerCase();

    const commonName = (
      record.commonName || ''
    ).toLowerCase();

    const recordId = String(record.id || '').toLowerCase();

    return (
      scientificName.includes(query) ||
      commonName.includes(query) ||
      recordId.includes(query)
    );
  });

  const renderHeader = () => (
    <View>
      {/* Welcome header */}
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.brand}>NIAH BIODIVERSITY</Text>
          <Text style={styles.title}>Ground Truthing</Text>
          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={14}
              color={COLORS.green}
            />
            <Text style={styles.subtitle}>Niah National Park</Text>
          </View>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            name="leaf"
            size={26}
            color={COLORS.green}
          />
        </View>
      </View>

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
            name={
              isOnline
                ? 'cloud-outline'
                : 'cloud-offline-outline'
            }
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

      {/* Quick actions */}
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Quick actions</Text>
        <Text style={styles.sectionHint}>Field tools</Text>
      </View>

      <View style={styles.actionGrid}>
        <View style={styles.actionItem}>
          <PrimaryButton
            title="Scan QR tag"
            icon={
              <Ionicons
                name="scan-outline"
                size={21}
                color={COLORS.bg}
              />
            }
            onPress={() => navigation.navigate('ScanQR')}
            style={styles.gridButton}
          />
        </View>

        <View style={styles.actionItem}>
          <OutlineButton
            title="New plant record"
            icon={
              <Ionicons
                name="add"
                size={22}
                color={COLORS.green}
              />
            }
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

      {/* Recent records heading */}
      <View style={styles.recordsHeading}>
        <View>
          <Text style={styles.sectionTitle}>Recent records</Text>
          <Text style={styles.sectionHint}>
            Your locally saved plant records
          </Text>
        </View>

        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('Records')}
          activeOpacity={0.75}
        >
          <Text style={styles.viewAllText}>View all</Text>
          <Ionicons
            name="arrow-forward"
            size={14}
            color={COLORS.green}
          />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <StyledInput
          placeholder="Search species or record"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {search.trim().length > 0 && (
        <Text style={styles.searchResultText}>
          {filtered.length} matching record
          {filtered.length !== 1 ? 's' : ''}
        </Text>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name={
            search.trim()
              ? 'search-outline'
              : 'leaf-outline'
          }
          size={29}
          color={COLORS.green}
        />
      </View>

      <Text style={styles.emptyTitle}>
        {search.trim()
          ? 'No matching records'
          : 'No plant records yet'}
      </Text>

      <Text style={styles.emptySubtitle}>
        {search.trim()
          ? 'Try another species name or record ID.'
          : 'Scan a QR tag or create a new plant record to get started.'}
      </Text>

      {!search.trim() && (
        <TouchableOpacity
          style={styles.emptyAction}
          onPress={() => navigation.navigate('NewPlantRecord')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="add"
            size={17}
            color={COLORS.bg}
          />
          <Text style={styles.emptyActionText}>
            Create plant record
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.bg}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item, index) =>
          String(item.id || index)
        }
        renderItem={({ item }) => (
          <View style={styles.recordItem}>
            <RecordListItem
              title={item.scientificName || 'Unnamed plant'}
              subtitle={
                item.status === 'synced'
                  ? 'Synced'
                  : 'Pending sync'
              }
              iconName={
                item.status === 'synced'
                  ? 'checkmark'
                  : 'time-outline'
              }
              iconColor={
                item.status === 'synced'
                  ? COLORS.green
                  : COLORS.warning
              }
              iconBg={
                item.status === 'synced'
                  ? COLORS.successBg
                  : COLORS.warningBg
              }
            />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
      />

      <BottomNav
        variant="botanist"
        activeIndex={0}
        items={[
          { icon: 'home-outline', label: 'Home' },
          { icon: 'list-outline', label: 'Records' },
          { icon: 'location-outline', label: 'Map' },
          { icon: 'person-outline', label: 'Profile' },
        ]}
        onPress={(index) => {
          if (index === 1) {
            navigation.navigate('Records');
          } else if (index === 3) {
            navigation.navigate('BotanistProfile');
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  listContent: {
    paddingHorizontal: 18,
    paddingTop: 13,
    paddingBottom: 24,
    flexGrow: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 17,
  },

  headerCopy: {
    flex: 1,
  },

  brand: {
    color: COLORS.green,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.7,
    marginBottom: 7,
  },

  title: {
    color: COLORS.text,
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: -0.6,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 12,
  },

  headerIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 25,
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

  recordsHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 13,
  },

  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingLeft: 8,
  },

  viewAllText: {
    color: COLORS.green,
    fontSize: 11,
    fontWeight: '800',
  },

  searchContainer: {
    marginBottom: 12,
  },

  searchResultText: {
    color: COLORS.muted,
    fontSize: 10,
    marginBottom: 10,
  },

  recordItem: {
    marginBottom: 10,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 30,
    marginTop: 3,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 19,
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },

  emptySubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 7,
  },

  emptyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: COLORS.green,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 11,
    marginTop: 17,
  },

  emptyActionText: {
    color: COLORS.bg,
    fontSize: 11,
    fontWeight: '900',
  },
});
