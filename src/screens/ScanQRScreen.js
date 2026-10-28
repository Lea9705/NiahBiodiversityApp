
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useRecords } from '../context/RecordsContext';
import { authFetch } from '../utils/session';
import BotanistBottomNav from '../components/BotanistBottomNav';

const API_URL = 'http://52.62.125.146/api/plants';

const DARK = {
  bg: '#0B1712',
  surface: '#14251B',
  green: '#B8E986',
  text: '#F2F6EE',
  muted: '#9BAE9F',
  border: '#2A4031',
};

// Decode either a plain ID, {"id":15}, or a plant-data QR.
function parseQR(data) {
  const raw = String(data ?? '').trim();

  try {
    const parsed = JSON.parse(raw);

    if (parsed && typeof parsed === 'object') {
      if (parsed.id !== undefined && parsed.id !== null) {
        return {
          type: 'id',
          id: String(parsed.id).trim(),
          raw,
        };
      }

      // Legacy CreateRecord QR field names.
      if (
        parsed.com !== undefined ||
        parsed.sci !== undefined ||
        parsed.commonName !== undefined ||
        parsed.scientificName !== undefined
      ) {
        return {
          type: 'plant',
          plant: {
            scientific_name:
              parsed.sci ?? parsed.scientificName ?? '',
            common_name:
              parsed.com ?? parsed.commonName ?? '',
            family: parsed.fam ?? parsed.family ?? '',
            height_m: parsed.h ?? parsed.height ?? '',
            diameter_cm: parsed.diameter_cm ?? parsed.diameter ?? '',
            morphological_notes:
              parsed.notes ?? parsed.morphologicalNotes ?? '',
          },
          raw,
        };
      }
    }
  } catch {
    // The QR may simply contain a plain ID.
  }

  return { type: 'id', id: raw, raw };
}

function matchesId(record, scannedId) {
  const id = String(scannedId ?? '').trim();
  const localId = String(record.id ?? '').trim();
  const serverId = String(record.serverId ?? '').trim();

  return (
    id === localId ||
    id === serverId ||
    (serverId !== '' && id === `cloud-${serverId}`)
  );
}

function isApproved(record) {
  return (
    String(record?.approvalStatus ?? record?.plant_status ?? '')
      .trim()
      .toLowerCase() === 'approved'
  );
}

function normalizeLocalPlant(record) {
  return {
    ...record,
    id: String(record.serverId || record.id),
    scientific_name: record.scientific_name ?? record.scientificName,
    common_name: record.common_name ?? record.commonName,
    height_m: record.height_m ?? record.height,
    diameter_cm: record.diameter_cm ?? record.diameter,
    morphological_notes:
      record.morphological_notes ?? record.notes,
    images: Array.isArray(record.images)
      ? record.images
      : Array.isArray(record.photos)
        ? record.photos
        : [],
    plant_status: record.plant_status ?? record.approvalStatus,
  };
}

function matchesPlantData(record, qrPlant) {
  const local = normalizeLocalPlant(record);

  const qrCommon = String(qrPlant.common_name ?? '').trim().toLowerCase();
  const qrScientific = String(qrPlant.scientific_name ?? '').trim().toLowerCase();
  const qrFamily = String(qrPlant.family ?? '').trim().toLowerCase();
  const qrNotes = String(qrPlant.morphological_notes ?? '').trim().toLowerCase();

  // Require a name and compare every supplied identifying field.
  const commonMatches =
    qrCommon !== '' &&
    String(local.common_name ?? '').trim().toLowerCase() === qrCommon;

  const scientificMatches =
    qrScientific !== '' &&
    String(local.scientific_name ?? '').trim().toLowerCase() === qrScientific;

  if (!commonMatches && !scientificMatches) return false;

  if (
    qrFamily &&
    String(local.family ?? '').trim().toLowerCase() !== qrFamily
  ) {
    return false;
  }

  if (
    qrNotes &&
    String(local.morphological_notes ?? '').trim().toLowerCase() !== qrNotes
  ) {
    return false;
  }

  return true;
}

export default function ScanQRScreen({ navigation, route }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);

  const isFocused = useIsFocused();
  const { records, loading: recordsLoading } = useRecords();
  const isVisitor = route?.params?.mode === 'visitor';

  // Botanists get the bottom bar and no back button. Visitors keep theirs.
  const safeEdges = isVisitor ? undefined : ['top', 'left', 'right'];
  const bottomNav = isVisitor ? null : <BotanistBottomNav active="scan" />;

  useEffect(() => {
    if (isFocused) {
      setScanned(false);
      setCameraReady(false);
      setCameraError('');
      setLookupLoading(false);
    }
  }, [isFocused]);

  const handleBarcodeScanned = async ({ data }) => {
    if (scanned || lookupLoading) return;

    setScanned(true);

    const qr = parseQR(data);

    console.log('[QR] Raw data:', qr.raw);
    console.log('[QR] Parsed type:', qr.type);

    if (recordsLoading) {
      Alert.alert(
        'Please wait',
        'Plant records are still loading. Please scan again.',
        [{ text: 'Scan again', onPress: () => setScanned(false) }]
      );
      return;
    }

    setLookupLoading(true);

    try {
      // Find a matching local record by ID or legacy plant-data fields.
      let matches = [];

      if (qr.type === 'id') {
        matches = records.filter((record) => matchesId(record, qr.id));
      } else {
        matches = records.filter((record) =>
          matchesPlantData(record, qr.plant)
        );
      }

      // Visitor must only open approved records.
      if (isVisitor) {
        matches = matches.filter(isApproved);
      }

      // Do not guess if a data-only QR matches multiple records.
      if (matches.length === 1) {
        const record = matches[0];

        if (isVisitor) {
          const plant = normalizeLocalPlant(record);

          navigation.replace('PlantDetail', {
            plantId: String(record.serverId || record.id),
            plant,
          });
        } else {
          navigation.replace('PlantRecordSummary', {
            record,
            readOnly: true,
          });
        }

        return;
      }

      if (matches.length > 1) {
        Alert.alert(
          'Multiple matching plants',
          'This QR does not identify one unique record. Please use the QR generated for the individual record.',
          [{ text: 'Scan again', onPress: () => setScanned(false) }]
        );
        return;
      }

      // Search the API when the phone has no matching local record.
      const response = await authFetch(API_URL);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const result = await response.json();
      const plants = Array.isArray(result)
        ? result
        : Array.isArray(result.plants)
          ? result.plants
          : [];

      let cloudMatches = [];

      if (qr.type === 'id') {
        cloudMatches = plants.filter((plant) => {
          const id = String(plant.id ?? '').trim();

          return (
            id === qr.id ||
            `cloud-${id}` === qr.id
          );
        });
      } else {
        cloudMatches = plants.filter((plant) =>
          matchesPlantData(plant, qr.plant)
        );
      }

      if (isVisitor) {
        cloudMatches = cloudMatches.filter((plant) =>
          String(plant.plant_status ?? '').trim().toLowerCase() ===
          'approved'
        );
      }

      if (cloudMatches.length === 1) {
        const plant = cloudMatches[0];

        if (isVisitor) {
          navigation.replace('PlantDetail', {
            plantId: String(plant.id),
            plant,
          });
        } else {
          navigation.replace('PlantRecordSummary', {
            record: {
              ...plant,
              id: String(plant.id),
              serverId: String(plant.id),
              scientificName: plant.scientific_name,
              commonName: plant.common_name,
              height: plant.height_m == null ? '' : String(plant.height_m),
              diameter:
                plant.diameter_cm == null ? '' : String(plant.diameter_cm),
              notes: plant.morphological_notes || '',
              photos: Array.isArray(plant.images) ? plant.images : [],
              approvalStatus: plant.plant_status,
            },
            readOnly: true,
          });
        }

        return;
      }

      Alert.alert(
        cloudMatches.length > 1 ? 'Multiple matching plants' : 'Plant not found',
        cloudMatches.length > 1
          ? 'This QR matches multiple records. Please use a QR containing the unique record ID.'
          : 'No matching record was found on this phone or in the cloud.',
        [{ text: 'Scan again', onPress: () => setScanned(false) }]
      );
    } catch (error) {
      console.error('[QR LOOKUP] Failed:', error);

      Alert.alert(
        'Could not find plant',
        'No matching local record was found, and the cloud could not be reached. Please try again when the API is available.',
        [{ text: 'Try again', onPress: () => setScanned(false) }]
      );
    } finally {
      setLookupLoading(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={DARK.bg} />
        <SafeAreaView style={styles.flex} edges={safeEdges}>
          <View style={styles.centerBox}>
            <ActivityIndicator color={DARK.green} />
            <Text style={styles.statusText}>Checking camera permission...</Text>
          </View>
        </SafeAreaView>
        {bottomNav}
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={DARK.bg} />
        <SafeAreaView style={styles.flex} edges={safeEdges}>
          {isVisitor && (
            <TouchableOpacity
              style={[styles.backButton, styles.backSpaced]}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="return-up-back" size={21} color={DARK.green} />
            </TouchableOpacity>
          )}

          <View style={styles.centerBox}>
            <Ionicons name="camera-outline" size={36} color={DARK.green} />
            <Text style={styles.permissionText}>
              {permission.canAskAgain
                ? 'Camera access is needed to scan plant tags.'
                : 'Camera access is turned off. Open Settings and allow camera access, then return here.'}
            </Text>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={
                permission.canAskAgain
                  ? requestPermission
                  : () => Linking.openSettings()
              }
            >
              <Text style={styles.permissionButtonText}>
                {permission.canAskAgain ? 'Allow camera' : 'Open Settings'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
        {bottomNav}
      </View>
    );
  }

  const statusMessage = cameraError
    ? cameraError
    : lookupLoading
      ? 'Looking up plant...'
      : !cameraReady
        ? 'Starting camera...'
        : 'Align the QR tag within the frame';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DARK.bg} />
      {isFocused && (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={
            scanned || lookupLoading ? undefined : handleBarcodeScanned
          }
          onCameraReady={() => {
            setCameraReady(true);
            setCameraError('');
          }}
          onMountError={(error) => {
            setCameraError(error?.message || 'The camera could not start.');
          }}
        />
      )}

      <SafeAreaView
        style={[styles.overlay, !isVisitor && styles.overlayCentered]}
        edges={safeEdges}
      >
        {isVisitor && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="return-up-back" size={21} color={DARK.green} />
          </TouchableOpacity>
        )}

        <View style={[styles.frameWrap, !isVisitor && styles.frameWrapCentered]}>
          <View style={styles.frame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>

          {(lookupLoading || (!cameraReady && !cameraError)) && (
            <ActivityIndicator
              color={DARK.green}
              size="small"
              style={styles.loader}
            />
          )}

          <Text style={[styles.hint, cameraError ? styles.hintError : null]}>
            {statusMessage}
          </Text>
        </View>
      </SafeAreaView>

      {bottomNav}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK.bg },
  flex: { flex: 1 },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
  },
  overlayCentered: { justifyContent: 'center' },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: DARK.surface,
    borderWidth: 1,
    borderColor: DARK.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backSpaced: { margin: 16 },
  frameWrap: { alignItems: 'center', marginBottom: 75 },
  frameWrapCentered: { marginBottom: 0 },
  frame: { width: 240, height: 240, borderRadius: 18, position: 'relative' },
  corner: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderColor: DARK.green,
  },
  topLeft: {
    top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  loader: { marginTop: 18 },
  hint: {
    color: DARK.text,
    fontSize: 13,
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  hintError: { color: '#FF8A80' },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 14,
  },
  statusText: { color: DARK.text, fontSize: 13 },
  permissionText: {
    color: DARK.muted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
  },
  permissionButton: {
    backgroundColor: DARK.green,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  permissionButtonText: { color: DARK.bg, fontWeight: '700' },
});