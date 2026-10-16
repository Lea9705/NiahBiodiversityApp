
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import BackButton from '../components/BackButton';
import { useRecords } from '../context/RecordsContext';

const COLORS = {
  bg: '#0B1712',
  surface: '#14251B',
  surfaceLight: '#1C3023',
  green: '#B8E986',
  text: '#F2F6EE',
  muted: '#9BAE9F',
  border: '#2A4031',
  successBg: '#203B2A',
  warning: '#F2C879',
  warningBg: '#3B3020',
};

export default function RecordsScreen({ navigation }) {
  const { records, loading } = useRecords();

  const approvedRecords = records.filter(
    (record) =>
      String(record.approvalStatus || '').trim().toLowerCase() ===
      'approved'
  );

  const renderRecord = ({ item }) => {
    const synced = item.status === 'synced';

    return (
      <TouchableOpacity
        style={styles.recordRow}
        activeOpacity={0.75}
        onPress={() =>
          navigation.navigate('PlantRecordSummary', {
            record: item,
            readOnly: true,
          })
        }
      >
        <View
          style={[
            styles.recordIcon,
            {
              backgroundColor: synced
                ? COLORS.successBg
                : COLORS.warningBg,
            },
          ]}
        >
          <Ionicons
            name={synced ? 'checkmark' : 'time-outline'}
            size={22}
            color={synced ? COLORS.green : COLORS.warning}
          />
        </View>

        <View style={styles.recordContent}>
          <Text style={styles.recordTitle} numberOfLines={1}>
            {item.scientificName || 'Unnamed record'}
          </Text>

          <Text style={styles.recordSubtitle} numberOfLines={2}>
            {item.commonName || 'No common name'}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={21}
          color={COLORS.muted}
        />
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name="leaf-outline"
          size={30}
          color={COLORS.green}
        />
      </View>

      <Text style={styles.emptyTitle}>
        {records.length === 0
          ? 'No plant records yet'
          : 'No approved records'}
      </Text>

      <Text style={styles.emptyText}>
        {records.length === 0
          ? 'Your saved plant records will appear here.'
          : 'Approved plant records will appear here when available.'}
      </Text>
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

      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />

        <Text style={styles.title}>Plant Records</Text>

        <View style={styles.headerSpacer} />
      </View>

      <Text style={styles.subtitle}>
        {approvedRecords.length} total
      </Text>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={COLORS.green} />
          <Text style={styles.loadingText}>
            Loading plant records...
          </Text>
        </View>
      ) : (
        <FlatList
          data={approvedRecords}
          keyExtractor={(item, index) =>
            String(item.id || index)
          }
          renderItem={renderRecord}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.list,
            approvedRecords.length === 0 && styles.emptyList,
          ]}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  header: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  title: {
    flex: 1,
    color: COLORS.text,
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
    marginHorizontal: 8,
  },

  headerSpacer: {
    width: 44,
    height: 44,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginBottom: 16,
  },

  list: {
    paddingBottom: 25,
  },

  recordRow: {
    minHeight: 65,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    gap: 13,
  },

  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  recordContent: {
    flex: 1,
    minWidth: 0,
  },

  recordTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },

  recordSubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
  },

  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  loadingText: {
    color: COLORS.muted,
    fontSize: 12,
  },

  emptyList: {
    flexGrow: 1,
  },

  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 70,
  },

  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },

  emptyText: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 7,
  },
});
