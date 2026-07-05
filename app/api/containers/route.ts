import { NextResponse } from "next/server";
import { docker } from "@/lib/core/docker";
import { Container } from "@/lib/types";
import { withErrorHandler } from "@/lib/utils/api-handler";
import { formatContainer } from "@/lib/services/container-format.service";
import { logger } from "@/lib/core/logger";

export const dynamic = "force-dynamic";

// Lists all containers (running + stopped), excluding internal helper
// containers marked with the label "containo.internal".
export const GET = withErrorHandler(async () => {
  const containers = await docker.listContainers({ all: true });

  const visibleContainers = containers.filter(
    (c: any) => c.Labels?.["containo.internal"] !== "true",
  );

  const formattedContainers: Container[] = visibleContainers.map((c: any) => {
    const base = formatContainer(c);
    const exposedPorts = c.Ports ? c.Ports.map((p: any) => p.PrivatePort) : [];
    return {
      ...base,
      logs: [],
      exposedPorts: Array.from(new Set(exposedPorts)) as number[],
    };
  });

  return NextResponse.json(formattedContainers);
});

// Creates and starts a new container from the given image, ports,
// environment variables, volume bindings, and restart policy.
export const POST = withErrorHandler(async (request: Request) => {
  const body = await request.json();
  const { name, image, ports, env, volumes, restartPolicy } = body;

  // Validate required fields
  if (!image || !image.trim()) {
    return NextResponse.json(
      { error: "Image name is required" },
      { status: 400 },
    );
  }
  if (ports && !/^\d+(:\d+)?$/.test(ports)) {
    return NextResponse.json(
      { error: "Port format invalid — expected '8080' or '8080:80'" },
      { status: 400 },
    );
  }

  // Parse port mapping: "8080:80" → Docker port binding format
  const portBindings: any = {};
  const exposedPorts: any = {};

  if (ports) {
    const [hostPort, containerPort] = ports.split(":");
    const cPort = containerPort || hostPort;
    const hPort = hostPort;
    exposedPorts[`${cPort}/tcp`] = {};
    portBindings[`${cPort}/tcp`] = [{ HostPort: hPort }];
  }

  // Parse env vars: newline-separated "KEY=VALUE" pairs
  const envArray = env ? env.split("\n").filter(Boolean) : [];

  // Parse volumes: newline-separated "/host:/container" bind mounts
  const volumeArray = volumes ? volumes.split("\n").filter(Boolean) : [];

  logger.info(
    "API",
    `Creating container '${name || "unnamed"}' from image ${image}`,
  );
  const container = await docker.createContainer({
    Image: image,
    name: name || undefined,
    ExposedPorts: exposedPorts,
    HostConfig: {
      PortBindings: portBindings,
      Binds: volumeArray,
      RestartPolicy: { Name: restartPolicy || "unless-stopped" },
    },
    Env: envArray,
  });

  await container.start();
  const shortId = container.id.substring(0, 12);
  logger.success(
    "API",
    `Container '${name || shortId}' created (${shortId}, image: ${image})`,
  );

  return NextResponse.json({
    success: true,
    id: shortId,
    message: "Container created and started",
  });
});
