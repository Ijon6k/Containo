/**
 * NDJSON (newline-delimited JSON) stream helpers.
 *
 * Used by SSE-style deployment streams. Centralized here to avoid
 * duplicated buffering logic across routes and hooks.
 */

import type { ReadableStreamDefaultController } from "stream/web";

const encoder = new TextEncoder();

/**
 * Encode a JSON message as a single NDJSON line.
 * NDJSON format: each message is a complete JSON object followed by \n.
 */
export function encodeNDJSON(message: Record<string, unknown>): Uint8Array {
  return encoder.encode(JSON.stringify(message) + "\n");
}

/**
 * Helper for route handlers — creates a `send` function that emits
 * NDJSON-encoded messages into the stream controller.
 */
export function createSender(
  controller: ReadableStreamDefaultController<Uint8Array>,
) {
  return (message: Record<string, unknown>) => {
    controller.enqueue(encodeNDJSON(message));
  };
}

/**
 * Incrementally buffer a chunk of NDJSON bytes and emit parsed messages.
 *
 * Handles the edge case where a chunk boundary splits a JSON line in half —
 * the partial line is buffered and prepended to the next chunk.
 *
 * @param buffer   persistent buffer (caller owns)
 * @param chunk    new bytes to add
 * @param onMessage called for each complete parsed line
 */
export function consumeNDJSONChunk(
  buffer: string,
  chunk: string,
  onMessage: (parsed: any, raw: string) => void,
): string {
  const combined = buffer + chunk;
  const lines = combined.split("\n");
  const remaining = lines.pop() ?? "";

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      onMessage(JSON.parse(line), line);
    } catch {
      // Non-JSON line: still forward as raw for log display
      onMessage(null, line);
    }
  }

  return remaining;
}

/**
 * Flush any remaining content in the buffer at stream end.
 */
export function flushNDJSONBuffer(
  buffer: string,
  onMessage: (parsed: any, raw: string) => void,
) {
  const remaining = buffer.trim();
  if (!remaining) return;
  try {
    onMessage(JSON.parse(remaining), remaining);
  } catch {
    onMessage(null, remaining);
  }
}

/**
 * Stream process lifecycle helper.
 * Handles graceful SIGTERM → SIGKILL after a 3s grace period.
 */
import type { ChildProcess } from "child_process";

export function killProcessGracefully(child: ChildProcess, graceMs = 3000) {
  if (child.killed) return;
  child.kill("SIGTERM");
  setTimeout(() => {
    if (!child.killed) child.kill("SIGKILL");
  }, graceMs);
}
