// First screen the app shows. Purely a router - it doesn't log anyone in,
// it just sends the user to the right login screen.
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function RoleSelectScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoWrap}>
        <View style={styles.logo}>
          <Ionicons name="leaf-outline" size={26} color={colors.successText} />
        </View>
        <Text style={styles.title}>Niah biodiversity</Text>
        <Text style={styles.subtitle}>Who's using the app today?</Text>
      </View>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('BotanistLogin')} activeOpacity={0.8}>
        <View style={[styles.iconCircle, { backgroundColor: colors.accentBg }]}>
          <Ionicons name="clipboard-outline" size={20} color={colors.accentText} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>I'm a botanist</Text>
          <Text style={styles.cardSub}>Field data collection and records</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('VisitorHome')} activeOpacity={0.8}>
        <View style={[styles.iconCircle, { backgroundColor: colors.successBg }]}>
          <Ionicons name="location-outline" size={20} color={colors.successText} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>I'm a visitor</Text>
          <Text style={styles.cardSub}>Explore plants on the trail</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 20, justifyContent: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: 32 },
  logo: { width: 52, height: 52, borderRadius: 14, backgroundColor: colors.successBg, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: { fontSize: 17, fontWeight: '600', color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4, textAlign: 'center' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surfaceAlt, borderWidth: 0.5, borderColor: colors.border, borderRadius: 12, padding: 16, marginBottom: 12 },
  iconCircle: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  cardSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});
