// A single shared SQLite database file, stored on the phone. Persists
// across app restarts.
import * as SQLite from 'expo-sqlite';

let dbInstance = null;

export async function getDatabase() {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('niah_biodiversity.db');
    await dbInstance.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS plants (
        id TEXT PRIMARY KEY NOT NULL,
        scientificName TEXT,
        commonName TEXT,
        family TEXT,
        height TEXT,
        diameter TEXT,
        latitude TEXT,
        longitude TEXT,
        notes TEXT,
        photos TEXT,
        status TEXT,
        createdAt TEXT
      );
    `);

    // Lightweight migration: the table may already exist on phones that
    // installed an earlier version, without this column. Adding it is
    // safe to attempt every time - it just fails harmlessly if it's
    // already there.
    try {
      await dbInstance.execAsync('ALTER TABLE plants ADD COLUMN serverId TEXT;');
    } catch (e) {
      // Column already exists - fine.
    }
  }
  return dbInstance;
}