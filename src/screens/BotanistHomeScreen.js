// Botanist's home screen: scan/register actions, search, and a list of
// recent records. The record list is dummy data for now - same pattern
// as your contact_list.js lab, just swap DUMMY_RECORDS for real local
// storage + synced API data once that's ready.
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import StyledInput from '../components/StyledInput';
import PrimaryButton from '../components/PrimaryButton';
import OutlineButton from '../components/OutlineButton';
import RecordListItem from '../components/RecordListItem';
import BottomNav from '../components/BottomNav';

// TODO: replace with records read from local offline storage (SQLite/WatermelonDB)
const DUMMY_RECORDS = [
  { key: '1', name: 'Shorea curtisii', status: 'synced', detail: 'Synced · 2h ago' },
  { key: '2', name: 'Nepenthes ampullaria', status: 'pending', detail: 'Pending sync · GPS logged' },
  { key: '3', name: 'Dipterocarpus caudatus', status: 'pending', detail: 'Pending sync · photo attached' },
];

export default function BotanistHomeScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const pendingCount = DUMMY_RECORDS.filter((r) => r.status === 'pending').length;
  const filtered = DUMMY_RECORDS.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Ground truthing</Text>
          <Text style={styles.subtitle}>Niah national park</Text>
        </View>
        <View style={styles.badge}>
          <Ionicons name="cloud-offline-outline" size={13} color={colors.warningText} />
          <Text style={styles.badgeText}>Offline, {pendingCount} pending</Text>
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

      <Text style={styles.sectionLabel}>Recent records</Text>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <RecordListItem
            title={item.name}
            subtitle={item.detail}
            iconName={item.status === 'synced' ? 'checkmark' : 'time-outline'}
            iconColor={item.status === 'synced' ? colors.successText : colors.warningText}
            iconBg={item.status === 'synced' ? colors.successBg : colors.warningBg}
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
          if (index === 3) {
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
});
