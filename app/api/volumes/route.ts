import { NextResponse } from "next/server";
import { docker } from "@/lib/core/docker";
import { Volume } from "@/lib/types";
import { withErrorHandler } from "@/lib/utils/api-handler";
import { logger } from "@/lib/core/logger";

export const GET = withErrorHandler(async () => {
  const [{ Volumes }, df] = await Promise.all([
    docker.listVolumes(),
    docker.df(),
  ]);

  const formattedVolumes: Volume[] = Volumes.map((v: any) => {
    // Match volume size from docker system df data
    const dfVol = df.Volumes?.find((dv: any) => dv.Name === v.Name);
    const sizeBytes = dfVol?.UsageData?.Size || 0;

    let sizeStr = "0 B";
    if (sizeBytes > 0) {
      if (sizeBytes > 1024 * 1024 * 1024) {
        sizeStr = (sizeBytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
      } else if (sizeBytes > 1024 * 1024) {
        sizeStr = (sizeBytes / (1024 * 1024)).toFixed(1) + " MB";
      } else {
        sizeStr = (sizeBytes / 1024).toFixed(1) + " KB";
      }
    }

    return {
      id: v.Name.substring(0, 12),
      name: v.Name,
      size: sizeStr,
      driver: v.Driver || "local",
      mountpoint: v.Mountpoint,
      createdAt: v.CreatedAt || "N/A",
      lastBackup: "Never",
    };
  });

  return NextResponse.json(formattedVolumes);
});

// Volume import: upload a .tar backup, stop dependent containers,
// restore data via an alpine helper, then restart what was running.
export const POST = withErrorHandler(async (request: Request) => {
  const contentType = request.headers.get("content-type") || "";
  let action, backupFile, formData;

  if (contentType.includes("multipart/form-data")) {
    formData = await request.formData();
    action = formData.get("action");
    backupFile = formData.get("backup");
  } else {
    const body = await request.json();
    action = body.action;
  }

  if (action === "import" && formData) {
    const targetVolume = formData.get("targetVolume") as string;

    if (!targetVolume) {
      return NextResponse.json(
        { error: "Target volume name is required" },
        { status: 400 },
      );
    }
    if (!backupFile) {
      return NextResponse.json(
        { error: "Backup file is required" },
        { status: 400 },
      );
    }

    // 1. Find and stop containers using this volume
    logger.info("API", `Starting volume restore to '${targetVolume}'`);
    const allContainers = await docker.listContainers({ all: true });
    const usingContainers = allContainers.filter((c) =>
      c.Mounts?.some(
        (m) => m.Name === targetVolume || m.Source.includes(targetVolume),
      ),
    );

    const originallyRunning = [];
    for (const c of usingContainers) {
      if (c.State === "running") {
        const container = docker.getContainer(c.Id);
        await container.stop().catch(() => {});
        originallyRunning.push(c.Id);
      }
    }

    // 2. Pull alpine helper image (if not already cached)
    try {
      await docker.getImage("alpine:latest").inspect();
    } catch (e) {
      const pullStream = await docker.pull("alpine:latest");
      await new Promise((resolve, reject) => {
        docker.modem.followProgress(pullStream, (err, res) =>
          err ? reject(err) : resolve(res),
        );
      });
    }

    // 3. Spin up ephemeral alpine container with volume mounted
    const helper = await docker.createContainer({
      Image: "alpine:latest",
      Cmd: ["/bin/sh", "-c", "sleep 10"],
      Labels: { "containo.internal": "true" },
      HostConfig: {
        Binds: [`${targetVolume}:/volume_data`],
      },
    });
    await helper.start();

    // 4. Extract backup archive into the volume, then tear down helper
    try {
      const buffer = Buffer.from(await (backupFile as File).arrayBuffer());
      await helper.putArchive(buffer, { path: "/volume_data" });
    } finally {
      await helper.stop().catch(() => {});
      await helper.remove({ force: true }).catch(() => {});
    }

    // 5. Restart containers that were running before the restore
    for (const id of originallyRunning) {
      await docker
        .getContainer(id)
        .start()
        .catch(() => {});
    }

    logger.success(
      "API",
      `Volume '${targetVolume}' restored (${originallyRunning.length} container(s) restarted)`,
    );
    return NextResponse.json({
      success: true,
      message: `Volume restore to ${targetVolume} completed. ${originallyRunning.length} container(s) restarted.`,
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
});
