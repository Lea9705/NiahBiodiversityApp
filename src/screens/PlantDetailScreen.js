
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRecords } from '../context/RecordsContext';

const API_URL = 'http://52.62.125.146/api/plants';

function getPhotoUri(photo) {
  if (typeof photo === 'string') return photo;
  if (photo && typeof photo === 'object') {
    return photo.uri || photo.url || photo.image_url || null;
  }
  return null;
}

function normalizeLocalPlant(record) {
  return {
    ...record,
    id: record.serverId || record.id,
    scientific_name: record.scientificName,
    common_name: record.commonName,
    height_m: record.height,
    diameter_cm: record.diameter,
    morphological_notes: record.notes,
    images: Array.isArray(record.photos) ? record.photos : [],
    plant_status: record.approvalStatus,
  };
}

export default function PlantDetailScreen({ route }) {
  const { plantId, plant: passedPlant } = route.params || {};
  const { records, loading: recordsLoading } = useRecords();

  const [plant, setPlant] = useState(passedPlant || null);
  const [loading, setLoading] = useState(!passedPlant);

  useEffect(() => {
    let cancelled = false;

    async function loadPlant() {
      // First, show the plant passed from the QR scanner.
      if (passedPlant) {
        setPlant(passedPlant);
      }

      // Next, check the locally saved approved records.
      const localRecord = records.find((record) => {
        const matches =
          String(record.id) === String(plantId) ||
          String(record.serverId ?? '') === String(plantId);

        return (
          matches &&
          String(record.approvalStatus ?? '')
            .trim()
            .toLowerCase() === 'approved'
        );
      });

      if (localRecord && !cancelled) {
        setPlant(normalizeLocalPlant(localRecord));
      }

      // Finally, try the API if internet is available.
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const result = await response.json();
        const plants = Array.isArray(result)
          ? result
          : Array.isArray(result.plants)
            ? result.plants
            : [];

        const onlinePlant = plants.find(
          (item) =>
            String(item.id) === String(plantId) &&
            String(item.plant_status || '').trim().toLowerCase() ===
              'approved'
        );

        if (!cancelled && onlinePlant) {
          setPlant(onlinePlant);
        } else if (
          !cancelled &&
          !localRecord &&
          !passedPlant
        ) {
          setPlant(null);
        }
      } catch (error) {
        console.log(
          '[PlantDetail] API unavailable; checking saved data.',
          error.message
        );

        if (!cancelled && !localRecord && !passedPlant) {
          setPlant(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (!recordsLoading) {
      loadPlant();
    }

    return () => {
      cancelled = true;
    };
  }, [plantId, passedPlant, records, recordsLoading]);

  if (loading || recordsLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#287A45" />
        <Text style={styles.message}>Loading plant details...</Text>
      </View>
    );
  }

  if (!plant) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Plant record not found</Text>
        <Text style={styles.message}>
          This approved plant is not available on this device.
          Connect to the internet and try again.
        </Text>
      </View>
    );
  }

  const photos = Array.isArray(plant.images)
    ? plant.images
    : Array.isArray(plant.photos)
      ? plant.photos
      : [];

  const photoUris = photos.map(getPhotoUri).filter(Boolean);

  const commonName =
    plant.common_name || plant.commonName || 'Unknown plant';

  const scientificName =
    plant.scientific_name || plant.scientificName || 'Not available';

  const family = plant.family || 'Not available';
  const height = plant.height_m ?? plant.height;
  const diameter = plant.diameter_cm ?? plant.diameter;
  const notes =
    plant.morphological_notes || plant.notes || 'No notes available.';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>{commonName}</Text>
      <Text style={styles.scientific}>{scientificName}</Text>

      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>Approved</Text>
      </View>

      <Text style={styles.sectionTitle}>Plant Photos</Text>

      {photoUris.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {photoUris.map((uri, index) => (
            <Image
              key={`${uri}-${index}`}
              source={{ uri }}
              style={styles.photo}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.noPhoto}>
          <Text style={styles.message}>No photos available offline.</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Plant Information</Text>

      <InfoRow label="Family" value={family} />
      <InfoRow
        label="Height (m)"
        value={height == null || height === '' ? 'Not available' : String(height)}
      />
      <InfoRow
        label="Diameter (cm)"
        value={
          diameter == null || diameter === ''
            ? 'Not available'
            : String(diameter)
        }
      />
      <InfoRow
        label="Latitude"
        value={plant.latitude == null ? 'Not available' : String(plant.latitude)}
      />
      <InfoRow
        label="Longitude"
        value={
          plant.longitude == null ? 'Not available' : String(plant.longitude)
        }
      />

      <Text style={styles.sectionTitle}>Morphological Notes</Text>
      <Text style={styles.notes}>{String(notes)}</Text>
    </ScrollView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8F5',
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F7F8F5',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#214D32',
    marginBottom: 6,
  },
  scientific: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666666',
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E1F2E5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 22,
  },
  statusText: {
    color: '#24683A',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#214D32',
    marginTop: 16,
    marginBottom: 12,
  },
  photo: {
    width: 220,
    height: 180,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#E5E5E5',
  },
  noPhoto: {
    padding: 18,
    borderRadius: 10,
    backgroundColor: '#EEEEEA',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E5DF',
    gap: 16,
  },
  infoLabel: {
    flex: 1,
    color: '#666666',
    fontSize: 14,
  },
  infoValue: {
    flex: 1,
    color: '#222222',
    fontSize: 14,
    textAlign: 'right',
  },
  notes: {
    fontSize: 15,
    lineHeight: 23,
    color: '#333333',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
  },
  message: {
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9B3030',
    textAlign: 'center',
  },
});
