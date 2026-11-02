// Botanist login. The email and password are checked by the server.
// A wrong email or password shows an error message.
// Styled to match the Niah Biodiversity botanical theme.

import React, { useState, useMemo } from 'react';
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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import StyledInput from '../components/StyledInput';
import PrimaryButton from '../components/PrimaryButton';
import BackButton from '../components/BackButton';
import { useUser } from '../context/UserContext';
import { useTheme } from '../theme/ThemeContext';


const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function BotanistLoginScreen({ navigation }) {
  const { styles, mode, pick } = useStyles();

  const { login } = useUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (loading) return;

    const trimmedEmail = email.trim();
    const newErrors = {};

    if (!trimmedEmail) {
      newErrors.email = '*Please enter your staff email';
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      newErrors.email = '*Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = '*Please enter your password';
    }

    setErrors(newErrors);
    setLoginError('');

    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      await login(trimmedEmail, password);

      navigation.reset({
        index: 0,
        routes: [{ name: 'BotanistHome' }],
      });
    } catch (error) {
      setLoading(false);

      if (error.code === 'INVALID_CREDENTIALS') {
        // One popup, one sentence, for every kind of wrong login.
        Alert.alert('Login failed', error.message);
        return;
      }

      setLoginError(error.message || 'Unable to log in. Please try again.');
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/niah-background.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />

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
                    color={pick('#55B8FF', '#1F6FB0')}
                  />
                </View>

                <Text style={styles.subtitle}>
                  Field Staff and Conservation Team
                </Text>

                <View style={styles.roleBadge}>
                  <Ionicons
                    name="leaf-outline"
                    size={15}
                    color={pick('#8BD66D', '#2A7A45')}
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

                      if (loginError) setLoginError('');

                      if (errors.email) {
                        setErrors((previous) => ({
                          ...previous,
                          email: '',
                        }));
                      }
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    returnKeyType="next"
                    editable={!loading}
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

                      if (loginError) setLoginError('');

                      if (errors.password) {
                        setErrors((previous) => ({
                          ...previous,
                          password: '',
                        }));
                      }
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="go"
                    onSubmitEditing={handleLogin}
                    editable={!loading}
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
                      color={pick('#A9B8AB', '#5E7062')}
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

                {/* Error from the server (wrong email or password, etc.) */}
                {loginError ? (
                  <View style={styles.errorBanner}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={18}
                      color={pick('#F08C86', '#B3392F')}
                    />
                    <Text style={styles.errorBannerText}>{loginError}</Text>
                  </View>
                ) : null}

                <PrimaryButton
                  title={loading ? 'Logging in...' : 'Log in'}
                  onPress={handleLogin}
                  style={[
                    styles.loginButton,
                    loading && styles.loginButtonLoading,
                  ]}
                />

                <View style={styles.securityNote}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={18}
                    color={pick('#8BD66D', '#2A7A45')}
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
                  color={pick('#91B79A', '#5E7062')}
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

// Styles are rebuilt whenever the light/dark mode changes.
function useStyles() {
  const { mode, pick, colors } = useTheme();
  const styles = useMemo(
    () => createStyles(null, pick, colors),
    [mode]
  );

  return { colors, styles, mode, pick };
}

const createStyles = (_palette, pick, colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: pick('#101711', '#EAF0E8'),
  },

  overlay: {
    flex: 1,
    backgroundColor: pick('rgba(5, 12, 8, 0.76)', 'rgba(247, 248, 245, 0.88)'),
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
    backgroundColor: pick('#10364A', '#E1EEF9'),
    borderWidth: 1,
    borderColor: pick('rgba(85, 184, 255, 0.45)', 'rgba(31, 111, 176, 0.35)'),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: pick('#C5D0C7', '#4D6052'),
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
    borderColor: pick('rgba(92, 174, 103, 0.55)', 'rgba(42, 122, 69, 0.45)'),
    backgroundColor: pick('rgba(20, 61, 34, 0.8)', '#E3F1E6'),
    marginTop: 18,
  },

  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: pick('#A7D99A', '#245F39'),
  },

  formCard: {
    backgroundColor: pick('rgba(20, 31, 24, 0.94)', 'rgba(255, 255, 255, 0.96)'),
    borderWidth: 1,
    borderColor: pick('rgba(157, 190, 158, 0.38)', '#D3E0D0'),
    borderRadius: 24,
    padding: 20,
  },

  formTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: pick('#F5F6F0', '#17261C'),
  },

  formSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: pick('#AEBBB0', '#5E7062'),
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
    color: pick('#A9B8AB', '#5E7062'),
  },

  forgotButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    marginBottom: 15,
  },

  forgot: {
    fontSize: 13,
    fontWeight: '600',
    color: pick('#8BD66D', '#2A7A45'),
  },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    padding: 12,
    marginBottom: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: pick('#713A38', '#F0BDB8'),
    backgroundColor: pick('#251B19', '#FCE9E7'),
  },

  errorBannerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: pick('#F5B8B3', '#8E2B23'),
  },

  loginButton: {
    marginBottom: 18,
  },

  loginButtonLoading: {
    opacity: 0.6,
  },

  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: pick('rgba(157, 190, 158, 0.2)', '#DDE6DA'),
    paddingTop: 16,
  },

  note: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    color: pick('#B8C4B9', '#5E7062'),
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
    color: pick('#A4B9A5', '#5E7062'),
  },
});