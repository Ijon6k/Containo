import { Container } from "../types/index";

/**
 * Format a raw Dockerode container object into the Containo Container type.
 * Shared by both the WebSocket broadcaster and REST API route.
 */
export function formatContainer(raw: any): Container {
  // Ports may be null for containers without published ports
  let ports =
    raw.Ports?.map(
      (p: any) => `${p.PublicPort || p.PrivatePort}:${p.PrivatePort}`,
    ).join(", ") || "N/A";
  const networkMode = raw.HostConfig?.NetworkMode || "default";
  if (networkMode === "host" && ports === "N/A") {
    ports = "Host Mode";
  }

  return {
    id: raw.Id.substring(0, 12),
    name: raw.Names[0].replace(/^\//, ""),
    image: raw.Image,
    status: raw.State === "running" ? "running" : "exited",
    ports,
    networkMode,
    composeProject: raw.Labels?.["com.docker.compose.project"],
    composeService: raw.Labels?.["com.docker.compose.service"],
    composeConfig: raw.Labels?.["com.docker.compose.project.config_files"],
    composeWorkingDir: raw.Labels?.["com.docker.compose.project.working_dir"],
  };
}
