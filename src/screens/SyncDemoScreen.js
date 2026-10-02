// Standalone demo of offline-first local + cloud sync, for showing the
// mechanism to the team. Entirely self-contained - does not touch
// PlantRecordSummaryScreen or any real backend. Starts empty on purpose,
// so you can watch a record move: added -> local/pending -> synced/cloud.
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const SAMPLE_PLANTS = [
  { scientificName: 'Shorea curtisii', commonName: 'Seraya', family: 'Dipterocarpaceae', height: '28.5', diameter: '45', latitude: '3.841200', longitude: '113.769100', notes: 'Mature tree, buttress roots visible.' },
  { scientificName: 'Nepenthes ampullaria', commonName: 'Pitcher plant', family: 'Nepenthaceae', height: '0.3', diameter: '', latitude: '3.839800', longitude: '113.770400', notes: 'Growing near cave entrance, ground pitchers.' },
  { scientificName: 'Dipterocarpus caudatus', commonName: 'Keruing', family: 'Dipterocarpaceae', height: '35', diameter: '60', latitude: '3.842700', longitude: '113.768500', notes: '' },
  { scientificName: 'Rafflesia tuan-mudae', commonName: 'Rafflesia', family: 'Rafflesiaceae', height: '0.1', diameter: '', latitude: '3.838500', longitude: '113.771200', notes: 'In bloom, single flower observed.' },
];

export default function SyncDemoScreen({ navigation }) {
  const [localDB, setLocalDB] = useState([]);
  const [cloudDB, setCloudDB] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Refs instead of state for the background checker below, so it always
  // reads the latest value without needing to restart itself.
  const isOnlineRef = useRef(false);
  const syncingRef = useRef(false);

  useEffect(() => {
    isOnlineRef.current = isOnline;
  }, [isOnline]);

  const addDummyRecord = () => {
    const base = SAMPLE_PLANTS[localDB.length % SAMPLE_PLANTS.length];
    const record = {
      id: `plant_${Date.now()}`,
      ...base,
      photos: [],
      status: 'pending',
    };
    // Mirrors the real rule: writing to local always happens instantly,
    // regardless of connectivity.
    setLocalDB((current) => [...current, record]);
  };

  // A single background check, created once on mount and never torn down
  // or restarted - that's what prevents a new record from cancelling a
  // sync that's already in progress. It polls every 400ms: if online,
  // not already mid-sync, and something's pending, it starts one.
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!isOnlineRef.current || syncingRef.current) return;

      setLocalDB((current) => {
        const pending = current.filter((r) => r.status === 'pending');
        if (pending.length === 0) return current;

        syncingRef.current = true;
        setSyncing(true);

        // Simulated network delay, same idea as a real API call taking a moment.
        setTimeout(() => {
          setCloudDB((cloud) => [...cloud, ...pending]);
          setLocalDB((latest) =>
            latest.map((r) =>
              pending.some((p) => p.id === r.id) ? { ...r, status: 'synced' } : r
            )
          );
          syncingRef.current = false;
          setSyncing(false);
        }, 1200);

        return current;
      });
    }, 400);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={16} color={colors.textSecondary} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Offline sync demo</Text>
      <Text style={styles.subtitle}>For testing the local → cloud sync mechanism only.</Text>

      <View style={styles.onlineRow}>
        <View>
          <Text style={styles.onlineLabel}>Simulated internet connection</Text>
          <Text style={styles.onlineValue}>{isOnline ? 'Online' : 'Offline'}</Text>
        </View>
        <Switch value={isOnline} onValueChange={setIsOnline} />
      </View>

      <TouchableOpacity style={styles.actionButton} onPress={addDummyRecord}>
        <Ionicons name="add" size={18} color={colors.textPrimary} />
        <Text style={styles.actionButtonText}>Add dummy record</Text>
      </TouchableOpacity>

      {syncing && (
        <View style={styles.syncingBanner}>
          <Ionicons name="sync" size={14} color={colors.accentText} />
          <Text style={styles.syncingText}>Syncing to cloud…</Text>
        </View>
      )}

      <View style={styles.columns}>
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Local database</Text>
          <Text style={styles.columnCount}>{localDB.length} total</Text>
          <FlatList
            data={localDB}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={<Text style={styles.emptyText}>Empty</Text>}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.recordRow}
                onPress={() => navigation.navigate('PlantRecordSummary', { record: item, readOnly: true })}
              >
                <Text style={styles.recordName} numberOfLines={1}>{item.scientificName}</Text>
                <Text
                  style={[
                    styles.recordStatus,
                    item.status === 'synced' ? styles.statusSynced : styles.statusPending,
                  ]}
                >
                  {item.status}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        <View style={styles.column}>
          <Text style={styles.columnTitle}>Cloud database</Text>
          <Text style={styles.columnCount}>{cloudDB.length} total</Text>
          <FlatList
            data={cloudDB}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={<Text style={styles.emptyText}>Empty</Text>}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.recordRow}
                onPress={() => navigation.navigate('PlantRecordSummary', { record: item, readOnly: true })}
              >
                <Text style={styles.recordName} numberOfLines={1}>{item.scientificName}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  backText: { color: colors.textSecondary, fontSize: 13 },
  title: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
  subtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2, marginBottom: 20 },
  onlineRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surfaceAlt, borderRadius: 10, padding: 14, marginBottom: 16 },
  onlineLabel: { fontSize: 12, color: colors.textSecondary },
  onlineValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginTop: 2 },
  actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.surfaceAlt, borderWidth: 0.5, borderColor: colors.border, borderRadius: 8, paddingVertical: 12, marginBottom: 12 },
  actionButtonText: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  syncingBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 20 },
  syncingText: { fontSize: 12, color: colors.accentText },
  columns: { flex: 1, flexDirection: 'row', gap: 10 },
  column: { flex: 1, backgroundColor: colors.surfaceAlt, borderRadius: 10, padding: 12 },
  columnTitle: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  columnCount: { fontSize: 11, color: colors.textMuted, marginBottom: 10 },
  emptyText: { fontSize: 12, color: colors.textMuted, marginTop: 8 },
  recordRow: { paddingVertical: 8, borderTopWidth: 0.5, borderTopColor: colors.border },
  recordName: { fontSize: 12, color: colors.textPrimary },
  recordStatus: { fontSize: 10, marginTop: 2, textTransform: 'uppercase' },
  statusPending: { color: colors.warningText },
  statusSynced: { color: colors.successText },
});