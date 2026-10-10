// First screen the app shows. Purely a router - it doesn't log anyone in,
// it just sends the user to the right login screen.
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function RoleSelectScreen({ navigation }) {
  return (
    <ImageBackground
      source={require('../../assets/images/niah-background.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
      <View style={styles.logoWrap}>
        <View style={styles.logo}>
          <Ionicons name="leaf-outline" size={42} color={colors.successText} />
        </View>
        <Text style={styles.title}>Niah Biodiversity</Text>
        <Text style={styles.subtitle}>Who's using the app today?</Text>
      </View>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('BotanistLogin')} activeOpacity={0.8}>
        <View style={[styles.iconCircle, { backgroundColor: colors.accentBg }]}>
          <Ionicons name="clipboard-outline" size={20} color={colors.accentText} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>I'm A Botanist</Text>
          <Text style={styles.cardSub}>Field Data Collection and Records</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('VisitorHome')} activeOpacity={0.8}>
        <View style={[styles.iconCircle, { backgroundColor: colors.successBg }]}>
          <Ionicons name="location-outline" size={20} color={colors.successText} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>I'm A Visitor</Text>
          <Text style={styles.cardSub}>Explore Plants on The Trail</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>
     </View> 
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1,justifyContent: 'center', },
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: 20, justifyContent: 'center', },
  logoWrap: { alignItems: 'center', marginBottom: 36 },
  logo: { width: 80, height: 80, borderRadius: 20, backgroundColor: colors.successBg, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  title: { fontSize: 35, fontWeight: '700', color: colors.textPrimary, textAlign: 'center', },
  subtitle: { fontSize: 16, fontWeight: '500', color: '#FFFFFF', marginTop: 6, textAlign: 'center', textShadowColor: 'rgba(0, 0, 0, 0.8)', textShadowOffset: { width: 0, height: 1 },  textShadowRadius: 4, },
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surfaceAlt, borderWidth: 0.5, borderColor: colors.border, borderRadius: 12, padding: 16, marginBottom: 12 },
  iconCircle: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  cardSub: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
});
