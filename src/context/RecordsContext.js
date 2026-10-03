// Records are now stored permanently in SQLite, on the phone itself -
// they survive closing the app, restarting the phone, everything.
// The public interface (records, addRecord, findRecordById) stays
// exactly the same as the old in-memory version, so no other screen
// needs to change.
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDatabase } from '../db/database';

const RecordsContext = createContext(null);

export function RecordsProvider({ children }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <RecordsContext.Provider value={{ records, addRecord, findRecordById, updateRecordStatus, loading }}>
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