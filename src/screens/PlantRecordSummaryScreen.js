import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { colors } from '../theme/colors';

export default function PlantRecordSummaryScreen({ navigation, route }) {
  const { record } = route.params;

  const handleSend = () => {
    Alert.alert(
      'Submit plant record?',
      'Please confirm that you want to submit this plant record.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Submit',
          onPress: () => {
            console.log('Record ready to submit:', record);
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

        {/* Photos */}
        {record.photos?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photoList}
            >
              {record.photos.map((uri, index) => (
                <Image
                  key={`${uri}-${index}`}
                  source={{ uri }}
                  style={styles.photo}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Plant information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plant information</Text>

          <InfoRow
            label="Scientific name"
            value={record.scientificName}
          />

          <InfoRow
            label="Common name"
            value={record.commonName}
          />

          <InfoRow
            label="Family"
            value={record.family}
          />

          <InfoRow
            label="Height"
            value={record.height ? `${record.height} m` : ''}
          />

          <InfoRow
            label="Diameter"
            value={record.diameter ? `${record.diameter} cm` : ''}
          />
        </View>

        {/* GPS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GPS location</Text>

          <InfoRow
            label="Latitude"
            value={record.latitude}
          />

          <InfoRow
            label="Longitude"
            value={record.longitude}
          />
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Morphological notes</Text>

          <Text style={styles.notes}>
            {record.notes || 'No notes provided.'}
          </Text>
        </View>

        {/* QR code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plant QR code</Text>

          <View style={styles.qrWrap}>
            <QRCode
              value={record.id}
              size={140}
              color="#000000"
              backgroundColor="#FFFFFF"
            />
          </View>

          <Text style={styles.qrId}>{record.id}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.goBack()}
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
          >
            <Ionicons
              name="send-outline"
              size={18}
              color={colors.buttonText}
            />
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
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
});