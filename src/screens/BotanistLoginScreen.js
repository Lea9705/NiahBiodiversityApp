// Botanist login only - no self-signup, matching the requirement that
// botanist accounts are created by an admin.
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import StyledInput from '../components/StyledInput';
import PrimaryButton from '../components/PrimaryButton';

export default function BotanistLoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const handleLogin = () => {
    const newErrors = {};
    if (!email) newErrors.email = '*Please enter your staff email';
    if (!password) newErrors.password = '*Please enter your password';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // TODO: replace with a real API call to your backend teammate's auth endpoint, e.g.
    // const res = await fetch(`${API_URL}/auth/login`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, password, role: 'botanist' }),
    // });
    // const { token } = await res.json();
    // await SecureStore.setItemAsync('token', token); // needs expo-secure-store
    navigation.navigate('BotanistHome');
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={16} color={colors.textSecondary} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.logoWrap}>
        <View style={[styles.logo, { backgroundColor: colors.accentBg }]}>
          <Ionicons name="clipboard-outline" size={22} color={colors.accentText} />
        </View>
        <Text style={styles.title}>Botanist login</Text>
        <Text style={styles.subtitle}>Field staff and conservation team</Text>
      </View>

      <StyledInput
        label="Staff email"
        placeholder="name@sfc.gov.my"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        error={errors.email}
      />
      <StyledInput
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        error={errors.password}
      />

      <Text style={styles.forgot}>Forgot password</Text>

      <PrimaryButton title="Log in" onPress={handleLogin} style={{ marginBottom: 14 }} />

      <Text style={styles.note}>
        Botanist accounts are created by an administrator. Contact your supervisor for access.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 20, justifyContent: 'center' },
  back: { position: 'absolute', top: 40, left: 20, flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { color: colors.textSecondary, fontSize: 13 },
  logoWrap: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  title: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  subtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  forgot: { textAlign: 'right', fontSize: 12, color: colors.accentText, marginBottom: 18 },
  note: { textAlign: 'center', fontSize: 11, color: colors.textMuted, lineHeight: 16 },
});
