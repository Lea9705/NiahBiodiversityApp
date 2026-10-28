
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import BackButton from '../components/BackButton';
import { useUser } from '../context/UserContext';

function buildProfileFields(user) {
  return [
    { label: 'Staff ID', value: user?.id || 'Not set up yet', icon: 'id-card-outline' },
    { label: 'Email', value: user?.email || 'Not set up yet', icon: 'mail-outline' },
    { label: 'Phone Number', value: user?.phone || 'Not added', icon: 'call-outline' },
    { label: 'Unit', value: user?.unit || 'Not assigned', icon: 'people-outline' },
    { label: 'Department', value: user?.department || 'Not assigned', icon: 'business-outline' },
  ];
}

const COLORS = {
  bg: '#0B1712',
  surface: '#14251B',
  surfaceLight: '#1C3023',
  green: '#B8E986',
  text: '#F2F6EE',
  muted: '#9BAE9F',
  border: '#2A4031',
  error: '#F08C86',
  errorBg: '#251B19',
  errorBorder: '#713A38',
};

const profileFields = [
  { label: 'Staff ID', value: 'Not set up yet', icon: 'id-card-outline' },
  { label: 'Email', value: 'Not set up yet', icon: 'mail-outline' },
  { label: 'Phone Number', value: 'Not added', icon: 'call-outline' },
  { label: 'Unit', value: 'Not assigned', icon: 'people-outline' },
  { label: 'Department', value: 'Not assigned', icon: 'business-outline' },
];

export default function BotanistProfileScreen({ navigation }) {
  const { user, logout } = useUser();
  const profileFields = buildProfileFields(user);
  const handleLogout = () => {
    logout();
    navigation.reset({ index: 0, routes: [{ name: 'RoleSelect' }] });
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.bg}
      />

      {/* Back button */}
      <View style={styles.topBar}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>

      {/* Profile heading */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons
            name="person"
            size={43}
            color="#54B5F4"
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
            color="#54B5F4"
          />
          <Text style={styles.roleBadgeText}>BOTANIST</Text>
        </View>
      </View>

      {/* Profile information */}
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
                color="#54B5F4"
              />
            </View>

            <View style={styles.fieldContent}>
              <Text style={styles.label}>{field.label}</Text>
              <Text style={styles.value} numberOfLines={1}>
                {field.value}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color={COLORS.muted}
            />
          </View>
        ))}
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 12,
  },

  topBar: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 4,
  },

  header: {
    alignItems: 'center',
    marginBottom: 22,
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#06432F',
    borderWidth: 2,
    borderColor: '#397A56',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  title: {
    fontSize: 25,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 5,
    textAlign: 'center',
  },

  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: '#0D2C20',
    borderWidth: 1,
    borderColor: '#23734A',
  },

  roleBadgeText: {
    color: '#54B5F4',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 15,
    paddingVertical: 3,
    marginBottom: 18,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    gap: 13,
    minHeight: 76,
  },

  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  fieldIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  fieldContent: {
    flex: 1,
    minWidth: 0,
  },

  label: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 5,
  },

  value: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },

  logoutButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.errorBorder,
    backgroundColor: COLORS.errorBg,
    borderRadius: 15,
    paddingVertical: 12,
    gap: 10,
    marginTop: 0,
  },

  logoutPressed: {
    opacity: 0.7,
  },

  logoutText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.error,
  },
});
