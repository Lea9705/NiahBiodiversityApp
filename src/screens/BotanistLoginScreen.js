// Botanist login only - no self-signup.
// Styled to match the Niah Biodiversity botanical theme.

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import StyledInput from '../components/StyledInput';
import PrimaryButton from '../components/PrimaryButton';
import BackButton from '../components/BackButton';
import { useUser, nameFromEmail } from '../context/UserContext';

export default function BotanistLoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const { setUserName } = useUser();
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = '*Please enter your staff email';
    }

    if (!password) {
      newErrors.password = '*Please enter your password';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    // Keep the existing navigation behaviour.
    // Replace with the real backend authentication API when ready.
    setUserName(nameFromEmail(email));
    navigation.navigate('BotanistHome');
  };

  return (
    <ImageBackground
      source={require('../../assets/images/niah-background.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />

      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          {/* Shared BackButton used by the other screens */}
          <View style={styles.backContainer}>
            <BackButton onPress={() => navigation.goBack()} />
          </View>

          <KeyboardAvoidingView
            style={styles.keyboardArea}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.logo}>
                  <Ionicons
                    name="clipboard-outline"
                    size={32}
                    color="#55B8FF"
                  />
                </View>

                <Text style={styles.subtitle}>
                  Field Staff and Conservation Team
                </Text>

                <View style={styles.roleBadge}>
                  <Ionicons
                    name="leaf-outline"
                    size={15}
                    color="#8BD66D"
                  />
                  <Text style={styles.roleBadgeText}>
                    BOTANIST ACCESS
                  </Text>
                </View>
              </View>

              {/* Login form */}
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Welcome back</Text>

                <Text style={styles.formSubtitle}>
                  Sign in with your staff account to continue.
                </Text>

                <View style={styles.inputGroup}>
                  <StyledInput
                    label="Staff Email"
                    placeholder="name@sarawakforestry.com"
                    value={email}
                    onChangeText={(value) => {
                      setEmail(value);

                      if (errors.email) {
                        setErrors((previous) => ({
                          ...previous,
                          email: '',
                        }));
                      }
                    }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    error={errors.email}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <StyledInput
                    label="Password"
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={(value) => {
                      setPassword(value);

                      if (errors.password) {
                        setErrors((previous) => ({
                          ...previous,
                          password: '',
                        }));
                      }
                    }}
                    secureTextEntry={!showPassword}
                    error={errors.password}
                  />

                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() =>
                      setShowPassword((previous) => !previous)
                    }
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={
                        showPassword
                          ? 'eye-off-outline'
                          : 'eye-outline'
                      }
                      size={19}
                      color="#A9B8AB"
                    />

                    <Text style={styles.passwordToggleText}>
                      {showPassword
                        ? 'Hide password'
                        : 'Show password'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.forgotButton}
                  onPress={() => {
                    alert(
                      'Password reset is not available yet. Please contact your administrator.'
                    );
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgot}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>

                <PrimaryButton
                  title="Log in"
                  onPress={handleLogin}
                  style={styles.loginButton}
                />

                <View style={styles.securityNote}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={18}
                    color="#8BD66D"
                  />

                  <Text style={styles.note}>
                    Botanist accounts are created by an administrator.
                    Contact your supervisor for access.
                  </Text>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Ionicons
                  name="leaf-outline"
                  size={14}
                  color="#91B79A"
                />

                <Text style={styles.footerText}>
                  DISCOVER · DOCUMENT · CONSERVE
                </Text>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101711',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 12, 8, 0.76)',
  },

  safeArea: {
    flex: 1,
  },

  backContainer: {
    alignSelf: 'flex-start',
    marginLeft: 22,
    marginTop: 8,
    zIndex: 2,
  },

  keyboardArea: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 26,
  },

  header: {
    alignItems: 'center',
    marginBottom: 28,
  },

  logo: {
    width: 78,
    height: 78,
    borderRadius: 25,
    backgroundColor: '#10364A',
    borderWidth: 1,
    borderColor: 'rgba(85, 184, 255, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
  },

  title: {
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: '#F5F6F0',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: '#C5D0C7',
    textAlign: 'center',
    marginTop: 7,
  },

  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 19,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(92, 174, 103, 0.55)',
    backgroundColor: 'rgba(20, 61, 34, 0.8)',
    marginTop: 18,
  },

  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#A7D99A',
  },

  formCard: {
    backgroundColor: 'rgba(20, 31, 24, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(157, 190, 158, 0.38)',
    borderRadius: 24,
    padding: 20,
  },

  formTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#F5F6F0',
  },

  formSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: '#AEBBB0',
    marginTop: 6,
    marginBottom: 22,
  },

  inputGroup: {
    marginBottom: 13,
  },

  passwordToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 6,
    paddingTop: 10,
    paddingBottom: 3,
  },

  passwordToggleText: {
    fontSize: 12,
    color: '#A9B8AB',
  },

  forgotButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    marginBottom: 15,
  },

  forgot: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8BD66D',
  },

  loginButton: {
    marginBottom: 18,
  },

  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(157, 190, 158, 0.2)',
    paddingTop: 16,
  },

  note: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    color: '#B8C4B9',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    marginTop: 24,
  },

  footerText: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: '#A4B9A5',
  },
});