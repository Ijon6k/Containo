"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { ModeSelection } from "./create/ModeSelection";
import { SimpleForm } from "./create/SimpleForm";
import { ComposeBuilder } from "./create/ComposeBuilder";
import { DeploymentLogs } from "./create/DeploymentLogs";
import { useDeployment } from "@/hooks/useDeployment";
import { parseDockerCommand } from "@/lib/services/cli-parser.service";
import { buildComposeYaml } from "@/lib/services/compose-yaml.service";

interface CreateContainerFlowProps {
  addToast: (msg: string, type?: "success" | "error") => void;
  onBack: () => void;
}

export default function CreateContainerFlow({
  addToast,
  onBack,
}: CreateContainerFlowProps) {
  const [step, setStep] = useState<"mode" | "form" | "logs">("mode");
  const [mode, setMode] = useState<"simple" | "compose" | "cli">("simple");
  const [deploymentMode, setDeploymentMode] = useState<"form" | "cli">("form");
  const abortRef = useRef<AbortController | null>(null);
  const [isComposeDeploying, setIsComposeDeploying] = useState(false);

  const [cliCommand, setCliCommand] = useState(
    "docker run -d --name my-app -p 8080:80 nginx",
  );

  const {
    isDeploying,
    deploymentLogs,
    deploymentComplete,
    pullProgress,
    handleDeploy,
    setDeploymentLogs,
    setDeploymentComplete,
  } = useDeployment(addToast);

  const resetAndBack = () => {
    setStep("mode");
    setDeploymentLogs([]);
    onBack();
  };

  const onModeSelect = (m: "simple" | "compose" | "cli") => {
    setMode(m);
    setDeploymentMode(m === "cli" ? "cli" : "form");
    setStep("form");
  };

  const startDeployment = (data?: any) => {
    setStep("logs");
    if (deploymentMode === "cli") handleDeploy(parseDockerCommand(cliCommand));
    else handleDeploy(data);
  };

  const streamComposeDeploy = async (body: Record<string, string>) => {
    setStep("logs");
    setDeploymentLogs([]);
    setDeploymentComplete(false);
    setIsComposeDeploying(true);
    const controller = new AbortController();
    abortRef.current = controller;
    const decoder = new TextDecoder();
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
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const p = JSON.parse(line);
            if (p.type === "log" || p.type === "create")
              setDeploymentLogs((prev) => [...prev, p.message]);
            else if (p.type === "success") {
              setDeploymentLogs((prev) => [...prev, `[SUCCESS] ${p.message}`]);
              setDeploymentComplete(true);
            } else if (p.type === "error") {
              setDeploymentLogs((prev) => [...prev, `[ERROR] ${p.message}`]);
              setDeploymentComplete(true);
              addToast(p.message, "error");
            }
          } catch {
            setDeploymentLogs((prev) => [...prev, line]);
          }
        }
      }
      if (buffer.trim()) {
        try {
          const p = JSON.parse(buffer);
          if (p.type === "success") {
            setDeploymentLogs((prev) => [...prev, `[SUCCESS] ${p.message}`]);
            setDeploymentComplete(true);
          }
        } catch {
          setDeploymentLogs((prev) => [...prev, buffer.trim()]);
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        setDeploymentLogs((prev) => [
          ...prev,
          "[STOPPED] Deployment cancelled",
        ]);
        setDeploymentComplete(true);
        addToast("Deployment stopped", "error");
      } else {
        setDeploymentLogs((prev) => [...prev, `[ERROR] ${err.message}`]);
        setDeploymentComplete(true);
        addToast(err.message, "error");
      }
    } finally {
      setIsComposeDeploying(false);
      abortRef.current = null;
    }
  };

  const handleComposeDeploy = async (
    services: any,
    stackName: string,
    targetDir: string,
  ) => {
    const yaml = buildComposeYaml(services);
    const clean = targetDir.endsWith("/") ? targetDir.slice(0, -1) : targetDir;
    await streamComposeDeploy({
      targetPath: `${clean}/${stackName}`,
      yamlContent: yaml,
    });
  };

  const handleExistingComposeDeploy = async (
    path: string,
    composeFile?: string,
  ) => {
    await streamComposeDeploy({
      targetPath: path,
      ...(composeFile ? { composeFile } : {}),
    });
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-10 pb-6 border-b border-border">
        <div className="flex items-center gap-6">
          <button
            onClick={step === "mode" ? onBack : () => setStep("mode")}
            className="p-2 hover:bg-hover rounded-sm transition-all text-text-secondary hover:text-text-primary"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-text-primary">
              {step === "mode"
                ? "New deployment"
                : step === "form"
                  ? `Configure ${mode === "compose" ? "stack" : "container"}`
                  : "Deployment progress"}
            </h1>
            <p className="text-base text-text-secondary mt-1">
              {step === "mode"
                ? "Select your preferred deployment method"
                : step === "form"
                  ? "Provide container specifications"
                  : "Monitoring deployment stream"}
            </p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 text-base font-semibold text-text-secondary hover:text-text-primary transition-all"
        >
          Cancel
        </button>
      </div>
      <div className="flex-1 bg-surface border border-border rounded-md shadow-sm flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
          <AnimatePresence mode="wait">
            {step === "mode" && (
              <motion.div
                key="mode"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <ModeSelection onSelect={onModeSelect} />
              </motion.div>
            )}
            {step === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col"
              >
                {(mode === "simple" || mode === "cli") && (
                  <SimpleForm
                    onDeploy={startDeployment}
                    isDeploying={isDeploying}
                    cliCommand={cliCommand}
                    setCliCommand={setCliCommand}
                    deploymentMode={deploymentMode}
                    setDeploymentMode={setDeploymentMode}
                  />
                )}
                {mode === "compose" && (
                  <ComposeBuilder
                    onDeploy={handleComposeDeploy}
                    onDeployExisting={handleExistingComposeDeploy}
                    isDeploying={isDeploying || isComposeDeploying}
                  />
                )}
              </motion.div>
            )}
            {step === "logs" && (
              <motion.div
                key="logs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full"
              >
                <DeploymentLogs
                  logs={deploymentLogs}
                  isComplete={deploymentComplete}
                  pullProgress={pullProgress}
                  onClose={resetAndBack}
                  onStop={
                    isComposeDeploying
                      ? () => abortRef.current?.abort()
                      : undefined
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
