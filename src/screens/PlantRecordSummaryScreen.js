
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { colors } from '../theme/colors';
import { useRecords } from '../context/RecordsContext';

export default function PlantRecordSummaryScreen({ navigation, route }) {
  const { record, readOnly } = route.params;
  const { addRecord } = useRecords();

  const [submitting, setSubmitting] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

  const photos = Array.isArray(record.photos) ? record.photos : [];

  const qrValue = String(record.serverId || record.id || '');

  const handleSend = () => {
    if (submitting) return;

    Alert.alert(
      'Submit plant record?',
      'Please confirm that you want to submit this plant record.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            setSubmitting(true);

            try {
              const status = await addRecord({
                ...record,
                status: 'pending',
              });

              setSubmitting(false);

              Alert.alert(
                status === 'synced' ? 'Record submitted' : 'Record saved',
                status === 'synced'
                  ? 'Your plant record has been saved and synced to the cloud.'
                  : 'Your plant record is saved on this phone. It will sync automatically when you are online.',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.navigate('BotanistHome'),
                  },
                ]
              );
            } catch (error) {
              setSubmitting(false);
              console.error('Save plant error:', error);

              Alert.alert(
                'Could not save',
                'The plant record could not be saved on this device.'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.back}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Review plant record</Text>

        <Text style={styles.subtitle}>
          Please check the information before submitting the record.
        </Text>

        {photos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photoList}
            >
              {photos.map((uri, index) => (
                <TouchableOpacity
                  key={`${uri}-${index}`}
                  onPress={() => setSelectedPhotoIndex(index)}
                >
                  <Image source={{ uri }} style={styles.photo} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plant information</Text>
          <InfoRow label="Scientific name" value={record.scientificName} />
          <InfoRow label="Common name" value={record.commonName} />
          <InfoRow label="Family" value={record.family} />
          <InfoRow
            label="Height"
            value={record.height ? `${record.height} m` : ''}
          />
          <InfoRow
            label="Diameter"
            value={record.diameter ? `${record.diameter} cm` : ''}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GPS location</Text>
          <InfoRow label="Latitude" value={record.latitude} />
          <InfoRow label="Longitude" value={record.longitude} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Morphological notes</Text>
          <Text style={styles.notes}>
            {record.notes || 'No notes provided.'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plant QR code</Text>

          <View style={styles.qrWrap}>
            {qrValue ? (
              <QRCode
                value={qrValue}
                size={140}
                color="#000000"
                backgroundColor="#FFFFFF"
              />
            ) : (
              <Text style={styles.value}>QR ID unavailable</Text>
            )}
          </View>

          <Text style={styles.qrId}>{qrValue}</Text>
        </View>

        {!readOnly && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.goBack()}
              disabled={submitting}
            >
              <Ionicons
                name="create-outline"
                size={18}
                color={colors.textPrimary}
              />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSend}
              disabled={submitting}
            >
              <Ionicons
                name={submitting ? 'sync-outline' : 'send-outline'}
                size={18}
                color={colors.buttonText}
              />
              <Text style={styles.sendButtonText}>
                {submitting ? 'Saving...' : 'Send'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {selectedPhotoIndex !== null && photos[selectedPhotoIndex] && (
        <View style={styles.fullScreenOverlay}>
          <TouchableOpacity
            style={styles.closePhoto}
            onPress={() => setSelectedPhotoIndex(null)}
          >
            <Ionicons name="close" size={30} color="#FFFFFF" />
          </TouchableOpacity>

          <Image
            source={{ uri: photos[selectedPhotoIndex] }}
            style={styles.fullScreenPhoto}
            resizeMode="contain"
          />

          {photos.length > 1 && (
            <View style={styles.photoNavigation}>
              <TouchableOpacity
                onPress={() =>
                  setSelectedPhotoIndex(
                    (selectedPhotoIndex - 1 + photos.length) % photos.length
                  )
                }
              >
                <Ionicons
                  name="chevron-back"
                  size={32}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              <Text style={styles.photoCounter}>
                {selectedPhotoIndex + 1} / {photos.length}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setSelectedPhotoIndex(
                    (selectedPhotoIndex + 1) % photos.length
                  )
                }
              >
                <Ionicons
                  name="chevron-forward"
                  size={32}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || 'Not provided'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 16,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  section: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  photoList: {
    gap: 10,
  },
  photo: {
    width: 110,
    height: 110,
    borderRadius: 8,
  },
  infoRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 3,
  },
  value: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  notes: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  qrWrap: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
  },
  qrId: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  editButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  editButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  sendButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.accentText,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  sendButtonText: {
    color: colors.buttonText,
    fontSize: 14,
    fontWeight: '600',
  },
  fullScreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    zIndex: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closePhoto: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 2,
    padding: 10,
  },
  fullScreenPhoto: {
    width: '100%',
    height: '75%',
  },
  photoNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '70%',
    marginTop: 20,
  },
  photoCounter: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});
