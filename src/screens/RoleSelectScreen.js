import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function RoleSelectScreen({ navigation }) {
  return (
    <ImageBackground
      source={require('../../assets/images/niah-background.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" />

      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            {/* Logo and heading */}
            <View style={styles.logoWrap}>
              <View style={styles.logo}>
                <Ionicons
                  name="leaf-outline"
                  size={44}
                  color="#2A7A45"
                />
              </View>

              <Text style={styles.title}>
                Niah Biodiversity
              </Text>

              <Text style={styles.subtitle}>
                Who's using the app today?
              </Text>

              <View style={styles.divider} />
            </View>

            {/* Role selection */}
            <View style={styles.roles}>
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  navigation.navigate('BotanistLogin')
                }
                activeOpacity={0.78}
              >
                <View style={styles.botanistIcon}>
                  <Ionicons
                    name="clipboard-outline"
                    size={27}
                    color="#1F6FB0"
                  />
                </View>

                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>
                    I'm a Botanist
                  </Text>

                  <Text style={styles.cardSub}>
                    Field Data Collection and Records
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color="#6B7D6F"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  navigation.navigate('VisitorHome')
                }
                activeOpacity={0.78}
              >
                <View style={styles.visitorIcon}>
                  <Ionicons
                    name="location-outline"
                    size={27}
                    color="#2A7A45"
                  />
                </View>

                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>
                    I'm a Visitor
                  </Text>

                  <Text style={styles.cardSub}>
                    Explore Plants on The Trail
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color="#6B7D6F"
                />
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Ionicons
                name="leaf-outline"
                size={14}
                color="#5E7062"
              />
              <Text style={styles.footerText}>
                DISCOVER · DOCUMENT · CONSERVE
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF0E8',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(247, 248, 245, 0.84)',
  },

  safeArea: {
    flex: 1,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 24,
  },

  logoWrap: {
    alignItems: 'center',
    marginBottom: 38,
  },

  logo: {
    width: 92,
    height: 92,
    borderRadius: 28,
    backgroundColor: '#E3F1E6',
    borderWidth: 1,
    borderColor: 'rgba(42, 122, 69, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },

  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#17261C',
    textAlign: 'center',
    letterSpacing: -0.7,
  },

  subtitle: {
    fontSize: 15,
    color: '#4D6052',
    marginTop: 10,
    textAlign: 'center',
  },

  divider: {
    width: 46,
    height: 3,
    borderRadius: 3,
    backgroundColor: '#2A7A45',
    marginTop: 23,
  },

  roles: {
    gap: 16,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 1,
    borderColor: '#CFDACB',
    borderRadius: 22,
    paddingVertical: 19,
    paddingHorizontal: 17,
    minHeight: 112,
  },

  botanistIcon: {
    width: 62,
    height: 62,
    borderRadius: 19,
    backgroundColor: '#E1EEF9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  visitorIcon: {
    width: 62,
    height: 62,
    borderRadius: 19,
    backgroundColor: '#E3F1E6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardContent: {
    flex: 1,
    gap: 5,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#17261C',
  },

  cardSub: {
    fontSize: 12,
    lineHeight: 18,
    color: '#5E7062',
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 34,
  },

  footerText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.4,
    color: '#5E7062',
  },
});
