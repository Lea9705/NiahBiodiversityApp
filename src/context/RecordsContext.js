// Records are stored permanently in SQLite, on the phone itself. This
// context also watches the device's real network status and
// automatically retries any "pending" record in the background whenever
// a connection is available - no manual button needed.
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

  useEffect(() => {
    recordsRef.current = records;
  }, [records]);

  useEffect(() => {
    (async () => {
      const db = await getDatabase();
      const rows = await db.getAllAsync('SELECT * FROM plants ORDER BY createdAt DESC');
      const parsed = rows.map((r) => ({ ...r, photos: JSON.parse(r.photos || '[]') }));
      setRecords(parsed);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = !!state.isConnected && state.isInternetReachable !== false;
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
      status: record.status || 'pending',
      createdAt: record.createdAt || new Date().toISOString(),
    };

    await db.runAsync(
      `INSERT INTO plants (id, scientificName, commonName, family, height, diameter, latitude, longitude, notes, photos, status, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        toSave.id, toSave.scientificName, toSave.commonName, toSave.family,
        toSave.height, toSave.diameter, toSave.latitude, toSave.longitude,
        toSave.notes, toSave.photos, toSave.status, toSave.createdAt,
      ]
    );

    setRecords((current) => [{ ...record, photos: record.photos || [] }, ...current]);
  };

  const findRecordById = (id) => records.find((r) => r.id === id);

  const updateRecordStatus = async (id, status) => {
    const db = await getDatabase();
    await db.runAsync('UPDATE plants SET status = ? WHERE id = ?', [status, id]);
    setRecords((current) => current.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (!isOnlineRef.current || syncingRef.current) return;

      const pending = recordsRef.current.filter((r) => r.status === 'pending');
      if (pending.length === 0) return;

      syncingRef.current = true;

      for (const record of pending) {
        try {
          await syncRecordToCloud(record);
          await updateRecordStatus(record.id, 'synced');
        } catch (e) {
          console.log('Background sync failed for', record.id, e.message);
        }
      }

      syncingRef.current = false;
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <RecordsContext.Provider
      value={{ records, addRecord, findRecordById, updateRecordStatus, isOnline, loading }}
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