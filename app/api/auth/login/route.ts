import { NextResponse } from "next/server";
import db from "@/lib/db";
import { comparePassword, createSession } from "@/lib/auth/index";
import { logger } from "@/lib/core/logger";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 },
      );
    }

    const user = db
      .query("SELECT * FROM users WHERE username = ?1")
      .get(username) as any;

    if (!user) {
      logger.warn("AUTH", `Login failed: unknown user '${username}'`);
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 },
      );
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      logger.warn("AUTH", `Login failed: wrong password for '${username}'`);
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 },
      );
    }

    await createSession(user.id);
    logger.success("AUTH", `User '${username}' logged in`);

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("AUTH", "Login error", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
