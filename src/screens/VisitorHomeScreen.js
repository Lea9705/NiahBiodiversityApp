// Visitor's home screen: scan action, search, and a list of featured
// species. FEATURED_SPECIES is dummy data - replace with a call to the
// web team's knowledge-system API once it exists.
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import StyledInput from '../components/StyledInput';
import PrimaryButton from '../components/PrimaryButton';
import RecordListItem from '../components/RecordListItem';
import BottomNav from '../components/BottomNav';

// TODO: replace with real species data from the web knowledge system API
const FEATURED_SPECIES = [
  { key: '1', name: 'Rafflesia tuan-mudae', detail: 'Endangered · Trail 2' },
  { key: '2', name: 'Nepenthes ampullaria', detail: 'Least concern · Cave trail' },
  { key: '3', name: 'Shorea curtisii', detail: 'Vulnerable · Main trail' },
];

export default function VisitorHomeScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const filtered = FEATURED_SPECIES.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <SafeAreaView style={styles.container}>

      <Pressable
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons
          name="arrow-back"
          size={22}
          color={colors.textPrimary}
      />
      <Text style={styles.backText}>Back</Text>
      </Pressable>

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Welcome, visitor</Text>
          <Text style={styles.subtitle}>Niah national park</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Visitor</Text>
        </View>
      </View>

      <PrimaryButton
        title="Scan a plant tag"
        icon={<Ionicons name="scan-outline" size={20} color={colors.buttonText} />}
        onPress={() => {
          // TODO: navigate to a QR scan screen once it's built
        }}
        style={{ marginBottom: 14 }}
      />

      <StyledInput placeholder="Search by common or scientific name" value={search} onChangeText={setSearch} />

      <Text style={styles.sectionLabel}>Featured species nearby</Text>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <RecordListItem
            title={item.name}
            subtitle={item.detail}
            iconName="leaf-outline"
            iconColor={colors.successText}
            iconBg={colors.successBg}
            showChevron
            onPress={() => {
              navigation.navigate('PlantDetail', {
              plant: item,  
              });
              // TODO: navigate to a plant detail screen, passing this item

            }}
          />
        )}
      />

      <BottomNav
        activeIndex={0}
        items={[
          { icon: 'home-outline', label: 'Home' },
          { icon: 'location-outline', label: 'Trail map' },
          { icon: 'bookmark-outline', label: 'Saved' },
          { icon: 'person-outline', label: 'Profile' },
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingVertical: 8, marginBottom: 8, },
  backText: {fontSize: 16, color: colors.textPrimary, marginLeft: 6, },
  container: { flex: 1, backgroundColor: colors.bg, padding: 16},
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  title: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  subtitle: { fontSize: 12, color: colors.textSecondary },
  badge: { backgroundColor: colors.accentBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, color: colors.accentText },
  sectionLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 8 },

});
