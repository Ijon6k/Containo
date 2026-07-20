import { NextResponse } from "next/server";
import { docker } from "@/lib/core/docker";
import { withErrorHandler } from "@/lib/utils/api-handler";
import { getSystemInfo } from "@/lib/services/docker-service";
import { logger } from "@/lib/core/logger";
import { execSync } from "child_process";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async () => {
  const payload = await getSystemInfo();
  return NextResponse.json(payload);
});

export const POST = withErrorHandler(async (request: Request) => {
  const body = await request.json();
  const { action, options } = body;

  if (!action) {
    return NextResponse.json({ error: "Action is required" }, { status: 400 });
  }

  if (action === "prune") {
    const targets = (options && options.length > 0)
      ? options
      : ["containers", "images", "volumes", "networks"];

    logger.info("API", `System prune started: ${targets.join(", ")}`);

    const pruneOps: Map<string, Promise<any>> = new Map();

    if (targets.includes("containers")) {
      pruneOps.set("containers", docker.pruneContainers());
    }
    if (targets.includes("images")) {
      pruneOps.set("images", docker.pruneImages());
    }
    if (targets.includes("images-all")) {
      pruneOps.set("images-all", docker.pruneImages({ filters: { dangling: { false: true } } }));
    }
    if (targets.includes("volumes")) {
      pruneOps.set("volumes", docker.pruneVolumes());
    }
    if (targets.includes("networks")) {
      pruneOps.set("networks", docker.pruneNetworks());
    }
    if (targets.includes("system")) {
      pruneOps.set("system", new Promise((resolve, reject) => {
        try {
          const out = execSync("docker system prune -af 2>&1", { timeout: 60000 });
          resolve({ message: out.toString().trim() });
        } catch (e: any) {
          resolve({ message: e.stderr || e.message || "" });
        }
      }));
    }
    if (targets.includes("builder")) {
      pruneOps.set("builder", new Promise((resolve, reject) => {
        try {
          const out = execSync("docker builder prune -af 2>&1", { timeout: 60000 });
          resolve({ message: out.toString().trim() });
        } catch (e: any) {
          resolve({ message: e.stderr || e.message || "" });
        }
      }));
    }
    if (targets.includes("buildx")) {
      pruneOps.set("buildx", new Promise((resolve, reject) => {
        try {
          const out = execSync("docker buildx prune -af 2>&1", { timeout: 60000 });
          resolve({ message: out.toString().trim() });
        } catch (e: any) {
          resolve({ message: e.stderr || e.message || "" });
        }
      }));
    }

    const entries = Array.from(pruneOps.entries());
    const results = await Promise.all(entries.map(([, p]) => p));

    const resultMap: Record<string, any> = {};
    entries.forEach(([key], i) => { resultMap[key] = results[i]; });

    logger.success("API", `System prune completed: ${entries.map(([k]) => k).join(", ")}`);
    return NextResponse.json({
      success: true,
      message: `Pruned: ${entries.map(([k]) => k).join(", ")}`,
      results: resultMap,
    });
  }

  return NextResponse.json({ error: `Invalid action: '${action}'` }, { status: 400 });
});
