// src/screens/IotScreen.js

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import BotanistHeader from '../components/BotanistHeader';
import AppBottomNav from '../components/AppBottomNav';

import { useUser } from '../context/UserContext';
import { useTheme } from '../theme/ThemeContext';

import {
  fetchAlerts,
  fetchSensors,
  openIotSocket,
} from '../services/iotApi';

// --------------------------------------------------
// COLOURS
// --------------------------------------------------

const PALETTES = {
  dark: {
    bg: '#0B1712',
    green: '#B8E986',
    text: '#F2F6EE',
    muted: '#9BAE9F',
    surface: '#14251B',
    border: '#2A4031',
    danger: '#FF8A80',
    amber: '#FFD180',
    card2: '#1A3022',
  },

  light: {
    bg: '#F7F8F5',
    green: '#2A7A45',
    text: '#17261C',
    muted: '#5E7062',
    surface: '#FFFFFF',
    border: '#D3DFCF',
    danger: '#B3261E',
    amber: '#8A5700',
    card2: '#EEF5EA',
  },
};

// --------------------------------------------------
// HELPER FUNCTIONS
// --------------------------------------------------

const firstValue = (item, keys) => {
  for (const key of keys) {
    if (
      item?.[key] !== undefined &&
      item?.[key] !== null
    ) {
      return item[key];
    }
  }

  return null;
};

const asNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
};

const average = (items, keys) => {
  const values = items
    .map((item) =>
      asNumber(firstValue(item, keys))
    )
    .filter((value) => value !== null);

  if (!values.length) {
    return null;
  }

  return (
    values.reduce((total, value) => total + value, 0) /
    values.length
  );
};

const timeLabel = (value) => {
  if (!value) {
    return 'Time unavailable';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString();
};

// --------------------------------------------------
// METRIC CARD COMPONENT
// --------------------------------------------------

function MetricCard({
  icon,
  label,
  value,
  unit,
  styles,
  colors,
  detail,
}) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricIcon}>
        <Ionicons
          name={icon}
          size={19}
          color={colors.green}
        />
      </View>

      <Text style={styles.metricLabel}>
        {label}
      </Text>

      <Text style={styles.metricValue}>
        {value}

        <Text style={styles.metricUnit}>
          {unit || ''}
        </Text>
      </Text>

      {!!detail && (
        <Text style={styles.metricDetail}>
          {detail}
        </Text>
      )}
    </View>
  );
}

// --------------------------------------------------
// MAIN IOT SCREEN
// --------------------------------------------------

export default function IotScreen() {
  const navigation = useNavigation();

  const { isLoggedIn } = useUser();
  const { mode } = useTheme();

  const colors = PALETTES[mode] || PALETTES.dark;

  const styles = useMemo(
    () => createStyles(colors),
    [colors]
  );

  // Data
  const [sensors, setSensors] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Error and connection states
  const [error, setError] = useState('');
  const [connection, setConnection] = useState('connecting');

  const [lastUpdated, setLastUpdated] = useState(null);

  // ------------------------------------------------
  // LOGIN CHECK
  // ------------------------------------------------

  useEffect(() => {
    if (!isLoggedIn) {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'VisitorHome',
          },
        ],
      });
    }
  }, [isLoggedIn, navigation]);

  // ------------------------------------------------
  // FETCH SENSOR AND ALERT DATA
  // ------------------------------------------------

  const loadData = useCallback(
    async (showSpinner = false) => {
      if (showSpinner) {
        setRefreshing(true);
      }

      try {
        const results = await Promise.allSettled([
          fetchSensors(),
          fetchAlerts(),
        ]);

        const sensorResult = results[0];
        const alertResult = results[1];

        if (sensorResult.status === 'fulfilled') {
          setSensors(sensorResult.value);
        }

        if (alertResult.status === 'fulfilled') {
          setAlerts(alertResult.value);
        }

        const failures = results.filter(
          (result) => result.status === 'rejected'
        );

        if (failures.length === 2) {
          setError(
            failures[0].reason?.message ||
              'Could not load IoT data.'
          );
        } else if (failures.length > 0) {
          setError(
            'Some IoT information could not be loaded. Pull down to retry.'
          );
        } else {
          setError('');
        }

        if (failures.length < 2) {
          setLastUpdated(new Date());
        }
      } catch (e) {
        setError(
          e?.message || 'Could not load IoT data.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // ------------------------------------------------
  // AUTOMATIC REFRESH + WEBSOCKET
  // ------------------------------------------------

  useEffect(() => {
    if (!isLoggedIn) {
      return undefined;
    }

    loadData();

    // Refresh REST data every 30 seconds.
    const poll = setInterval(() => {
      loadData();
    }, 30000);

    // Refresh data when a WebSocket message arrives.
    const closeSocket = openIotSocket({
      onStatus: setConnection,

      onMessage: () => {
        loadData();
      },
    });

    return () => {
      clearInterval(poll);
      closeSocket?.();
    };
  }, [isLoggedIn, loadData]);

  // ------------------------------------------------
  // GROUP READINGS BY DEVICE
  // ------------------------------------------------

  const deviceRows = useMemo(() => {
    const groups = new Map();

    sensors.forEach((reading, index) => {
      const id = String(
        firstValue(reading, [
          'device_id',
          'deviceId',
          'device',
          'sensor_id',
        ]) ?? `Device ${index + 1}`
      );

      if (!groups.has(id)) {
        groups.set(id, []);
      }

      groups.get(id).push(reading);
    });

    return Array.from(groups.entries())
      .map(([id, readings]) => {
        const latest = readings.reduce(
          (currentLatest, item) => {
            const time = new Date(
              firstValue(item, [
                'recorded_at',
                'timestamp',
                'created_at',
                'time',
              ]) || 0
            ).getTime();

            const latestTime = new Date(
              firstValue(currentLatest || {}, [
                'recorded_at',
                'timestamp',
                'created_at',
                'time',
              ]) || 0
            ).getTime();

            return (
              !currentLatest || time > latestTime
            )
              ? item
              : currentLatest;
          },
          null
        );

        return {
          id,
          count: readings.length,
          latest,
        };
      })
      .sort((a, b) => a.id.localeCompare(b.id));
  }, [sensors]);

  // ------------------------------------------------
  // DASHBOARD METRICS
  // ------------------------------------------------

  const onlineCount = deviceRows.filter(
    ({ latest }) =>
      firstValue(latest, [
        'online',
        'is_online',
        'status',
      ]) === true ||
      String(
        firstValue(latest, ['status']) || ''
      ).toLowerCase() === 'online'
  ).length;

  const temperature = average(sensors, [
    'temperature',
    'temp',
    'temperature_c',
  ]);

  const humidity = average(sensors, [
    'humidity',
    'relative_humidity',
  ]);

  const activeAlerts = alerts.filter((alert) => {
    const status = String(
      firstValue(alert, ['status', 'state']) || ''
    ).toLowerCase();

    return ![
      'resolved',
      'closed',
      'dismissed',
      'inactive',
    ].includes(status);
  });

  if (!isLoggedIn) {
    return null;
  }

  // ------------------------------------------------
  // CONNECTION STATUS
  // ------------------------------------------------

  const connectionText = {
    connected: 'Live connection active',
    connecting: 'Connecting to live updates…',
    disconnected: 'Live connection disconnected',
    error: 'Live connection unavailable',
  }[connection] || 'Live connection status unknown';

  const connectionColor =
    connection === 'connected'
      ? colors.green
      : connection === 'error' ||
          connection === 'disconnected'
        ? colors.danger
        : colors.amber;

  // ------------------------------------------------
  // UI
  // ------------------------------------------------

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        barStyle={
          mode === 'dark'
            ? 'light-content'
            : 'dark-content'
        }
        backgroundColor={colors.bg}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(true)}
            tintColor={colors.green}
          />
        }
      >
        {/* HEADER */}

        <BotanistHeader />

        <View style={styles.headingRow}>
          <View>
            <Text style={styles.eyebrow}>
              MONITORING
            </Text>

            <Text style={styles.title}>
              IoT Dashboard
            </Text>

            <Text style={styles.subtitle}>
              Sensor readings and plant security
            </Text>
          </View>

          <View style={styles.headingIcon}>
            <Ionicons
              name="hardware-chip-outline"
              size={25}
              color={colors.green}
            />
          </View>
        </View>

        {/* LIVE CONNECTION STATUS */}

        <View style={styles.connectionCard}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: connectionColor,
              },
            ]}
          />

          <View style={{ flex: 1 }}>
            <Text style={styles.connectionTitle}>
              {connectionText}
            </Text>

            <Text style={styles.connectionSub}>
              Sensor and alert data refresh automatically
            </Text>
          </View>

          {connection === 'connecting' && (
            <ActivityIndicator
              color={colors.green}
              size="small"
            />
          )}
        </View>

        {/* ERROR MESSAGE */}

        {!!error && (
          <View style={styles.errorCard}>
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={colors.danger}
            />

            <Text style={styles.errorText}>
              {error}
            </Text>
          </View>
        )}

        {/* OVERVIEW METRICS */}

        <Text style={styles.sectionTitle}>
          Overview
        </Text>

        <View style={styles.metricsGrid}>
          <MetricCard
            icon="wifi"
            label="Online devices"
            value={
              loading && !sensors.length
                ? '—'
                : String(onlineCount)
            }
            detail={`${deviceRows.length} device${
              deviceRows.length === 1 ? '' : 's'
            } detected`}
            styles={styles}
            colors={colors}
          />

          <MetricCard
            icon="thermometer-outline"
            label="Average temperature"
            value={
              temperature === null
                ? '—'
                : temperature.toFixed(1)
            }
            unit={
              temperature === null ? '' : '°C'
            }
            styles={styles}
            colors={colors}
          />

          <MetricCard
            icon="water-outline"
            label="Average humidity"
            value={
              humidity === null
                ? '—'
                : humidity.toFixed(1)
            }
            unit={
              humidity === null ? '' : '%'
            }
            styles={styles}
            colors={colors}
          />

          <MetricCard
            icon="warning-outline"
            label="Security alerts"
            value={String(activeAlerts.length)}
            detail="Unresolved alerts"
            styles={styles}
            colors={colors}
          />
        </View>

        {/* DEVICE READINGS */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Device readings
          </Text>

          <Text style={styles.countPill}>
            {sensors.length} readings
          </Text>
        </View>

        {loading && !sensors.length ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator color={colors.green} />

            <Text style={styles.emptyText}>
              Loading sensor data…
            </Text>
          </View>
        ) : deviceRows.length ? (
          deviceRows.map((device) => {
            const temp = asNumber(
              firstValue(device.latest, [
                'temperature',
                'temp',
                'temperature_c',
              ])
            );

            const humid = asNumber(
              firstValue(device.latest, [
                'humidity',
                'relative_humidity',
              ])
            );

            const recorded = firstValue(
              device.latest,
              [
                'recorded_at',
                'timestamp',
                'created_at',
                'time',
              ]
            );

            const status = String(
              firstValue(device.latest, ['status']) || ''
            ).toLowerCase();

            const online =
              firstValue(device.latest, [
                'online',
                'is_online',
              ]) === true ||
              status === 'online';

            return (
              <View
                key={device.id}
                style={styles.deviceCard}
              >
                <View style={styles.deviceTop}>
                  <View style={styles.deviceIcon}>
                    <Ionicons
                      name="hardware-chip-outline"
                      size={20}
                      color={colors.green}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.deviceName}>
                      {device.id}
                    </Text>

                    <Text style={styles.deviceMeta}>
                      {device.count} reading
                      {device.count === 1 ? '' : 's'}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.deviceStatus,
                      {
                        backgroundColor: online
                          ? colors.card2
                          : colors.surface,
                        borderColor: online
                          ? colors.green
                          : colors.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.miniDot,
                        {
                          backgroundColor: online
                            ? colors.green
                            : colors.muted,
                        },
                      ]}
                    />

                    <Text
                      style={[
                        styles.deviceStatusText,
                        {
                          color: online
                            ? colors.green
                            : colors.muted,
                        },
                      ]}
                    >
                      {online
                        ? 'Online'
                        : status || 'Status unknown'}
                    </Text>
                  </View>
                </View>

                <View style={styles.readingRow}>
                  <View style={styles.readingValue}>
                    <Ionicons
                      name="thermometer-outline"
                      size={16}
                      color={colors.muted}
                    />

                    <Text style={styles.readingText}>
                      {temp === null
                        ? '—'
                        : `${temp.toFixed(1)}°C`}
                    </Text>
                  </View>

                  <View style={styles.readingValue}>
                    <Ionicons
                      name="water-outline"
                      size={16}
                      color={colors.muted}
                    />

                    <Text style={styles.readingText}>
                      {humid === null
                        ? '—'
                        : `${humid.toFixed(1)}%`}
                    </Text>
                  </View>
                </View>

                <Text style={styles.timestamp}>
                  Latest: {timeLabel(recorded)}
                </Text>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons
              name="pulse-outline"
              size={25}
              color={colors.muted}
            />

            <Text style={styles.emptyText}>
              No sensor readings available yet.
            </Text>
          </View>
        )}

        {/* PLANT SECURITY ALERTS */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Plant security alerts
          </Text>

          <Text style={styles.countPill}>
            {activeAlerts.length} active
          </Text>
        </View>

        {loading && !alerts.length ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator color={colors.green} />

            <Text style={styles.emptyText}>
              Loading alerts…
            </Text>
          </View>
        ) : activeAlerts.length ? (
          activeAlerts.slice(0, 10).map(
            (alert, index) => {
              const title = firstValue(alert, [
                'title',
                'alert_type',
                'type',
                'event_type',
                'name',
              ]) || 'Plant security alert';

              const message = firstValue(alert, [
                'message',
                'description',
                'details',
                'reason',
              ]);

              const recorded = firstValue(alert, [
                'created_at',
                'recorded_at',
                'timestamp',
                'time',
              ]);

              const severity = String(
                firstValue(alert, [
                  'severity',
                  'level',
                  'priority',
                ]) || 'notice'
              ).toLowerCase();

              const severe = [
                'critical',
                'high',
                'danger',
                'urgent',
              ].includes(severity);

              return (
                <View
                  key={String(
                    firstValue(alert, [
                      'id',
                      'alert_id',
                    ]) || `${title}-${index}`
                  )}
                  style={styles.alertCard}
                >
                  <View
                    style={[
                      styles.alertIcon,
                      {
                        backgroundColor: severe
                          ? `${colors.danger}18`
                          : colors.card2,
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        severe
                          ? 'alert-circle'
                          : 'notifications-outline'
                      }
                      size={20}
                      color={
                        severe
                          ? colors.danger
                          : colors.green
                      }
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.alertTitle}>
                      {String(title).replace(/_/g, ' ')}
                    </Text>

                    {!!message && (
                      <Text style={styles.alertMessage}>
                        {String(message)}
                      </Text>
                    )}

                    <Text style={styles.timestamp}>
                      {timeLabel(recorded)}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.severity,
                      {
                        color: severe
                          ? colors.danger
                          : colors.amber,
                      },
                    ]}
                  >
                    {severity}
                  </Text>
                </View>
              );
            }
          )
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons
              name="shield-checkmark-outline"
              size={25}
              color={colors.green}
            />

            <Text style={styles.emptyText}>
              No active security alerts.
            </Text>
          </View>
        )}

        {/* LAST UPDATED */}

        <Text style={styles.footerText}>
          {lastUpdated
            ? `Last updated ${lastUpdated.toLocaleTimeString()}`
            : 'Pull down to refresh data'}
        </Text>
      </ScrollView>

      {/* BOTTOM NAVIGATION */}

      <AppBottomNav active="iot" />
    </SafeAreaView>
  );
}

// --------------------------------------------------
// STYLES
// --------------------------------------------------

const createStyles = (C) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: C.bg,
    },

    content: {
      flexGrow: 1,
      paddingHorizontal: 18,
      paddingTop: 13,
      paddingBottom: 28,
    },

    headingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 22,
      marginBottom: 18,
    },

    eyebrow: {
      color: C.green,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.6,
      marginBottom: 5,
    },

    title: {
      color: C.text,
      fontSize: 25,
      fontWeight: '800',
    },

    subtitle: {
      color: C.muted,
      fontSize: 12,
      marginTop: 5,
    },

    headingIcon: {
      width: 52,
      height: 52,
      borderRadius: 17,
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.border,
      alignItems: 'center',
      justifyContent: 'center',
    },

    connectionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: C.border,
      backgroundColor: C.surface,
      marginBottom: 22,
      gap: 10,
    },

    statusDot: {
      width: 9,
      height: 9,
      borderRadius: 5,
    },

    connectionTitle: {
      color: C.text,
      fontSize: 12,
      fontWeight: '700',
    },

    connectionSub: {
      color: C.muted,
      fontSize: 10,
      marginTop: 4,
    },

    errorCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
      borderWidth: 1,
      borderColor: C.danger,
      backgroundColor: C.surface,
      borderRadius: 12,
      padding: 12,
      marginBottom: 18,
    },

    errorText: {
      flex: 1,
      color: C.danger,
      fontSize: 11,
      lineHeight: 16,
    },

    sectionTitle: {
      color: C.text,
      fontSize: 16,
      fontWeight: '800',
      marginBottom: 12,
    },

    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 24,
    },

    metricCard: {
      width: '48.2%',
      minHeight: 132,
      backgroundColor: C.surface,
      borderColor: C.border,
      borderWidth: 1,
      borderRadius: 17,
      padding: 13,
      marginBottom: 10,
    },

    metricIcon: {
      width: 34,
      height: 34,
      borderRadius: 11,
      backgroundColor: C.card2,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },

    metricLabel: {
      color: C.muted,
      fontSize: 11,
      fontWeight: '600',
      lineHeight: 15,
    },

    metricValue: {
      color: C.text,
      fontSize: 24,
      fontWeight: '800',
      marginTop: 5,
    },

    metricUnit: {
      color: C.muted,
      fontSize: 12,
      fontWeight: '700',
    },

    metricDetail: {
      color: C.muted,
      fontSize: 10,
      marginTop: 4,
    },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 3,
      marginBottom: 12,
    },

    countPill: {
      color: C.green,
      backgroundColor: C.card2,
      borderRadius: 20,
      paddingHorizontal: 9,
      paddingVertical: 5,
      overflow: 'hidden',
      fontSize: 10,
      fontWeight: '800',
    },

    deviceCard: {
      backgroundColor: C.surface,
      borderColor: C.border,
      borderWidth: 1,
      borderRadius: 16,
      padding: 14,
      marginBottom: 10,
    },

    deviceTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    deviceIcon: {
      width: 40,
      height: 40,
      borderRadius: 13,
      backgroundColor: C.card2,
      alignItems: 'center',
      justifyContent: 'center',
    },

    deviceName: {
      color: C.text,
      fontSize: 13,
      fontWeight: '800',
    },

    deviceMeta: {
      color: C.muted,
      fontSize: 10,
      marginTop: 4,
    },

    deviceStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      borderRadius: 20,
      borderWidth: 1,
      paddingHorizontal: 8,
      paddingVertical: 5,
    },

    miniDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },

    deviceStatusText: {
      fontSize: 9,
      fontWeight: '700',
      textTransform: 'capitalize',
    },

    readingRow: {
      flexDirection: 'row',
      gap: 18,
      marginTop: 15,
      marginBottom: 10,
    },

    readingValue: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

    readingText: {
      color: C.text,
      fontSize: 12,
      fontWeight: '700',
    },

    timestamp: {
      color: C.muted,
      fontSize: 10,
      marginTop: 8,
      lineHeight: 14,
    },

    alertCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      backgroundColor: C.surface,
      borderColor: C.border,
      borderWidth: 1,
      borderRadius: 15,
      padding: 13,
      marginBottom: 9,
    },

    alertIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },

    alertTitle: {
      color: C.text,
      fontSize: 12,
      fontWeight: '800',
      lineHeight: 17,
      textTransform: 'capitalize',
    },

    alertMessage: {
      color: C.muted,
      fontSize: 11,
      marginTop: 4,
      lineHeight: 16,
    },

    severity: {
      fontSize: 9,
      fontWeight: '800',
      textTransform: 'uppercase',
      marginTop: 3,
    },

    emptyCard: {
      minHeight: 90,
      backgroundColor: C.surface,
      borderColor: C.border,
      borderWidth: 1,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      marginBottom: 18,
      gap: 9,
    },

    emptyText: {
      color: C.muted,
      fontSize: 11,
      textAlign: 'center',
    },

    footerText: {
      color: C.muted,
      fontSize: 10,
      textAlign: 'center',
      marginTop: 14,
      marginBottom: 8,
    },
  });