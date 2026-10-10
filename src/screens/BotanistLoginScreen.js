// Botanist login only - no self-signup, matching the requirement that
// botanist accounts are created by an admin.
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
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
    <ImageBackground
      source={require('../../assets/images/niah-background.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.overlay}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={16} color={colors.textSecondary} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.logoWrap}>
        <View style={[styles.logo, { backgroundColor: colors.accentBg }]}>
          <Ionicons name="clipboard-outline" size={22} color={colors.accentText} />
        </View>
        <Text style={styles.title}>Botanist Login</Text>
        <Text style={styles.subtitle}>Field Staff and Conservation Team</Text>
      </View>

      <StyledInput
        label="Staff Email"
        placeholder="name@sarawakforestry.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        error={errors.email}
      />
      <StyledInput
        label="Password"
        placeholder="Enter Your Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        error={errors.password}
      />

    <TouchableOpacity
      onPress={() => {
        alert('Password reset is not available yet. Please contact your administrator.');
      }}
      activeOpacity={0.7}
    >
      <Text style={styles.forgot}>Forgot Password?</Text>
    </TouchableOpacity>

      <PrimaryButton title="Log in" onPress={handleLogin} style={{ marginBottom: 14 }} />

      <Text style={styles.note}>
        Botanist accounts are created by an administrator. Contact your supervisor for access.
      </Text>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, },
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.78)', padding: 20, justifyContent: 'center', },
  back: { position: 'absolute', top: 50, left: 20, flexDirection: 'row', alignItems: 'center', paddingVertical: 8, zIndex: 10, elevation: 10, },
  backText: { color: colors.textSecondary, fontSize: 13 },
  logoWrap: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  title: { fontSize: 20, fontWeight: '700', color: '#FFFFFF',  textAlign: 'center', textShadowColor: 'rgba(0, 0, 0, 0.8)',  textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3, },
  subtitle: { fontSize: 14,  color: '#FFFFFF', marginTop: 5,  textAlign: 'center',  textShadowColor: 'rgba(0, 0, 0, 0.8)',  textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3, },
  forgot: { textAlign: 'right', fontSize: 12, color: colors.accentText, marginBottom: 18 },
  note: { textAlign: 'center', fontSize: 12, color: '#FFFFFF', lineHeight: 18, marginTop: 2, textShadowColor: 'rgba(0, 0, 0, 0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3, },
});
