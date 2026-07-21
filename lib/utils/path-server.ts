/**
 * Server-only path validation utilities.
 *
 * Imports `fs` and `os`, so this module can only be loaded from
 * server components, route handlers, or other Node.js contexts.
 * Client code should import from `path.ts` instead.
 */

import os from "os";
import fs from "fs";
import {
  normalizePath,
  PathValidationError,
} from "./path";

/**
 * Whitelist of directories that the DirectoryPicker is allowed to browse.
 * Includes "/" as an entry point — listing is then filtered against
 * BLOCKED_ROOTS so sensitive subdirs are hidden.
 */
const ALLOWED_ROOTS = ["/", "/home", "/srv", "/opt", "/var/lib"];

/**
 * Directories that must never appear in the listing or be navigated to.
 */
const BLOCKED_ROOTS = [
  "/etc",
  "/root",
  "/usr",
  "/bin",
  "/sbin",
  "/boot",
  "/sys",
  "/proc",
  "/dev",
  "/var/run",
];

/**
 * Validate that a user-supplied path is safe to read.
 *
 * Rules:
 *   1. Must be a non-empty string with no control characters
 *   2. Must be an absolute path
 *   3. Must resolve inside one of ALLOWED_ROOTS, and not inside BLOCKED_ROOTS
 *
 * Returns the validated absolute path, or throws if invalid.
 */
export function validateBrowsePath(inputPath: string | null | undefined): string {
  if (!inputPath || inputPath === "undefined" || inputPath.trim() === "") {
    return resolveDefaultPath();
  }

  if (typeof inputPath !== "string" || inputPath.length === 0) {
    throw new PathValidationError("Path must be a non-empty string");
  }

  if (/[\x00-\x1f]/.test(inputPath)) {
    throw new PathValidationError("Path contains invalid characters");
  }

  if (!inputPath.startsWith("/")) {
    throw new PathValidationError("Path must be absolute");
  }

  const normalized = normalizePath(inputPath);

  const isAllowed = ALLOWED_ROOTS.some(
    (root) => normalized === root || normalized.startsWith(root + "/"),
  );
  if (!isAllowed) {
    throw new PathValidationError(
      `Path '${normalized}' is outside allowed directories`,
    );
  }

  const isBlocked = BLOCKED_ROOTS.some(
    (blocked) => normalized === blocked || normalized.startsWith(blocked + "/"),
  );
  if (isBlocked) {
    throw new PathValidationError(
      `Path '${normalized}' is in a protected subtree`,
    );
  }

  return normalized;
}

/**
 * Validate that a user-supplied path is safe for writing (deploying compose).
 * Stricter than validateBrowsePath: writing only allowed under writable roots.
 */
export function validateDeployPath(inputPath: string): string {
  if (!inputPath) {
    throw new PathValidationError("Deploy path is required");
  }

  if (/[\x00-\x1f]/.test(inputPath)) {
    throw new PathValidationError("Path contains invalid characters");
  }

  if (!inputPath.startsWith("/")) {
    throw new PathValidationError("Deploy path must be absolute");
  }

  const normalized = normalizePath(inputPath);

  const WRITE_BLOCKED = [
    ...BLOCKED_ROOTS,
    "/var/lib/docker",
    "/lib",
    "/lib64",
    "/mnt",
    "/media",
    "/tmp",
  ];

  for (const blocked of WRITE_BLOCKED) {
    if (normalized === blocked || normalized.startsWith(blocked + "/")) {
      throw new PathValidationError(
        `Cannot deploy to '${normalized}': protected directory`,
      );
    }
  }

  const WRITABLE_ROOTS = ["/home", "/srv", "/opt", "/var/lib"];
  const isWritable = WRITABLE_ROOTS.some(
    (root) => normalized === root || normalized.startsWith(root + "/"),
  );
  if (!isWritable) {
    throw new PathValidationError(
      `Deploy path '${normalized}' is not in a writable directory`,
    );
  }

  return normalized;
}

/**
 * Pick a default starting directory for the picker when the client
 * doesn't specify one. Walks through candidates:
 *   1. User's home directory (os.homedir())
 *   2. /home (commonly mounted from host)
 *   3. / (root)
 *
 * The first one that exists wins. This handles the case where the
 * container's home dir doesn't exist (e.g. /home/bun when /home
 * is mounted from the host and only contains /home/<hostuser>).
 */
function resolveDefaultPath(): string {
  const candidates = [os.homedir(), "/home", "/"];
  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
        return candidate;
      }
    } catch {
      // ignore stat errors and try the next candidate
    }
  }
  return "/";
}
