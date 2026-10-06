// Botanist's home screen: scan/register actions, search, and a list of
// recent records. The record list is dummy data for now - same pattern
// as your contact_list.js lab, just swap DUMMY_RECORDS for real local
// storage + synced API data once that's ready.
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import StyledInput from '../components/StyledInput';
import PrimaryButton from '../components/PrimaryButton';
import OutlineButton from '../components/OutlineButton';
import RecordListItem from '../components/RecordListItem';
import BottomNav from '../components/BottomNav';
import { useRecords } from '../context/RecordsContext';


export default function BotanistHomeScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const { records, isOnline } = useRecords();
  const pendingCount = records.filter(
    (r) => r.status === 'pending'
  ).length;
  const filtered = records.filter((r) =>
    (r.scientificName || '')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>

        <View>
          <Text style={styles.title}>Ground Truthing</Text>
          <Text style={styles.subtitle}>Niah National Park</Text>
        </View>

        <View
          style={[
            styles.badge,
            isOnline ? styles.badgeOnline : styles.badgeOffline,
          ]}
        >
          <Ionicons
            name={isOnline ? 'cloud-outline' : 'cloud-offline-outline'}
            size={13}
            color={isOnline ? colors.successText : colors.warningText}
          />

          <Text
            style={[
            styles.badgeText,
            isOnline ? styles.badgeTextOnline : styles.badgeTextOffline,
            ]}
          >
            {isOnline
              ? pendingCount > 0
                ? `Online, ${pendingCount} pending`
                : 'Online'
              : pendingCount > 0
                ? `Offline, ${pendingCount} pending`
                : 'Offline'}
          </Text>
        </View>

    </View>
      <View style={styles.grid2}>
        <PrimaryButton
          title="Scan QR tag"
          icon={<Ionicons name="scan-outline" size={22} color={colors.buttonText} />}
          onPress={() => navigation.navigate('ScanQR')}
          style={styles.gridButton}
        />
        <OutlineButton
          title="New plant record"
          icon={<Ionicons name="add" size={22} color={colors.textPrimary} />}
          onPress={() => navigation.navigate('NewPlantRecord')}
          style={styles.gridButton}
        />
      </View>

      <StyledInput placeholder="Search species or record" value={search} onChangeText={setSearch} />

      <TouchableOpacity
        style={styles.activitiesCard}
        onPress={() => navigation.navigate('Activities')}
      >
        <View>
          <Text style={styles.activitiesTitle}>My Activities</Text>
          <Text style={styles.activitiesSubtitle}>
            {pendingCount} pending submission{pendingCount !== 1 ? 's' : ''}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      <Text style={styles.sectionLabel}>Recent records</Text>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecordListItem
            title={item.scientificName || 'Unnamed plant'}
            subtitle={
              item.status === 'synced'
                ? 'Synced'
                : 'Pending sync'
            }
            iconName={item.status === 'synced' ? 'checkmark' : 'time-outline'}
            iconColor={
              item.status === 'synced'
                ? colors.successText
                : colors.warningText
            }
            iconBg={
              item.status === 'synced'
                ? colors.successBg
                : colors.warningBg
            }
          />
        )}
      />

      <BottomNav
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
  container: { flex: 1, backgroundColor: colors.bg, padding: 16},
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  title: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  subtitle: { fontSize: 12, color: colors.textSecondary },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.warningBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, color: colors.warningText },
  grid2: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  gridButton: { flex: 1, flexDirection: 'column', paddingVertical: 16 },
  sectionLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 8 },
  activitiesCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, padding: 14, borderRadius: 12, marginBottom: 16, },
  activitiesTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, },
  activitiesSubtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 4, },
  badgeOnline: { backgroundColor: colors.successBg, },
  badgeOffline: { backgroundColor: colors.warningBg, },
  badgeTextOnline: { color: colors.successText, },
  badgeTextOffline: { color: colors.warningText, },
});
