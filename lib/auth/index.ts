import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { getJwtSecret, verifySession } from './utils';


export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}

export async function createSession(userId: number) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecret());

  const cookieStore = await cookies();
  cookieStore.set('containo_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });

  return token;
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('containo_session')?.value;
  if (!token) return null;

  try {
    return await verifySession(token);
  } catch (err) {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('containo_session');
}
