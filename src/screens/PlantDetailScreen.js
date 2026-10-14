import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, TouchableOpacity, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function PlantDetailScreen({ navigation, route }) {
  const { plantId } = route.params || {};
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlant = async () => {
      try {
        const response = await fetch('http://52.62.125.146/api/plants');

        if (!response.ok) {
          throw new Error(`Failed to fetch plant: ${response.status}`);
        }

        const data = await response.json();

        
        const foundPlant = data.find(
          (item) => String(item.id) === String(plantId)
        );

        if (foundPlant) {
          setPlant({
            ...foundPlant,
            images: Array.isArray(foundPlant.images)
              ? foundPlant.images
              : [],
          });
        } else {
          setPlant(null);
        }

        
      } catch (error) {
        console.error('Failed to load plant:', error);
        setPlant(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPlant();
  }, [plantId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Loading plant information...</Text>
      </SafeAreaView>
    );
  }

  if (!plant) {
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

        <Text style={styles.errorText}>
          Plant record not found.
        </Text>
      </SafeAreaView>
    );
  }

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

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="leaf-outline"
            size={48}
            color={colors.successText}
          />
        </View>

        <Text style={styles.name}>{plant.scientific_name}</Text>

        <Text style={styles.detail}>
          {plant.plant_status || 'Pending'}
        </Text>


          {plant.images?.length > 0 && (
            <View style={styles.imagesSection}>
              <Text style={styles.sectionTitle}>Photos</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.imagesList}
              >
                {plant.images.map((uri, index) => (
                  <TouchableOpacity
                    key={`${uri}-${index}`}
                    activeOpacity={0.8}
                    onPress={() => {
                      // Full-screen viewer akan kita tambah kemudian.
                    }}
                  >
                    <Image
                      source={{ uri }}
                      style={styles.plantImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Plant information</Text>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Scientific name</Text>
          <Text style={styles.value}>
            {plant.scientific_name || 'Not available'}
          </Text>

          <Text style={styles.label}>Common name</Text>
          <Text style={styles.value}>
            {plant.common_name || 'Not available'}
          </Text>

          <Text style={styles.label}>Family</Text>
          <Text style={styles.value}>
            {plant.family || 'Not available'}
          </Text>

          <Text style={styles.label}>Height</Text>
          <Text style={styles.value}>
            {plant.height_m != null ? `${plant.height_m} m` : 'Not available'}
          </Text>

          <Text style={styles.label}>Diameter</Text>
          <Text style={styles.value}>
            {plant.diameter_cm != null
              ? `${plant.diameter_cm} cm`
              : 'Not available'}
          </Text>

          <Text style={styles.label}>Morphological notes</Text>
          <Text style={styles.value}>
            {plant.morphological_notes || 'Not available'}
          </Text>

          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>
            {plant.latitude && plant.longitude
              ? `${plant.latitude}, ${plant.longitude}`
              : 'Not available'}
          </Text>

          <Text style={styles.label}>Status</Text>
          <Text style={styles.value}>
            {plant.plant_status || 'Pending'}
          </Text>
        </View>

        <View style={styles.noteCard}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={colors.accentText}
          />

        <Text style={styles.noteText}>
          This information is retrieved from the biodiversity database.
        </Text>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 16,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    marginBottom: 20,
  },

  backText: {
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 6,
  },

  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 20,
    backgroundColor: colors.successBg,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },

  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },

  detail: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  imagesSection: {
    marginTop: 24,
    marginBottom: 8,
  },

  imagesList: {
    gap: 10,
    paddingVertical: 4,
  },

  plantImage: {
    width: 150,
    height: 150,
    borderRadius: 12,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },

  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },

  label: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 8,
    marginBottom: 4,
  },

  value: {
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 8,
  },

  noteCard: {
    flexDirection: 'row',
    backgroundColor: colors.accentBg,
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    marginBottom: 30,
  },

  noteText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 10,
    lineHeight: 19,
  },

  errorText: {
    color: colors.textPrimary,
    fontSize: 16,
    marginTop: 30,
  },
});