// Dummy version for testing the list -> detail flow, no backend call.
// Swap DUMMY_PLANTS for a real fetch() once the backend is confirmed working.
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import RecordListItem from '../components/RecordListItem';

const DUMMY_PLANTS = [
  {
    id: '1',
    scientificName: 'Shorea curtisii',
    commonName: 'Seraya',
    family: 'Dipterocarpaceae',
    latitude: '3.841200',
    longitude: '113.769100',
    height: '28.5',
    diameter: '45',
    notes: 'Mature tree, buttress roots visible.',
    photos: [],
  },
  {
    id: '2',
    scientificName: 'Nepenthes ampullaria',
    commonName: 'Pitcher plant',
    family: 'Nepenthaceae',
    latitude: '3.839800',
    longitude: '113.770400',
    height: '0.3',
    diameter: '',
    notes: 'Growing near cave entrance, ground pitchers.',
    photos: [],
  },
  {
    id: '3',
    scientificName: 'Dipterocarpus caudatus',
    commonName: 'Keruing',
    family: 'Dipterocarpaceae',
    latitude: '3.842700',
    longitude: '113.768500',
    height: '35',
    diameter: '60',
    notes: '',
    photos: [],
  },
];

export default function RecordsScreen({ navigation }) {
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
        {DUMMY_PLANTS.length} total
      </Text>

      <FlatList
        data={DUMMY_PLANTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecordListItem
            title={item.scientificName}
            subtitle={item.commonName}
            iconName="leaf-outline"
            iconColor={colors.successText}
            iconBg={colors.successBg}
            showChevron
            onPress={() =>
              navigation.navigate('PlantRecordSummary', {
                record: item,
                readOnly: true,
              })
            }
          />
        )}
      />
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
});