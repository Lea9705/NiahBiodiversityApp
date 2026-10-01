// Standalone demo of offline-first local + cloud sync, for showing the
// mechanism to the team. Entirely self-contained - does not touch
// PlantRecordSummaryScreen or any real backend. Starts empty on purpose,
// so you can watch a record move: added -> local/pending -> synced/cloud.
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const SAMPLE_NAMES = ['Shorea curtisii', 'Nepenthes ampullaria', 'Dipterocarpus caudatus', 'Rafflesia tuan-mudae'];

export default function SyncDemoScreen({ navigation }) {
  const [localDB, setLocalDB] = useState([]);
  const [cloudDB, setCloudDB] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const addDummyRecord = () => {
    const name = SAMPLE_NAMES[localDB.length % SAMPLE_NAMES.length];
    const record = {
      id: `plant_${Date.now()}`,
      name,
      status: 'pending',
    };
    // Mirrors the real rule: writing to local always happens immediately,
    // regardless of connectivity.
    setLocalDB((current) => [...current, record]);
  };

  const syncNow = () => {
    if (!isOnline) {
      Alert.alert('No internet', 'Records stay in the local database until a connection is available.');
      return;
    }

    const pending = localDB.filter((r) => r.status === 'pending');
    if (pending.length === 0) {
      Alert.alert('Nothing to sync', 'All records are already synced.');
      return;
    }

    setSyncing(true);
    // Simulated network delay, same idea as a real API call taking a moment.
    setTimeout(() => {
      setCloudDB((current) => [...current, ...pending]);
      setLocalDB((current) =>
        current.map((r) => (r.status === 'pending' ? { ...r, status: 'synced' } : r))
      );
      setSyncing(false);
    }, 1200);
  };

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

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionButton} onPress={addDummyRecord}>
          <Ionicons name="add" size={18} color={colors.textPrimary} />
          <Text style={styles.actionButtonText}>Add dummy record</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.syncButton]}
          onPress={syncNow}
          disabled={syncing}
        >
          <Ionicons name="sync" size={18} color={colors.buttonText} />
          <Text style={styles.syncButtonText}>{syncing ? 'Syncing…' : 'Sync now'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.columns}>
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Local database</Text>
          <Text style={styles.columnCount}>{localDB.length} total</Text>
          <FlatList
            data={localDB}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={<Text style={styles.emptyText}>Empty</Text>}
            renderItem={({ item }) => (
              <View style={styles.recordRow}>
                <Text style={styles.recordName} numberOfLines={1}>{item.name}</Text>
                <Text
                  style={[
                    styles.recordStatus,
                    item.status === 'synced' ? styles.statusSynced : styles.statusPending,
                  ]}
                >
                  {item.status}
                </Text>
              </View>
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
              <View style={styles.recordRow}>
                <Text style={styles.recordName} numberOfLines={1}>{item.name}</Text>
              </View>
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
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.surfaceAlt, borderWidth: 0.5, borderColor: colors.border, borderRadius: 8, paddingVertical: 12 },
  actionButtonText: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  syncButton: { backgroundColor: colors.accentText, borderWidth: 0 },
  syncButtonText: { fontSize: 13, fontWeight: '600', color: colors.buttonText },
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