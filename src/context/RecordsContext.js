// Records are stored permanently in SQLite, on the phone itself. This
// context also watches the device's network status and automatically
// retries any "pending" record in the background, waiting longer
// between tries when a record keeps failing.
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { getDatabase } from '../db/database';
import { syncRecordToCloud } from '../utils/syncRecord';
import { useUser } from './UserContext';
import { authFetch, getUser, getToken } from '../utils/session';
import * as SecureStore from 'expo-secure-store';

const RecordsContext = createContext(null);

const PLANTS_URL = 'http://52.62.125.146/api/plants';

// How often the phone checks the cloud for plants that were approved,
// rejected or deleted (while it is online and someone is logged in).
const APPROVED_SYNC_INTERVAL_MS = 20000;

function normalizeApproval(value) {
  const status = String(value || '').trim().toLowerCase();

  if (status === 'approved') return 'Approved';
  if (status === 'rejected') return 'Rejected';
  return 'Pending';
}

export function RecordsProvider({ children }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);

  const isOnlineRef = useRef(false);
  const syncingRef = useRef(false);
  const recordsRef = useRef([]);
  const retryRef = useRef({}); // record id -> { fails, nextTry }
  const approvedSyncRunningRef = useRef(false);
  const { token } = useUser();

  useEffect(() => {
    recordsRef.current = records;
  }, [records]);

  // Load everything already saved on this phone, once, when the app starts.
  useEffect(() => {
    (async () => {
      const db = await getDatabase();
      const rows = await db.getAllAsync('SELECT * FROM plants ORDER BY createdAt DESC');
      const parsed = rows.map((r) => ({ ...r, photos: JSON.parse(r.photos || '[]') }));
      setRecords(parsed);
      setLoading(false);
    })();
  }, []);

  // Watch the device's network status. Only "connected" is trusted; the
  // extra "internet reachable" check can wrongly say false on some Wi-Fi.
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = !!state.isConnected;
      setIsOnline(online);
      isOnlineRef.current = online;
    });
    return () => unsubscribe();
  }, []);

  // Keep the plants on this phone live with the cloud. While the phone is
  // online and someone is logged in, check right away, then every 20 seconds,
  // and again whenever the app comes back to the foreground.
  useEffect(() => {
    if (!isOnline || loading || !token) return;

    const run = () => {
      syncApprovedRecords().catch((error) => {
        console.log('Approved records sync failed:', error.message);
      });
    };

    run();

    const intervalId = setInterval(run, APPROVED_SYNC_INTERVAL_MS);
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') run();
    });

    return () => {
      clearInterval(intervalId);
      appStateSubscription.remove();
    };
  }, [isOnline, loading, token]);

  const updateRecordStatus = async (id, status) => {
  const db = await getDatabase();

  await db.runAsync(
    'UPDATE plants SET status = ? WHERE id = ?',
    [status, id]
  );

  setRecords((current) =>
    current.map((r) => (r.id === id ? { ...r, status } : r))
  );
};

const updateRecordServerId = async (id, serverId) => {
  if (serverId === null || serverId === undefined) return;

  const db = await getDatabase();

  await db.runAsync(
    'UPDATE plants SET serverId = ? WHERE id = ?',
    [String(serverId), id]
  );

  setRecords((current) =>
    current.map((r) =>
      r.id === id ? { ...r, serverId: String(serverId) } : r
    )
  );
};

  // Saves a record on the phone first. If the phone is online, it also
  // tries to send it to the cloud right away. Returns 'synced' if that
  // worked, or 'pending' if the record is waiting to be sent.
  const addRecord = async (record) => {
    const db = await getDatabase();

    const toSave = {
      id: record.id,
      scientificName: record.scientificName || '',
      commonName: record.commonName || '',
      family: record.family || '',
      height: record.height || '',
      diameter: record.diameter || '',
      latitude: record.latitude || '',
      longitude: record.longitude || '',
      notes: record.notes || '',
      photos: JSON.stringify(record.photos || []),
      status: 'pending',
      createdAt: record.createdAt || new Date().toISOString(),
    };

    // If online and no other sync is running, take the sync lock so the
    // background loop can't send this same record at the same time.
    const tookLock = isOnlineRef.current && !syncingRef.current;
    if (tookLock) {
      syncingRef.current = true;
    }

    let finalStatus = 'pending';

    try {
      await db.runAsync(
        `INSERT INTO plants (id, scientificName, commonName, family, height, diameter, latitude, longitude, notes, photos, status, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          toSave.id,
          toSave.scientificName,
          toSave.commonName,
          toSave.family,
          toSave.height,
          toSave.diameter,
          toSave.latitude,
          toSave.longitude,
          toSave.notes,
          toSave.photos,
          toSave.status,
          toSave.createdAt,
        ]
      );

      const localRecord = {
        ...toSave,
        photos: record.photos || [],
      };

      setRecords((current) => [localRecord, ...current]);

      if (tookLock) {
        try {
          const response = await syncRecordToCloud(localRecord);

          await updateRecordServerId(record.id, response.id);
          await updateRecordStatus(record.id, 'synced');

          delete retryRef.current[record.id];
          finalStatus = 'synced';
        } catch (e) {
          console.log(
            'Online sync failed for',
            record.id,
            '- keeping record pending:',
            e.message
          );
        }
      }
    } finally {
      if (tookLock) {
        syncingRef.current = false;
      }
    }

    return finalStatus;
  };

  const findRecordById = (id) => {
    console.log('[QR LOOKUP] Scanned ID:', id);

    console.log(
      '[QR LOOKUP] Local records:',
      records.map((r) => ({
        id: r.id,
        serverId: r.serverId,
        commonName: r.commonName,
        status: r.status,
        approvalStatus: r.approvalStatus,
      }))
    );

    return records.find(
      (r) =>
        String(r.id) === String(id) ||
        String(r.serverId) === String(id)
    );
  };


  // Makes the plants on this phone match the cloud database:
  //  - approved plants are added or updated,
  //  - plants rejected (or set back to pending) in the cloud leave the
  //    Explore list,
  //  - plants deleted from the cloud are deleted here too.
  // Returns quickly if a check is already running.
  const syncApprovedRecords = async () => {
    if (approvedSyncRunningRef.current) return;
    approvedSyncRunningRef.current = true;

    try {
      const db = await getDatabase();

      const authToken =
        getToken() || (await SecureStore.getItemAsync('authToken'));

      if (!authToken) {
        throw new Error('You must log in before fetching approved plant records.');
      }

      // Note which records are already linked to the cloud BEFORE asking the
      // server. A record submitted while we wait is then never mistaken for
      // one that was deleted.
      const linkedBefore = await db.getAllAsync(
        'SELECT id, serverId, approvalStatus FROM plants WHERE serverId IS NOT NULL'
      );

      const response = await authFetch(PLANTS_URL, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch plants: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('The plants API did not return a list.');
      }

      const cloudById = new Map(data.map((plant) => [String(plant.id), plant]));
      let changed = false;

      // 1. Plants that were deleted, rejected or set back to pending.
      for (const row of linkedBefore) {
        const cloudPlant = cloudById.get(String(row.serverId));
        const isCloudCopy = String(row.id).startsWith('cloud-');

        if (!cloudPlant) {
          // Deleted from the cloud database, so delete it here too.
          await db.runAsync('DELETE FROM plants WHERE id = ?', [row.id]);
          changed = true;
          continue;
        }

        const cloudStatus = normalizeApproval(cloudPlant.plant_status);

        if (cloudStatus !== 'Approved') {
          if (isCloudCopy) {
            // Only a downloaded copy of an approved plant, so remove it.
            await db.runAsync('DELETE FROM plants WHERE id = ?', [row.id]);
            changed = true;
          } else if (row.approvalStatus !== cloudStatus) {
            // The botanist's own record: keep it, but record its new status.
            await db.runAsync(
              'UPDATE plants SET approvalStatus = ? WHERE id = ?',
              [cloudStatus, row.id]
            );
            changed = true;
          }
        }
      }

      // 2. Approved plants: add the new ones, update the ones that changed.
      const currentRows = await db.getAllAsync(
        'SELECT * FROM plants WHERE serverId IS NOT NULL'
      );
      const currentByServerId = new Map(
        currentRows.map((row) => [String(row.serverId), row])
      );

      for (const plant of data) {
        if (normalizeApproval(plant.plant_status) !== 'Approved') continue;

        const serverId = String(plant.id);

        const fields = {
          scientificName: plant.scientific_name || '',
          commonName: plant.common_name || '',
          family: plant.family || '',
          height: plant.height_m != null ? String(plant.height_m) : '',
          diameter: plant.diameter_cm != null ? String(plant.diameter_cm) : '',
          latitude: plant.latitude != null ? String(plant.latitude) : '',
          longitude: plant.longitude != null ? String(plant.longitude) : '',
          notes: plant.morphological_notes || '',
          photos: JSON.stringify(Array.isArray(plant.images) ? plant.images : []),
        };

        const existing = currentByServerId.get(serverId);

        if (!existing) {
          await db.runAsync(
            `INSERT INTO plants (
              id, serverId, scientificName, commonName, family,
              height, diameter, latitude, longitude, notes,
              photos, status, approvalStatus, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              serverId = excluded.serverId,
              scientificName = excluded.scientificName,
              commonName = excluded.commonName,
              family = excluded.family,
              height = excluded.height,
              diameter = excluded.diameter,
              latitude = excluded.latitude,
              longitude = excluded.longitude,
              notes = excluded.notes,
              photos = excluded.photos,
              approvalStatus = excluded.approvalStatus`,
            [
              `cloud-${serverId}`,
              serverId,
              fields.scientificName,
              fields.commonName,
              fields.family,
              fields.height,
              fields.diameter,
              fields.latitude,
              fields.longitude,
              fields.notes,
              fields.photos,
              'synced',
              'Approved',
              plant.created_at || new Date().toISOString(),
            ]
          );
          changed = true;
          continue;
        }

        const unchanged =
          existing.scientificName === fields.scientificName &&
          existing.commonName === fields.commonName &&
          existing.family === fields.family &&
          existing.height === fields.height &&
          existing.diameter === fields.diameter &&
          existing.latitude === fields.latitude &&
          existing.longitude === fields.longitude &&
          existing.notes === fields.notes &&
          existing.photos === fields.photos &&
          existing.approvalStatus === 'Approved';

        if (!unchanged) {
          await db.runAsync(
            `UPDATE plants SET
              scientificName = ?, commonName = ?, family = ?, height = ?,
              diameter = ?, latitude = ?, longitude = ?, notes = ?,
              photos = ?, approvalStatus = ?
            WHERE id = ?`,
            [
              fields.scientificName,
              fields.commonName,
              fields.family,
              fields.height,
              fields.diameter,
              fields.latitude,
              fields.longitude,
              fields.notes,
              fields.photos,
              'Approved',
              existing.id,
            ]
          );
          changed = true;
        }
      }

      // Only refresh the screens when something really changed.
      if (changed) {
        const rows = await db.getAllAsync(
          'SELECT * FROM plants ORDER BY createdAt DESC'
        );

        setRecords(
          rows.map((r) => ({
            ...r,
            photos: JSON.parse(r.photos || '[]'),
          }))
        );
      }
    } finally {
      approvedSyncRunningRef.current = false;
    }
  };


  // Temporary helper for testing.
  const deleteRecord = async (id) => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM plants WHERE id = ?', [id]);
    setRecords((current) => current.filter((r) => r.id !== id));
  };

  // Background auto-sync. Checks every 5 seconds, but a record that keeps
  // failing waits 10s, 20s, 40s, then 60s between tries instead of being
  // re-sent every 5 seconds forever.
  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (!isOnlineRef.current || syncingRef.current || !getUser()) return;

      const now = Date.now();
      const due = recordsRef.current.filter((r) => {
        if (r.status !== 'pending') return false;
        const retry = retryRef.current[r.id];
        return !retry || now >= retry.nextTry;
      });
      if (due.length === 0) return;

      syncingRef.current = true;

      try {
        for (const record of due) {
          try {
            const response = await syncRecordToCloud(record);

            await updateRecordServerId(record.id, response.id);
            await updateRecordStatus(record.id, 'synced');
            delete retryRef.current[record.id];
          } catch (e) {
            const fails = (retryRef.current[record.id]?.fails || 0) + 1;
            const waitMs = Math.min(5000 * 2 ** fails, 60000);
            retryRef.current[record.id] = { fails, nextTry: Date.now() + waitMs };
            console.log('Sync failed for', record.id, '-', e.message, '- retry in', Math.round(waitMs / 1000), 's');
          }
        }
      } finally {
        syncingRef.current = false;
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <RecordsContext.Provider
      value={{
        records,
        addRecord,
        findRecordById,
        syncApprovedRecords,
        updateRecordStatus,
        deleteRecord,
        isOnline,
        loading,
      }}
    >
      {children}
    </RecordsContext.Provider>
  );
}

export function useRecords() {
  const ctx = useContext(RecordsContext);
  if (!ctx) {
    throw new Error('useRecords must be used inside a RecordsProvider');
  }
  return ctx;
}