import { NextRequest } from "next/server";
import { spawn, ChildProcess } from "child_process";
import fs from "fs";
import path from "path";
import { logger } from "@/lib/core/logger";
import { PathValidationError } from "@/lib/utils/path";
import { validateDeployPath } from "@/lib/utils/path-server";
import { createSender, killProcessGracefully } from "@/lib/utils/sse";

/**
 * Resolve relative volume mounts (./data:/app) to absolute paths
 * so Docker Compose resolves them correctly from inside the container.
 */
function fixVolumeRelative(yaml: string, baseDir: string): string {
  return yaml.replace(/^(\s*)-\s*\.\//gm, `$1- ${baseDir}/`);
}

/**
 * Deploy a Docker Compose stack.
 *
 * Two modes:
 *   1. { yamlContent } — write a new compose file from the client-supplied YAML
 *   2. { composeFile }  — use an existing compose file in the target directory
 *
 * Streams NDJSON progress to the client. Returns NDJSON-encoded events:
 *   { type: "log", message }      — each docker compose stdout/stderr line
 *   { type: "success", message }   — exit code 0
 *   { type: "error", message }     — non-zero exit, spawn error, or abort
 */
export async function POST(req: NextRequest) {
  try {
    const { targetPath, yamlContent, composeFile } = await req.json();
    const deployPath = validateDeployPath(targetPath);

    if (!yamlContent && !composeFile) {
      return new Response(
        JSON.stringify({ error: "Provide yamlContent or composeFile" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    if (yamlContent) {
      fs.mkdirSync(deployPath, { recursive: true });
      fs.writeFileSync(
        path.join(deployPath, "docker-compose.yml"),
        fixVolumeRelative(yamlContent, deployPath),
        "utf8",
      );
    } else {
      if (!fs.existsSync(deployPath)) {
        return new Response(
          JSON.stringify({ error: "Target directory does not exist" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      const yamlFile = composeFile || "docker-compose.yml";
      const yamlPath = path.join(deployPath, yamlFile);
      if (!fs.existsSync(yamlPath)) {
        return new Response(
          JSON.stringify({ error: "No compose file found" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      const raw = fs.readFileSync(yamlPath, "utf8");
      const fixed = fixVolumeRelative(raw, deployPath);
      if (fixed !== raw) {
        fs.writeFileSync(
          path.join(deployPath, ".containo-temp-compose.yml"),
          fixed,
          "utf8",
        );
      }
    }

    const tempFile = path.join(deployPath, ".containo-temp-compose.yml");
    let child: ChildProcess | null = null;

    const stream = new ReadableStream({
      start(controller) {
        const send = createSender(controller);
        send({ type: "log", message: `docker compose up -d (cwd: ${deployPath})` });

        const args = ["compose"];
        if (fs.existsSync(tempFile)) {
          args.push("-f", ".containo-temp-compose.yml");
        } else if (composeFile) {
          args.push("-f", composeFile);
        }
        args.push("up", "-d");

        const proc = spawn("docker", args, { cwd: deployPath });
        child = proc;

        let buffer = "";
        const onData = (data: Buffer) => {
          buffer += data.toString();
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (!line.trim()) continue;
            // Docker Compose overwrites the same line with \r for progress —
            // we only emit the final segment after \r to avoid log spam.
            const final = line.split("\r").pop()!.trim();
            if (final) send({ type: "log", message: final });
          }
        };

        proc.stdout.on("data", onData);
        proc.stderr.on("data", onData);

        proc.on("close", (code) => {
          cleanupTempFile(tempFile);
          if (buffer.trim()) {
            const final = buffer.split("\r").pop()!.trim();
            if (final) send({ type: "log", message: final });
          }
          if (code === 0) {
            logger.success("API", `Compose deploy succeeded (${deployPath})`);
            send({ type: "success", message: "Stack deployed successfully" });
          } else {
            logger.error(
              "API",
              `Compose deploy failed with exit code ${code} (${deployPath})`,
            );
            send({
              type: "error",
              message: `docker compose exited with code ${code}`,
            });
          }
          controller.close();
        });

        proc.on("error", (err) => {
          logger.error("API", `Compose deploy error (${deployPath})`, err);
          cleanupTempFile(tempFile);
          send({ type: "error", message: err.message });
          controller.close();
        });

        req.signal.addEventListener("abort", () => {
          if (child) killProcessGracefully(child);
        });
      },
      cancel() {
        if (child) killProcessGracefully(child);
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    if (error instanceof PathValidationError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
    logger.error("API", "Compose deploy error", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

function cleanupTempFile(tempFile: string) {
  try {
    fs.unlinkSync(tempFile);
  } catch {
    // File may not exist if deploy used inline YAML — ignore
  }
}
