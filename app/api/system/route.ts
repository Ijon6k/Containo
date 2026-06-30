import { NextResponse } from "next/server";
import { docker } from "@/lib/core/docker";
import { withErrorHandler } from "@/lib/utils/api-handler";
import { getSystemInfo } from "@/lib/services/docker-service";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async () => {
  const payload = await getSystemInfo();
  return NextResponse.json(payload);
});

export const POST = withErrorHandler(async (request: Request) => {
  const { action } = await request.json();

  if (action === "prune") {
    const results = await Promise.all([
      docker.pruneContainers(),
      docker.pruneImages(),
      docker.pruneVolumes(),
      docker.pruneNetworks(),
    ]);

    return NextResponse.json({
      success: true,
      message: "System pruned successfully",
      results,
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
});
