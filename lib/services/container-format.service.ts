import { Container } from "../types/index";

/**
 * Format a raw Dockerode container object into the Containo Container type.
 * Shared by both the WebSocket broadcaster and REST API route.
 *
 * Port display:
 *   - Bound ports (PublicPort != null)  →  "80:80"
 *   - Internal ports (PublicPort == null) → "serviceName:port"
 *   - IPv4/IPv6 duplicates are de-duplicated
 */
export function formatContainer(raw: any): Container {
  const serviceName =
    raw.Labels?.["com.docker.compose.service"] ||
    raw.Names?.[0]?.replace(/^\//, "") ||
    "unknown";

  const boundPorts: Array<{ host: number; container: number }> = [];
  const internalPorts: number[] = [];
  const seenPairs = new Set<string>();

  if (raw.Ports) {
    for (const p of raw.Ports) {
      if (p.PublicPort != null) {
        const key = `${p.PublicPort}:${p.PrivatePort}`;
        if (!seenPairs.has(key)) {
          seenPairs.add(key);
          boundPorts.push({ host: p.PublicPort, container: p.PrivatePort });
        }
      } else {
        if (!internalPorts.includes(p.PrivatePort)) {
          internalPorts.push(p.PrivatePort);
        }
      }
    }
  }

  const parts: string[] = [];
  for (const bp of boundPorts) {
    parts.push(`${bp.host}:${bp.container}`);
  }
  for (const ip of internalPorts) {
    parts.push(`${serviceName}:${ip}`);
  }

  let ports = parts.join(", ") || "N/A";

  const networkMode = raw.HostConfig?.NetworkMode || "default";
  if (
    networkMode === "host" &&
    boundPorts.length === 0 &&
    internalPorts.length === 0
  ) {
    ports = "Host Mode";
  }

  return {
    id: raw.Id.substring(0, 12),
    name: raw.Names[0].replace(/^\//, ""),
    image: raw.Image,
    status: raw.State === "running" ? "running" : "exited",
    ports,
    networkMode,
    hostPorts: boundPorts,
    internalPorts,
    composeProject: raw.Labels?.["com.docker.compose.project"],
    composeConfig: raw.Labels?.["com.docker.compose.project.config_files"],
    composeWorkingDir: raw.Labels?.["com.docker.compose.project.working_dir"],
  };
}
