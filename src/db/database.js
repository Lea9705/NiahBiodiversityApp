
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
        genus TEXT,
        species TEXT,
        height TEXT,
        diameter TEXT,
        latitude TEXT,
        longitude TEXT,
        notes TEXT,
        photos TEXT,
        status TEXT,
        createdAt TEXT,
        lastEdit TEXT
      );
    `);

    // Add missing columns safely without deleting existing records.
    for (const column of [
      'serverId',
      'approvalStatus',
      'genus',
      'species',
      'rejectionReason',
      'lastEdit',
      'reviewerName',
      'ownerId',
      'conservationStatus',
    ]) {
      try {
        await dbInstance.execAsync(
          `ALTER TABLE plants ADD COLUMN ${column} TEXT;`
        );
      } catch (e) {
        // Column already exists - fine.
      }
    }
  }

  return dbInstance;
}
