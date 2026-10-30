// My Activities, shown directly on the Home screen: the botanist's own
// plant submissions and their approval status (Pending, Approved, Rejected).
import React, { useState, useCallback, useRef, useMemo, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  AppState,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { useUser } from '../context/UserContext';
import { useRecords } from '../context/RecordsContext';
import { authFetch } from '../utils/session';
import { recordFromCloudPlant } from '../utils/plantRecord';
import { useTheme } from '../theme/ThemeContext';

const PLANTS_URL = 'http://52.62.125.146/api/plants';

// How often the list checks the cloud for status changes (in milliseconds).
const REFRESH_INTERVAL_MS = 15000;

// How long a record that was just sent is kept on screen while we wait for
// the cloud list to include it.
const UNCONFIRMED_TIMEOUT_MS = 60000;

const PALETTES = {
  dark: {
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
  },
  light: {
    bg: '#F7F8F5',
    surface: '#FFFFFF',
    surfaceLight: '#E3F1E6',
    green: '#2A7A45',
    text: '#17261C',
    muted: '#5E7062',
    border: '#D3DFCF',
    success: '#2A7A45',
    successBg: '#E8F5EB',
    warning: '#8A5A00',
    warningBg: '#FBEED0',
    error: '#B3392F',
    errorBg: '#FCE9E7',
  },
};

const FILTERS = ['All', 'Pending', 'Approved', 'Rejected'];

function normalizeStatus(value) {
  const status = String(value || '').trim().toLowerCase();

  if (status === 'approved') return 'Approved';
  if (status === 'rejected') return 'Rejected';
  return 'Pending';
}

// The API may expose the owner ID under different names.
function getOwnerId(plant) {
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
}

function getStatusIcon(status) {
  if (status === 'Approved') return 'checkmark-circle';
  if (status === 'Rejected') return 'close-circle';
  return 'time-outline';
}

function getStatusColor(status, COLORS) {
  if (status === 'Approved') return COLORS.success;
  if (status === 'Rejected') return COLORS.error;
  return COLORS.warning;
}

function getStatusBackground(status, COLORS) {
  if (status === 'Approved') return COLORS.successBg;
  if (status === 'Rejected') return COLORS.errorBg;
  return COLORS.warningBg;
}

function toTime(value) {
  const time = new Date(value || 0).getTime();
  return Number.isFinite(time) ? time : 0;
}

function formatDate(value) {
  const time = toTime(value);
  return time ? new Date(time).toLocaleDateString() : '';
}

// Records saved on this phone that have not reached the cloud yet (for
// example, submitted while offline). They wait here as Pending until they
// sync. Records that already have a cloud ID come from the cloud list.
function buildLocalPendingItems(records) {
  return (records || [])
    .filter((record) => record.status === 'pending' && !record.serverId)
    .map((record) => ({
      id: `local-${record.id}`,
      localRecord: record,
      name: record.scientificName || 'Unknown plant',
      status: 'Pending',
      detail: 'Saved on this phone · Waiting to sync',
      date: formatDate(record.createdAt),
      time: toTime(record.createdAt),
    }));
}

// Newest first, whether the record came from the cloud or from the phone.
function mergeActivities(cloudItems, localItems) {
  return [...localItems, ...cloudItems].sort((a, b) => b.time - a.time);
}

// A record that was just sent from this phone. It is shown straight away as
// a cloud record (Pending) so the list never has a gap while we wait for the
// next check of the cloud.
function toSyncedItem(record) {
  return {
    id: String(record.serverId),
    name: record.scientificName || 'Unknown plant',
    status: 'Pending',
    detail: 'Submitted · Waiting for approval',
    date: formatDate(record.createdAt),
    time: toTime(record.createdAt),
  };
}

// Compares the records waiting to be sent before and now, and returns the
// ones that were sent in between.
function findJustSentRecords(previousUnsentIds, records) {
  const all = records || [];

  const unsentIds = new Set(
    all
      .filter((record) => record.status === 'pending' && !record.serverId)
      .map((record) => record.id)
  );

  const justSent = previousUnsentIds
    ? all.filter(
        (record) =>
          previousUnsentIds.has(record.id) &&
          !unsentIds.has(record.id) &&
          record.serverId
      )
    : [];

  return { unsentIds, justSent };
}

// Adds records that were just sent but are not in the cloud list yet. Once
// the cloud list includes them (or too much time has passed) they are
// forgotten. Removes those from the `unconfirmed` map as it goes.
function mergeUnconfirmed(cloudItems, unconfirmed, now) {
  const cloudIds = new Set(cloudItems.map((item) => item.id));
  const stillWaiting = [];

  unconfirmed.forEach((entry, id) => {
    if (cloudIds.has(id) || now - entry.since > UNCONFIRMED_TIMEOUT_MS) {
      unconfirmed.delete(id);
    } else {
      stillWaiting.push(entry.item);
    }
  });

  return [...cloudItems, ...stillWaiting];
}

export default function MyActivitiesSection() {
  const { styles, COLORS } = useStyles();

  const navigation = useNavigation();
  const { user } = useUser();
  const userId = user?.id;

  const [filter, setFilter] = useState('All');
  const [cloudActivities, setCloudActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const hasLoadedRef = useRef(false);
  const fetchingRef = useRef(false);
  const lastSignatureRef = useRef(null);
  const unconfirmedRef = useRef(new Map()); // cloud ID -> { item, since }
  const prevUnsentRef = useRef(null);

  // Always call the newest version of the records sync.
  const { records, syncApprovedRecords } = useRecords();
  const syncRecordsRef = useRef(syncApprovedRecords);
  syncRecordsRef.current = syncApprovedRecords;

  // silent = true refreshes quietly in the background: no spinner, and the
  // list already on screen is kept if the check fails.
  const fetchActivities = useCallback(
    async ({ silent = false } = {}) => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;

      try {
        if (!silent) {
          setLoading(true);
          setLoadError(false);
        }

        if (userId === undefined || userId === null) {
          throw new Error('Your login session was not found. Please log in again.');
        }

        const response = await authFetch(PLANTS_URL, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch plants: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error('Unexpected plant records response');
        }

        const currentUserId = String(userId);

        const myPlants = data.filter((plant) => {
          const ownerId = getOwnerId(plant);
          return ownerId != null && String(ownerId) === currentUserId;
        });

        // Newest submissions first.
        myPlants.sort((a, b) => {
          const timeA = new Date(a.created_at || 0).getTime() || 0;
          const timeB = new Date(b.created_at || 0).getTime() || 0;
          return timeB - timeA;
        });

        const formatted = myPlants.map((plant) => {
          const status = normalizeStatus(plant.plant_status);

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
            date: formatDate(plant.created_at),
            time: toTime(plant.created_at),
            detail,
            plant,
          };
        });

        // Records just sent from this phone may not be in the cloud list yet.
        // Keep showing them until the cloud confirms them.
        setCloudActivities(
          mergeUnconfirmed(formatted, unconfirmedRef.current, Date.now())
        );
        setLoadError(false);
        hasLoadedRef.current = true;

        // When a status changes, also update this phone's copy of the
        // approved plants right away, so Explore matches this list.
        const signature = formatted
          .map((item) => `${item.id}:${item.status}`)
          .join('|');

        if (
          lastSignatureRef.current !== null &&
          lastSignatureRef.current !== signature
        ) {
          syncRecordsRef.current().catch((error) => {
            console.log('Explore update failed:', error.message);
          });
        }

        lastSignatureRef.current = signature;
      } catch (error) {
        console.log('Could not load activities:', error.message);

        if (!silent || !hasLoadedRef.current) {
          setLoadError(true);
        }
      } finally {
        fetchingRef.current = false;
        setLoading(false);
      }
    },
    [userId]
  );

  // Live: load when Home opens, then check again every 15 seconds and
  // whenever the app returns to the foreground. Stops when Home is left.
  useFocusEffect(
    useCallback(() => {
      fetchActivities({ silent: hasLoadedRef.current });

      const intervalId = setInterval(() => {
        fetchActivities({ silent: true });
      }, REFRESH_INTERVAL_MS);

      const appStateSubscription = AppState.addEventListener(
        'change',
        (state) => {
          if (state === 'active') {
            fetchActivities({ silent: true });
          }
        }
      );

      return () => {
        clearInterval(intervalId);
        appStateSubscription.remove();
      };
    }, [fetchActivities])
  );

  // When a record saved on this phone gets sent to the cloud, show it from
  // the cloud side right away (still Pending) instead of leaving a gap until
  // the next check, then confirm it with the cloud. (Runs before the screen is
  // drawn, so the card never flashes away.)
  useLayoutEffect(() => {
    const { unsentIds, justSent } = findJustSentRecords(
      prevUnsentRef.current,
      records
    );

    prevUnsentRef.current = unsentIds;

    if (justSent.length === 0) return;

    const now = Date.now();

    justSent.forEach((record) => {
      unconfirmedRef.current.set(String(record.serverId), {
        item: toSyncedItem(record),
        since: now,
      });
    });

    setCloudActivities((current) => {
      const known = new Set(current.map((item) => item.id));
      const added = justSent
        .filter((record) => !known.has(String(record.serverId)))
        .map(toSyncedItem);

      return added.length > 0 ? [...current, ...added] : current;
    });

    fetchActivities({ silent: true });
  }, [records, fetchActivities]);

  // The cloud list plus the records still waiting on this phone.
  const activities = useMemo(
    () => mergeActivities(cloudActivities, buildLocalPendingItems(records)),
    [cloudActivities, records]
  );

  // Opens the same plant record page as the cards in Explore.
  const openActivity = (item) => {
    // 1. saved on this phone and not sent yet
    // 2. already in the cloud: use the copy saved on this phone if there is one
    //    (exactly what Explore shows), otherwise build it from the cloud data
    const cloudId = String(item.plant ? item.plant.id : item.id);

    const record =
      item.localRecord ||
      records.find((r) => String(r.serverId ?? '') === cloudId) ||
      (item.plant ? recordFromCloudPlant(item.plant) : null);

    if (!record) return;

    navigation.navigate('PlantRecordSummary', { record, readOnly: true });
  };

  const filteredActivities =
    filter === 'All'
      ? activities
      : activities.filter((item) => item.status === filter);

  const renderState = () => {
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

          <Text style={styles.emptyTitle}>Could not load activities</Text>
          <Text style={styles.emptyText}>
            Check your connection. This will try again automatically.
          </Text>
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

  const showList = filteredActivities.length > 0;

  return (
    <View style={styles.section}>
      {/* Heading */}
      <View style={styles.heading}>
        <View style={styles.headingCopy}>
          <Text style={styles.title}>My Activities</Text>
          <Text style={styles.subtitle}>Track your plant submissions</Text>
        </View>
      </View>

      {/* Shown when the server cannot be reached */}
      {loadError && activities.length > 0 && (
        <View style={styles.notice}>
          <Ionicons
            name="cloud-offline-outline"
            size={16}
            color={COLORS.warning}
          />
          <Text style={styles.noticeText}>
            Can't reach the server. Showing records saved on this phone. This
            will update automatically.
          </Text>
        </View>
      )}

      {/* Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryIcon}>
          <Ionicons name="clipboard-outline" size={25} color={COLORS.green} />
        </View>

        <View style={styles.summaryCopy}>
          <Text style={styles.summaryLabel}>Total submissions</Text>
          <Text style={styles.summaryValue}>{activities.length}</Text>
          <Text style={styles.summaryHint}>
            Records submitted to the collection
          </Text>
        </View>

        <View style={styles.summaryDecoration}>
          <Ionicons name="leaf-outline" size={43} color={COLORS.green} />
        </View>
      </View>

      {/* Filters */}
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
              style={[styles.filterButton, active && styles.filterButtonActive]}
              onPress={() => setFilter(item)}
              activeOpacity={0.75}
            >
              <Text
                style={[styles.filterText, active && styles.filterTextActive]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      {showList
        ? filteredActivities.map((item) => {
            const statusColor = getStatusColor(item.status, COLORS);

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.activityCard}
                onPress={() => openActivity(item)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: getStatusBackground(item.status, COLORS) },
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

                  <Text style={styles.activityDetail}>{item.detail}</Text>

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
                      { backgroundColor: getStatusBackground(item.status, COLORS) },
                    ]}
                  >
                    <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                      {item.status}
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
          })
        : renderState()}
    </View>
  );
}

// Styles are rebuilt whenever the light/dark mode changes.
function useStyles() {
  const { mode, pick, colors } = useTheme();
  const COLORS = PALETTES[mode];
  const styles = useMemo(
    () => createStyles(COLORS, pick, colors),
    [mode]
  );

  return { COLORS, colors, styles, mode, pick };
}

const createStyles = (COLORS, pick, colors) => StyleSheet.create({
  section: {
    marginTop: 6,
  },

  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },

  headingCopy: {
    flex: 1,
  },

  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 4,
  },


  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    padding: 12,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: pick('#57472C', '#E3CD94'),
    backgroundColor: COLORS.warningBg,
  },

  noticeText: {
    flex: 1,
    color: COLORS.warning,
    fontSize: 11,
    lineHeight: 17,
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
    marginBottom: 24,
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
    paddingTop: 30,
    paddingBottom: 30,
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
    marginTop: 4,
  },

  emptyText: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 7,
  },


});
