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

    // Older installs may not have this column. Adding it is safe to try
    // every time; it fails harmlessly if it already exists.
    try {
      await dbInstance.execAsync('ALTER TABLE plants ADD COLUMN serverId TEXT;');
    } catch (e) {
      // Column already exists - fine.
    }

    try {
      await dbInstance.execAsync(
        'ALTER TABLE plants ADD COLUMN approvalStatus TEXT;'
      );
    } catch (e) {
      // Column already exists - fine.
    }

    // The note written when a record is rejected, the time of its last edit
    // and the name of the person who reviewed it. Also the account that
    // made the record, so another account on the same phone never sends it.
    for (const column of ['genus', 'species', 'rejectionReason', 'lastEdit', 'reviewerName', 'ownerId']) {
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