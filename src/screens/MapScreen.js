// Map: where the approved, common plants were recorded.
// Visitors and staff share this page. Threatened plants never get a pin.
import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  StatusBar,
  Keyboard,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import BotanistHeader from '../components/BotanistHeader';
import VisitorHeader from '../components/VisitorHeader';
import AppBottomNav from '../components/AppBottomNav';
import PlantLeafletMap from '../components/PlantLeafletMap';
import { useRecords } from '../context/RecordsContext';
import { useUser } from '../context/UserContext';
import { useTheme } from '../theme/ThemeContext';
import { buildMapPins } from '../utils/mapPins';

const PALETTES = {
  dark: {
    background: '#0B1712',
    card: '#14251B',
    cardBorder: '#2A4031',
    green: '#B8E986',
    greenDark: '#1C3023',
    text: '#F2F6EB',
    secondary: '#9BAE9F',
    muted: '#71806D',
    mapBackground: '#14251B',
  },
  light: {
    background: '#F7F8F5',
    card: '#FFFFFF',
    cardBorder: '#D3DFCF',
    green: '#2A7A45',
    greenDark: '#E3F1E6',
    text: '#17261C',
    secondary: '#4D6052',
    muted: '#5F7164',
    mapBackground: '#E6EEE4',
  },
};

export default function MapScreen({ navigation }) {
  const { styles, FOREST, mode } = useStyles();

  const [search, setSearch] = useState('');
  const { records, loading, syncApprovedRecords } = useRecords();

  // Someone who has not logged in is a visitor.
  const { isLoggedIn } = useUser();
  const isVisitor = !isLoggedIn;

  // Always call the newest version of the sync function.
  const syncRef = useRef(syncApprovedRecords);
  syncRef.current = syncApprovedRecords;

  // Check the cloud every time the map opens, like Explore does.
  useFocusEffect(
    useCallback(() => {
      syncRef.current().catch((error) => {
        console.log('Map refresh failed:', error.message);
      });
    }, [])
  );

  // The pins. Approved plants with a location, minus threatened plants.
  const pins = useMemo(
    () => buildMapPins(records, { search }),
    [records, search]
  );

  const openPin = (id) => {
    const record = records.find((item) => String(item.id) === String(id));

    if (!record) return;

    navigation.navigate('PlantRecordSummary', {
      record,
      readOnly: true,
    });
  };

  const emptyText = search.trim()
    ? 'No plants match your search.'
    : isVisitor
    ? 'Plants appear on the map after they are approved and downloaded to this phone.'
    : 'No approved plants with a location yet.';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={FOREST.background}
      />

      <View style={styles.top}>
        {isVisitor ? <VisitorHeader /> : <BotanistHeader />}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Plant map</Text>
            <Text style={styles.sectionSubtitle}>
              Where common plants were recorded
            </Text>
          </View>

          {!loading && (
            <View style={styles.countBadge}>
              <Text style={styles.countNumber}>{pins.length}</Text>
              <Text style={styles.countLabel}>
                {pins.length === 1 ? 'PIN' : 'PINS'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search plants, names or family..."
              placeholderTextColor={FOREST.muted}
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={Keyboard.dismiss}
            />

            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')} hitSlop={10}>
                <Ionicons
                  name="close-circle"
                  size={19}
                  color={FOREST.secondary}
                />
              </Pressable>
            )}
          </View>

          <TouchableOpacity
            style={styles.searchButton}
            onPress={Keyboard.dismiss}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Search"
          >
            <Ionicons name="search" size={22} color={FOREST.background} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mapWrap}>
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={FOREST.green} />
          </View>
        ) : (
          <PlantLeafletMap
            pins={pins}
            onOpenPin={openPin}
            backgroundColor={FOREST.mapBackground}
            textColor={FOREST.text}
          />
        )}

        {!loading && pins.length === 0 && (
          <View style={styles.emptyOverlay} pointerEvents="none">
            <Ionicons name="location-outline" size={20} color={FOREST.green} />
            <Text style={styles.emptyText}>{emptyText}</Text>
          </View>
        )}
      </View>

      <Text style={styles.note}>
        Pins for threatened plants are hidden to protect them.
      </Text>

      <AppBottomNav active="map" />
    </SafeAreaView>
  );
}

// Styles are rebuilt whenever the light/dark mode changes.
function useStyles() {
  const { mode } = useTheme();
  const FOREST = PALETTES[mode];
  const styles = useMemo(() => createStyles(FOREST), [mode]);

  return { FOREST, styles, mode };
}

const createStyles = (FOREST) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: FOREST.background,
    },

    top: {
      paddingHorizontal: 18,
      paddingTop: 13,
    },

    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },

    sectionTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: FOREST.text,
      letterSpacing: -0.4,
    },

    sectionSubtitle: {
      fontSize: 12,
      color: FOREST.secondary,
      marginTop: 5,
    },

    countBadge: {
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 54,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 13,
      backgroundColor: FOREST.greenDark,
    },

    countNumber: {
      fontSize: 17,
      fontWeight: '800',
      color: FOREST.green,
    },

    countLabel: {
      marginTop: 2,
      fontSize: 7,
      letterSpacing: 1,
      fontWeight: '800',
      color: FOREST.secondary,
    },

    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12,
    },

    searchBox: {
      flex: 1,
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 15,
      borderRadius: 15,
      backgroundColor: FOREST.card,
      borderWidth: 1,
      borderColor: FOREST.cardBorder,
    },

    searchInput: {
      flex: 1,
      color: FOREST.text,
      fontSize: 12,
      paddingVertical: 13,
    },

    searchButton: {
      width: 52,
      height: 52,
      borderRadius: 15,
      backgroundColor: FOREST.green,
      alignItems: 'center',
      justifyContent: 'center',
    },

    mapWrap: {
      flex: 1,
      minHeight: 240,
      marginHorizontal: 18,
      // Clipping a WebView with rounded corners can make it draw nothing on
      // some Android phones, so only iPhone gets the rounded, clipped corners.
      borderRadius: Platform.OS === 'ios' ? 18 : 6,
      overflow: Platform.OS === 'ios' ? 'hidden' : 'visible',
      borderWidth: 1,
      borderColor: FOREST.cardBorder,
      backgroundColor: FOREST.mapBackground,
    },

    loading: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },

    emptyOverlay: {
      position: 'absolute',
      top: 12,
      left: 12,
      right: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: FOREST.card,
      borderWidth: 1,
      borderColor: FOREST.cardBorder,
    },

    emptyText: {
      flex: 1,
      fontSize: 12,
      lineHeight: 17,
      color: FOREST.text,
    },

    note: {
      marginHorizontal: 18,
      marginTop: 8,
      marginBottom: 6,
      fontSize: 11,
      textAlign: 'center',
      color: FOREST.muted,
    },
  });
