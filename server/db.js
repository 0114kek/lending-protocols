import fs from 'fs';
import Database from 'better-sqlite3';

const dbDir = './server/data';
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(`${dbDir}/protocols.db`);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    protocol TEXT NOT NULL,
    date INTEGER NOT NULL,
    tvl REAL,
    fees REAL,
    revenue REAL,
    UNIQUE(protocol, date)
  );
`);

export default db;
