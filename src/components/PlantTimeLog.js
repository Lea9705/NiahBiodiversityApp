// Time log: every time this plant record was submitted or edited, who did it
// and when. It reads the record's history from the server, so staff must be
// logged in and online to see it.
//
// It keeps itself up to date: it checks again every 15 seconds and whenever
// the app comes back to the front. There are no buttons to press.
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  AppState,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { authFetch } from '../utils/session';
import { useTheme } from '../theme/ThemeContext';
import { buildTimeLogEntries, formatDateTime } from '../utils/timeLog';
import { API_BASE } from '../config';

const PLANTS_URL = `${API_BASE}/plants`;
const REQUEST_TIMEOUT_MS = 12000;

// How often the log checks the server, and the longest it waits between
// tries when the server keeps failing (15s, 30s, then 60s).
const REFRESH_MS = 15000;
const MAX_WAIT_MS = 60000;

const PALETTES = {
  dark: {
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

// An error whose text is safe to show, with the server's own explanation.
// willRetry is false when trying again by itself would not help.
class LogError extends Error {
  constructor(message, detail = '', willRetry = true) {
    super(message);
    this.known = true;
    this.detail = detail;
    this.willRetry = willRetry;
  }
}

async function loadRevisions(serverId) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await authFetch(`${PLANTS_URL}/${serverId}/revisions`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (response.status === 401 || response.status === 403) {
      throw new LogError(
        'Your login has expired. Please log out and log in again.',
        '',
        false
      );
    }

    if (!response.ok) {
      let detail = '';

      try {
        const body = await response.json();
        detail = body && body.error ? String(body.error) : '';
      } catch (e) {
        // The server gave no explanation.
      }

      throw new LogError(
        `The time log could not be loaded (${response.status}).`,
        detail
      );
    }

    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

export default function PlantTimeLog({ record }) {
  const { styles, COLORS } = useStyles();

  const serverId = record && record.serverId ? String(record.serverId) : '';

  const [state, setState] = useState({
    loading: !!serverId,
    error: '',
    detail: '',
    willRetry: false,
    entries: [],
  });

  // Reads the history. silent = a quiet refresh in the background: no
  // spinner, and the entries already on screen stay if it fails.
  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        setState((current) => ({ ...current, loading: true }));
      }

      try {
        const revisions = await loadRevisions(serverId);

        setState({
          loading: false,
          error: '',
          detail: '',
          willRetry: false,
          entries: buildTimeLogEntries(revisions),
        });

        return { ok: true, stop: false };
      } catch (error) {
        const known = !!error.known;
        const willRetry = known ? error.willRetry !== false : true;

        setState((current) => ({
          ...current,
          loading: false,
          error:
            error.name === 'AbortError'
              ? 'The time log took too long to load.'
              : known
              ? error.message
              : 'The time log could not be loaded. Check your internet connection.',
          detail: known ? error.detail || '' : '',
          willRetry,
        }));

        return { ok: false, stop: !willRetry };
      }
    },
    [serverId]
  );

  // Load now, then keep checking by itself.
  useEffect(() => {
    if (!serverId) return undefined;

    let stopped = false;
    let running = false;
    let timer = null;
    let failures = 0;
    let first = true;

    const cycle = async () => {
      if (stopped || running) return;
      running = true;

      const result = await load({ silent: !first });

      first = false;
      running = false;

      // Stop for good when the page is closed, or when trying again by
      // itself cannot help (an expired login).
      if (stopped || result.stop) return;

      failures = result.ok ? 0 : failures + 1;

      const wait = result.ok
        ? REFRESH_MS
        : Math.min(REFRESH_MS * 2 ** failures, MAX_WAIT_MS);

      timer = setTimeout(cycle, wait);
    };

    cycle();

    // Coming back to the app: check straight away.
    const subscription = AppState.addEventListener('change', (next) => {
      if (next !== 'active' || stopped) return;

      clearTimeout(timer);
      failures = 0;
      cycle();
    });

    return () => {
      stopped = true;
      clearTimeout(timer);
      subscription.remove();
    };
  }, [serverId, load]);

  // A record that is only on this phone has no history on the server yet.
  const entries = useMemo(() => {
    if (!serverId) {
      return [
        {
          key: 'local',
          title: 'Saved on this phone',
          detail: 'Waiting to be sent. The full log appears after it syncs.',
          by: '',
          time: record && record.createdAt,
          status: '',
        },
      ];
    }

    if (state.entries.length > 0) return state.entries;

    // No history from the server (it is empty, or it could not be loaded):
    // still show the two times this phone knows.
    if (!state.loading && record) {
      const basics = [];

      if (record.lastEdit && record.lastEdit !== record.createdAt) {
        basics.push({
          key: 'last-edit',
          title: 'Last edited',
          detail: '',
          by: '',
          time: record.lastEdit,
          status: '',
        });
      }

      if (record.createdAt) {
        basics.push({
          key: 'created',
          title: 'Record created',
          detail: '',
          by: '',
          time: record.createdAt,
          status: '',
        });
      }

      return basics;
    }

    return [];
  }, [serverId, state, record]);

  const dotColor = (status) => {
    if (status === 'Approved') return COLORS.success;
    if (status === 'Rejected') return COLORS.error;
    if (status === 'Pending') return COLORS.warning;
    return COLORS.green;
  };

  const chipStyle = (status) => {
    if (status === 'Approved') {
      return { backgroundColor: COLORS.successBg, color: COLORS.success };
    }
    if (status === 'Rejected') {
      return { backgroundColor: COLORS.errorBg, color: COLORS.error };
    }
    return { backgroundColor: COLORS.warningBg, color: COLORS.warning };
  };

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <View style={styles.headingIcon}>
          <Ionicons name="time-outline" size={21} color={COLORS.green} />
        </View>

        <View style={styles.headingCopy}>
          <Text style={styles.title}>Time log</Text>
          <Text style={styles.subtitle}>
            When this record was submitted and edited
          </Text>
        </View>
      </View>

      {state.loading && entries.length === 0 && (
        <View style={styles.stateBox}>
          <ActivityIndicator color={COLORS.green} />
          <Text style={styles.stateText}>Loading the time log...</Text>
        </View>
      )}

      {!!state.error && (
        <View style={styles.stateBox}>
          <Ionicons
            name="cloud-offline-outline"
            size={22}
            color={COLORS.warning}
          />
          <Text style={styles.stateText}>{state.error}</Text>

          {!!state.detail && (
            <Text selectable style={styles.stateDetail}>
              Server message: {state.detail}
            </Text>
          )}

          {state.willRetry && (
            <Text style={styles.stateDetail}>Trying again automatically...</Text>
          )}
        </View>
      )}

      {entries.map((entry, index) => {
        const chip = entry.status ? chipStyle(entry.status) : null;

        return (
          <View key={entry.key} style={styles.entry}>
            <View style={styles.rail}>
              <View
                style={[styles.dot, { backgroundColor: dotColor(entry.status) }]}
              />
              {index < entries.length - 1 && <View style={styles.line} />}
            </View>

            <View style={styles.entryBody}>
              <View style={styles.entryTop}>
                <Text style={styles.entryTitle}>{entry.title}</Text>

                {!!chip && (
                  <View
                    style={[
                      styles.chip,
                      { backgroundColor: chip.backgroundColor },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: chip.color }]}>
                      {entry.status}
                    </Text>
                  </View>
                )}
              </View>

              {!!entry.detail && (
                <Text style={styles.entryDetail}>{entry.detail}</Text>
              )}

              {!!entry.by && <Text style={styles.entryBy}>By {entry.by}</Text>}

              {!!entry.time && (
                <Text style={styles.entryTime}>
                  {formatDateTime(entry.time)}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

// Styles are rebuilt whenever the light/dark mode changes.
function useStyles() {
  const { mode } = useTheme();
  const COLORS = PALETTES[mode];
  const styles = useMemo(() => createStyles(COLORS), [mode]);

  return { COLORS, styles };
}

const createStyles = (COLORS) =>
  StyleSheet.create({
    section: {
      backgroundColor: COLORS.surface,
      borderRadius: 21,
      borderWidth: 1,
      borderColor: COLORS.border,
      padding: 15,
      marginBottom: 15,
    },

    heading: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
    },

    headingIcon: {
      width: 40,
      height: 40,
      borderRadius: 14,
      backgroundColor: COLORS.surfaceLight,
      alignItems: 'center',
      justifyContent: 'center',
    },

    headingCopy: {
      flex: 1,
    },

    title: {
      fontSize: 16,
      fontWeight: '800',
      color: COLORS.text,
    },

    subtitle: {
      fontSize: 11,
      color: COLORS.muted,
      marginTop: 3,
    },

    stateBox: {
      alignItems: 'center',
      gap: 8,
      paddingVertical: 12,
    },

    stateText: {
      fontSize: 12,
      lineHeight: 17,
      textAlign: 'center',
      color: COLORS.muted,
    },

    stateDetail: {
      fontSize: 11,
      lineHeight: 16,
      textAlign: 'center',
      color: COLORS.muted,
    },

    entry: {
      flexDirection: 'row',
      gap: 12,
    },

    rail: {
      alignItems: 'center',
      width: 14,
    },

    dot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginTop: 4,
    },

    line: {
      flex: 1,
      width: 2,
      marginTop: 4,
      backgroundColor: COLORS.border,
    },

    entryBody: {
      flex: 1,
      paddingBottom: 18,
    },

    entryTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },

    entryTitle: {
      flex: 1,
      fontSize: 14,
      fontWeight: '800',
      color: COLORS.text,
    },

    chip: {
      paddingHorizontal: 9,
      paddingVertical: 3,
      borderRadius: 999,
    },

    chipText: {
      fontSize: 10,
      fontWeight: '800',
    },

    entryDetail: {
      fontSize: 12,
      lineHeight: 17,
      color: COLORS.text,
      marginTop: 4,
    },

    entryBy: {
      fontSize: 11,
      color: COLORS.muted,
      marginTop: 4,
    },

    entryTime: {
      fontSize: 11,
      color: COLORS.muted,
      marginTop: 2,
    },
  });
