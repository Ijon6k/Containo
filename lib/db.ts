import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { logger } from "./core/logger";

const dataDir = path.join(process.cwd(), "data");

// Ensure data directory exists with permissive permissions so the host
// user (running docker) can access SQLite and JWT files created inside
// the container.
try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    fs.chmodSync(dataDir, 0o777);
  }
} catch (err) {
  logger.error("DB", "Failed to create data directory", err);
}

const dbPath = process.env.DATABASE_PATH || path.join(dataDir, "containo.db");
logger.info("DB", `Initializing database at: ${dbPath}`);

let db: Database.Database;
try {
  db = new Database(dbPath);
} catch (err) {
  logger.error("DB", "Failed to initialize SQLite", err);
  throw err;
}

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Self-healing: if users exist but the .setup_done flag was deleted
// (e.g. volume mount cleared), recreate it so the setup page is skipped.
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as {
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

export default db;
