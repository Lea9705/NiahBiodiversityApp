import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';

export default function ActivitiesScreen({ navigation }) {
  const [filter, setFilter] = useState('All');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch('http://52.62.125.146/api/plants');

      if (!response.ok) {
        throw new Error(`Failed to fetch plants: ${response.status}`);
      }

      const data = await response.json();

      const formattedActivities = data.map((plant) => {
        const status = plant.plant_status || 'Pending';

        let detail = 'Submitted · Waiting for approval';

        if (status === 'Approved') {
          detail = 'Approved';
        } else if (status === 'Rejected') {
          detail = 'Rejected';
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
      : activities.filter((item) => item.status === filter);

  const getStatusIcon = (status) => {
    if (status === 'Approved') return 'checkmark-circle';
    if (status === 'Rejected') return 'close-circle';
    return 'time-outline';
  };

  const getStatusColor = (status) => {
    if (status === 'Approved') return colors.successText;
    if (status === 'Rejected') return colors.errorText;
    return colors.warningText;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.back}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={16}
            color={colors.textSecondary}
          />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title} pointerEvents="none"> My Activities </Text>
      </View>

      {/* Filter tabs */}
      <View style={styles.filters}>
        {['All', 'Pending', 'Approved', 'Rejected'].map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.filterButton,
              filter === item && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(item)}
          >
            <Text
              style={[
                styles.filterText,
                filter === item && styles.filterTextActive,
              ]}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Activity list */}
      <FlatList
        data={filteredActivities}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="document-outline"
              size={40}
              color={colors.textMuted}
            />
            <Text style={styles.emptyTitle}>No activities</Text>
            <Text style={styles.emptyText}>
              There are no activities in this category.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.activityCard}
            onPress={() => {
              console.log('OPENING PLANT:', item.id);

              navigation.navigate('PlantDetail', {
                plantId: item.id,
              });
            }}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name={getStatusIcon(item.status)}
                size={24}
                color={getStatusColor(item.status)}
              />
            </View>

            <View style={styles.activityContent}>
              <Text style={styles.plantName}>{item.name}</Text>

              <Text style={styles.activityDetail}>
                {item.detail}
              </Text>

              <Text style={styles.activityDate}>
                {item.date}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 16,
  },

  header: {
  height: 40,
  justifyContent: 'center',
  position: 'relative',
  marginBottom: 16,
  },

  back: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
  alignSelf: 'flex-start',
  },  

  backText: {
  fontSize: 13,
  color: colors.textSecondary,
  },

  title: {
  position: 'absolute',
  left: 0,
  right: 0,
  textAlign: 'center',
  fontSize: 18,
  fontWeight: '600',
  color: colors.textPrimary,
  },

  filters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },

  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },

  filterButtonActive: {
    backgroundColor: colors.accentBg,
  },

  filterText: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  filterTextActive: {
    color: colors.accentText,
    fontWeight: '600',
  },

  list: {
    paddingBottom: 20,
  },

  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },

  iconContainer: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  activityContent: {
    flex: 1,
  },

  plantName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },

  activityDetail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 3,
  },

  activityDate: {
    fontSize: 11,
    color: colors.textMuted,
  },

  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 12,
  },

  emptyText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 5,
  },
});