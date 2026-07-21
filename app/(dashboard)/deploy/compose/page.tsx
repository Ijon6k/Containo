"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ComposeBuilder } from "@/components/create/ComposeBuilder";
import { DeploymentLogs } from "@/components/create/DeploymentLogs";
import { useNotify } from "@/components/providers/NotificationProvider";
import { buildComposeYaml } from "@/lib/services/compose-yaml.service";
import { sanitizeStackName } from "@/lib/utils/path";
import { consumeNDJSONChunk, flushNDJSONBuffer } from "@/lib/utils/sse";
import {
  ServiceData,
  ComposeNetwork,
  ComposeVolume,
} from "@/lib/types";

export default function ComposeDeployPage() {
  const router = useRouter();
  const { addToast } = useNotify();
  const [step, setStep] = useState<"form" | "logs">("form");
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentLogs, setDeploymentLogs] = useState<string[]>([]);
  const [deploymentComplete, setDeploymentComplete] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function streamComposeDeploy(body: Record<string, string>) {
    setStep("logs");
    setDeploymentLogs([]);
    setDeploymentComplete(false);
    setIsDeploying(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/compose/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (!controller.signal.aborted) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        buffer = consumeNDJSONChunk(buffer, chunk, handleServerEvent);
      }
      flushNDJSONBuffer(buffer, handleServerEvent);
    } catch (err: any) {
      if (err.name === "AbortError") {
        appendLog("[STOPPED] Deployment cancelled");
        setDeploymentComplete(true);
        addToast("Deployment stopped", "error");
      } else {
        appendLog(`[ERROR] ${err.message}`);
        setDeploymentComplete(true);
        addToast(err.message, "error");
      }
    } finally {
      setIsDeploying(false);
      abortRef.current = null;
    }

    function handleServerEvent(parsed: any, raw: string) {
      switch (parsed?.type) {
        case "log":
        case "create":
          appendLog(parsed.message);
          break;
        case "success":
          appendLog(`[SUCCESS] ${parsed.message}`);
          setDeploymentComplete(true);
          break;
        case "error":
          appendLog(`[ERROR] ${parsed.message}`);
          setDeploymentComplete(true);
          addToast(parsed.message, "error");
          break;
        default:
          appendLog(raw);
      }
    }

    function appendLog(message: string) {
      setDeploymentLogs((prev) => [...prev, message]);
    }
  }

  const handleDeploy = (
    services: ServiceData[],
    stackName: string,
    targetDir: string,
    networks: ComposeNetwork[] = [],
    volumes: ComposeVolume[] = [],
  ) => {
    const yaml = buildComposeYaml(services, networks, volumes);
    const clean = targetDir.endsWith("/") ? targetDir.slice(0, -1) : targetDir;
    const safeName = sanitizeStackName(stackName);
    streamComposeDeploy({ targetPath: `${clean}/${safeName}`, yamlContent: yaml });
  };

  const handleDeployExisting = (path: string, composeFile?: string) => {
    streamComposeDeploy({ targetPath: path, ...(composeFile ? { composeFile } : {}) });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="p-2 hover:bg-hover rounded-sm transition-all text-text-secondary hover:text-text-primary"
          aria-label="Back to dashboard"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-text-primary">
            {step === "form" ? "Configure stack" : "Deployment progress"}
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {step === "form"
              ? "Build a multi-service Docker Compose stack with visual preview."
              : "Monitoring deployment stream"}
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {step === "form" ? (
          <ComposeBuilder
            onDeploy={handleDeploy}
            onDeployExisting={handleDeployExisting}
            isDeploying={isDeploying}
          />
        ) : (
          <DeploymentLogs
            logs={deploymentLogs}
            pullProgress={{}}
            onClose={() => router.push("/dashboard")}
            isComplete={deploymentComplete}
            onStop={isDeploying ? () => abortRef.current?.abort() : undefined}
          />
        )}
      </div>
    </div>
  );
}
