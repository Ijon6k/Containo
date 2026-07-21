/**
 * ID generator for client-side entities (services, networks, volumes, etc).
 *
 * Replaces the fragile `useRef<number>` counter pattern which:
 *   - Resets to its starting value on component remount
 *   - Can collide across multiple ComposeBuilder instances
 *
 * Uses crypto.randomUUID() when available (modern browsers, all Node 19+),
 * falls back to a time + random ID for older environments.
 */

const ID_PREFIX = {
  service: "svc",
  network: "net",
  volume: "vol",
} as const;

export type IDKind = keyof typeof ID_PREFIX;

/**
 * Generate a unique ID for the given entity kind.
 *
 * @example
 *   generateId("service")  // → "svc-9f1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d"
 */
export function generateId(kind: IDKind): string {
  const prefix = ID_PREFIX[kind];
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
