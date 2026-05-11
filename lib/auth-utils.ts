import { jwtVerify, JWTPayload } from 'jose';
import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
import { logger } from './logger';

const DEFAULT_SECRET = 'containo-super-secret-key-change-this-in-production';
const SECRET_FILE_PATH = path.join(process.cwd(), 'data', '.jwt_secret');

export function getJwtSecret() {
  // 1. Priority: Environment Variable
  let secret = process.env.JWT_SECRET;
  
  if (secret) return new TextEncoder().encode(secret);

  // 2. Priority: Persistent File
  try {
    if (fs.existsSync(SECRET_FILE_PATH)) {
      secret = fs.readFileSync(SECRET_FILE_PATH, 'utf8').trim();
      return new TextEncoder().encode(secret);
    }
  } catch (e) {}

  // 3. Priority: Auto-Generate (Zero-Config)
  try {
    const newSecret = randomBytes(32).toString('hex');
    const dataDir = path.dirname(SECRET_FILE_PATH);
    
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(SECRET_FILE_PATH, newSecret, 'utf8');
    logger.success('SECURITY', 'No JWT_SECRET provided. Generated a new random secret and saved it to data/.jwt_secret');
    return new TextEncoder().encode(newSecret);
  } catch (e) {
    // Fallback for extreme cases (e.g. read-only filesystem)
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CRITICAL: Could not generate or read JWT_SECRET!');
    }
    return new TextEncoder().encode(DEFAULT_SECRET);
  }
}

export interface SessionPayload extends JWTPayload {
  userId: number;
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as SessionPayload;
  } catch (err) {
    return null;
  }
}
