"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Terminal, Sparkles } from "lucide-react";
import { ServiceData } from "@/lib/types";
import { containerFormSchema, ContainerFormValues } from "./form/schema";
import { ModeSwitcher } from "./form/ModeSwitcher";
import { BasicSettings } from "./form/BasicSettings";
import { NetworkEnvSettings } from "./form/NetworkEnvSettings";
import { AdvancedSettings } from "./form/AdvancedSettings";

interface SimpleFormProps {
  onDeploy: (data: ServiceData) => void;
  isDeploying: boolean;
  cliCommand: string;
  setCliCommand: (cmd: string) => void;
  deploymentMode: "form" | "cli";
  setDeploymentMode: (mode: "form" | "cli") => void;
}

export const SimpleForm = ({
  onDeploy,
  isDeploying,
  cliCommand,
  setCliCommand,
  deploymentMode,
  setDeploymentMode,
}: SimpleFormProps) => {
  const methods = useForm<ContainerFormValues>({
    resolver: zodResolver(containerFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      image: "",
      ports: "",
      env: "",
      cpu: "",
      memory: "",
      privileged: "false",
      volumes: "",
      restartPolicy: "no",
      networkMode: "",
      command: "",
      labels: "",
    },
  });

  const {
    handleSubmit,
    formState: { isValid },
  } = methods;

  const fillDemo = () => {
    methods.reset({
      name: "containo-demo",
      image: "ijon6k/containo-demo-frontend:latest",
      ports: "8080:80",
      env: "",
      cpu: "",
      memory: "",
      privileged: "false",
      volumes: "",
      restartPolicy: "unless-stopped",
      networkMode: "",
      command: "",
      labels: "",
    });
  };

  const onSubmit = (data: ContainerFormValues) => {
    onDeploy({
      id: "",
      name: data.name,
      image: data.image,
      ports: data.ports || "",
      env: data.env || "",
      volumes: data.volumes || "",
      restartPolicy: data.restartPolicy,
      networkMode: data.networkMode,
      command: data.command,
      labels: data.labels,
      privileged: data.privileged === "true",
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 flex flex-col h-full">
      <ModeSwitcher
        deploymentMode={deploymentMode}
        setDeploymentMode={setDeploymentMode}
      />

      <AnimatePresence mode="wait">
        {deploymentMode === "form" ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            <FormProvider {...methods}>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-8 flex-1"
              >
                <BasicSettings />
                <NetworkEnvSettings />
                <AdvancedSettings />
              </form>
            </FormProvider>
          </motion.div>
        ) : (
          <motion.div
            key="cli"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6 flex-1"
          >
            <div className="space-y-4 h-full flex flex-col">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <Terminal className="w-5 h-5 text-text-secondary" />
                <h3 className="text-lg font-semibold text-text-primary">
                  Command line
                </h3>
              </div>
              <p className="text-base text-text-secondary">
                Paste your docker run command here. The system will parse it
                automatically.
              </p>
              <textarea
                value={cliCommand}
                onChange={(e) => setCliCommand(e.target.value)}
                placeholder="docker run -d --name app ..."
                className="w-full h-48 lg:h-64 bg-surface2 border border-border rounded-sm p-6 font-mono text-base text-text-primary focus:border-brand/50 outline-none leading-relaxed custom-scrollbar"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="pt-8 border-t border-border flex justify-end mt-auto gap-3">
        {deploymentMode === "form" && (
          <button
            onClick={fillDemo}
            type="button"
            className="border border-border text-text-secondary hover:text-text-primary hover:bg-hover px-4 py-3 rounded-sm text-base font-semibold transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Try demo
          </button>
        )}
        {deploymentMode === "form" ? (
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isDeploying || !isValid}
            className="bg-brand hover:bg-brand-hover text-white px-10 py-3 rounded-sm text-base font-semibold transition-all active:scale-95 disabled:opacity-30 disabled:grayscale shadow-sm"
          >
            {isDeploying ? "Deploying..." : "Deploy container"}
          </button>
        ) : (
          <button
            onClick={() => onDeploy(undefined as any)}
            disabled={isDeploying || !cliCommand}
            className="bg-brand hover:bg-brand-hover text-white px-10 py-3 rounded-sm text-base font-semibold transition-all active:scale-95 disabled:opacity-30 disabled:grayscale shadow-sm"
          >
            {isDeploying ? "Deploying..." : "Deploy from CLI"}
          </button>
        )}
      </div>
    </div>
  );
};
