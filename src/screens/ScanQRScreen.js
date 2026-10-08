// Live camera scanner for plant QR tags. Looks up the scanned ID against
// the records saved on this phone and shows the matching plant's info.
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useRecords } from '../context/RecordsContext';

export default function ScanQRScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const isFocused = useIsFocused();
  const { findRecordById } = useRecords();

  // Start fresh every time this screen comes back into view.
  useEffect(() => {
    if (isFocused) {
      setScanned(false);
      setCameraReady(false);
      setCameraError('');
    }
  }, [isFocused]);

  const handleBarcodeScanned = ({ data }) => {
    if (scanned) return;
    setScanned(true);

    const record = findRecordById(data);

    if (record) {
      navigation.replace('PlantRecordSummary', { record, readOnly: true });
    } else {
      Alert.alert(
        'Plant not found',
        "This tag isn't linked to any record saved on this phone.",
        [{ text: 'Scan again', onPress: () => setScanned(false) }]
      );
    }
  };

  // Still checking permission: show a message instead of a blank screen.
  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerBox}>
          <ActivityIndicator color="#FFFFFF" />
          <Text style={styles.statusText}>Checking camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.centerBox}>
          <Ionicons name="camera-outline" size={32} color={colors.textSecondary} />
          <Text style={styles.permissionText}>
            {permission.canAskAgain
              ? 'Camera access is needed to scan plant tags.'
              : 'Camera access is turned off. Open Settings and allow Camera (when testing, look for Expo Go in your phone settings), then come back.'}
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={permission.canAskAgain ? requestPermission : () => Linking.openSettings()}
          >
            <Text style={styles.permissionButtonText}>
              {permission.canAskAgain ? 'Allow camera' : 'Open Settings'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusMessage = cameraError
    ? cameraError
    : !cameraReady
    ? 'Starting camera...'
    : 'Align the QR tag within the frame';

  return (
    <View style={styles.container}>
      {isFocused && (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          onCameraReady={() => setCameraReady(true)}
          onMountError={(e) => setCameraError(e?.message || 'The camera could not start.')}
        />
      )}

      <SafeAreaView style={styles.overlay}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.frameWrap}>
          <View style={styles.frame} />
          <Text style={[styles.hint, cameraError ? styles.hintError : null]}>
            {statusMessage}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay: { flex: 1, justifyContent: 'space-between', padding: 16 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 16 },
  backText: { color: '#FFFFFF', fontSize: 13 },
  frameWrap: { alignItems: 'center', marginBottom: 80 },
  frame: { width: 240, height: 240, borderWidth: 2, borderColor: '#FFFFFF', borderRadius: 16 },
  hint: { color: '#FFFFFF', fontSize: 13, marginTop: 16, textAlign: 'center', paddingHorizontal: 24 },
  hintError: { color: '#FF8A80' },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  statusText: { color: '#FFFFFF', fontSize: 13 },
  permissionText: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
  permissionButton: { backgroundColor: colors.buttonBg, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20, marginTop: 8 },
  permissionButtonText: { color: colors.buttonText, fontWeight: '600' },
});