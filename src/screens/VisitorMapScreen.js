import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';
import { useTheme } from '../theme/ThemeContext';

const API_URL = 'http://52.62.125.146/api/plants';

const PALETTES = {
  dark: {
    background: '#101810',
    card: '#192419',
    border: '#2A3829',
    green: '#A8D96B',
    text: '#F2F5EB',
    secondary: '#A7B3A0',
    muted: '#71806D',
  },
  light: {
    background: '#F7F8F5',
    card: '#FFFFFF',
    border: '#D3DFCF',
    green: '#2A7A45',
    text: '#17261C',
    secondary: '#4D6052',
    muted: '#5F7164',
  },
};

const NIAH_REGION = {
  latitude: 3.8157,
  longitude: 113.7677,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

export default function VisitorMapScreen({ navigation }) {
  const { styles, FOREST, mode, pick } = useStyles();

  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadPlants() {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error('Unable to fetch plant locations.');
        }

        const data = await response.json();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.plants)
            ? data.plants
            : [];

        const mappedPlants = list.filter((plant) => {
          const latitude = Number(plant.latitude);
          const longitude = Number(plant.longitude);

          return (
            String(plant.plant_status || '').toLowerCase() === 'approved' &&
            Number.isFinite(latitude) &&
            Number.isFinite(longitude) &&
            latitude >= -90 &&
            latitude <= 90 &&
            longitude >= -180 &&
            longitude <= 180
          );
        });

        if (active) {
          setPlants(mappedPlants);
        }
      } catch (err) {
        if (active) {
          setError('Plant locations could not be loaded. Check your connection.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPlants();

    return () => {
      active = false;
    };
  }, []);

  async function locateMe() {
    try {
      setLocationLoading(true);

      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (permission.status !== 'granted') {
        Alert.alert(
          'Location permission needed',
          'Allow location access if you want to see your current position on the map.'
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setUserLocation(location);
    } catch (err) {
      Alert.alert(
        'Location unavailable',
        'Your current location could not be determined. You can still explore plant markers.'
      );
    } finally {
      setLocationLoading(false);
    }
  }

  function openPlantDetails(plant) {
    navigation.navigate('PlantDetail', {
      plantId: plant.id,
    });
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={FOREST.background}
      />

      <View style={styles.header}>
        <View style={styles.headingIcon}>
          <Ionicons name="map" size={23} color={FOREST.green} />
        </View>

        <View style={styles.headingText}>
          <Text style={styles.title}>Trail Map</Text>
          <Text style={styles.subtitle}>
            Discover plants across Niah
          </Text>
        </View>

        <Pressable
          style={styles.locationButton}
          onPress={locateMe}
          disabled={locationLoading}
        >
          {locationLoading ? (
            <ActivityIndicator size="small" color={FOREST.green} />
          ) : (
            <Ionicons
              name="locate-outline"
              size={22}
              color={FOREST.green}
            />
          )}
        </Pressable>
      </View>

      <View style={styles.mapContainer}>
    
        <MapView
            style={StyleSheet.absoluteFillObject}
            initialRegion={{
                latitude: 3.8157,
                longitude: 113.7677,
                latitudeDelta: 0.04,
                longitudeDelta: 0.04,
            }}
            showsUserLocation={Boolean(userLocation)}
            showsMyLocationButton={false}
            onPress={() => setSelectedPlant(null)}
        >
            {plants.map((plant) => (
                <Marker
                    key={String(plant.id)}
                    coordinate={{
                        latitude: Number(plant.latitude),
                        longitude: Number(plant.longitude),
                    }}
                    onPress={() => setSelectedPlant(plant)}
                >
                    <View style={styles.marker}>
                        <Ionicons
                            name="leaf"
                            size={17}
                            color={pick('#101810', '#FFFFFF')}
                        />
                    </View>
                </Marker>
            ))}
        </MapView>

        <View style={styles.mapLabel}>
          <Ionicons name="leaf" size={14} color={FOREST.green} />
          <Text style={styles.mapLabelText}>
            {plants.length} plant locations
          </Text>
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={FOREST.green} />
            <Text style={styles.loadingText}>
              Loading plant locations...
            </Text>
          </View>
        )}

        {!loading && error ? (
          <View style={styles.errorBanner}>
            <Ionicons
              name="cloud-offline-outline"
              size={18}
              color={FOREST.green}
            />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {!loading && !error && plants.length === 0 && (
          <View style={styles.emptyBanner}>
            <Ionicons
              name="leaf-outline"
              size={20}
              color={FOREST.green}
            />
            <Text style={styles.emptyText}>
              No approved plant coordinates available yet.
            </Text>
          </View>
        )}
      </View>

      {selectedPlant ? (
        <View style={styles.selectedCard}>
          <View style={styles.selectedIcon}>
            <Ionicons name="leaf" size={23} color={FOREST.green} />
          </View>

          <View style={styles.selectedInfo}>
            <Text style={styles.selectedName} numberOfLines={2}>
              {selectedPlant.common_name || 'Unknown plant'}
            </Text>

            <Text style={styles.selectedScientific} numberOfLines={2}>
              {selectedPlant.scientific_name || 'Scientific name unavailable'}
            </Text>

            <Text style={styles.selectedFamily} numberOfLines={1}>
              {selectedPlant.family || 'Plant family unavailable'}
            </Text>
          </View>

          <Pressable
            style={styles.detailsButton}
            onPress={() => openPlantDetails(selectedPlant)}
          >
            <Ionicons
              name="arrow-forward"
              size={19}
              color={FOREST.background}
            />
          </Pressable>
        </View>
      ) : (
        <View style={styles.hintCard}>
          <Ionicons
            name="information-circle-outline"
            size={21}
            color={FOREST.green}
          />
          <View style={styles.hintTextContainer}>
            <Text style={styles.hintTitle}>Explore the map</Text>
            <Text style={styles.hintDescription}>
              Tap a leaf marker to discover the plant recorded at that location.
            </Text>
          </View>
        </View>
      )}

      <BottomNav
        variant="default"
        activeIndex={1}
        items={[
          { icon: 'home-outline', label: 'Home' },
          { icon: 'map-outline', label: 'Trail Map' },
          { icon: 'leaf-outline', label: 'Explore' },
        ]}
        onPress={(index) => {
          if (index === 0) {
            navigation.navigate('VisitorHome');
          } else if (index === 1) {
            // Already on Trail Map.
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
  const FOREST = PALETTES[mode];
  const styles = useMemo(
    () => createStyles(FOREST, pick, colors),
    [mode]
  );

  return { FOREST, colors, styles, mode, pick };
}

const createStyles = (FOREST, pick, colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FOREST.background,
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 17,
    gap: 11,
  },

  headingIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: pick('#243B19', '#E3F1E6'),
  },

  headingText: {
    flex: 1,
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
    color: FOREST.text,
  },

  subtitle: {
    fontSize: 12,
    color: FOREST.secondary,
    marginTop: 4,
  },

  locationButton: {
    width: 43,
    height: 43,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: FOREST.card,
    borderWidth: 1,
    borderColor: FOREST.border,
  },

  mapContainer: {
    flex: 1,
    minHeight: 250,
    borderRadius: 21,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: FOREST.border,
    backgroundColor: FOREST.card,
  },

  map: {
    ...StyleSheet.absoluteFillObject,
  },

  marker: {
    width: 35,
    height: 35,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FOREST.green,
    borderWidth: 2,
    borderColor: '#F2F5EB',
    elevation: 4,
  },

  mapLabel: {
    position: 'absolute',
    top: 13,
    left: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: FOREST.background,
    borderWidth: 1,
    borderColor: FOREST.border,
  },

  mapLabelText: {
    color: FOREST.text,
    fontSize: 11,
    fontWeight: '700',
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: pick('rgba(16,24,16,0.88)', 'rgba(247,248,245,0.92)'),
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  loadingText: {
    color: FOREST.text,
    fontSize: 13,
  },

  errorBanner: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    padding: 12,
    borderRadius: 13,
    backgroundColor: FOREST.background,
    borderWidth: 1,
    borderColor: FOREST.border,
  },

  errorText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: FOREST.text,
  },

  emptyBanner: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    padding: 12,
    borderRadius: 13,
    backgroundColor: FOREST.background,
    borderWidth: 1,
    borderColor: FOREST.border,
  },

  emptyText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: FOREST.text,
  },

  selectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 13,
    marginTop: 13,
    borderRadius: 17,
    backgroundColor: FOREST.card,
    borderWidth: 1,
    borderColor: FOREST.border,
  },

  selectedIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: pick('#243B19', '#E3F1E6'),
  },

  selectedInfo: {
    flex: 1,
  },

  selectedName: {
    fontSize: 14,
    fontWeight: '800',
    color: FOREST.text,
  },

  selectedScientific: {
    fontSize: 11,
    fontStyle: 'italic',
    color: FOREST.secondary,
    marginTop: 4,
  },

  selectedFamily: {
    fontSize: 10,
    color: FOREST.muted,
    marginTop: 4,
  },

  detailsButton: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FOREST.green,
  },

  hintCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    padding: 14,
    marginTop: 13,
    borderRadius: 16,
    backgroundColor: FOREST.card,
    borderWidth: 1,
    borderColor: FOREST.border,
  },

  hintTextContainer: {
    flex: 1,
  },

  hintTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: FOREST.text,
  },

  hintDescription: {
    fontSize: 11,
    lineHeight: 17,
    color: FOREST.secondary,
    marginTop: 4,
  },
});