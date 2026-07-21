import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { logger } from "@/lib/core/logger";
import { parentPath, PathValidationError } from "@/lib/utils/path";
import { validateBrowsePath } from "@/lib/utils/path-server";

/**
 * Filesystem browser: lists directories and docker-compose files.
 *
 * The Docker image mounts /home from the host, so user project directories
 * are accessible directly. Path validation ensures the client cannot browse
 * privileged subtrees (e.g. /etc, /root) even though "/" itself is browsable.
 *
 * Subtrees listed in BLOCKED_ROOTS are hidden from the directory listing.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  try {
    const targetPath = validateBrowsePath(searchParams.get("path"));

    if (!fs.existsSync(targetPath)) {
      return NextResponse.json({ error: "Directory not found" }, { status: 404 });
    }

    const stat = fs.statSync(targetPath);
    if (!stat.isDirectory()) {
      return NextResponse.json(
        { error: "Path is not a directory" },
        { status: 400 },
      );
    }

    const entries = fs.readdirSync(targetPath, { withFileTypes: true });
    const items = entries
      .filter((entry) => {
        if (entry.name.startsWith(".")) return false;
        const fullPath = path.join(targetPath, entry.name);
        // Hide sensitive subtrees entirely
        const BLOCKED = [
          "/etc", "/root", "/usr", "/bin", "/sbin", "/boot",
          "/sys", "/proc", "/dev", "/var/run",
        ];
        if (BLOCKED.some((b) => fullPath === b || fullPath.startsWith(b + "/"))) {
          return false;
        }
        return entry.isDirectory() || /docker-compose.*\.(yml|yaml)$/.test(entry.name);
      })
      .map((entry) => ({
        name: entry.name,
        path: path.join(targetPath, entry.name),
        isDirectory: entry.isDirectory(),
      }))
      .sort((a, b) => {
        if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

    return NextResponse.json({
      currentPath: targetPath,
      parentPath: parentPath(targetPath),
      items,
    });
  } catch (error) {
    if (error instanceof PathValidationError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    logger.error("API", "Filesystem browse error", error);
    return NextResponse.json(
      { error: "Failed to browse directory" },
      { status: 500 },
    );
  }
}
