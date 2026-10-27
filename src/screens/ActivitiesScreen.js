
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';

import BackButton from '../components/BackButton';

const COLORS = {
  bg: '#0B1712',
  surface: '#14251B',
  surfaceLight: '#1C3023',
  green: '#B8E986',
  text: '#F2F6EE',
  muted: '#9BAE9F',
  border: '#2A4031',
  success: '#B8E986',
  successBg: '#203B2A',
  warning: '#F2C879',
  warningBg: '#3B3020',
  error: '#F08C86',
  errorBg: '#3B2322',
};

const FILTERS = ['All', 'Pending', 'Approved', 'Rejected'];

export default function ActivitiesScreen({ navigation }) {
  const [filter, setFilter] = useState('All');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(false);

      const token = await SecureStore.getItemAsync('authToken');
      const userJson = await SecureStore.getItemAsync('authUser');

      if (!token) {
        throw new Error(
          'Your login session was not found. Please log in again.'
        );
      }

      if (!userJson) {
        throw new Error(
          'Your user session was not found. Please log in again.'
        );
      }

      let currentUser;
      try {
        currentUser = JSON.parse(userJson);
      } catch {
        throw new Error('Your saved user details are invalid. Please log in again.');
      }

      if (currentUser?.id == null) {
        throw new Error('Your login session has no user ID. Please log in again.');
      }

      const response = await fetch(
        'http://52.62.125.146/api/plants',
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch plants: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Unexpected plant records response');
      }

      // The API may expose the owner ID under different naming conventions.
      // Only include records whose owner matches the logged-in botanist.
      const getOwnerId = (plant) => {
        const owner =
          plant.submitted_by ??
          plant.submittedBy ??
          plant.submitted_by_id ??
          plant.submittedById ??
          plant.user_id ??
          plant.userId ??
          plant.botanist_id ??
          plant.botanistId ??
          plant.created_by ??
          plant.createdBy ??
          plant.user?.id ??
          plant.botanist?.id;
        if (owner && typeof owner === 'object') {
          return owner.id ?? owner.user_id ?? owner.userId ?? null;
        }
        return owner ?? null;
      };

      const currentUserId = String(currentUser.id);
      const myPlants = data.filter((plant) => {
        const ownerId = getOwnerId(plant);
        return ownerId != null && String(ownerId) === currentUserId;
      });

      const formattedActivities = myPlants.map((plant) => {
        const status = plant.plant_status || 'Pending';

        let detail = 'Submitted · Waiting for approval';

        if (status === 'Approved') {
          detail = 'Your submission has been approved';
        } else if (status === 'Rejected') {
          detail = 'Your submission was rejected';
        }

        return {
          id: String(plant.id),
          name: plant.scientific_name || 'Unknown plant',
          status,
          date: plant.created_at
            ? new Date(plant.created_at).toLocaleDateString()
            : '',
          detail,
        };
      });

      setActivities(formattedActivities);
    } catch (error) {
      console.error('Failed to load activities:', error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchActivities();
    }, [fetchActivities])
  );

  const filteredActivities =
    filter === 'All'
      ? activities
      : activities.filter(
          (item) =>
            item.status.trim().toLowerCase() === filter.toLowerCase()
        );

  const getStatusIcon = (status) => {
    if (status === 'Approved') return 'checkmark-circle';
    if (status === 'Rejected') return 'close-circle';
    return 'time-outline';
  };

  const getStatusColor = (status) => {
    if (status === 'Approved') return COLORS.success;
    if (status === 'Rejected') return COLORS.error;
    return COLORS.warning;
  };

  const getStatusBackground = (status) => {
    if (status === 'Approved') return COLORS.successBg;
    if (status === 'Rejected') return COLORS.errorBg;
    return COLORS.warningBg;
  };

  const getStatusLabel = (status) => {
    if (status === 'Approved') return 'Approved';
    if (status === 'Rejected') return 'Rejected';
    return 'Pending';
  };

  const renderHeader = () => (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />

        <View style={styles.headerCopy}>
          <Text style={styles.brand}>NIAH BIODIVERSITY</Text>
          <Text style={styles.title}>My Activities</Text>
          <Text style={styles.subtitle}>
            Track your plant submissions
          </Text>
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchActivities}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Refresh activities"
        >
          <Ionicons
            name="refresh-outline"
            size={20}
            color={COLORS.green}
          />
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryIcon}>
          <Ionicons
            name="clipboard-outline"
            size={25}
            color={COLORS.green}
          />
        </View>

        <View style={styles.summaryCopy}>
          <Text style={styles.summaryLabel}>Total submissions</Text>
          <Text style={styles.summaryValue}>{activities.length}</Text>
          <Text style={styles.summaryHint}>
            Records submitted to the collection
          </Text>
        </View>

        <View style={styles.summaryDecoration}>
          <Ionicons
            name="leaf-outline"
            size={43}
            color={COLORS.green}
          />
        </View>
      </View>

      {/* Filter section */}
      <View style={styles.filterHeading}>
        <Text style={styles.sectionTitle}>Submission history</Text>
        <Text style={styles.sectionSubtitle}>
          {filteredActivities.length} record
          {filteredActivities.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.filters}>
        {FILTERS.map((item) => {
          const active = filter === item;

          return (
            <TouchableOpacity
              key={item}
              style={[
                styles.filterButton,
                active && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(item)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.filterText,
                  active && styles.filterTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={COLORS.green} />
          <Text style={styles.emptyTitle}>Loading activities</Text>
          <Text style={styles.emptyText}>
            Fetching your plant submissions...
          </Text>
        </View>
      );
    }

    if (loadError) {
      return (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="cloud-offline-outline"
              size={29}
              color={COLORS.warning}
            />
          </View>

          <Text style={styles.emptyTitle}>
            Could not load activities
          </Text>

          <Text style={styles.emptyText}>
            Check your connection and try again.
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchActivities}
            activeOpacity={0.8}
          >
            <Ionicons
              name="refresh-outline"
              size={17}
              color={COLORS.bg}
            />
            <Text style={styles.retryButtonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name="document-text-outline"
            size={29}
            color={COLORS.green}
          />
        </View>

        <Text style={styles.emptyTitle}>
          {filter === 'All'
            ? 'No activities yet'
            : `No ${filter.toLowerCase()} submissions`}
        </Text>

        <Text style={styles.emptyText}>
          {filter === 'All'
            ? 'Your plant submissions will appear here.'
            : `There are currently no ${filter.toLowerCase()} submissions in this category.`}
        </Text>
      </View>
    );
  };

  const renderActivity = ({ item }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity
        style={styles.activityCard}
        onPress={() => {
          navigation.navigate('PlantDetail', {
            plantId: item.id,
          });
        }}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: getStatusBackground(item.status) },
          ]}
        >
          <Ionicons
            name={getStatusIcon(item.status)}
            size={23}
            color={statusColor}
          />
        </View>

        <View style={styles.activityContent}>
          <Text style={styles.plantName} numberOfLines={2}>
            {item.name}
          </Text>

          <Text style={styles.activityDetail}>
            {item.detail}
          </Text>

          {!!item.date && (
            <View style={styles.dateRow}>
              <Ionicons
                name="calendar-outline"
                size={13}
                color={COLORS.muted}
              />
              <Text style={styles.activityDate}>{item.date}</Text>
            </View>
          )}
        </View>

        <View style={styles.activityRight}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusBackground(item.status) },
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                { color: statusColor },
              ]}
            >
              {getStatusLabel(item.status)}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={19}
            color={COLORS.muted}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.bg}
      />

      <FlatList
        data={loading || loadError ? [] : filteredActivities}
        keyExtractor={(item) => item.id}
        renderItem={renderActivity}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  listContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 35,
    flexGrow: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 25,
  },

  headerCopy: {
    flex: 1,
  },

  brand: {
    color: COLORS.green,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 5,
  },

  title: {
    color: COLORS.text,
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 5,
  },

  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    marginBottom: 27,
    overflow: 'hidden',
  },

  summaryIcon: {
    width: 49,
    height: 49,
    borderRadius: 15,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryCopy: {
    flex: 1,
  },

  summaryLabel: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '600',
  },

  summaryValue: {
    color: COLORS.text,
    fontSize: 25,
    fontWeight: '900',
    marginTop: 2,
  },

  summaryHint: {
    color: COLORS.muted,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 3,
  },

  summaryDecoration: {
    opacity: 0.22,
    marginRight: 2,
  },

  filterHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },

  sectionSubtitle: {
    color: COLORS.muted,
    fontSize: 10,
  },

  filters: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 17,
  },

  filterButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 11,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  filterButtonActive: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },

  filterText: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '700',
  },

  filterTextActive: {
    color: COLORS.bg,
    fontWeight: '900',
  },

  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 13,
    borderRadius: 17,
    marginBottom: 11,
  },

  iconContainer: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activityContent: {
    flex: 1,
    minWidth: 0,
  },

  plantName: {
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
    marginBottom: 5,
  },

  activityDetail: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 7,
  },

  activityDate: {
    color: COLORS.muted,
    fontSize: 10,
  },

  activityRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 10,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },

  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 45,
    paddingBottom: 35,
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },

  emptyText: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 7,
  },

  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: COLORS.green,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 17,
  },

  retryButtonText: {
    color: COLORS.bg,
    fontSize: 11,
    fontWeight: '900',
  },
});
