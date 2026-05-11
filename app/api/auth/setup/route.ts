import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { hashPassword } from '@/lib/auth/index';
import fs from 'fs';
import path from 'path';

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

    if (!username || username.trim().length < 3) {
      return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    if (password.includes(' ')) {
      return NextResponse.json({ error: 'Password cannot contain spaces' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hashedPassword);
    
    // Create setup flag file for middleware
    const flagPath = path.join(process.cwd(), 'data', '.setup_done');
    fs.writeFileSync(flagPath, 'done');
    fs.chmodSync(flagPath, 0o666);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
