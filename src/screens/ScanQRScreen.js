// Live camera scanner for plant QR tags. Looks up the scanned ID against
// records added this session and shows the matching plant's info.
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useRecords } from '../context/RecordsContext';

export default function ScanQRScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const { findRecordById } = useRecords();

  const handleBarcodeScanned = ({ data }) => {
    if (scanned) return;
    setScanned(true);

    const record = findRecordById(data);

    if (record) {
      navigation.replace('PlantRecordSummary', { record, readOnly: true });
    } else {
      Alert.alert(
        'Plant not found',
        "This tag isn't linked to any record saved in this session yet.",
        [{ text: 'Scan again', onPress: () => setScanned(false) }]
      );
    }
  };

  if (!permission) {
    return <SafeAreaView style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionBox}>
          <Ionicons name="camera-outline" size={32} color={colors.textSecondary} />
          <Text style={styles.permissionText}>Camera access is needed to scan plant tags.</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      <SafeAreaView style={styles.overlay}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.frameWrap}>
          <View style={styles.frame} />
          <Text style={styles.hint}>Align the QR tag within the frame</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay: { flex: 1, justifyContent: 'space-between', padding: 16 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { color: '#FFFFFF', fontSize: 13 },
  frameWrap: { alignItems: 'center', marginBottom: 80 },
  frame: { width: 240, height: 240, borderWidth: 2, borderColor: '#FFFFFF', borderRadius: 16 },
  hint: { color: '#FFFFFF', fontSize: 13, marginTop: 16 },
  permissionBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  permissionText: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
  permissionButton: { backgroundColor: colors.buttonBg, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20, marginTop: 8 },
  permissionButtonText: { color: colors.buttonText, fontWeight: '600' },
});