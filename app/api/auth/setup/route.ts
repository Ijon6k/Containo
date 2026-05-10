import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function GET() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  return NextResponse.json({ setupNeeded: userCount.count === 0 });
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Check if setup is actually needed
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    if (userCount.count > 0) {
      return NextResponse.json({ error: 'Setup already completed' }, { status: 400 });
    }

    if (!username || !password || password.length < 4) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hashedPassword);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
