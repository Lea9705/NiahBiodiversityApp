// Records are stored permanently in SQLite, on the phone itself. This
// context also watches the device's network status and automatically
// retries any "pending" record in the background, waiting longer
// between tries when a record keeps failing.
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { getDatabase } from '../db/database';
import { syncRecordToCloud } from '../utils/syncRecord';

const RecordsContext = createContext(null);

export function RecordsProvider({ children }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);

  const isOnlineRef = useRef(false);
  const syncingRef = useRef(false);
  const recordsRef = useRef([]);
  const retryRef = useRef({}); // record id -> { fails, nextTry }

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

  // Download approved records whenever internet is available.
  useEffect(() => {
    if (!isOnline || loading) return;

    syncApprovedRecords().catch((error) => {
      console.log('Approved records sync failed:', error.message);
    });
  }, [isOnline, loading]);

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

  const findRecordById = (id) =>
  records.find(
    (r) =>
      String(r.id) === String(id) ||
      String(r.serverId) === String(id)
  );


const syncApprovedRecords = async () => {
  const db = await getDatabase();

  const response = await fetch('http://52.62.125.146/api/plants');

  if (!response.ok) {
    throw new Error(`Failed to fetch plants: ${response.status}`);
  }

  const data = await response.json();

  const approvedPlants = data.filter(
    (plant) =>
      String(plant.plant_status || '').trim().toLowerCase() === 'approved'
  );

  for (const plant of approvedPlants) {
    const serverId = String(plant.id);

    const existing = await db.getFirstAsync(
      'SELECT id FROM plants WHERE serverId = ?',
      [serverId]
    );

    const localId = existing?.id || `cloud-${serverId}`;

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
        localId,
        serverId,
        plant.scientific_name || '',
        plant.common_name || '',
        plant.family || '',
        plant.height_m != null ? String(plant.height_m) : '',
        plant.diameter_cm != null ? String(plant.diameter_cm) : '',
        plant.latitude != null ? String(plant.latitude) : '',
        plant.longitude != null ? String(plant.longitude) : '',
        plant.morphological_notes || '',
        JSON.stringify(
          Array.isArray(plant.images) ? plant.images : []
        ),
        'synced',
        'Approved',
        plant.created_at || new Date().toISOString(),
      ]
    );
  }

  const rows = await db.getAllAsync(
    'SELECT * FROM plants ORDER BY createdAt DESC'
  );

  setRecords(
    rows.map((r) => ({
      ...r,
      photos: JSON.parse(r.photos || '[]'),
    }))
  );
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
      if (!isOnlineRef.current || syncingRef.current) return;

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