import Database from 'better-sqlite3';
import path from 'path';

import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');

try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    // Make directory accessible to host user
    fs.chmodSync(dataDir, 0o777);
  }
} catch (err) {
  console.error('Failed to create data directory:', err);
}

const dbPath = process.env.DATABASE_PATH || path.join(dataDir, 'containo.db');
console.log('Initializing database at:', dbPath);

let db: any;
try {
  db = new Database(dbPath);
} catch (err) {
  console.error('FAILED TO INITIALIZE SQLITE:', err);
  throw err;
}

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Self-healing: Create setup flag if users exist
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
const flagPath = path.join(dataDir, '.setup_done');
if (userCount.count > 0 && !fs.existsSync(flagPath)) {
  fs.writeFileSync(flagPath, 'done');
  fs.chmodSync(flagPath, 0o666);
}

// Ensure the DB file itself is accessible to host user
try {
  fs.chmodSync(dbPath, 0o666);
} catch (e) {}

export default db;
