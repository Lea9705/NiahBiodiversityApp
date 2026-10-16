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
      <StatusBar barStyle="light-content" />

      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            {/* Logo and heading */}
            <View style={styles.logoWrap}>
              <View style={styles.logo}>
                <Ionicons
                  name="leaf-outline"
                  size={44}
                  color="#8BD66D"
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
                    color="#55B8FF"
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
                  color="#B6C1B8"
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
                    color="#8BD66D"
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
                  color="#B6C1B8"
                />
              </TouchableOpacity>
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
          </View>
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
    backgroundColor: 'rgba(5, 12, 8, 0.66)',
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
    backgroundColor: '#193719',
    borderWidth: 1,
    borderColor: 'rgba(139, 214, 109, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },

  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F5F6F0',
    textAlign: 'center',
    letterSpacing: -0.7,
  },

  subtitle: {
    fontSize: 15,
    color: '#D0D8D0',
    marginTop: 10,
    textAlign: 'center',
  },

  divider: {
    width: 46,
    height: 3,
    borderRadius: 3,
    backgroundColor: '#78B96C',
    marginTop: 23,
  },

  roles: {
    gap: 16,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    backgroundColor: 'rgba(22, 34, 27, 0.91)',
    borderWidth: 1,
    borderColor: 'rgba(157, 190, 158, 0.48)',
    borderRadius: 22,
    paddingVertical: 19,
    paddingHorizontal: 17,
    minHeight: 112,
  },

  botanistIcon: {
    width: 62,
    height: 62,
    borderRadius: 19,
    backgroundColor: '#10364A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  visitorIcon: {
    width: 62,
    height: 62,
    borderRadius: 19,
    backgroundColor: '#1D3A1D',
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
    color: '#F4F6F0',
  },

  cardSub: {
    fontSize: 12,
    lineHeight: 18,
    color: '#B8C1B9',
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
    color: '#A4B9A5',
  },
});
