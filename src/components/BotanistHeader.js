// Top bar for the Home and Explore screens: profile icon, greeting, logout.
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/UserContext';

const COLORS = {
  surfaceLight: '#E3F1E6',
  green: '#2A7A45',
  text: '#17261C',
  muted: '#5E7062',
  border: '#D3DFCF',
  error: '#B3392F',
  errorBg: '#FCE9E7',
  errorBorder: '#F0BDB8',
};

export default function BotanistHeader() {
  const navigation = useNavigation();
  const { userName, logout } = useUser();

  const handleLogout = () => {
    Alert.alert(
      'Log out?',
      'You will return to the start screen. Records saved on this phone stay on this phone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'RoleSelect' }],
            });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={styles.avatar}
        onPress={() => navigation.navigate('BotanistProfile')}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Open profile"
      >
        <Ionicons name="person" size={22} color={COLORS.green} />
      </TouchableOpacity>

      <Text style={styles.hello} numberOfLines={1}>
        Hello, <Text style={styles.name}>{userName || 'Botanist'}</Text>
      </Text>

      <TouchableOpacity
        style={styles.logoutWrap}
        onPress={handleLogout}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Log out"
      >
        <View style={styles.logout}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
        </View>
        <Text style={styles.logoutLabel}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  hello: {
    flex: 1,
    color: COLORS.muted,
    fontSize: 16,
  },

  name: {
    color: COLORS.text,
    fontWeight: '800',
  },

  logoutWrap: {
    alignItems: 'center',
    gap: 4,
  },

  logout: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.errorBg,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutLabel: {
    color: COLORS.error,
    fontSize: 10,
    fontWeight: '700',
  },
});