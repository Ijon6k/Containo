import fs from "fs";

/**
 * Translate user-facing path to container mount point.
 * /home/foo → /host/foo (when /host exists)
 */
export function toContainerPath(p: string): string {
  if (fs.existsSync("/host") && p.startsWith("/home")) {
    return "/host" + p.slice(5);
  }
  return p;
}

/**
 * Reverse translation for Docker daemon (host perspective).
 * /host/foo → /home/foo
 */
export function toHostPath(p: string): string {
  if (p.startsWith("/host")) return "/home" + p.slice(5);
  return p;
}

/**
 * For UI display: /host → /home (alias of toHostPath)
 */
export function toDisplayPath(p: string): string {
  return toHostPath(p);
}

/**
 * Resolve relative volume mounts (./data:/app) to absolute paths
 * so Docker Compose resolves them correctly from inside the container.
 */
export function fixVolumePaths(yaml: string, hostDir: string): string {
  return yaml.replace(/^(\s*)-\s*\.\//gm, `$1- ${hostDir}/`);
}
