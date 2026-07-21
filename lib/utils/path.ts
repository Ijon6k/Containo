/**
 * Pure path utilities — safe to import from both client and server code.
 *
 * Server-side path validation lives in `path-server.ts` because it
 * touches the filesystem and cannot be bundled for the browser.
 */

/**
 * Get the parent path of an absolute path. Returns "/" for top-level paths.
 * Pure string operation — does not touch the filesystem.
 */
export function parentPath(p: string): string {
  if (!p || p === "/") return "/";
  const idx = p.lastIndexOf("/");
  if (idx <= 0) return "/";
  return p.slice(0, idx);
}

/**
 * Sanitize a stack name for use in a file path.
 * Only allows alphanumerics, dash, underscore, and dot.
 */
export function sanitizeStackName(name: string, maxLength = 64): string {
  return (
    name
      .replace(/[^a-zA-Z0-9_\-.]/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, maxLength) || "stack"
  );
}

/**
 * Normalize a path: collapse double slashes, resolve . and .. segments
 * WITHOUT touching the filesystem. Lexical-only normalization.
 */
export function normalizePath(p: string): string {
  const isAbsolute = p.startsWith("/");
  const segments = p.split("/").filter((s) => s.length > 0 && s !== ".");
  const stack: string[] = [];

  for (const seg of segments) {
    if (seg === "..") {
      stack.pop();
    } else {
      stack.push(seg);
    }
  }

  return (isAbsolute ? "/" : "") + stack.join("/");
}

export class PathValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PathValidationError";
  }
}
