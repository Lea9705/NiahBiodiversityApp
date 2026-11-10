// Records are stored permanently in SQLite, on the phone itself. This
// context also watches the device's network status and automatically
// retries any "pending" record in the background, waiting longer
// between tries when a record keeps failing.
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { getDatabase } from '../db/database';
import { syncRecordToCloud, syncUpdateToCloud } from '../utils/syncRecord';
import { describeSyncError } from '../utils/syncProblem';
import { useUser } from './UserContext';
import { authFetch, getUser, getToken } from '../utils/session';
import * as SecureStore from 'expo-secure-store';
import { API_BASE } from '../config';

const RecordsContext = createContext(null);

const PLANTS_URL = `${API_BASE}/plants`;

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

  // Why the last attempt to send a record failed (null when nothing is wrong).
  const [syncProblem, setSyncProblem] = useState(null);

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
  // online (for visitors and for staff), check right away, then every 20
  // seconds, and again whenever the app comes back to the foreground.
  useEffect(() => {
    if (!isOnline || loading) return;

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

  // Reads one record from the phone's database.
  const readRecordRow = async (id) => {
    const db = await getDatabase();
    const row = await db.getFirstAsync('SELECT * FROM plants WHERE id = ?', [id]);

    return row ? { ...row, photos: JSON.parse(row.photos || '[]') } : null;
  };

  // Sends one waiting record to the cloud. A record that already has a cloud
  // ID is an edit (it goes back to Pending). Anything else is a new record.
  const sendRecordToCloud = async (record) => {
    if (record.serverId) {
      const result = await syncUpdateToCloud(record);

      return {
        id: record.serverId,
        lastEdit: (result && result.plant && result.plant.last_edit) || null,
        isUpdate: true,
      };
    }

    const response = await syncRecordToCloud(record);

    return {
      id: response.id,
      lastEdit: response.last_edit || response.lastEdit || null,
      isUpdate: false,
    };
  };

  // After a record was sent: remember its cloud ID, mark it as sent and keep
  // the server-generated last_edit timestamp when the API returns one.
  const markRecordSent = async (id, sent) => {
    const db = await getDatabase();

    const serverId = String(sent.id);
    const lastEdit = sent.lastEdit || null;

    // The cloud ID and the "sent" mark are saved together, in one step, so the
    // record never looks like "has an ID but is still waiting to be sent".
    await db.runAsync(
      `UPDATE plants SET serverId = ?, status = 'synced',
         lastEdit = COALESCE(?, lastEdit) WHERE id = ?`,
      [serverId, lastEdit, id]
    );

    setRecords((current) =>
      current.map((r) =>
        r.id === id
          ? { ...r, serverId, status: 'synced', ...(lastEdit ? { lastEdit } : {}) }
          : r
      )
    );

    setSyncProblem(null);
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
      genus: record.genus || '',
      species: record.species || '',
      conservationStatus: record.conservationStatus || '',
      height: record.height || '',
      diameter: record.diameter || '',
      latitude: record.latitude || '',
      longitude: record.longitude || '',
      notes: record.notes || '',
      photos: JSON.stringify(record.photos || []),
      status: 'pending',
      createdAt: record.createdAt || new Date().toISOString(),
      lastEdit: record.lastEdit || null,
      // The account that made this record.
      ownerId: getUser()?.id != null ? String(getUser().id) : null,
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
        `INSERT INTO plants (id, scientificName, commonName, family, genus, species, conservationStatus, height, diameter, latitude, longitude, notes, photos, status, createdAt, lastEdit, ownerId)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          toSave.id,
          toSave.scientificName,
          toSave.commonName,
          toSave.family,
          toSave.genus,
          toSave.species,
          toSave.conservationStatus,
          toSave.height,
          toSave.diameter,
          toSave.latitude,
          toSave.longitude,
          toSave.notes,
          toSave.photos,
          toSave.status,
          toSave.createdAt,
          toSave.lastEdit,
          toSave.ownerId,
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

          await markRecordSent(record.id, { id: response.id, isUpdate: false });

          delete retryRef.current[record.id];
          finalStatus = 'synced';
        } catch (e) {
          console.log(
            'Online sync failed for',
            record.id,
            '- keeping record pending:',
            e.message
          );
          setSyncProblem(describeSyncError(e));
        }
      }
    } finally {
      if (tookLock) {
        syncingRef.current = false;
      }
    }

    return finalStatus;
  };

    // Saves an edited plant record. The record goes back to Pending. The edit is
  // sent to the cloud right away when the phone is online, or later when it is.
  // Returns 'synced', 'pending' (saved on this phone, waiting to be sent) or
  // 'deleted' (the record no longer exists in the cloud).
  const updateRecord = async (record) => {
    const db = await getDatabase();

    if (!record.serverId) {
      throw new Error(
        'This plant record is not in the cloud yet, so it cannot be edited.'
      );
    }

    const serverId = String(record.serverId);

    // The phone may not have a copy yet (for example a plant opened by scanning).
    const existing = await db.getFirstAsync(
      'SELECT id FROM plants WHERE id = ? OR serverId = ?',
      [record.id, serverId]
    );

    const localId = existing ? existing.id : `cloud-${serverId}`;

    const values = [
      record.scientificName || '',
      record.commonName || '',
      record.family || '',
      record.genus || '',
      record.species || '',
      record.conservationStatus || '',
      record.height || '',
      record.diameter || '',
      record.latitude || '',
      record.longitude || '',
      record.notes || '',
      JSON.stringify(record.photos || []),
    ];

    if (existing) {
      await db.runAsync(
        `UPDATE plants SET
           scientificName = ?, commonName = ?, family = ?, genus = ?, species = ?, conservationStatus = ?, height = ?,
           diameter = ?, latitude = ?, longitude = ?, notes = ?, photos = ?,
           status = 'pending', approvalStatus = 'Pending', rejectionReason = NULL,
           ownerId = ?
         WHERE id = ?`,
        [...values, getUser()?.id != null ? String(getUser().id) : null, localId]
      );
    } else {
      await db.runAsync(
        `INSERT INTO plants (
           id, serverId, scientificName, commonName, family, genus, species, conservationStatus, height,
           diameter, latitude, longitude, notes, photos, status,
           approvalStatus, createdAt, lastEdit, ownerId
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'Pending', ?, ?, ?)`,
        [
          localId,
          serverId,
          ...values,
          record.createdAt || new Date().toISOString(),
          record.lastEdit || null,
          getUser()?.id != null ? String(getUser().id) : null,
        ]
      );
    }

    const row = await readRecordRow(localId);

    setRecords((current) =>
      current.some((r) => r.id === localId)
        ? current.map((r) => (r.id === localId ? row : r))
        : [row, ...current]
    );

    // Try to send it now, unless another sync is already running.
    const tookLock = isOnlineRef.current && !syncingRef.current;

    if (!tookLock) return 'pending';

    syncingRef.current = true;

    try {
      const sent = await sendRecordToCloud(row);

      await markRecordSent(localId, sent);
      delete retryRef.current[localId];

      return 'synced';
    } catch (e) {
      if (e.status === 404) {
        // Someone deleted this plant from the cloud in the meantime.
        await deleteRecord(localId);
        return 'deleted';
      }

      console.log(
        'Online sync of the edit failed for',
        localId,
        '- keeping it pending:',
        e.message
      );
      setSyncProblem(describeSyncError(e));

      return 'pending';
    } finally {
      syncingRef.current = false;
    }
  };

  // Records saved before the phone remembered owners have no owner yet. They
  // belong to whoever logs in first after this update.
  useEffect(() => {
    const me = getUser()?.id;

    if (loading || me == null) return;

    (async () => {
      const db = await getDatabase();

      await db.runAsync(
        "UPDATE plants SET ownerId = ? WHERE ownerId IS NULL AND status = 'pending'",
        [String(me)]
      );

      setRecords((current) =>
        current.map((r) =>
          r.status === 'pending' && !r.ownerId ? { ...r, ownerId: String(me) } : r
        )
      );
    })().catch((error) => console.log('Could not set record owners:', error.message));
  }, [loading, token]);

  // When nothing is waiting to be sent any more, there is nothing to warn about.
  useEffect(() => {
    if (!records.some((r) => r.status === 'pending')) {
      setSyncProblem(null);
    }
  }, [records]);

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
  //  - plants deleted from the cloud are deleted here too,
  //  - the rejection note, last edit time and reviewer are kept up to date.
  // An edit that is still waiting to be sent from this phone is never
  // overwritten or removed. Returns quickly if a check is already running.
  const syncApprovedRecords = async () => {
    if (approvedSyncRunningRef.current) return;
    approvedSyncRunningRef.current = true;

    try {
      const db = await getDatabase();

      // Staff send their login token. Visitors have none and ask without it.
      const authToken =
        getToken() || (await SecureStore.getItemAsync('authToken'));
      const isVisitorSync = !authToken;

      // Note which records are already linked to the cloud BEFORE asking the
      // server. A record submitted while we wait is then never mistaken for
      // one that was deleted.
      const linkedBefore = await db.getAllAsync(
        `SELECT id, serverId, status, approvalStatus, rejectionReason,
                genus, species, conservationStatus, lastEdit, reviewerName
         FROM plants WHERE serverId IS NOT NULL`
      );

      const response = await authFetch(PLANTS_URL, {
        headers: {
          Accept: 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
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

        // A visitor only tidies the downloaded copies. A botanist's own records
        // are never touched without a login.
        if (isVisitorSync && !isCloudCopy) continue;

        // An edit waiting to be sent from this phone is left alone.
        if (row.status === 'pending') continue;

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
          } else {
            // The botanist's own record: keep it, but keep its status, its
            // rejection note and its review details up to date.
            const reason =
              cloudStatus === 'Rejected' ? cloudPlant.reason || '' : '';

            const differs =
              row.approvalStatus !== cloudStatus ||
              (row.rejectionReason || '') !== reason ||
              (row.lastEdit || '') !== (cloudPlant.last_edit || '') ||
              (row.genus || '') !== (cloudPlant.genus || '') ||
              (row.species || '') !== (cloudPlant.species || '') ||
              (row.conservationStatus || '') !== (cloudPlant.conservation_status || '') ||
              (row.reviewerName || '') !== (cloudPlant.reviewer_name || '');

            if (differs) {
              await db.runAsync(
                `UPDATE plants SET approvalStatus = ?, rejectionReason = ?,
                   genus = ?, species = ?, conservationStatus = ?, lastEdit = ?, reviewerName = ? WHERE id = ?`,
                [
                  cloudStatus,
                  reason,
                  cloudPlant.genus || '',
                  cloudPlant.species || '',
                  cloudPlant.conservation_status || '',
                  cloudPlant.last_edit || null,
                  cloudPlant.reviewer_name || null,
                  row.id,
                ]
              );
              changed = true;
            }
          }
        }
      }

            // 1b. A record the phone still thinks is unsent, but the server already
      //     has: the server saved it, but the reply never reached the phone.
      //     Every photo's file name starts with this phone's record ID, so the
      //     match is exact. Sending it again would make a duplicate.
      if (!isVisitorSync && !syncingRef.current) {
        const unsent = await db.getAllAsync(
          `SELECT id FROM plants WHERE status = 'pending' AND serverId IS NULL
             AND (ownerId IS NULL OR ownerId = ?)
           ORDER BY createdAt ASC`,
          [String(getUser()?.id ?? '')]
        );

        const taken = new Set(linkedBefore.map((row) => String(row.serverId)));
        const adopted = [];

        for (const row of unsent) {
          const needle = `/plants/${row.id}_`;

          const found = data.find(
            (plant) =>
              !taken.has(String(plant.id)) &&
              Array.isArray(plant.images) &&
              plant.images.some((url) => String(url).includes(needle))
          );

          if (!found) continue;

          taken.add(String(found.id));

          const cloudStatus = normalizeApproval(found.plant_status);

          await db.runAsync(
            `UPDATE plants SET serverId = ?, status = 'synced', approvalStatus = ?,
               rejectionReason = ?, genus = ?, species = ?, conservationStatus = ?, lastEdit = ?, reviewerName = ? WHERE id = ?`,
            [
              String(found.id),
              cloudStatus,
              cloudStatus === 'Rejected' ? found.reason || '' : '',
              found.genus || '',
              found.species || '',
              found.conservation_status || '',
              found.last_edit || null,
              found.reviewer_name || null,
              row.id,
            ]
          );

          adopted.push({ id: row.id, serverId: String(found.id), cloudStatus });
          changed = true;
        }

        if (adopted.length > 0) {
          setRecords((current) =>
            current.map((r) => {
              const hit = adopted.find((a) => a.id === r.id);

              return hit
                ? { ...r, serverId: hit.serverId, status: 'synced', approvalStatus: hit.cloudStatus }
                : r;
            })
          );
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
          genus: plant.genus || '',
          species: plant.species || '',
          conservationStatus: plant.conservation_status || '',
          height: plant.height_m != null ? String(plant.height_m) : '',
          diameter: plant.diameter_cm != null ? String(plant.diameter_cm) : '',
          latitude: plant.latitude != null ? String(plant.latitude) : '',
          longitude: plant.longitude != null ? String(plant.longitude) : '',
          notes: plant.morphological_notes || '',
          photos: JSON.stringify(Array.isArray(plant.images) ? plant.images : []),
          lastEdit: plant.last_edit || null,
          reviewerName: plant.reviewer_name || null,
        };

        const existing = currentByServerId.get(serverId);

        // An edit waiting to be sent from this phone is never overwritten.
        if (existing && existing.status === 'pending') continue;

        if (!existing) {
          await db.runAsync(
            `INSERT INTO plants (
              id, serverId, scientificName, commonName, family, genus, species,
              conservationStatus, height, diameter, latitude, longitude, notes,
              photos, status, approvalStatus, createdAt,
              rejectionReason, lastEdit, reviewerName
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              serverId = excluded.serverId,
              scientificName = excluded.scientificName,
              commonName = excluded.commonName,
              family = excluded.family,
              genus = excluded.genus,
              species = excluded.species,
              conservationStatus = excluded.conservationStatus,
              height = excluded.height,
              diameter = excluded.diameter,
              latitude = excluded.latitude,
              longitude = excluded.longitude,
              notes = excluded.notes,
              photos = excluded.photos,
              approvalStatus = excluded.approvalStatus,
              rejectionReason = excluded.rejectionReason,
              lastEdit = excluded.lastEdit,
              reviewerName = excluded.reviewerName`,
            [
              `cloud-${serverId}`,
              serverId,
              fields.scientificName,
              fields.commonName,
              fields.family,
              fields.genus,
              fields.species,
              fields.conservationStatus,
              fields.height,
              fields.diameter,
              fields.latitude,
              fields.longitude,
              fields.notes,
              fields.photos,
              'synced',
              'Approved',
              plant.created_at || new Date().toISOString(),
              '',
              fields.lastEdit,
              fields.reviewerName,
            ]
          );
          changed = true;
          continue;
        }

        const unchanged =
          existing.scientificName === fields.scientificName &&
          existing.commonName === fields.commonName &&
          existing.family === fields.family &&
          existing.genus === fields.genus &&
          existing.species === fields.species &&
          (existing.conservationStatus || '') === fields.conservationStatus &&
          existing.height === fields.height &&
          existing.diameter === fields.diameter &&
          existing.latitude === fields.latitude &&
          existing.longitude === fields.longitude &&
          existing.notes === fields.notes &&
          existing.photos === fields.photos &&
          existing.approvalStatus === 'Approved' &&
          (existing.rejectionReason || '') === '' &&
          (existing.lastEdit || '') === (fields.lastEdit || '') &&
          (existing.reviewerName || '') === (fields.reviewerName || '');

        if (!unchanged) {
          await db.runAsync(
            `UPDATE plants SET
              scientificName = ?, commonName = ?, family = ?, genus = ?, species = ?, conservationStatus = ?, height = ?,
              diameter = ?, latitude = ?, longitude = ?, notes = ?,
              photos = ?, approvalStatus = ?, rejectionReason = ?,
              lastEdit = ?, reviewerName = ?
            WHERE id = ?`,
            [
              fields.scientificName,
              fields.commonName,
              fields.family,
              fields.genus,
              fields.species,
              fields.conservationStatus,
              fields.height,
              fields.diameter,
              fields.latitude,
              fields.longitude,
              fields.notes,
              fields.photos,
              'Approved',
              '',
              fields.lastEdit,
              fields.reviewerName,
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
      const me = String(getUser()?.id ?? '');
      const due = recordsRef.current.filter((r) => {
        if (r.status !== 'pending') return false;
        // Only the account that made a record sends it. (A record from before
        // the phone remembered owners belongs to whoever is logged in.)
        if (r.ownerId && String(r.ownerId) !== me) return false;
        const retry = retryRef.current[r.id];
        return !retry || now >= retry.nextTry;
      });
      if (due.length === 0) return;

      syncingRef.current = true;

      try {
        for (const record of due) {
          try {
            const sent = await sendRecordToCloud(record);

            await markRecordSent(record.id, sent);
            delete retryRef.current[record.id];
          } catch (e) {
            // An edit for a plant that was deleted from the cloud: forget it.
            if (record.serverId && e.status === 404) {
              await deleteRecord(record.id);
              delete retryRef.current[record.id];
              continue;
            }

            const fails = (retryRef.current[record.id]?.fails || 0) + 1;
            const waitMs = Math.min(5000 * 2 ** fails, 60000);
            retryRef.current[record.id] = { fails, nextTry: Date.now() + waitMs };
            console.log('Sync failed for', record.id, '-', e.message, '- retry in', Math.round(waitMs / 1000), 's');
            setSyncProblem(describeSyncError(e));
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
        updateRecord,
        findRecordById,
        syncApprovedRecords,
        updateRecordStatus,
        deleteRecord,
        isOnline,
        loading,
        syncProblem,
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