// Shows plant records saved on this phone (via SQLite-backed
// RecordsContext). Tapping one opens the review screen in read-only mode.
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import RecordListItem from '../components/RecordListItem';
import { useRecords } from '../context/RecordsContext';

export default function RecordsScreen({ navigation }) {
  
const { records, loading } = useRecords();

const approvedRecords = records.filter(
  (record) =>
    String(record.approvalStatus || '').trim().toLowerCase() === 'approved'
);


  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.back}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={16}
            color={colors.textSecondary}
          />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text
          style={styles.title}
          pointerEvents="none"
        >
          Plant Records
        </Text>
      </View>

      <Text style={styles.subtitle}>
        {approvedRecords.length} total
      </Text>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={colors.accentText} />
        </View>
      ) : (
        <FlatList
          data={approvedRecords}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RecordListItem
              title={item.scientificName || 'Unnamed record'}
              subtitle={`${item.commonName || 'No common name'} · ${item.status === 'synced' ? 'Synced' : 'Pending sync'}`}
              iconName={item.status === 'synced' ? 'checkmark' : 'time-outline'}
              iconColor={item.status === 'synced' ? colors.successText : colors.warningText}
              iconBg={item.status === 'synced' ? colors.successBg : colors.warningBg}
              showChevron
              onPress={() =>
                navigation.navigate('PlantRecordSummary', {
                  record: item,
                  readOnly: true,
                })
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.centerBox}>
              <Text style={styles.emptyText}>No plant records yet.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', },
  backText: { color: colors.textSecondary, fontSize: 13 },
  header: { height: 40, justifyContent: 'center', position: 'relative', marginBottom: 4, },
  title: { position: 'absolute',left: 0, right: 0, textAlign: 'center', fontSize: 18, fontWeight: '600', color: colors.textPrimary, },
  subtitle: { fontSize: 12, color: colors.textSecondary, marginBottom: 16, },
  centerBox: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: { fontSize: 13, color: colors.textMuted },
});