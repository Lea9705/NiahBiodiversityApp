import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function BotanistProfileScreen({ navigation }) {
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

      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons
            name="person-outline"
            size={32}
            color={colors.accentText}
          />
        </View>

        <Text style={styles.title}>Botanist profile</Text>
        <Text style={styles.subtitle}>
          Field staff and conservation team
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Account</Text>
        <Text style={styles.value}>Botanist</Text>

        <Text style={styles.label}>Access</Text>
        <Text style={styles.value}>Field data collection</Text>
      </View>

      <Pressable
        style={styles.logoutButton}
        onPress={() => navigation.replace('RoleSelect')}
      >
        <Ionicons
          name="log-out-outline"
          size={20}
          color={colors.errorText}
        />
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
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
    marginBottom: 24,
  },

  backText: {
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 6,
  },

  header: {
    alignItems: 'center',
    marginBottom: 24,
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accentBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },

  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },

  label: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },

  value: {
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 14,
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.errorText,
    borderRadius: 10,
    paddingVertical: 12,
  },

  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.errorText,
    marginLeft: 8,
  },
});