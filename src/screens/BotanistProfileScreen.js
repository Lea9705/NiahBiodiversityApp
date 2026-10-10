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
          size={16}
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

        <Text style={styles.title}>Botanist Profile</Text>
        <Text style={styles.subtitle}>
          Your Account Information
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>Not set up yet</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>Not set up yet</Text>

        <Text style={styles.label}>Role</Text>
        <Text style={styles.value}>Botanist</Text>

        <Text style={styles.label}>Section</Text>
        <Text style={styles.value}>Not assigned</Text>

        <Text style={styles.label}>Division</Text>
        <Text style={styles.value}>Not assigned</Text>
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
        <Text style={styles.logoutText}>Log Out</Text>
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
    paddingVertical: 4,
    paddingHorizontal: 0,
    marginBottom: 24,
  },

  backText: {
    fontSize: 14,
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
    marginBottom: 18,
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