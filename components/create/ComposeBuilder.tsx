import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  Plus,
  Box,
  FileCode,
  Layers,
  Settings2,
  FolderOpen,
  Sparkles,
} from "lucide-react";
import { ServiceData } from "@/lib/types";
import { ServiceCard } from "./compose/ServiceCard";
import { VisualizerTab } from "./compose/VisualizerTab";
import { YamlPreview } from "./compose/YamlPreview";
import { LocalStackDeployer } from "./compose/LocalStackDeployer";
import { DirectoryPicker } from "./compose/DirectoryPicker";

interface ComposeBuilderProps {
  onDeploy: (composeData: any, stackName: string, targetDir: string) => void;
  onDeployExisting?: (path: string, composeFile?: string) => void;
  isDeploying: boolean;
}

export const ComposeBuilder = ({
  onDeploy,
  onDeployExisting,
  isDeploying,
}: ComposeBuilderProps) => {
  const [stackName, setStackName] = useState("my-stack");
  const [targetDir, setTargetDir] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [services, setServices] = useState<ServiceData[]>([
    {
      id: "1",
      name: "web-frontend",
      image: "traefik/whoami",
      ports: "8080:80",
      env: "TITLE=Hello Demo",
      volumes: "",
      restartPolicy: "always",
      command: "",
      depends_on: "redis-cache",
      networks: "demo-net",
    },
    {
      id: "2",
      name: "redis-cache",
      image: "redis:alpine",
      ports: "",
      env: "",
      volumes: "",
      restartPolicy: "unless-stopped",
      command: "",
      depends_on: "",
      networks: "demo-net",
    },
  ]);
  const [activeTab, setActiveTab] = useState<
    "visualizer" | "yaml" | "existing"
  >("visualizer");

  const demoStack = () => {
    setServices([
      {
        id: "1",
        name: "proxy",
        image: "ijon6k/containo-demo-proxy:latest",
        ports: "80:80",
        env: "",
        volumes: "",
        restartPolicy: "unless-stopped",
        command: "",
        depends_on: "frontend,backend",
        networks: "",
      },
      {
        id: "2",
        name: "frontend",
        image: "ijon6k/containo-demo-frontend:latest",
        ports: "",
        env: "",
        volumes: "",
        restartPolicy: "unless-stopped",
        command: "",
        depends_on: "",
        networks: "",
      },
      {
        id: "3",
        name: "backend",
        image: "ijon6k/containo-demo-backend:latest",
        ports: "",
        env: "",
        volumes: "",
        restartPolicy: "unless-stopped",
        command: "",
        depends_on: "",
        networks: "",
      },
    ]);
    setStackName("containo-demo");
  };

  const addService = () => {
    const newId = (services.length + 1).toString();
    setServices([
      ...services,
      {
        id: newId,
        name: `service-${newId}`,
        image: "",
        ports: "",
        env: "",
        volumes: "",
        restartPolicy: "no",
        command: "",
        depends_on: "",
        networks: "",
      },
    ]);
  };

  const updateService = (
    id: string,
    field: keyof ServiceData,
    value: string,
  ) => {
    setServices(
      services.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  };

  const removeService = (id: string) => {
    if (services.length > 1) setServices(services.filter((s) => s.id !== id));
  };

  const generateYaml = () => {
    let yaml = "services:\n";
    services.forEach((s) => {
      yaml += `  ${s.name}:\n`;
      yaml += `    image: ${s.image || "no-image"}\n`;
      if (s.ports) yaml += `    ports:\n      - "${s.ports}"\n`;
      if (s.restartPolicy) yaml += `    restart: ${s.restartPolicy}\n`;
      if (s.env) {
        yaml += "    environment:\n";
        s.env.split(",").forEach((e) => (yaml += `      - ${e.trim()}\n`));
      }
      if (s.volumes) {
        yaml += "    volumes:\n";
        s.volumes.split(",").forEach((v) => (yaml += `      - ${v.trim()}\n`));
      }
      if (s.command) yaml += `    command: ${s.command}\n`;
      if (s.depends_on) {
        yaml += "    depends_on:\n";
        s.depends_on
          .split(",")
          .forEach((d) => (yaml += `      - ${d.trim()}\n`));
      }
      if (s.networks) {
        yaml += "    networks:\n";
        s.networks.split(",").forEach((n) => (yaml += `      - ${n.trim()}\n`));
      }
    });
    return yaml;
  };

  return (
    <div className="flex flex-col h-full gap-8">
      <div className="flex flex-col lg:flex-row gap-8 min-h-[600px] flex-1">
        <div className="w-full lg:w-[40%] flex flex-col gap-6 pr-2">
          <div className="flex items-center justify-between border-b border-ui-border pb-4">
            <h3 className="text-lg font-semibold text-text-main flex items-center gap-3">
              <Layers className="w-5 h-5 text-brand" /> Service Units
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={demoStack}
                className="text-sm font-semibold text-amber-500 hover:text-amber-400 transition-all flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/5 border border-amber-500/20 rounded-md"
              >
                <Sparkles className="w-3.5 h-3.5" /> Demo
              </button>
              <button
                onClick={addService}
                className="text-sm font-semibold text-brand hover:text-brand/80 transition-all flex items-center gap-2 px-3 py-1.5 bg-brand/5 border border-brand/20 rounded-md"
              >
                <Plus className="w-4 h-4" /> Add Service
              </button>
            </div>
          </div>
          <div className="space-y-4 overflow-y-auto custom-scrollbar max-h-[calc(100vh-420px)]">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                updateService={updateService}
                removeService={removeService}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 bg-ui-bg border border-ui-border rounded-lg overflow-hidden flex flex-col shadow-sm">
          <div className="flex bg-ui-accent/50 border-b border-ui-border">
            {[
              { id: "visualizer", label: "Network View", icon: Box },
              { id: "yaml", label: "YAML Source", icon: FileCode },
              { id: "existing", label: "Deploy Existing", icon: FolderOpen },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-3 py-4 text-sm font-semibold transition-all ${activeTab === tab.id ? "bg-ui-bg text-brand border-b-2 border-brand" : "text-text-sub hover:bg-ui-accent"}`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>
          <div className="flex-1 p-8 relative overflow-hidden flex flex-col">
            <AnimatePresence mode="wait">
              {activeTab === "visualizer" && (
                <VisualizerTab services={services} />
              )}
              {activeTab === "yaml" && (
                <YamlPreview yamlContent={generateYaml()} />
              )}
              {activeTab === "existing" && (
                <LocalStackDeployer
                  onDeployExisting={onDeployExisting || (() => {})}
                  isDeploying={isDeploying}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-ui-accent/30 border border-ui-border rounded-xl mt-auto shadow-sm gap-4">
        <div className="flex items-center gap-5 w-full md:w-auto">
          <div className="p-3 bg-ui-bg rounded-lg border border-ui-border shrink-0">
            <Settings2 className="w-6 h-6 text-brand" />
          </div>
          <div>
            <p className="text-base font-semibold text-text-main">
              Stack verified ({services.length} services)
            </p>
            <div className="text-xs text-text-sub mt-1 flex items-center gap-2">
              <span>Save Location:</span>
              {targetDir ? (
                <span className="font-mono text-brand truncate max-w-[200px]">
                  {targetDir}
                </span>
              ) : (
                <span className="text-rose-400">Not selected</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <input
            type="text"
            value={stackName}
            onChange={(e) => setStackName(e.target.value)}
            placeholder="Stack Name"
            className="bg-ui-bg border border-ui-border rounded-lg px-4 py-3 text-sm text-text-main focus:border-brand/50 outline-none w-40 transition-colors"
          />
          <button
            onClick={() => setShowPicker(true)}
            className="bg-ui-bg border border-ui-border hover:border-brand/50 text-text-main px-4 py-3 rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
          >
            <FolderOpen className="w-4 h-4" /> Browse
          </button>
          <button
            onClick={() => onDeploy(services, stackName, targetDir)}
            disabled={isDeploying || !stackName || !targetDir}
            className="bg-brand hover:bg-brand/90 text-white px-8 py-3 rounded-lg text-sm font-semibold transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {isDeploying ? "Deploying..." : "Deploy Stack"}
          </button>
        </div>
      </div>

      {showPicker && (
        <DirectoryPicker
          title="Select Save Location"
          onSelect={(path) => {
            setTargetDir(path);
            setShowPicker(false);
          }}
          onCancel={() => setShowPicker(false)}
          initialPath={targetDir || ""}
        />
      )}
    </div>
  );
};
