// Explore: the plant records on this phone that the admin approved,
// shown in the same card grid as the Visitor Explore page.
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  FlatList,
  Image,
  StyleSheet,
  StatusBar,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import BotanistHeader from '../components/BotanistHeader';
import BotanistBottomNav from '../components/BotanistBottomNav';
import { useRecords } from '../context/RecordsContext';

const FOREST = {
  background: '#F7F8F5',
  card: '#FFFFFF',
  cardBorder: '#D3DFCF',
  green: '#2A7A45',
  greenDark: '#E3F1E6',
  placeholderBg: '#E3EEE1',
  text: '#17261C',
  secondary: '#4D6052',
  muted: '#5F7164',
};

const isApproved = (record) =>
  String(record.approvalStatus || '').trim().toLowerCase() === 'approved';

function getPlantImage(record) {
  const photos = Array.isArray(record.photos) ? record.photos : [];

  return (
    photos.find(
      (photo) => typeof photo === 'string' && photo.trim().length > 0
    ) || null
  );
}

export default function ExploreScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const { records, loading } = useRecords();

  const approvedRecords = useMemo(
    () => records.filter(isApproved),
    [records]
  );

  const filteredPlants = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return approvedRecords;

    return approvedRecords.filter((record) =>
      [record.commonName, record.scientificName, record.family].some(
        (value) => String(value || '').toLowerCase().includes(query)
      )
    );
  }, [approvedRecords, search]);

  function openRecord(record) {
    navigation.navigate('PlantRecordSummary', {
      record,
      readOnly: true,
    });
  }

  function renderPlant({ item }) {
    const imageUrl = getPlantImage(item);

    return (
      <Pressable
        style={({ pressed }) => [
          styles.plantCard,
          pressed && styles.plantCardPressed,
        ]}
        onPress={() => openRecord(item)}
      >
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.plantImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="leaf-outline" size={38} color={FOREST.green} />
              <Text style={styles.placeholderText}>Plant</Text>
            </View>
          )}

          <View style={styles.imageOverlay} />

          <View style={styles.leafBadge}>
            <Ionicons name="leaf" size={13} color={FOREST.green} />
          </View>
        </View>

        <View style={styles.plantInfo}>
          <Text style={styles.commonName} numberOfLines={2}>
            {item.commonName || 'Unknown plant'}
          </Text>

          <Text style={styles.scientificName} numberOfLines={2}>
            {item.scientificName || 'Scientific name unavailable'}
          </Text>

          <View style={styles.cardFooter}>
            <View style={styles.familyContainer}>
              <Ionicons
                name="flower-outline"
                size={12}
                color={FOREST.green}
              />
              <Text style={styles.familyText} numberOfLines={1}>
                {item.family || 'Plant species'}
              </Text>
            </View>

            <Ionicons
              name="arrow-forward"
              size={15}
              color={FOREST.green}
            />
          </View>
        </View>
      </Pressable>
    );
  }

  const listHeader = (
    <View>
      <BotanistHeader />

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Explore plants</Text>
          <Text style={styles.sectionSubtitle}>Approved plant records</Text>
        </View>

        {!loading && (
          <View style={styles.countBadge}>
            <Text style={styles.countNumber}>{filteredPlants.length}</Text>
            <Text style={styles.countLabel}>
              {filteredPlants.length === 1 ? 'PLANT' : 'PLANTS'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search plants, names or family..."
            placeholderTextColor={FOREST.muted}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={Keyboard.dismiss}
          />

          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={10}>
              <Ionicons
                name="close-circle"
                size={19}
                color={FOREST.secondary}
              />
            </Pressable>
          )}
        </View>

        <TouchableOpacity
          style={styles.searchButton}
          onPress={Keyboard.dismiss}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Search"
        >
          <Ionicons name="search" size={22} color={FOREST.background} />
        </TouchableOpacity>
      </View>

      <View style={styles.collectionHeader}>
        <View style={styles.collectionIcon}>
          <Ionicons name="leaf" size={17} color={FOREST.green} />
        </View>
        <Text style={styles.collectionTitle}>Plant collection</Text>
      </View>
    </View>
  );

  const listEmpty = (
    <View style={styles.stateContainer}>
      {loading ? (
        <ActivityIndicator size="large" color={FOREST.green} />
      ) : (
        <Ionicons
          name={search ? 'search-outline' : 'leaf-outline'}
          size={42}
          color={FOREST.green}
        />
      )}

      <Text style={styles.stateTitle}>
        {loading
          ? 'Loading plant records...'
          : search
            ? 'No plants found'
            : 'No approved plants yet'}
      </Text>

      <Text style={styles.stateDescription}>
        {loading
          ? 'Reading the records saved on this phone.'
          : search
            ? 'Try another plant name or family.'
            : 'Plants approved by the admin will appear here after they are downloaded to this phone.'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right']}
    >
      <StatusBar barStyle="dark-content" backgroundColor={FOREST.background} />

      <FlatList
        key="plant-grid"
        data={filteredPlants}
        keyExtractor={(item, index) => String(item.id ?? index)}
        renderItem={renderPlant}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={<View style={styles.listFooter} />}
      />

      <BotanistBottomNav active="explore" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FOREST.background,
  },

  listContent: {
    paddingHorizontal: 18,
    paddingTop: 13,
    paddingBottom: 8,
    flexGrow: 1,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: FOREST.text,
    letterSpacing: -0.4,
  },

  sectionSubtitle: {
    fontSize: 12,
    color: FOREST.secondary,
    marginTop: 5,
  },

  countBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 54,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 13,
    backgroundColor: FOREST.greenDark,
  },

  countNumber: {
    fontSize: 17,
    fontWeight: '800',
    color: FOREST.green,
  },

  countLabel: {
    marginTop: 2,
    fontSize: 7,
    letterSpacing: 1,
    fontWeight: '800',
    color: FOREST.secondary,
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },

  searchBox: {
    flex: 1,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
    backgroundColor: FOREST.card,
    borderWidth: 1,
    borderColor: FOREST.cardBorder,
  },

  searchInput: {
    flex: 1,
    color: FOREST.text,
    fontSize: 12,
    paddingVertical: 13,
  },

  searchButton: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: FOREST.green,
    alignItems: 'center',
    justifyContent: 'center',
  },

  collectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 14,
  },

  collectionIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FOREST.greenDark,
  },

  collectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: FOREST.text,
  },

  gridRow: {
    justifyContent: 'space-between',
    gap: 12,
  },

  plantCard: {
    flex: 1,
    minWidth: 0,
    marginBottom: 13,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: FOREST.card,
    borderWidth: 1,
    borderColor: FOREST.cardBorder,
  },

  plantCardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },

  imageContainer: {
    height: 145,
    backgroundColor: FOREST.greenDark,
    position: 'relative',
    overflow: 'hidden',
  },

  plantImage: {
    width: '100%',
    height: '100%',
  },

  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FOREST.placeholderBg,
  },

  placeholderText: {
    color: FOREST.secondary,
    fontSize: 10,
    marginTop: 7,
    letterSpacing: 1,
  },

  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 18, 8, 0.06)',
  },

  leafBadge: {
    position: 'absolute',
    right: 9,
    top: 9,
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: '#CFE0CB',
  },

  plantInfo: {
    paddingHorizontal: 11,
    paddingTop: 12,
    paddingBottom: 12,
  },

  commonName: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    color: FOREST.text,
    minHeight: 36,
  },

  scientificName: {
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
    color: FOREST.secondary,
    marginTop: 4,
    minHeight: 32,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 5,
    borderTopWidth: 1,
    borderTopColor: FOREST.cardBorder,
    paddingTop: 10,
    marginTop: 9,
  },

  familyContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  familyText: {
    flex: 1,
    fontSize: 9,
    color: FOREST.secondary,
  },

  stateContainer: {
    flexGrow: 1,
    minHeight: 210,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 30,
  },

  stateTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: FOREST.text,
    textAlign: 'center',
    marginTop: 14,
  },

  stateDescription: {
    fontSize: 12,
    lineHeight: 19,
    color: FOREST.secondary,
    textAlign: 'center',
    marginTop: 8,
  },

  listFooter: {
    height: 14,
  },
});