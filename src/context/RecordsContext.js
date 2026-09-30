// A simple in-memory store shared across the app for this session.
// Records added here are NOT saved to disk - restarting the app clears
// them. This is a lightweight placeholder until real offline storage
// (SQLite/WatermelonDB) is built.
import React, { createContext, useContext, useState } from 'react';

const RecordsContext = createContext(null);

export function RecordsProvider({ children }) {
  const [records, setRecords] = useState([]);

  const addRecord = (record) => {
    setRecords((current) => [...current, record]);
  };

  const findRecordById = (id) => records.find((r) => r.id === id);

  return (
    <RecordsContext.Provider value={{ records, addRecord, findRecordById }}>
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