import { NextRequest, NextResponse } from "next/server";
import { docker } from "@/lib/core/docker";
import { logger } from "@/lib/core/logger";

// Streams container logs via SSE. Handles two Docker log formats:
//   - TTY mode: plain text chunks (no multiplexing header)
//   - Non-TTY: 8-byte multiplex header prefixing each frame
//     [stream_type(1)][0x00][0x00][0x00][payload_size(4)][payload...]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const container = docker.getContainer(id);

  const stream = new ReadableStream({
    async start(controller) {
      let logStream: any;
      try {
        const info = await container.inspect();
        const hasTty = info.Config.Tty;
        logStream = await container.logs({
          follow: true,
          stdout: true,
          stderr: true,
          tail: 100,
        });

        let buffer = Buffer.alloc(0);
        logStream.on("data", (chunk: Buffer) => {
          // TTY containers: logs come as plain text, no header
          if (hasTty) {
            const lines = chunk.toString("utf8").split("\n");
            for (const line of lines) {
              if (line.trim()) {
                controller.enqueue(
                  `data: ${JSON.stringify({ log: line })}\n\n`,
                );
              }
            }
            return;
          }

          // Non-TTY: accumulate chunks and reassemble framed payloads
          buffer = Buffer.concat([buffer, chunk]);

          while (buffer.length >= 8) {
            const type = buffer.readUInt8(0); // stream type (0=stdin, 1=stdout, 2=stderr)
            if (type <= 2) {
              const payloadSize = buffer.readUInt32BE(4); // payload length (big-endian)
              if (buffer.length >= 8 + payloadSize) {
                const payload = buffer.slice(8, 8 + payloadSize);
                buffer = buffer.slice(8 + payloadSize);

                const lines = payload.toString("utf8").split("\n");
                for (const line of lines) {
                  if (line.trim()) {
                    controller.enqueue(
                      `data: ${JSON.stringify({ log: line })}\n\n`,
                    );
                  }
                }
              } else {
                break; // incomplete frame — wait for more data
              }
            } else {
              // Non-standard header — dump the buffer as raw text and reset
              const lines = buffer.toString("utf8").split("\n");
              for (const line of lines) {
                if (line.trim()) {
                  controller.enqueue(
                    `data: ${JSON.stringify({ log: line })}\n\n`,
                  );
                }
              }
              buffer = Buffer.alloc(0);
            }
          }
        });

        logStream.on("end", () => {
          try {
            controller.close();
          } catch (e) {}
        });

        logStream.on("error", (err: any) => {
          logger.error("API", `Log stream error for container ${id}`, err);
          controller.error(err);
        });

        // Kill stream when client disconnects (tab close / abort)
        request.signal.addEventListener("abort", () => {
          if (logStream) logStream.destroy();
          try {
            controller.close();
          } catch (e) {}
        });
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
