import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

// ponytail: /home → /host for file operations (container mount)
function toContainerPath(p: string): string {
  if (fs.existsSync("/host") && p.startsWith("/home")) {
    return "/host" + p.slice(5);
  }
  return p;
}

// ponytail: /host → /home for display (user-friendly)
function toDisplayPath(p: string): string {
  if (p.startsWith("/host")) return "/home" + p.slice(5);
  return p;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  let defaultPath = "/host";
  if (!fs.existsSync("/host")) {
    defaultPath = os.homedir();
  }

  let targetPath = searchParams.get("path");
  if (!targetPath || targetPath === "undefined") {
    targetPath = defaultPath;
  }

  targetPath = toContainerPath(targetPath);

  if (targetPath === "/" && fs.existsSync("/host")) {
    targetPath = "/host";
  }

  try {
    if (!fs.existsSync(targetPath)) {
      return NextResponse.json(
        { error: "Directory not found" },
        { status: 404 },
      );
    }
    const stat = fs.statSync(targetPath);
    if (!stat.isDirectory()) {
      return NextResponse.json(
        { error: "Path is not a directory" },
        { status: 400 },
      );
    }
    const items = fs.readdirSync(targetPath, { withFileTypes: true });
    const formattedItems = items
      .filter((item) => {
        if (item.name.startsWith(".")) return false;
        return item.isDirectory() || item.name.includes("docker-compose");
      })
      .map((item) => ({
        name: item.name,
        path: toDisplayPath(path.join(targetPath, item.name)),
        isDirectory: item.isDirectory(),
      }))
      .sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });

    return NextResponse.json({
      currentPath: toDisplayPath(targetPath),
      parentPath:
        targetPath === "/" ? "/" : toDisplayPath(path.dirname(targetPath)),
      items: formattedItems,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
