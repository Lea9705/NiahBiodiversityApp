
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useRecords } from '../context/RecordsContext';
import BackButton from '../components/BackButton';

const COLORS = {
  bg: '#0B1712',
  surface: '#14251B',
  surfaceLight: '#1C3023',
  green: '#B8E986',
  text: '#F2F6EE',
  muted: '#9BAE9F',
  border: '#2A4031',
  white: '#FFFFFF',
};

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
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.bg}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <BackButton onPress={() => navigation.goBack()} />

          <View style={styles.headerText}>
            <Text style={styles.brand}>NIAH BIODIVERSITY</Text>
            <Text style={styles.headerSubtitle}>
              {readOnly ? 'PLANT RECORD' : 'RECORD REVIEW'}
            </Text>
          </View>

          <View style={styles.leafIcon}>
            <Ionicons name="leaf" size={21} color={COLORS.green} />
            </View>
          </View>

        {/* Page title */}
        <View style={styles.pageHeading}>
          <View style={styles.eyebrow}>
            <View style={styles.eyebrowDot} />
            <Text style={styles.eyebrowText}>
              {readOnly ? 'BIODIVERSITY COLLECTION' : 'FIELD OBSERVATION'}
            </Text>
          </View>

          <Text style={styles.title}>
            {readOnly ? 'Plant details' : 'Review plant record'}
          </Text>

          <Text style={styles.subtitle}>
            {readOnly
              ? 'Explore the recorded information for this plant.'
              : 'Check the photos and information before submitting your record.'}
          </Text>
        </View>

        {/* Photos */}
        <View style={styles.section}>
          <SectionHeading
            icon="images-outline"
            title="Plant photos"
            subtitle={
              photos.length > 0
                ? `${photos.length} photo${photos.length === 1 ? '' : 's'}`
                : 'No photos added'
            }
          />

          {photos.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photoList}
            >
              {photos.map((uri, index) => (
                <TouchableOpacity
                  key={`${uri}-${index}`}
                  style={styles.photoCard}
                  onPress={() => setSelectedPhotoIndex(index)}
                  activeOpacity={0.85}
                >
                  <Image
                    source={{ uri }}
                    style={styles.photo}
                    resizeMode="cover"
                  />
                  <View style={styles.photoExpand}>
                    <Ionicons
                      name="expand-outline"
                      size={15}
                      color={COLORS.text}
                    />
                  </View>
                  <Text style={styles.photoLabel}>
                    PHOTO {String(index + 1).padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyPhotos}>
              <Ionicons
                name="image-outline"
                size={27}
                color={COLORS.muted}
              />
              <Text style={styles.emptyPhotosText}>
                No plant photos available
              </Text>
            </View>
          )}
        </View>

        {/* Plant information */}
        <View style={styles.section}>
          <SectionHeading
            icon="leaf-outline"
            title="Plant information"
            subtitle="Species and physical measurements"
          />

          <View style={styles.infoGrid}>
            <View style={styles.infoTile}>
              <Text style={styles.label}>Common name</Text>
              <Text style={styles.tileValue}>
                {record.commonName || 'Not provided'}
              </Text>
            </View>

            <View style={styles.infoTile}>
              <Text style={styles.label}>Scientific name</Text>
              <Text style={[styles.tileValue, styles.scientificValue]}>
                {record.scientificName || 'Not provided'}
              </Text>
            </View>
          </View>

          <InfoRow
            icon="git-branch-outline"
            label="Family"
            value={record.family}
          />

          <View style={styles.divider} />

          <View style={styles.measurements}>
            <View style={styles.measurementCard}>
              <View style={styles.measurementIcon}>
                <Ionicons
                  name="resize-outline"
                  size={19}
                  color={COLORS.green}
                />
              </View>
              <Text style={styles.label}>Height</Text>
              <Text style={styles.measurementValue}>
                {record.height ? `${record.height} m` : 'Not provided'}
              </Text>
            </View>

            <View style={styles.measurementCard}>
              <View style={styles.measurementIcon}>
                <Ionicons
                  name="ellipse-outline"
                  size={19}
                  color={COLORS.green}
                />
              </View>
              <Text style={styles.label}>Diameter</Text>
              <Text style={styles.measurementValue}>
                {record.diameter ? `${record.diameter} cm` : 'Not provided'}
              </Text>
            </View>
          </View>
        </View>

        {/* GPS */}
        <View style={styles.section}>
          <SectionHeading
            icon="location-outline"
            title="GPS location"
            subtitle="Recorded coordinates"
          />

          <View style={styles.locationBanner}>
            <View style={styles.locationIcon}>
              <Ionicons
                name="navigate-outline"
                size={22}
                color={COLORS.green}
              />
            </View>
            <View style={styles.locationCopy}>
              <Text style={styles.locationTitle}>Field coordinates</Text>
              <Text style={styles.locationSubtitle}>
                Geographic position captured for this record
              </Text>
            </View>
          </View>

          <View style={styles.coordinateRow}>
            <View style={styles.coordinateItem}>
              <Text style={styles.label}>LATITUDE</Text>
              <Text style={styles.coordinateValue}>
                {record.latitude || 'Not provided'}
              </Text>
            </View>

            <View style={styles.coordinateItem}>
              <Text style={styles.label}>LONGITUDE</Text>
              <Text style={styles.coordinateValue}>
                {record.longitude || 'Not provided'}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <SectionHeading
            icon="document-text-outline"
            title="Morphological notes"
            subtitle="Plant characteristics and observations"
          />

          <View style={styles.notesBox}>
            <View style={styles.notesAccent} />
            <Text style={styles.notes}>
              {record.notes || 'No notes provided for this plant.'}
            </Text>
          </View>
        </View>

        {/* QR code */}
        <View style={styles.section}>
          <SectionHeading
            icon="qr-code-outline"
            title="Plant QR code"
            subtitle="Scan to identify this record"
          />

          <View style={styles.qrContainer}>
            <View style={styles.qrWrap}>
              {qrValue ? (
                <QRCode
                  value={qrValue}
                  size={148}
                  color="#000000"
                  backgroundColor="#FFFFFF"
                />
              ) : (
                <View style={styles.qrUnavailable}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={28}
                    color="#667066"
                  />
                  <Text style={styles.qrUnavailableText}>
                    QR ID unavailable
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.qrCaption}>PLANT RECORD ID</Text>
            <Text style={styles.qrId}>{qrValue || 'Unavailable'}</Text>
          </View>
        </View>

        {/* Actions remain available only when not read-only */}
        {!readOnly && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.goBack()}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <Ionicons
                name="create-outline"
                size={19}
                color={COLORS.text}
              />
              <Text style={styles.editButtonText}>Edit record</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sendButton,
                submitting && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <Ionicons
                name={submitting ? 'sync-outline' : 'send-outline'}
                size={18}
                color={COLORS.bg}
              />
              <Text style={styles.sendButtonText}>
                {submitting ? 'Saving...' : 'Submit record'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.footer}>
          ROOTED IN NATURE · NIAH BIODIVERSITY
        </Text>
      </ScrollView>

      {/* Full-screen photo viewer */}
      {selectedPhotoIndex !== null && photos[selectedPhotoIndex] && (
        <View style={styles.fullScreenOverlay}>
          <View style={styles.viewerHeader}>
            <Text style={styles.viewerTitle}>Plant photos</Text>
            <TouchableOpacity
              style={styles.closePhoto}
              onPress={() => setSelectedPhotoIndex(null)}
              accessibilityLabel="Close photo viewer"
            >
              <Ionicons name="close" size={25} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <Image
            source={{ uri: photos[selectedPhotoIndex] }}
            style={styles.fullScreenPhoto}
            resizeMode="contain"
          />

          {photos.length > 1 && (
            <View style={styles.photoNavigation}>
              <TouchableOpacity
                style={styles.photoNavButton}
                onPress={() =>
                  setSelectedPhotoIndex(
                    (selectedPhotoIndex - 1 + photos.length) % photos.length
                  )
                }
                accessibilityLabel="Previous photo"
              >
                <Ionicons
                  name="chevron-back"
                  size={25}
                  color={COLORS.text}
                />
              </TouchableOpacity>

              <Text style={styles.photoCounter}>
                {selectedPhotoIndex + 1} / {photos.length}
              </Text>

              <TouchableOpacity
                style={styles.photoNavButton}
                onPress={() =>
                  setSelectedPhotoIndex(
                    (selectedPhotoIndex + 1) % photos.length
                  )
                }
                accessibilityLabel="Next photo"
              >
                <Ionicons
                  name="chevron-forward"
                  size={25}
                  color={COLORS.text}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
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

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      {icon ? (
        <View style={styles.infoRowIcon}>
          <Ionicons name={icon} size={18} color={COLORS.green} />
        </View>
      ) : null}

      <View style={styles.infoRowCopy}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value || 'Not provided'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 38,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 27,
    gap: 12,
  },
  backButton: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  brand: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.7,
  },
  headerSubtitle: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.8,
    marginTop: 4,
  },
  leafIcon: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pageHeading: {
    marginBottom: 24,
  },
  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 11,
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
    lineHeight: 35,
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
    gap: 12,
    paddingBottom: 2,
  },
  photoCard: {
    width: 148,
    padding: 7,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  photo: {
    width: '100%',
    height: 133,
    borderRadius: 10,
    backgroundColor: COLORS.bg,
  },
  photoExpand: {
    position: 'absolute',
    right: 13,
    top: 13,
    width: 29,
    height: 29,
    borderRadius: 10,
    backgroundColor: '#0B1712DD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoLabel: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
    paddingHorizontal: 3,
    paddingTop: 9,
    paddingBottom: 3,
  },
  emptyPhotos: {
    minHeight: 105,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 14,
    gap: 9,
  },
  emptyPhotosText: {
    color: COLORS.muted,
    fontSize: 11,
  },

  infoGrid: {
    gap: 10,
    marginBottom: 15,
  },
  infoTile: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 13,
    padding: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  tileValue: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  scientificValue: {
    color: COLORS.green,
    fontStyle: 'italic',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 7,
  },
  infoRowIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoRowCopy: {
    flex: 1,
  },
  value: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 13,
  },
  measurements: {
    flexDirection: 'row',
    gap: 10,
  },
  measurementCard: {
    flex: 1,
    minWidth: 0,
    padding: 12,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  measurementIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  measurementValue: {
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
  },

  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 14,
    padding: 12,
    marginBottom: 13,
  },
  locationIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationCopy: {
    flex: 1,
  },
  locationTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
  },
  locationSubtitle: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },
  coordinateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  coordinateItem: {
    flex: 1,
    minWidth: 0,
    padding: 12,
    backgroundColor: COLORS.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  coordinateValue: {
    color: COLORS.text,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '700',
  },

  notesBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 13,
    overflow: 'hidden',
    minHeight: 65,
  },
  notesAccent: {
    width: 3,
    backgroundColor: COLORS.green,
  },
  notes: {
    flex: 1,
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 20,
    padding: 14,
  },

  qrContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 19,
  },
  qrWrap: {
    minWidth: 180,
    minHeight: 180,
    backgroundColor: COLORS.white,
    borderRadius: 13,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrUnavailable: {
    alignItems: 'center',
    gap: 8,
  },
  qrUnavailableText: {
    color: '#667066',
    fontSize: 11,
  },
  qrCaption: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginTop: 16,
  },
  qrId: {
    color: COLORS.green,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 6,
  },

  actions: {
    gap: 11,
    marginTop: 3,
  },
  editButton: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  editButtonText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
  },
  sendButton: {
    minHeight: 52,
    borderRadius: 15,
    backgroundColor: COLORS.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  sendButtonDisabled: {
    opacity: 0.65,
  },
  sendButtonText: {
    color: COLORS.bg,
    fontSize: 13,
    fontWeight: '900',
  },

  footer: {
    color: '#627767',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    textAlign: 'center',
    marginTop: 25,
    marginBottom: 9,
  },

  fullScreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.bg,
    zIndex: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  viewerHeader: {
    position: 'absolute',
    top: 18,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  viewerTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
  },
  closePhoto: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenPhoto: {
    width: '100%',
    height: '72%',
  },
  photoNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '70%',
    marginTop: 20,
  },
  photoNavButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoCounter: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },
});
