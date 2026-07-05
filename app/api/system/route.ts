import { NextResponse } from "next/server";
import { docker } from "@/lib/core/docker";
import { withErrorHandler } from "@/lib/utils/api-handler";
import { getSystemInfo } from "@/lib/services/docker-service";
import { logger } from "@/lib/core/logger";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async () => {
  const payload = await getSystemInfo();
  return NextResponse.json(payload);
});

export const POST = withErrorHandler(async (request: Request) => {
  const { action } = await request.json();

  if (!action) {
    return NextResponse.json({ error: "Action is required" }, { status: 400 });
  }

  if (action === "prune") {
    logger.info("API", "System prune started");
    const results = await Promise.all([
      docker.pruneContainers(),
      docker.pruneImages(),
      docker.pruneVolumes(),
      docker.pruneNetworks(),
    ]);

    logger.success("API", "System prune completed");
    return NextResponse.json({
      success: true,
      message: "System pruned successfully",
      results,
    });
  }

  return NextResponse.json(
    { error: `Invalid action: '${action}'` },
    { status: 400 },
  );
});
