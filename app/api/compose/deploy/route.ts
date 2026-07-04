import { NextRequest } from "next/server";
import { spawn, ChildProcess } from "child_process";
import fs from "fs";
import path from "path";

function killProcess(child: ChildProcess) {
  if (child.killed) return;
  child.kill("SIGTERM");
  setTimeout(() => {
    if (!child.killed) child.kill("SIGKILL");
  }, 3000);
}

function toContainerPath(p: string): string {
  if (fs.existsSync("/host") && p.startsWith("/home"))
    return "/host" + p.slice(5);
  return p;
}

function toHostPath(p: string): string {
  if (p.startsWith("/host")) return "/home" + p.slice(5);
  return p;
}

function fixVolumePaths(yaml: string, hostDir: string): string {
  return yaml.replace(/^(\s*)-\s*\.\//gm, `$1- ${hostDir}/`);
}

export async function POST(req: NextRequest) {
  try {
    const { targetPath: rawPath, yamlContent, composeFile } = await req.json();
    const targetPath = toContainerPath(rawPath);
    const hostDir = toHostPath(targetPath);

    if (!targetPath) {
      return new Response(
        JSON.stringify({ error: "Target path is required" }),
        { status: 400 },
      );
    }

    if (yamlContent) {
      if (!fs.existsSync(targetPath))
        fs.mkdirSync(targetPath, { recursive: true });
      fs.writeFileSync(
        path.join(targetPath, "docker-compose.yml"),
        fixVolumePaths(yamlContent, hostDir),
        "utf8",
      );
    } else {
      if (!fs.existsSync(targetPath)) {
        return new Response(
          JSON.stringify({ error: "Target directory does not exist" }),
          { status: 400 },
        );
      }
      const yamlFile = composeFile || "docker-compose.yml";
      const yamlPath = path.join(targetPath, yamlFile);
      if (!fs.existsSync(yamlPath)) {
        return new Response(
          JSON.stringify({ error: "No compose file found" }),
          { status: 400 },
        );
      }
      const raw = fs.readFileSync(yamlPath, "utf8");
      const fixed = fixVolumePaths(raw, hostDir);
      if (fixed !== raw)
        fs.writeFileSync(
          path.join(targetPath, ".containo-temp-compose.yml"),
          fixed,
          "utf8",
        );
    }

    const encoder = new TextEncoder();
    let child: ChildProcess | null = null;

    const stream = new ReadableStream({
      start(controller) {
        const send = (msg: Record<string, unknown>) =>
          controller.enqueue(encoder.encode(JSON.stringify(msg) + "\n"));

        send({
          type: "log",
          message: `docker compose up -d (cwd: ${targetPath})`,
        });

        const args = ["compose"];
        const tempFile = path.join(targetPath, ".containo-temp-compose.yml");
        if (fs.existsSync(tempFile))
          args.push("-f", ".containo-temp-compose.yml");
        else if (composeFile) args.push("-f", composeFile);
        args.push("up", "-d");

        const proc = spawn("docker", args, { cwd: targetPath });
        child = proc;

        let buffer = "";
        const onData = (data: Buffer) => {
          buffer += data.toString();
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (!line.trim()) continue;
            const parts = line.split("\r");
            const final = parts[parts.length - 1].trim();
            if (final) send({ type: "log", message: final });
          }
        };

        proc.stdout.on("data", onData);
        proc.stderr.on("data", onData);

        proc.on("close", (code) => {
          try {
            fs.unlinkSync(tempFile);
          } catch {}
          if (buffer.trim()) {
            const parts = buffer.split("\r");
            const final = parts[parts.length - 1].trim();
            if (final) send({ type: "log", message: final });
          }
          if (code === 0)
            send({ type: "success", message: "Stack deployed successfully" });
          else
            send({
              type: "error",
              message: `docker compose exited with code ${code}`,
            });
          controller.close();
        });

        proc.on("error", (err) => {
          try {
            fs.unlinkSync(tempFile);
          } catch {}
          send({ type: "error", message: err.message });
          controller.close();
        });

        req.signal.addEventListener("abort", () => {
          if (child) killProcess(child);
        });
      },
      cancel() {
        if (child) killProcess(child);
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
