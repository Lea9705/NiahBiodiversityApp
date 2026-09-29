import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function PlantDetailScreen({ navigation, route }) {
  const plant = route.params?.plant;

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

        <Text style={styles.name}>{plant.name}</Text>

        <Text style={styles.detail}>
          {plant.detail}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Plant information</Text>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Scientific name</Text>
          <Text style={styles.value}>{plant.name}</Text>

          <Text style={styles.label}>Conservation status</Text>
          <Text style={styles.value}>
            {plant.detail?.split(' · ')[0] || 'Not available'}
          </Text>

          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>
            {plant.detail?.split(' · ')[1] || 'Not available'}
          </Text>
        </View>

        <View style={styles.noteCard}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={colors.accentText}
          />

          <Text style={styles.noteText}>
            This plant information is currently prototype data.
            It will later be retrieved from the central biodiversity
            knowledge system.
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