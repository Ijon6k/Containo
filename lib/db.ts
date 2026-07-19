import { Database } from "bun:sqlite";
import path from "path";
import fs from "fs";
import { logger } from "./core/logger";

const dataDir = path.join(process.cwd(), "data");
const dbPath = process.env.DATABASE_PATH || path.join(dataDir, "containo.db");

let _db: Database | null = null;

function getDb(): Database {
  if (_db) return _db;

  // Ensure data directory exists
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      fs.chmodSync(dataDir, 0o777);
    }
  } catch (err) {
    logger.error("DB", "Failed to create data directory", err);
  }

  logger.info("DB", `Initializing database at: ${dbPath}`);

  try {
    _db = new Database(dbPath, { strict: true });
  } catch (err) {
    logger.error("DB", "Failed to initialize SQLite", err);
    throw err;
  }

  // Enable WAL mode for better concurrent read performance
  _db.exec("PRAGMA journal_mode = WAL;");

  // Initialize database schema
  _db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Self-healing: if users exist but the .setup_done flag was deleted
  const userCount = _db.query("SELECT COUNT(*) as count FROM users").get() as {
    count: number;
  };
  const flagPath = path.join(dataDir, ".setup_done");
  if (userCount.count > 0 && !fs.existsSync(flagPath)) {
    fs.writeFileSync(flagPath, "done");
    fs.chmodSync(flagPath, 0o666);
    logger.info(
      "DB",
      `Self-healing: recreated setup flag (${userCount.count} user(s) exist)`,
    );
  }

  // Ensure the DB file is accessible to the host user
  try {
    fs.chmodSync(dbPath, 0o666);
  } catch (e) {}

  return _db;
}

// Export a Proxy to maintain backward-compatible db.prepare() / db.exec() API
// while lazily initializing the real Database on first access.
const db = new Proxy({} as Database, {
  get(_target, prop) {
    const real = getDb();
    const value = (real as any)[prop];
    if (typeof value === "function") {
      return value.bind(real);
    }
    return value;
  },
});

export default db;
