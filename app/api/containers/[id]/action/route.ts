import { NextRequest, NextResponse } from "next/server";
import { docker } from "@/lib/core/docker";
import { withErrorHandler } from "@/lib/utils/api-handler";
import { logger } from "@/lib/core/logger";

export const POST = withErrorHandler(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
  ) => {
    const { id } = await params;
    const body = await request.json();
    const action = body.action;
    const ALLOWED = ["start", "stop", "restart", "delete"];

    if (!id) {
      return NextResponse.json(
        { error: "Container ID is required" },
        { status: 400 },
      );
    }
    if (!action || !ALLOWED.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action: expected one of ${ALLOWED.join(", ")}` },
        { status: 400 },
      );
    }

    const container = docker.getContainer(id);
    const containerName = (
      await container.inspect().catch(() => ({ Name: id }))
    ).Name.replace(/^\//, "");

    switch (action) {
      case "start":
        await container.start();
        logger.info("API", `Container '${containerName}' (${id}) started`);
        break;
      case "stop":
        await container.stop();
        logger.info("API", `Container '${containerName}' (${id}) stopped`);
        break;
      case "restart":
        await container.restart();
        logger.info("API", `Container '${containerName}' (${id}) restarted`);
        break;
      case "delete":
        await container.remove({ force: true });
        logger.info("API", `Container '${containerName}' (${id}) deleted`);
        break;
    }

    return NextResponse.json({ success: true, action });
  },
);
