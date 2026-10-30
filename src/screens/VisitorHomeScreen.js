
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';
import BackButton from '../components/BackButton';
import { useTheme } from '../theme/ThemeContext';

const API_URL = 'http://52.62.125.146/api/plants';

const PALETTES = {
  dark: {
    bg: '#0B1712',
    surface: '#14251B',
    surfaceLight: '#1C3023',
    green: '#B8E986',
    text: '#F2F6EE',
    muted: '#9BAE9F',
    border: '#2A4031',
  },
  light: {
    bg: '#F7F8F5',
    surface: '#FFFFFF',
    surfaceLight: '#E3F1E6',
    green: '#2A7A45',
    text: '#17261C',
    muted: '#5E7062',
    border: '#D3DFCF',
  },
};

// The hero card keeps its deep-forest look, so its text uses fixed light colours.
const HERO = {
  text: '#F2F6EE',
  green: '#B8E986',
  dark: '#0B1712',
};

export default function VisitorHomeScreen({ navigation }) {
  const { styles, COLORS, mode } = useStyles();

  const [search, setSearch] = useState('');
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadPlants() {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error('Unable to load plants');
        }

        const data = await response.json();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.plants)
            ? data.plants
            : [];

        if (active) {
          setPlants(
            list.filter(
              (plant) =>
                String(plant.plant_status || '').toLowerCase() === 'approved'
            )
          );
        }
      } catch (err) {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadPlants();

    return () => {
      active = false;
    };
  }, []);

  const filteredPlants = useMemo(() => {
    const query = search.trim().toLowerCase();

    const results = plants.filter((plant) => {
      const common = String(plant.common_name || '').toLowerCase();
      const scientific = String(plant.scientific_name || '').toLowerCase();
      const family = String(plant.family || '').toLowerCase();

      return (
        common.includes(query) ||
        scientific.includes(query) ||
        family.includes(query)
      );
    });

    return results;
  }, [plants, search]);

  const featuredPlants = filteredPlants.slice(0, 6);

  function openPlant(plant) {
    navigation.navigate('PlantDetail', {
      plantId: plant.id,
    });
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right']}
    >
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={COLORS.bg} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        
<View style={styles.topBar}>
  <BackButton
    onPress={() => navigation.navigate('RoleSelect')}
  />

  <View style={styles.brandRow}>
    <View style={styles.logo}>
      <Ionicons name="leaf" size={22} color={COLORS.green} />
    </View>
    <View>
      <Text style={styles.brand}>NIAH</Text>
      <Text style={styles.brandSub}>BIODIVERSITY</Text>
    </View>
  </View>

  <View style={styles.visitorBadge}>
    <Ionicons
      name="person-circle-outline"
      size={15}
      color={COLORS.green}
    />
    <Text style={styles.visitorText}>VISITOR</Text>
  </View>
</View>


        <View style={styles.hero}>
          <View style={styles.heroGlow} />
          <View style={styles.heroTag}>
            <View style={styles.liveDot} />
            <Text style={styles.heroTagText}>EXPLORE THE WILD</Text>
          </View>

          <Text style={styles.heroTitle}>
            Nature is{'\n'}
            <Text style={styles.heroTitleAccent}>waiting.</Text>
          </Text>

          <Text style={styles.heroDescription}>
            Discover the remarkable plant life of Niah through every leaf,
            trail and discovery.
          </Text>

          <Pressable
            style={styles.heroButton}
            onPress={() => navigation.navigate('VisitorExplore')}
          >
            <Text style={styles.heroButtonText}>Explore plants</Text>
            <Ionicons name="arrow-forward" size={18} color={HERO.dark} />
          </Pressable>

          <View style={styles.heroDecoration}>
            <Ionicons name="leaf-outline" size={94} color="#B8E986" />
          </View>
        </View>

        <Pressable
          style={styles.scanCard}
          onPress={() =>
            navigation.navigate('ScanQR', { mode: 'visitor' })
          }
        >
          <View style={styles.scanIconBox}>
            <Ionicons name="scan-outline" size={27} color={COLORS.green} />
          </View>

          <View style={styles.scanTextBox}>
            <Text style={styles.scanTitle}>Scan Plant Tag</Text>
            <Text style={styles.scanSubtitle}>
              Scan a QR code to discover a plant
            </Text>
          </View>

          <View style={styles.scanArrow}>
            <Ionicons
              name="arrow-up-right"
              size={20}
              color={COLORS.green}
            />
          </View>
        </Pressable>


        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={21} color={COLORS.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search plants or plant families..."
            placeholderTextColor={COLORS.muted}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons
                name="close-circle"
                size={20}
                color={COLORS.muted}
              />
            </Pressable>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Discover plants</Text>
            <Text style={styles.sectionSubtitle}>
              A glimpse into Niah's green world
            </Text>
          </View>

          <Pressable
            style={styles.viewAll}
            onPress={() => navigation.navigate('VisitorExplore')}
          >
            <Text style={styles.viewAllText}>View all</Text>
            <Ionicons name="chevron-forward" size={15} color={COLORS.green} />
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.messageBox}>
            <ActivityIndicator size="large" color={COLORS.green} />
            <Text style={styles.messageText}>Discovering plant life...</Text>
          </View>
        ) : error ? (
          <View style={styles.messageBox}>
            <Ionicons
              name="cloud-offline-outline"
              size={30}
              color={COLORS.muted}
            />
            <Text style={styles.messageTitle}>Couldn't load plants</Text>
            <Text style={styles.messageText}>
              Check your connection and try opening Explore again.
            </Text>
            <Pressable
              style={styles.retryButton}
              onPress={() => navigation.navigate('VisitorExplore')}
            >
              <Text style={styles.retryText}>Open Explore</Text>
            </Pressable>
          </View>
        ) : featuredPlants.length === 0 ? (
          <View style={styles.messageBox}>
            <Ionicons
              name="leaf-outline"
              size={30}
              color={COLORS.muted}
            />
            <Text style={styles.messageTitle}>No plants found</Text>
            <Text style={styles.messageText}>
              Try another plant name or family.
            </Text>
          </View>
        ) : (
          <View style={styles.plantList}>
            {featuredPlants.map((plant) => {
              const imageUrl = Array.isArray(plant.images)
                ? plant.images[0]
                : null;

              return (
                <Pressable
                  key={String(plant.id)}
                  style={styles.plantCard}
                  onPress={() => openPlant(plant)}
                >
                  {imageUrl ? (
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.plantImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.plantImagePlaceholder}>
                      <Ionicons
                        name="leaf-outline"
                        size={30}
                        color={COLORS.green}
                      />
                    </View>
                  )}

                  <View style={styles.plantInfo}>
                    <Text style={styles.plantName} numberOfLines={2}>
                      {plant.common_name || plant.scientific_name || 'Unknown plant'}
                    </Text>
                    <Text style={styles.scientificName} numberOfLines={1}>
                      {plant.scientific_name || 'Scientific name unavailable'}
                    </Text>
                    <View style={styles.plantMeta}>
                      <Ionicons
                        name="checkmark-circle"
                        size={13}
                        color={COLORS.green}
                      />
                      <Text style={styles.plantMetaText}>Verified record</Text>
                    </View>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={19}
                    color={COLORS.muted}
                  />
                </Pressable>
              );
            })}
          </View>
        )}

        <Pressable
          style={styles.mapBanner}
          onPress={() => navigation.navigate('VisitorMap')}
        >
          <View style={styles.mapIcon}>
            <Ionicons name="map-outline" size={25} color={COLORS.green} />
          </View>
          <View style={styles.mapCopy}>
            <Text style={styles.mapTitle}>Find your next discovery</Text>
            <Text style={styles.mapSubtitle}>
              Explore plant locations on the trail map.
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={COLORS.green} />
        </Pressable>

        <Text style={styles.footer}>ROOTED IN NATURE · NIAH BIODIVERSITY</Text>
      </ScrollView>

      <BottomNav
        activeIndex={0}
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

// Styles are rebuilt whenever the light/dark mode changes.
function useStyles() {
  const { mode, pick, colors } = useTheme();
  const COLORS = PALETTES[mode];
  const styles = useMemo(
    () => createStyles(COLORS, pick, colors),
    [mode]
  );

  return { COLORS, colors, styles, mode, pick };
}

const createStyles = (COLORS, pick, colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 2,
  },
  brandSub: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2.5,
    marginTop: 2,
  },
  visitorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  visitorText: {
    color: COLORS.green,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  hero: {
    backgroundColor: '#1B3525',
    borderRadius: 26,
    padding: 23,
    minHeight: 280,
    overflow: 'hidden',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroGlow: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: '#294B32',
    right: -80,
    top: -55,
  },
  heroTag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#0D2118',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 17,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: HERO.green,
  },
  heroTagText: {
    color: HERO.green,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.3,
  },
  heroTitle: {
    color: HERO.text,
    fontSize: 39,
    lineHeight: 43,
    fontWeight: '900',
    letterSpacing: -1.3,
  },
  heroTitleAccent: {
    color: HERO.green,
  },
  heroDescription: {
    color: '#C0D0C2',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 12,
    maxWidth: '82%',
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 10,
    backgroundColor: HERO.green,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 13,
    marginTop: 20,
  },
  heroButtonText: {
    color: HERO.dark,
    fontSize: 12,
    fontWeight: '800',
  },
  heroDecoration: {
    position: 'absolute',
    right: -12,
    bottom: 8,
    opacity: 0.18,
    transform: [{ rotate: '-25deg' }],
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 22,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 14,
  },
  statIcon: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 11,
  },
  statNumber: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 4,
  },

  scanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 14,
    marginBottom: 24,
  },
  scanIconBox: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanTextBox: {
    flex: 1,
  },
  scanTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },
  scanSubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 5,
  },
  scanArrow: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    paddingHorizontal: 14,
    marginBottom: 26,
    minHeight: 52,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 12,
    paddingVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  sectionSubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 5,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    color: COLORS.green,
    fontSize: 11,
    fontWeight: '700',
  },
  plantList: {
    gap: 10,
  },
  plantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
  },
  plantImage: {
    width: 72,
    height: 78,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
  },
  plantImagePlaceholder: {
    width: 72,
    height: 78,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plantInfo: {
    flex: 1,
    paddingVertical: 4,
  },
  plantName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  scientificName: {
    color: COLORS.muted,
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 4,
  },
  plantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  plantMetaText: {
    color: COLORS.green,
    fontSize: 10,
  },
  messageBox: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 25,
    alignItems: 'center',
    marginBottom: 18,
  },
  messageTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 10,
  },
  messageText: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
  },
  retryButton: {
    marginTop: 14,
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: COLORS.green,
    fontSize: 12,
    fontWeight: '700',
  },
  mapBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: pick('#172C20', '#FFFFFF'),
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 15,
    marginTop: 25,
  },
  mapIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapCopy: {
    flex: 1,
  },
  mapTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
  },
  mapSubtitle: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 5,
  },
  footer: {
    color: pick('#627767', '#5E7062'),
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.3,
    textAlign: 'center',
    marginTop: 25,
    marginBottom: 12,
  },
});
