// The plant registration form. Photo capture and GPS are wired to real
// device APIs.
import React, { useState, useEffect } from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert, KeyboardAvoidingView, Platform,} from 'react-native';
import * as Device from 'expo-device';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { colors } from '../theme/colors';
import StyledInput from '../components/StyledInput';
import PrimaryButton from '../components/PrimaryButton';

export default function NewPlantRecordScreen({ navigation }) {
  const [recordId] = useState(
    () => `plant_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  );
  const [photos, setPhotos] = useState([]);
  const [locationError, setLocationError] = useState('');
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

  const updateField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleBack = () => {
    Alert.alert(
      'Discard plant record?',
      'You have unsaved changes. If you go back now, all the information and photos you entered will be lost.',
      [
        { text: 'Stay', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  };

  const capturePhoto = async () => {
    if (__DEV__ && Platform.OS === 'ios' && Device.isDevice === false) {
      const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!libraryPermission.granted) {
        Alert.alert('Photo library permission needed', 'Allow photo library access to select a test image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.6,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setPhotos((current) => [...current, result.assets[0].uri]);
      }
      return;
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Camera permission needed', 'Camera access is required to capture a plant photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 0.6 });

    if (!result.canceled && result.assets?.length > 0) {
      setPhotos((current) => [...current, result.assets[0].uri]);
    }
  };

  const captureLocation = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      setLocationError('Location permission denied');
      return;
    }
    try {
      const pos = await Location.getCurrentPositionAsync({});
      updateField('latitude', pos.coords.latitude.toFixed(6));
      updateField('longitude', pos.coords.longitude.toFixed(6));
      setLocationError('');
    } catch (e) {
      setLocationError('Could not get a GPS fix. Try moving to open ground.');
    }
  };

  useEffect(() => {
    captureLocation();
  }, []);

  const handleSave = () => {
    if (!form.scientificName) {
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled">

          <View style={styles.header}>
            <TouchableOpacity style={styles.back} onPress={handleBack}>
              <Ionicons name="arrow-back" size={16} color={colors.textSecondary} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <View style={styles.badge}>
              <Ionicons name="cloud-offline-outline" size={13} color={colors.warningText} />
              <Text style={styles.badgeText}>Offline</Text>
            </View>
          </View>

          <Text style={styles.title}>New plant record</Text>

          <View style={styles.photoSection}>
            {photos.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoList}>
                {photos.map((uri, index) => (
                  <View key={`${uri}-${index}`} style={styles.photoItem}>
                    <Image source={{ uri }} style={styles.photoPreview} />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => setPhotos((current) => current.filter((_, i) => i !== index))}
                    >
                      <Ionicons name="close" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity style={styles.photoButton} onPress={capturePhoto}>
              <Ionicons name="camera-outline" size={24} color={colors.textSecondary} />
              <Text style={styles.photoText}>
                {photos.length === 0 ? 'Tap to capture photo' : 'Capture another photo'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.gpsButton} onPress={captureLocation}>
            <Ionicons name="location-outline" size={18} color={colors.successText} />
            <Text style={styles.gpsButtonText}>Use current GPS location</Text>
          </TouchableOpacity>
          {locationError ? <Text style={styles.gpsError}>{locationError}</Text> : null}

          <View style={styles.grid2}>
            <StyledInput
              label="Latitude"
              placeholder="e.g. 3.841200"
              value={form.latitude}
              onChangeText={(v) => updateField('latitude', v)}
              keyboardType="numeric"
              containerStyle={{ flex: 1 }}
            />
            <StyledInput
              label="Longitude"
              placeholder="e.g. 113.769100"
              value={form.longitude}
              onChangeText={(v) => updateField('longitude', v)}
              keyboardType="numeric"
              containerStyle={{ flex: 1 }}
            />
          </View>

          <StyledInput label="Scientific name" placeholder="e.g. Shorea curtisii" value={form.scientificName} onChangeText={(v) => updateField('scientificName', v)} />
          <StyledInput label="Common name" placeholder="e.g. Seraya" value={form.commonName} onChangeText={(v) => updateField('commonName', v)} />
          <StyledInput label="Family" placeholder="e.g. Dipterocarpaceae" value={form.family} onChangeText={(v) => updateField('family', v)} />

          <View style={styles.grid2}>
            <StyledInput label="Height (m)" placeholder="0.0" value={form.height} onChangeText={(v) => updateField('height', v)} keyboardType="numeric" containerStyle={{ flex: 1 }} />
            <StyledInput label="Diameter (cm)" placeholder="0.0" value={form.diameter} onChangeText={(v) => updateField('diameter', v)} keyboardType="numeric" containerStyle={{ flex: 1 }} />
          </View>

          <StyledInput
            label="Morphological notes"
            placeholder="Leaf shape, bark texture, flowering, etc."
            value={form.notes}
            onChangeText={(v) => updateField('notes', v)}
            multiline
            numberOfLines={4}
            style={{ minHeight: 64, textAlignVertical: 'top' }}
          />

          <PrimaryButton
            title="Add Record"
            icon={<Ionicons name="save-outline" size={16} color={colors.buttonText} />}
            onPress={handleSave}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16},
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { color: colors.textSecondary, fontSize: 13 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.warningBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, color: colors.warningText },
  title: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 16 },
  photoText: { fontSize: 13, color: colors.textSecondary },
  photoPreview: { width: '100%', height: '100%' },
  gpsButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surfaceAlt, borderWidth: 0.5, borderColor: colors.border, borderRadius: 8, padding: 12, marginBottom: 8 },
  gpsButtonText: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  gpsError: { fontSize: 12, color: colors.warningText, marginBottom: 12 },
  grid2: { flexDirection: 'row', gap: 10 },
  photoSection: { marginBottom: 16, },
  photoList: { gap: 10, marginBottom: 10, },
  photoItem: { width: 100, height: 100, borderRadius: 8, overflow: 'hidden', position: 'relative', },
  removePhotoButton: { position: 'absolute', top: 5, right: 5, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(0, 0, 0, 0.7)', alignItems: 'center', justifyContent: 'center', },
  photoButton: { width: '100%', height: 120, borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed', borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 6, },
});