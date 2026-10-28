
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import * as Device from 'expo-device';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Location from 'expo-location';

import StyledInput from '../components/StyledInput';
import PrimaryButton from '../components/PrimaryButton';
import BackButton from '../components/BackButton';
import { useRecords } from '../context/RecordsContext';

const COLORS = {
  bg: '#F7F8F5',
  surface: '#FFFFFF',
  surfaceLight: '#E3F1E6',
  green: '#2A7A45',
  text: '#17261C',
  muted: '#5E7062',
  border: '#D3DFCF',
  white: '#FFFFFF',
  successBg: '#E8F5EB',
  warningBg: '#FBEED0',
  warning: '#8A5A00',
};

export default function NewPlantRecordScreen({ navigation }) {
  const { isOnline, records } = useRecords();

  const pendingCount = records.filter(
    (record) => record.status === 'pending'
  ).length;

  const [recordId] = useState(
    () =>
      `plant_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  );

  const [photos, setPhotos] = useState([]);
  const [locationError, setLocationError] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);

  const [form, setForm] = useState({
    scientificName: '',
    commonName: '',
    family: '',
    height: '',
    diameter: '',
    latitude: '',
    longitude: '',
    notes: '',
  });

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleBack = () => {
    Alert.alert(
      'Discard plant record?',
      'You have unsaved changes. If you go back now, all the information and photos you entered will be lost.',
      [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const savePhotoLocally = async (uri) => {
    const directory = FileSystem.documentDirectory;

    if (!directory) {
      throw new Error('App storage is unavailable.');
    }

    const filename = `plant_photo_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}.jpg`;

    const destination = `${directory}${filename}`;

    await FileSystem.copyAsync({
      from: uri,
      to: destination,
    });

    return destination;
  };

  const capturePhoto = async () => {
    try {
      let result;

      if (__DEV__ && Platform.OS === 'ios' && Device.isDevice === false) {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            'Photo library permission needed',
            'Allow photo library access to select a test image.'
          );
          return;
        }

        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.6,
          allowsMultipleSelection: false,
        });
      } else {
        const permission =
          await ImagePicker.requestCameraPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            'Camera permission needed',
            'Camera access is required to capture a plant photo.'
          );
          return;
        }

        result = await ImagePicker.launchCameraAsync({
          quality: 0.6,
        });
      }

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const savedUri = await savePhotoLocally(result.assets[0].uri);

      setPhotos((current) => [...current, savedUri]);
    } catch (error) {
      console.error('[Photo] Failed to save image locally:', error);

      Alert.alert(
        'Could not save photo',
        'Please try taking the photo again.'
      );
    }
  };

  const captureLocation = async () => {
    setLocationLoading(true);
    setLocationError('');

    try {
      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        setLocationError('Location permission denied');
        return;
      }

      const position = await Location.getCurrentPositionAsync({});

      updateField('latitude', position.coords.latitude.toFixed(6));
      updateField('longitude', position.coords.longitude.toFixed(6));
    } catch (error) {
      setLocationError(
        'Could not get a GPS fix. Try moving to open ground.'
      );
    } finally {
      setLocationLoading(false);
    }
  };

  useEffect(() => {
    captureLocation();
  }, []);

  const handleSave = () => {
    if (!form.scientificName.trim()) {
      Alert.alert('Missing info', 'Scientific name is required.');
      return;
    }

    const record = {
      id: recordId,
      ...form,
      photos,
      createdAt: new Date().toISOString(),
    };

    navigation.navigate('PlantRecordSummary', { record });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.bg}
      />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <BackButton onPress={handleBack} />

            <View style={styles.headerText}>
              <Text style={styles.brand}>NIAH BIODIVERSITY</Text>
              <Text style={styles.headerSubtitle}>FIELD COLLECTION</Text>
            </View>

            <View style={styles.leafIcon}>
              <Ionicons
                name="leaf"
                size={21}
                color={COLORS.green}
              />
            </View>
          </View>

          {/* Online / offline status */}
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusBadge,
                isOnline ? styles.badgeOnline : styles.badgeOffline,
              ]}
            >
              <Ionicons
                name={isOnline ? 'cloud-outline' : 'cloud-offline-outline'}
                size={15}
                color={isOnline ? COLORS.green : COLORS.warning}
              />

              <Text
                style={[
                  styles.statusText,
                  isOnline ? styles.statusOnlineText : styles.statusOfflineText,
                ]}
              >
                {isOnline
                  ? pendingCount > 0
                    ? `Online · ${pendingCount} pending`
                    : 'Online'
                  : pendingCount > 0
                    ? `Offline · ${pendingCount} pending`
                    : 'Offline'}
              </Text>
            </View>
          </View>

          {/* Page heading */}
          <View style={styles.pageHeading}>
            <View style={styles.eyebrow}>
              <View style={styles.eyebrowDot} />
              <Text style={styles.eyebrowText}>FIELD OBSERVATION</Text>
            </View>

            <Text style={styles.title}>New plant record</Text>

            <Text style={styles.subtitle}>
              Document the plant, capture its location and record your
              observations for the Niah Biodiversity collection.
            </Text>
          </View>

          {/* Plant photos */}
          <View style={styles.section}>
            <SectionHeading
              icon="camera-outline"
              title="Plant photos"
              subtitle={
                photos.length > 0
                  ? `${photos.length} photo${photos.length === 1 ? '' : 's'} added`
                  : 'Capture photos for identification'
              }
            />

            {photos.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photoList}
              >
                {photos.map((uri, index) => (
                  <View key={`${uri}-${index}`} style={styles.photoItem}>
                    <Image
                      source={{ uri }}
                      style={styles.photoPreview}
                      resizeMode="cover"
                    />

                    <View style={styles.photoNumber}>
                      <Text style={styles.photoNumberText}>
                        {String(index + 1).padStart(2, '0')}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() =>
                        setPhotos((current) =>
                          current.filter((_, i) => i !== index)
                        )
                      }
                      accessibilityRole="button"
                      accessibilityLabel={`Remove photo ${index + 1}`}
                    >
                      <Ionicons
                        name="close"
                        size={16}
                        color={COLORS.white}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.photoButton}
              onPress={capturePhoto}
              activeOpacity={0.8}
            >
              <View style={styles.photoButtonIcon}>
                <Ionicons
                  name="camera-outline"
                  size={25}
                  color={COLORS.green}
                />
              </View>

              <Text style={styles.photoButtonTitle}>
                {photos.length === 0
                  ? 'Capture plant photo'
                  : 'Capture another photo'}
              </Text>

              <Text style={styles.photoButtonSubtitle}>
                {photos.length === 0
                  ? 'Take a clear photo of the plant'
                  : 'Add another view of the plant'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* GPS location */}
          <View style={styles.section}>
            <SectionHeading
              icon="location-outline"
              title="GPS location"
              subtitle="Record the plant’s geographic position"
            />

            <TouchableOpacity
              style={[
                styles.gpsButton,
                locationLoading && styles.disabledButton,
              ]}
              onPress={captureLocation}
              disabled={locationLoading}
              activeOpacity={0.8}
            >
              <View style={styles.gpsIcon}>
                <Ionicons
                  name={locationLoading ? 'sync-outline' : 'navigate-outline'}
                  size={21}
                  color={COLORS.green}
                />
              </View>

              <View style={styles.gpsButtonCopy}>
                <Text style={styles.gpsButtonTitle}>
                  {locationLoading
                    ? 'Getting GPS location...'
                    : 'Use current GPS location'}
                </Text>
                <Text style={styles.gpsButtonSubtitle}>
                  {form.latitude && form.longitude
                    ? 'Coordinates captured · You can edit them below'
                    : 'Allow location access to capture coordinates'}
                </Text>
              </View>

              {!locationLoading && (
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={COLORS.muted}
                />
              )}
            </TouchableOpacity>

            {locationError ? (
              <View style={styles.errorMessage}>
                <Ionicons
                  name="alert-circle-outline"
                  size={16}
                  color={COLORS.warning}
                />
                <Text style={styles.gpsError}>{locationError}</Text>
              </View>
            ) : null}

            <View style={styles.grid2}>
              <View style={styles.gridItem}>
                <StyledInput
                  label="Latitude"
                  placeholder="e.g. 3.841200"
                  value={form.latitude}
                  onChangeText={(value) => updateField('latitude', value)}
                  keyboardType="numeric"
                  containerStyle={{ flex: 1 }}
                />
              </View>

              <View style={styles.gridItem}>
                <StyledInput
                  label="Longitude"
                  placeholder="e.g. 113.769100"
                  value={form.longitude}
                  onChangeText={(value) => updateField('longitude', value)}
                  keyboardType="numeric"
                  containerStyle={{ flex: 1 }}
                />
              </View>
            </View>
          </View>

          {/* Plant information */}
          <View style={styles.section}>
            <SectionHeading
              icon="leaf-outline"
              title="Plant information"
              subtitle="Enter the species and physical measurements"
            />

            <StyledInput
              label="Scientific name"
              placeholder="e.g. Shorea curtisii"
              value={form.scientificName}
              onChangeText={(value) =>
                updateField('scientificName', value)
              }
            />

            <StyledInput
              label="Common name"
              placeholder="e.g. Seraya"
              value={form.commonName}
              onChangeText={(value) => updateField('commonName', value)}
            />

            <StyledInput
              label="Family"
              placeholder="e.g. Dipterocarpaceae"
              value={form.family}
              onChangeText={(value) => updateField('family', value)}
            />

            <View style={styles.grid2}>
              <View style={styles.gridItem}>
                <StyledInput
                  label="Height (m)"
                  placeholder="0.0"
                  value={form.height}
                  onChangeText={(value) => updateField('height', value)}
                  keyboardType="numeric"
                  containerStyle={{ flex: 1 }}
                />
              </View>

              <View style={styles.gridItem}>
                <StyledInput
                  label="Diameter (cm)"
                  placeholder="0.0"
                  value={form.diameter}
                  onChangeText={(value) => updateField('diameter', value)}
                  keyboardType="numeric"
                  containerStyle={{ flex: 1 }}
                />
              </View>
            </View>
          </View>

          {/* Morphological notes */}
          <View style={styles.section}>
            <SectionHeading
              icon="document-text-outline"
              title="Morphological notes"
              subtitle="Describe the plant’s visible characteristics"
            />

            <StyledInput
              label="Observations"
              placeholder="Leaf shape, bark texture, flowering, etc."
              value={form.notes}
              onChangeText={(value) => updateField('notes', value)}
              multiline
              numberOfLines={4}
              style={{
                minHeight: 100,
                textAlignVertical: 'top',
              }}
            />

            <Text style={styles.helperText}>
              Include any characteristics that may help with plant
              identification.
            </Text>
          </View>

          {/* Save / review */}
          <View style={styles.submitSection}>
            <View style={styles.submitInfo}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={COLORS.green}
              />
              <Text style={styles.submitInfoText}>
                Review your information before submitting the record.
              </Text>
            </View>

            <PrimaryButton
              title="Add record"
              icon={
                <Ionicons
                  name="arrow-forward-outline"
                  size={18}
                  color={COLORS.bg}
                />
              }
              onPress={handleSave}
            />
          </View>

          <Text style={styles.footer}>
            ROOTED IN NATURE · NIAH BIODIVERSITY
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SectionHeading({ icon, title, subtitle }) {
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionIcon}>
        <Ionicons name={icon} size={21} color={COLORS.green} />
      </View>

      <View style={styles.sectionHeadingCopy}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {!!subtitle && (
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  keyboardContainer: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },

  headerText: {
    flex: 1,
  },

  brand: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  headerSubtitle: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.7,
    marginTop: 5,
  },

  leafIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusRow: {
    alignItems: 'flex-start',
    marginBottom: 23,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },

  badgeOnline: {
    backgroundColor: COLORS.successBg,
    borderColor: COLORS.border,
  },

  badgeOffline: {
    backgroundColor: COLORS.warningBg,
    borderColor: '#E3CD94',
  },

  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },

  statusOnlineText: {
    color: COLORS.green,
  },

  statusOfflineText: {
    color: COLORS.warning,
  },

  pageHeading: {
    marginBottom: 23,
  },

  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },

  eyebrowDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.green,
  },

  eyebrowText: {
    color: COLORS.green,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  title: {
    color: COLORS.text,
    fontSize: 29,
    lineHeight: 36,
    fontWeight: '900',
    letterSpacing: -0.8,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 8,
  },

  section: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 21,
    padding: 15,
    marginBottom: 15,
  },

  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginBottom: 18,
  },

  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionHeadingCopy: {
    flex: 1,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },

  sectionSubtitle: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },

  photoList: {
    gap: 11,
    paddingBottom: 12,
  },

  photoItem: {
    width: 125,
    height: 135,
    padding: 5,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },

  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },

  photoNumber: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },

  photoNumberText: {
    color: COLORS.text,
    fontSize: 9,
    fontWeight: '800',
  },

  removePhotoButton: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 27,
    height: 27,
    borderRadius: 9,
    backgroundColor: '#0B1712DD',
    alignItems: 'center',
    justifyContent: 'center',
  },

  photoButton: {
    minHeight: 135,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 15,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },

  photoButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  photoButtonTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },

  photoButtonSubtitle: {
    color: COLORS.muted,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 15,
  },

  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 12,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    marginBottom: 14,
  },

  disabledButton: {
    opacity: 0.65,
  },

  gpsIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  gpsButtonCopy: {
    flex: 1,
  },

  gpsButtonTitle: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '800',
  },

  gpsButtonSubtitle: {
    color: COLORS.muted,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 4,
  },

  errorMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    marginBottom: 12,
  },

  gpsError: {
    flex: 1,
    color: COLORS.warning,
    fontSize: 11,
    lineHeight: 17,
  },

  grid2: {
    flexDirection: 'row',
    gap: 10,
  },

  gridItem: {
    flex: 1,
    minWidth: 0,
  },

  helperText: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 2,
  },

  submitSection: {
    marginTop: 2,
    gap: 15,
  },

  submitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 13,
    borderRadius: 13,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  submitInfoText: {
    flex: 1,
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 16,
  },

  footer: {
    color: '#5E7062',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    textAlign: 'center',
    marginTop: 26,
    marginBottom: 10,
  },
});
