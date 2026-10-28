import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
  TextInput,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import BottomNav from '../components/BottomNav';

const API_URL = 'http://52.62.125.146/api/plants';

const FOREST = {
  background: '#F7F8F5',
  card: '#FFFFFF',
  cardBorder: '#D3DFCF',
  green: '#2A7A45',
  greenDark: '#E3F1E6',
  text: '#17261C',
  secondary: '#4D6052',
  muted: '#5F7164',
};

// The hero card keeps its deep-forest look, so its text uses fixed light colours.
const HERO = {
  text: '#F2F5EB',
  green: '#A8D96B',
  secondary: '#A7B3A0',
};

export default function VisitorExploreScreen({ navigation }) {
  const [plants, setPlants] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  async function loadPlants(isRefresh = false) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const data = await response.json();

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.plants)
          ? data.plants
          : [];

      setPlants(
        list.filter(
          (plant) =>
            String(plant.plant_status || '').toLowerCase() === 'approved'
        )
      );
    } catch (err) {
      setError('Unable to load plants. Check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadPlants();
  }, []);

  const filteredPlants = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return plants;

    return plants.filter((plant) =>
      [
        plant.common_name,
        plant.scientific_name,
        plant.family,
      ].some((value) => String(value || '').toLowerCase().includes(query))
    );
  }, [plants, search]);

  function openPlant(plant) {
    navigation.navigate('PlantDetail', {
      plantId: plant.id,
    });
  }

  function getPlantImage(plant) {
    if (Array.isArray(plant.images)) {
      return plant.images.find(
        (image) => typeof image === 'string' && image.trim().length > 0
      );
    }

    if (typeof plant.images === 'string' && plant.images.trim()) {
      return plant.images;
    }

    return null;
  }

  function renderPlant({ item }) {
    const imageUrl = getPlantImage(item);

    return (
      <Pressable
        style={({ pressed }) => [
          styles.plantCard,
          pressed && styles.plantCardPressed,
        ]}
        onPress={() => openPlant(item)}
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
            {item.common_name || 'Unknown plant'}
          </Text>

          <Text style={styles.scientificName} numberOfLines={2}>
            {item.scientific_name || 'Scientific name unavailable'}
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadPlants(true)}
            tintColor={FOREST.green}
            colors={[FOREST.green]}
            progressBackgroundColor={FOREST.card}
          />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.topBar}>
              <View style={styles.brand}>
                <View style={styles.logoBox}>
                  <Ionicons
                    name="leaf"
                    size={24}
                    color={FOREST.green}
                  />
                </View>

                <View>
                  <Text style={styles.brandName}>NIAH</Text>
                  <Text style={styles.brandCaption}>BIODIVERSITY</Text>
                </View>
              </View>

              <View style={styles.parkBadge}>
                <View style={styles.onlineDot} />
                <Text style={styles.parkBadgeText}>NATIONAL PARK</Text>
              </View>
            </View>

            <View style={styles.hero}>
              <View style={styles.heroDecoration}>
                <Ionicons
                  name="leaf-outline"
                  size={100}
                  color="#253B22"
                />
              </View>

              <Text style={styles.eyebrow}>THE WORLD OF PLANTS</Text>

              <Text style={styles.heroTitle}>
                Discover the{'\n'}
                <Text style={styles.heroHighlight}>Wild.</Text>
              </Text>

              <Text style={styles.heroDescription}>
                Explore the remarkable plant life of Niah National Park.
              </Text>

              <View style={styles.heroBottom}>
                <View style={styles.heroDivider} />
                <Text style={styles.heroFootnote}>
                  NATURE • DISCOVERY • CONSERVATION
                </Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Explore plants</Text>
                <Text style={styles.sectionSubtitle}>
                  Find your next discovery
                </Text>
              </View>

              {!loading && !error && (
                <View style={styles.countBadge}>
                  <Text style={styles.countNumber}>
                    {filteredPlants.length}
                  </Text>
                  <Text style={styles.countLabel}>
                    {filteredPlants.length === 1 ? 'PLANT' : 'PLANTS'}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.searchBox}>
              <Ionicons
                name="search-outline"
                size={21}
                color={FOREST.green}
              />

              <TextInput
                style={styles.searchInput}
                placeholder="Search plants, names or family..."
                placeholderTextColor={FOREST.muted}
                value={search}
                onChangeText={setSearch}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />

              {search.length > 0 && (
                <Pressable
                  onPress={() => setSearch('')}
                  hitSlop={10}
                >
                  <Ionicons
                    name="close-circle"
                    size={19}
                    color={FOREST.secondary}
                  />
                </Pressable>
              )}
            </View>

            <View style={styles.collectionHeader}>
              <View style={styles.collectionIcon}>
                <Ionicons
                  name="leaf"
                  size={17}
                  color={FOREST.green}
                />
              </View>
              <Text style={styles.collectionTitle}>Plant collection</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.stateContainer}>
            {loading ? (
              <ActivityIndicator size="large" color={FOREST.green} />
            ) : (
              <Ionicons
                name={error ? 'cloud-offline-outline' : 'leaf-outline'}
                size={42}
                color={FOREST.green}
              />
            )}

            <Text style={styles.stateTitle}>
              {loading
                ? 'Exploring the forest...'
                : error
                  ? 'Something went wrong'
                  : search
                    ? 'No plants found'
                    : 'Nothing to discover yet'}
            </Text>

            <Text style={styles.stateDescription}>
              {loading
                ? 'Loading the plant collection.'
                : error
                  ? error
                  : search
                    ? 'Try another plant name or family.'
                    : 'Plant information will appear here when available.'}
            </Text>

            {error && !loading && (
              <Pressable
                style={styles.retryButton}
                onPress={() => loadPlants()}
              >
                <Ionicons
                  name="refresh-outline"
                  size={17}
                  color={FOREST.background}
                />
                <Text style={styles.retryText}>Try again</Text>
              </Pressable>
            )}
          </View>
        }
        ListFooterComponent={<View style={styles.listFooter} />}
      />

      <BottomNav
        activeIndex={2}
        items={[
          { icon: 'home-outline', label: 'Home' },
          { icon: 'map-outline', label: 'Trail Map' },
          { icon: 'leaf-outline', label: 'Explore' },
        ]}
        onPress={(index) => {
          if (index === 0) {
            navigation.navigate('VisitorHome');
          } else if (index === 1) {
            navigation.navigate('VisitorMap');
          } else if (index === 2) {
            navigation.navigate('VisitorExplore');
          }
        }}
      />
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
    paddingTop: 8,
    paddingBottom: 8,
    flexGrow: 1,
  },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },

  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  logoBox: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: FOREST.greenDark,
    justifyContent: 'center',
    alignItems: 'center',
  },

  brandName: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2.5,
    color: FOREST.text,
  },

  brandCaption: {
    marginTop: 3,
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: '600',
    color: FOREST.secondary,
  },

  parkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: FOREST.cardBorder,
    backgroundColor: FOREST.card,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: FOREST.green,
  },

  parkBadgeText: {
    fontSize: 8,
    letterSpacing: 1,
    fontWeight: '700',
    color: FOREST.secondary,
  },

  hero: {
    backgroundColor: '#1B2A1A',
    borderWidth: 1,
    borderColor: '#30432A',
    borderRadius: 24,
    padding: 22,
    marginBottom: 28,
    overflow: 'hidden',
    minHeight: 225,
    justifyContent: 'center',
  },

  heroDecoration: {
    position: 'absolute',
    right: -12,
    top: 25,
    opacity: 0.75,
    transform: [{ rotate: '-25deg' }],
  },

  eyebrow: {
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: '800',
    color: HERO.green,
    marginBottom: 13,
  },

  heroTitle: {
    fontSize: 37,
    lineHeight: 41,
    fontWeight: '800',
    letterSpacing: -1.3,
    color: HERO.text,
  },

  heroHighlight: {
    color: HERO.green,
  },

  heroDescription: {
    maxWidth: 235,
    fontSize: 12,
    lineHeight: 19,
    color: '#C0CBB8',
    marginTop: 12,
  },

  heroBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 21,
  },

  heroDivider: {
    height: 2,
    width: 22,
    backgroundColor: HERO.green,
    borderRadius: 2,
  },

  heroFootnote: {
    fontSize: 7,
    letterSpacing: 1.1,
    fontWeight: '700',
    color: HERO.secondary,
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

  searchBox: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 15,
    borderRadius: 15,
    backgroundColor: FOREST.card,
    borderWidth: 1,
    borderColor: FOREST.cardBorder,
    marginBottom: 24,
  },

  searchInput: {
    flex: 1,
    color: FOREST.text,
    fontSize: 12,
    paddingVertical: 13,
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
    backgroundColor: '#E3EEE1',
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

  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: FOREST.green,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 17,
  },

  retryText: {
    fontSize: 12,
    fontWeight: '800',
    color: FOREST.background,
  },

  listFooter: {
    height: 14,
  },
});