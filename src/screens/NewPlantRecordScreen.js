// The plant registration form. Photo capture and GPS are wired to real
// device APIs (expo-image-picker, expo-location) - not just visual
// placeholders. Saving is still a TODO: right now it just logs the
// record and shows an alert, instead of writing to local offline storage.
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { colors } from '../theme/colors';
import StyledInput from '../components/StyledInput';
import PrimaryButton from '../components/PrimaryButton';

export default function NewPlantRecordScreen({ navigation }) {
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [form, setForm] = useState({
    scientificName: '',
    commonName: '',
    family: '',
    height: '',
    diameter: '',
    notes: '',
  });

  const updateField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const capturePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera permission needed', 'Enable camera access in settings to attach a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const captureLocation = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      setLocationError('Location permission denied');
      return;
    }
    try {
      const pos = await Location.getCurrentPositionAsync({});
      setLocation(pos.coords);
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

    const record = { ...form, photo, location, createdAt: new Date().toISOString() };

    // TODO: save `record` into local offline storage (e.g. WatermelonDB or SQLite)
    // and add it to a sync queue so it uploads automatically once the device
    // is back online. Right now it's just logged to the console as a placeholder.
    console.log('New offline record:', record);

    Alert.alert('Saved offline', "This record will sync automatically when you're back online.");
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={16} color={colors.textSecondary} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.badge}>
            <Ionicons name="cloud-offline-outline" size={13} color={colors.warningText} />
            <Text style={styles.badgeText}>Offline</Text>
          </View>
        </View>

        <Text style={styles.title}>New plant record</Text>

        <TouchableOpacity style={styles.photoBox} onPress={capturePhoto}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photoPreview} />
          ) : (
            <>
              <Ionicons name="camera-outline" size={24} color={colors.textSecondary} />
              <Text style={styles.photoText}>Tap to capture photo</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.gpsRow} onPress={captureLocation}>
          <Ionicons name="location-outline" size={18} color={colors.successText} />
          <View>
            <Text style={styles.gpsLabel}>GPS location</Text>
            <Text style={styles.gpsValue}>
              {location
                ? `${location.latitude.toFixed(4)}° N, ${location.longitude.toFixed(4)}° E · ±${Math.round(location.accuracy)}m`
                : locationError || 'Getting location…'}
            </Text>
          </View>
        </TouchableOpacity>

        <StyledInput
          label="Scientific name"
          placeholder="e.g. Shorea curtisii"
          value={form.scientificName}
          onChangeText={(v) => updateField('scientificName', v)}
        />
        <StyledInput
          label="Common name"
          placeholder="e.g. Seraya"
          value={form.commonName}
          onChangeText={(v) => updateField('commonName', v)}
        />
        <StyledInput
          label="Family"
          placeholder="e.g. Dipterocarpaceae"
          value={form.family}
          onChangeText={(v) => updateField('family', v)}
        />

        <View style={styles.grid2}>
          <StyledInput
            label="Height (m)"
            placeholder="0.0"
            value={form.height}
            onChangeText={(v) => updateField('height', v)}
            keyboardType="numeric"
            style={{ flex: 1 }}
          />
          <StyledInput
            label="Diameter (cm)"
            placeholder="0.0"
            value={form.diameter}
            onChangeText={(v) => updateField('diameter', v)}
            keyboardType="numeric"
            style={{ flex: 1 }}
          />
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
          title="Save record offline"
          icon={<Ionicons name="save-outline" size={16} color={colors.buttonText} />}
          onPress={handleSave}
        />
      </ScrollView>
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
  photoBox: { width: '100%', height: 120, borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed', borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 16, overflow: 'hidden' },
  photoText: { fontSize: 13, color: colors.textSecondary },
  photoPreview: { width: '100%', height: '100%' },
  gpsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surfaceAlt, borderRadius: 8, padding: 10, marginBottom: 16 },
  gpsLabel: { fontSize: 12, color: colors.textSecondary },
  gpsValue: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  grid2: { flexDirection: 'row', gap: 10 },
});
