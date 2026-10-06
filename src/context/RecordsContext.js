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

  // If online, reserve the sync lock before saving so the
  // background sync cannot upload this same record at the same time.
  if (isOnlineRef.current) {
    syncingRef.current = true;
  }

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

    setRecords((current) => [
      localRecord,
      ...current,
    ]);

    // If already online, sync immediately.
    if (isOnlineRef.current) {
      try {
        await syncRecordToCloud(localRecord);
        await updateRecordStatus(record.id, 'synced');
        delete retryRef.current[record.id];
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
    syncingRef.current = false;
  }
};

  const findRecordById = (id) => records.find((r) => r.id === id);

  const updateRecordStatus = async (id, status) => {
    const db = await getDatabase();
    await db.runAsync('UPDATE plants SET status = ? WHERE id = ?', [status, id]);
    setRecords((current) => current.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  //temporarily
  const deleteRecord = async (id) => {
  const db = await getDatabase();

  await db.runAsync(
    'DELETE FROM plants WHERE id = ?',
    [id]
  );

  setRecords((current) =>
    current.filter((r) => r.id !== id)
  );
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

      for (const record of due) {
        try {
          await syncRecordToCloud(record);
          await updateRecordStatus(record.id, 'synced');
          delete retryRef.current[record.id];
        } catch (e) {
          const fails = (retryRef.current[record.id]?.fails || 0) + 1;
          const waitMs = Math.min(5000 * 2 ** fails, 60000);
          retryRef.current[record.id] = { fails, nextTry: Date.now() + waitMs };
          console.log('Sync failed for', record.id, '-', e.message, '- retry in', Math.round(waitMs / 1000), 's');
        }
      }

      syncingRef.current = false;
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <RecordsContext.Provider
      value={{
        records,
        addRecord,
        findRecordById,
        updateRecordStatus,
        deleteRecord,
        isOnline,
        loading
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