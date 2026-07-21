import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { logger } from "@/lib/core/logger";
import { parentPath, PathValidationError } from "@/lib/utils/path";
import { validateBrowsePath } from "@/lib/utils/path-server";

/**
 * Filesystem browser: lists directories and docker-compose files.
 *
 * The Docker image mounts the host's home directory to /home, so user
 * project directories are accessible directly. Path validation ensures
 * the client cannot browse privileged subtrees (e.g. /etc, /root) even
 * though "/" itself is browsable.
 *
 * On WSL, the mount path /home:/home must match the WSL user's $HOME
 * (e.g. /home/<wsluser>). If you use Windows home, mount it explicitly
 * via the HOST_HOME_DIR env var, e.g.:
 *   docker run -e HOST_HOME_DIR=/mnt/c/Users/<winuser> ...
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  try {
    const targetPath = validateBrowsePath(searchParams.get("path"));

    // Step 1: existence check
    let exists = false;
    try {
      exists = fs.existsSync(targetPath);
    } catch (err: any) {
      logger.error("API", `existsSync failed for '${targetPath}': ${err.code} ${err.message}`);
      return NextResponse.json(
        {
          error: `Cannot access path '${targetPath}': ${err.code ?? err.message}`,
          hint: "If running under WSL, ensure /home is mounted from the host.",
        },
        { status: 500 },
      );
    }
    if (!exists) {
      return NextResponse.json(
        { error: `Directory not found: '${targetPath}'` },
        { status: 404 },
      );
    }

    // Step 2: stat check (separately to give better error on permission denied)
    let stat;
    try {
      stat = fs.statSync(targetPath);
    } catch (err: any) {
      logger.error("API", `statSync failed for '${targetPath}': ${err.code} ${err.message}`);
      return NextResponse.json(
        {
          error: `Cannot stat path '${targetPath}': ${err.code ?? err.message}`,
          hint: err.code === "EACCES"
            ? "Permission denied. Check the user mapping between host and container."
            : undefined,
        },
        { status: 500 },
      );
    }
    if (!stat.isDirectory()) {
      return NextResponse.json(
        { error: `Path is not a directory: '${targetPath}'` },
        { status: 400 },
      );
    }

    // Step 3: listing
    let entries;
    try {
      entries = fs.readdirSync(targetPath, { withFileTypes: true });
    } catch (err: any) {
      logger.error("API", `readdirSync failed for '${targetPath}': ${err.code} ${err.message}`);
      return NextResponse.json(
        {
          error: `Cannot list directory '${targetPath}': ${err.code ?? err.message}`,
          hint: err.code === "EACCES"
            ? "Permission denied. The container user may not have read access."
            : undefined,
        },
        { status: 500 },
      );
    }

    const BLOCKED = [
      "/etc", "/root", "/usr", "/bin", "/sbin", "/boot",
      "/sys", "/proc", "/dev", "/var/run",
    ];

    const items = entries
      .filter((entry) => {
        if (entry.name.startsWith(".")) return false;
        const fullPath = path.join(targetPath, entry.name);
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
      {
        error: "Failed to browse directory",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
