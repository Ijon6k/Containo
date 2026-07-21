import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { logger } from "@/lib/core/logger";

// Filesystem browser: lists directories and docker-compose files.
// Volume mount /home:/home makes host paths directly accessible.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  let targetPath = searchParams.get("path");
  if (!targetPath || targetPath === "undefined") {
    targetPath = os.homedir();
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
        path: path.join(targetPath, item.name),
        isDirectory: item.isDirectory(),
      }))
      .sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });

    return NextResponse.json({
      currentPath: targetPath,
      parentPath: targetPath === "/" ? "/" : path.dirname(targetPath),
      items: formattedItems,
    });
  } catch (error: any) {
    logger.error("API", `Filesystem browse error for '${targetPath}'`, error);
    return NextResponse.json(
      { error: "Failed to browse directory" },
      { status: 500 },
    );
  }
}
