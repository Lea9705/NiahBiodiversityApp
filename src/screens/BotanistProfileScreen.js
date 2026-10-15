import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const profileFields = [
  { label: 'Staff ID', value: 'Not set up yet', icon: 'id-card-outline' },
  { label: 'Email', value: 'Not set up yet', icon: 'mail-outline' },
  { label: 'Phone Number', value: 'Not added', icon: 'call-outline' },
  { label: 'Unit', value: 'Not assigned', icon: 'people-outline' },
  { label: 'Department', value: 'Not assigned', icon: 'business-outline' },
];

export default function BotanistProfileScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
              name="person"
              size={48}
              color={colors.accentText}
            />
          </View>

          <Text style={styles.title}>Botanist Profile</Text>
          <Text style={styles.subtitle}>
            Your Account Information
          </Text>

          <View style={styles.roleBadge}>
            <Ionicons
              name="leaf-outline"
              size={16}
              color={colors.accentText}
            />
            <Text style={styles.roleBadgeText}>BOTANIST</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          {profileFields.map((field, index) => (
            <View
              key={field.label}
              style={[
                styles.infoRow,
                index !== profileFields.length - 1 &&
                  styles.infoRowBorder,
              ]}
            >
              <View style={styles.fieldIcon}>
                <Ionicons
                  name={field.icon}
                  size={23}
                  color={colors.accentText}
                />
              </View>

              <View style={styles.fieldContent}>
                <Text style={styles.label}>{field.label}</Text>
                <Text style={styles.value}>{field.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <Pressable
          style={styles.logoutButton}
          onPress={() => navigation.replace('RoleSelect')}
        >
          <Ionicons
            name="log-out-outline"
            size={22}
            color={colors.errorText}
          />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B100E',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
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
    marginLeft: 8,
  },

  header: {
    alignItems: 'center',
    marginBottom: 28,
  },

  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#193D2C',
    borderWidth: 2,
    borderColor: '#527C5B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },

  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 24,
    backgroundColor: '#14291D',
    borderWidth: 1,
    borderColor: '#3D7149',
  },

  roleBadgeText: {
    color: colors.accentText,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },

  infoCard: {
    backgroundColor: '#171E1B',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#303A35',
    paddingHorizontal: 18,
    paddingVertical: 4,
    marginBottom: 24,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },

  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#303A35',
  },

  fieldIcon: {
    width: 54,
    height: 54,
    borderRadius: 15,
    backgroundColor: '#202D25',
    alignItems: 'center',
    justifyContent: 'center',
  },

  fieldContent: {
    flex: 1,
  },

  label: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 6,
  },

  value: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.errorText,
    borderRadius: 16,
    paddingVertical: 16,
    gap: 10,
    marginTop: 4,
  },

  logoutText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.errorText,
  },
});
