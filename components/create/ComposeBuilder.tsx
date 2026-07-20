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
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h3 className="text-xl font-semibold text-text-primary flex items-center gap-3">
              <Layers className="w-5 h-5 text-brand" /> Service units
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={demoStack}
                className="text-base font-semibold text-warning transition-all flex items-center gap-1.5 px-3 py-1.5 bg-warning-bg border border-warning/20 rounded-sm"
              >
                <Sparkles className="w-3.5 h-3.5" /> Demo
              </button>
              <button
                onClick={addService}
                className="text-base font-semibold text-brand transition-all flex items-center gap-2 px-3 py-1.5 bg-brand/10 border border-brand/20 rounded-sm"
              >
                <Plus className="w-4 h-4" /> Add service
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

        <div className="flex-1 bg-surface border border-border rounded-md overflow-hidden flex flex-col shadow-sm">
          <div className="flex bg-surface2/50 border-b border-border">
            {[
              { id: "visualizer", label: "Network view", icon: Box },
              { id: "yaml", label: "YAML source", icon: FileCode },
              { id: "existing", label: "Deploy existing", icon: FolderOpen },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-3 py-4 text-base font-semibold transition-all ${activeTab === tab.id ? "bg-surface text-brand border-b-2 border-brand" : "text-text-secondary hover:bg-hover"}`}
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

      <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-surface2/30 border border-border rounded-md mt-auto shadow-sm gap-4">
        <div className="flex items-center gap-5 w-full md:w-auto">
          <div className="p-3 bg-surface rounded-sm border border-border shrink-0">
            <Settings2 className="w-6 h-6 text-brand" />
          </div>
          <div>
            <p className="text-lg font-semibold text-text-primary">
              Stack verified ({services.length} services)
            </p>
            <div className="text-sm text-text-secondary mt-1 flex items-center gap-2">
              <span>Save location:</span>
              {targetDir ? (
                <span className="font-mono text-brand truncate max-w-[200px]">
                  {targetDir}
                </span>
              ) : (
                <span className="text-danger">Not selected</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <input
            type="text"
            value={stackName}
            onChange={(e) => setStackName(e.target.value)}
            placeholder="Stack name"
            className="bg-surface border border-border rounded-sm px-4 py-3 text-base text-text-primary focus:border-brand/50 outline-none w-40 transition-colors"
          />
          <button
            onClick={() => setShowPicker(true)}
            className="bg-surface border border-border hover:border-brand/50 text-text-primary px-4 py-3 rounded-sm text-base font-semibold transition-all shadow-sm flex items-center gap-2"
          >
            <FolderOpen className="w-4 h-4" /> Browse
          </button>
          <button
            onClick={() => onDeploy(services, stackName, targetDir)}
            disabled={isDeploying || !stackName || !targetDir}
            className="bg-brand hover:bg-brand-hover text-white px-8 py-3 rounded-sm text-base font-semibold transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {isDeploying ? "Deploying..." : "Deploy stack"}
          </button>
        </div>
      </div>

      {showPicker && (
        <DirectoryPicker
          title="Select save location"
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
