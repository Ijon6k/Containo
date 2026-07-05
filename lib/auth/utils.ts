import { jwtVerify, JWTPayload } from "jose";
import fs from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { logger } from "../core/logger";

const DEFAULT_SECRET = "containo-super-secret-key-change-this-in-production";
const SECRET_FILE_PATH = path.join(process.cwd(), "data", ".jwt_secret");

// Cached JWT secret (Uint8Array for jose) — avoids re-reading file on every request
let _cached: Uint8Array | null = null;

// Resolves JWT secret with three-tier fallback:
//   1. JWT_SECRET env var (explicit)
//   2. data/.jwt_secret file (auto-generated, persisted)
//   3. Auto-generate new secret (zero-config first run)
// Falls back to hardcoded default only in development.
export function getJwtSecret() {
  if (_cached) return _cached;

  // 1. Priority: Environment Variable
  let secret = process.env.JWT_SECRET;

  if (secret) {
    _cached = new TextEncoder().encode(secret);
    return _cached;
  }

  // 2. Priority: Persistent File
  try {
    if (fs.existsSync(SECRET_FILE_PATH)) {
      secret = fs.readFileSync(SECRET_FILE_PATH, "utf8").trim();
      _cached = new TextEncoder().encode(secret);
      return _cached;
    }
  } catch (e) {}

  // 3. Priority: Auto-Generate (Zero-Config)
  try {
    const newSecret = randomBytes(32).toString("hex");
    const dataDir = path.dirname(SECRET_FILE_PATH);

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(SECRET_FILE_PATH, newSecret, "utf8");
    logger.success(
      "SECURITY",
      "No JWT_SECRET provided. Generated a new random secret and saved it to data/.jwt_secret",
    );
    _cached = new TextEncoder().encode(newSecret);
    return _cached;
  } catch (e) {
    // Read-only filesystem fallback — refuse in production
    if (process.env.NODE_ENV === "production") {
      throw new Error("CRITICAL: Could not generate or read JWT_SECRET!");
    }
    _cached = new TextEncoder().encode(DEFAULT_SECRET);
    return _cached;
  }
}

export interface SessionPayload extends JWTPayload {
  userId: number;
}

export async function verifySession(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as SessionPayload;
  } catch (err) {
    return null;
  }
}
