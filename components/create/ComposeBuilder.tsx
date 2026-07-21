import { useState, useCallback } from "react";
import {
  Plus,
  Box,
  FileCode,
  Layers,
  Settings2,
  FolderOpen,
  Sparkles,
} from "lucide-react";
import { ServiceData, ComposeNetwork, ComposeVolume } from "@/lib/types";
import { generateId } from "@/lib/services/id-generator";
import { ServiceCard } from "./compose/ServiceCard";
import { NetworkCard } from "./compose/NetworkCard";
import { VolumeCard } from "./compose/VolumeCard";
import { VisualizerTab } from "./compose/VisualizerTab";
import { YamlPreview } from "./compose/YamlPreview";
import { LocalStackDeployer } from "./compose/LocalStackDeployer";
import { DirectoryPicker } from "./compose/DirectoryPicker";

interface ComposeBuilderProps {
  onDeploy: (composeData: any, stackName: string, targetDir: string) => void;
  onDeployExisting?: (path: string, composeFile?: string) => void;
  isDeploying: boolean;
}

type PanelTab = "services" | "networks" | "volumes";
type RightTab = "visualizer" | "yaml" | "existing";

const DEFAULT_SERVICES: ServiceData[] = [
  {
    id: "demo-1",
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
    id: "demo-2",
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
];

const PANEL_TABS: { id: PanelTab; label: string }[] = [
  { id: "services", label: "Services" },
  { id: "networks", label: "Networks" },
  { id: "volumes", label: "Volumes" },
];

const RIGHT_TABS: { id: RightTab; label: string; icon: typeof Box }[] = [
  { id: "visualizer", label: "Network view", icon: Box },
  { id: "yaml", label: "YAML source", icon: FileCode },
  { id: "existing", label: "Deploy existing", icon: FolderOpen },
];

export function ComposeBuilder({
  onDeploy,
  onDeployExisting,
  isDeploying,
}: ComposeBuilderProps) {
  const [stackName, setStackName] = useState("my-stack");
  const [targetDir, setTargetDir] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const [services, setServices] = useState<ServiceData[]>(DEFAULT_SERVICES);
  const [networks, setNetworks] = useState<ComposeNetwork[]>([]);
  const [volumes, setVolumes] = useState<ComposeVolume[]>([]);

  const [panelTab, setPanelTab] = useState<PanelTab>("services");
  const [rightTab, setRightTab] = useState<RightTab>("visualizer");

  const configuredServices = services.filter(
    (s) => s.name.trim() && s.image.trim(),
  ).length;

  // ── Service CRUD ─────────────────────────────────────────────────────
  const addService = useCallback(() => {
    const id = generateId("service");
    setServices((prev) => [
      ...prev,
      {
        id,
        name: "",
        image: "",
        ports: "",
        env: "",
        volumes: "",
        restartPolicy: "unless-stopped",
        command: "",
        depends_on: "",
        networks: "",
      },
    ]);
  }, []);

  const updateService = useCallback(
    (id: string, field: keyof ServiceData, value: string) => {
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
      );
    },
    [],
  );

  const removeService = useCallback((id: string) => {
    setServices((prev) => (prev.length > 1 ? prev.filter((s) => s.id !== id) : prev));
  }, []);

  // ── Network CRUD ─────────────────────────────────────────────────────
  const addNetwork = useCallback(() => {
    const id = generateId("network");
    setNetworks((prev) => [
      ...prev,
      {
        id,
        name: "",
        driver: "bridge",
        subnet: "",
        gateway: "",
        external: false,
        labels: "",
      },
    ]);
  }, []);

  const updateNetwork = useCallback(
    (id: string, field: keyof ComposeNetwork, value: string | boolean) => {
      setNetworks((prev) =>
        prev.map((n) => (n.id === id ? { ...n, [field]: value } : n)),
      );
    },
    [],
  );

  const removeNetwork = useCallback((id: string) => {
    setNetworks((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // ── Volume CRUD ──────────────────────────────────────────────────────
  const addVolume = useCallback(() => {
    const id = generateId("volume");
    setVolumes((prev) => [
      ...prev,
      {
        id,
        name: "",
        driver: "local",
        type: "named",
        source: "",
        target: "",
        labels: "",
      },
    ]);
  }, []);

  const updateVolume = useCallback(
    (id: string, field: keyof ComposeVolume, value: string) => {
      setVolumes((prev) =>
        prev.map((v) => (v.id === id ? { ...v, [field]: value } : v)),
      );
    },
    [],
  );

  const removeVolume = useCallback((id: string) => {
    setVolumes((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const loadDemoStack = useCallback(() => {
    setServices([
      {
        id: generateId("service"),
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
        id: generateId("service"),
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
        id: generateId("service"),
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
  }, []);

  const counts = {
    services: services.length,
    networks: networks.length,
    volumes: volumes.length,
  };

  const handleDeploy = () => {
    onDeploy(services, stackName, targetDir);
  };

  return (
    <div className="flex flex-col gap-5 flex-1 min-h-0">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-stretch flex-1 min-h-0">
        {/* ── Left Panel ── */}
        <div className="w-full xl:w-[32%] min-h-0 flex flex-col overflow-hidden bg-surface border-r border-border">
          <div className="min-h-0 flex flex-1 flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-text-primary flex items-center gap-3">
                      <Layers className="w-5 h-5 text-brand" /> Stack configuration
                    </h3>
                    <p className="mt-1 text-sm text-text-secondary">
                      Services, networks, and volumes for your compose stack.
                    </p>
                  </div>
                  <button
                    onClick={loadDemoStack}
                    className="text-base font-semibold text-warning transition-all flex items-center gap-1.5 px-3 py-1.5 bg-warning-bg border border-warning/20 rounded-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Demo
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex bg-surface2 rounded-sm p-0.5">
                    {PANEL_TABS.map((tab) => {
                      const active = panelTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setPanelTab(tab.id)}
                          className={`px-3 py-1.5 text-[13px] font-medium rounded-sm transition-colors ${
                            active
                              ? "bg-surface border border-border text-brand"
                              : "text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          {tab.label}
                          <span
                            className={`ml-1.5 text-[11px] ${active ? "text-brand" : "text-text-tertiary"}`}
                          >
                            {counts[tab.id]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={
                      panelTab === "services"
                        ? addService
                        : panelTab === "networks"
                          ? addNetwork
                          : addVolume
                    }
                    className="text-sm font-semibold text-brand transition-all flex items-center gap-2 px-3 py-1.5 bg-brand/10 border border-brand/20 rounded-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add {panelTab === "services" ? "service" : panelTab === "networks" ? "network" : "volume"}
                  </button>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar px-5 py-4">
              <div className="space-y-1 pr-1">
                <PanelContent
                  tab={panelTab}
                  services={services}
                  networks={networks}
                  volumes={volumes}
                  updateService={updateService}
                  removeService={removeService}
                  updateNetwork={updateNetwork}
                  removeNetwork={removeNetwork}
                  updateVolume={updateVolume}
                  removeVolume={removeVolume}
                  addService={addService}
                  addNetwork={addNetwork}
                  addVolume={addVolume}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex bg-surface2/50 border-b border-border">
            {RIGHT_TABS.map((tab) => {
              const active = rightTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setRightTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-3 py-4 text-base font-semibold transition-all ${
                    active
                      ? "bg-surface text-brand border-b-2 border-brand"
                      : "text-text-secondary hover:bg-hover"
                  }`}
                >
                  <Icon className="w-4 h-4" /> {tab.label}
                </button>
              );
            })}
          </div>
          <div className="flex-1 min-h-0 p-6 xl:p-8 overflow-hidden flex flex-col bg-surface">
            <TabPanel visible={rightTab === "visualizer"}>
              <VisualizerTab services={services} networks={networks} volumes={volumes} />
            </TabPanel>
            <TabPanel visible={rightTab === "yaml"}>
              <YamlPreview services={services} networks={networks} volumes={volumes} />
            </TabPanel>
            <TabPanel visible={rightTab === "existing"}>
              <LocalStackDeployer
                onDeployExisting={onDeployExisting || (() => {})}
                isDeploying={isDeploying}
              />
            </TabPanel>
          </div>
        </div>
      </div>

      {/* ── Bottom deploy bar ── */}
      <div className="flex flex-col md:flex-row items-center justify-between p-5 border-t border-border gap-4 shrink-0">
        <div className="flex items-center gap-5 w-full md:w-auto">
          <div className="p-3 bg-surface rounded-sm border border-border shrink-0">
            <Settings2 className="w-5 h-5 text-brand" />
          </div>
          <div>
            <p className="text-base font-semibold text-text-primary">
              Stack verified ({services.length} services
              {networks.length > 0 ? `, ${networks.length} networks` : ""}
              {volumes.length > 0 ? `, ${volumes.length} volumes` : ""})
            </p>
            <div className="text-sm text-text-secondary mt-0.5 flex items-center gap-2">
              <span>
                {configuredServices}/{services.length} services ready · Save location:
              </span>
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
            className="bg-surface border border-border rounded-sm px-4 py-2.5 text-sm text-text-primary focus:border-brand/50 outline-none w-36 transition-colors"
          />
          <button
            onClick={() => setShowPicker(true)}
            className="bg-surface border border-border hover:border-brand/50 text-text-secondary hover:text-text-primary px-4 py-2.5 rounded-sm text-sm font-semibold transition-all flex items-center gap-2"
          >
            <FolderOpen className="w-4 h-4" /> Browse
          </button>
          <button
            onClick={handleDeploy}
            disabled={isDeploying || !stackName || !targetDir}
            className="bg-brand hover:bg-brand-hover text-white px-8 py-2.5 rounded-sm text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
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
          initialPath={targetDir}
        />
      )}
    </div>
  );
}

interface PanelContentProps {
  tab: PanelTab;
  services: ServiceData[];
  networks: ComposeNetwork[];
  volumes: ComposeVolume[];
  updateService: (id: string, field: keyof ServiceData, value: string) => void;
  removeService: (id: string) => void;
  updateNetwork: (id: string, field: keyof ComposeNetwork, value: string | boolean) => void;
  removeNetwork: (id: string) => void;
  updateVolume: (id: string, field: keyof ComposeVolume, value: string) => void;
  removeVolume: (id: string) => void;
  addService: () => void;
  addNetwork: () => void;
  addVolume: () => void;
}

function PanelContent({
  tab,
  services,
  networks,
  volumes,
  updateService,
  removeService,
  updateNetwork,
  removeNetwork,
  updateVolume,
  removeVolume,
  addService,
  addNetwork,
  addVolume,
}: PanelContentProps) {
  if (tab === "services") {
    if (services.length === 0) {
      return <EmptyState message="No services yet. Add one to start building your stack." actionLabel="Add service" onAction={addService} />;
    }
    return (
      <>
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            updateService={updateService}
            removeService={removeService}
          />
        ))}
      </>
    );
  }

  if (tab === "networks") {
    if (networks.length === 0) {
      return (
        <EmptyState
          message="No custom networks. Add one to configure subnet, gateway, or external networks."
          actionLabel="Add network"
          onAction={addNetwork}
        />
      );
    }
    return (
      <>
        {networks.map((network) => (
          <NetworkCard
            key={network.id}
            network={network}
            updateNetwork={updateNetwork}
            removeNetwork={removeNetwork}
          />
        ))}
      </>
    );
  }

  if (volumes.length === 0) {
    return (
      <EmptyState
        message="No named volumes. Add one to persist data across container restarts."
        actionLabel="Add volume"
        onAction={addVolume}
      />
    );
  }
  return (
    <>
      {volumes.map((volume) => (
        <VolumeCard
          key={volume.id}
          volume={volume}
          updateVolume={updateVolume}
          removeVolume={removeVolume}
        />
      ))}
    </>
  );
}

function EmptyState({
  message,
  actionLabel,
  onAction,
}: {
  message: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="py-16 text-center">
      <p className="text-sm text-text-tertiary mb-4">{message}</p>
      <button
        onClick={onAction}
        className="inline-flex items-center gap-2 px-4 py-2 bg-brand/10 border border-brand/20 rounded-sm text-sm font-semibold text-brand hover:bg-brand/20 transition-all"
      >
        <Plus className="w-3.5 h-3.5" /> {actionLabel}
      </button>
    </div>
  );
}

function TabPanel({ visible, children }: { visible: boolean; children: React.ReactNode }) {
  return (
    <div
      className="flex-1 min-h-0"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.15s",
        position: visible ? "relative" : "absolute",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {children}
    </div>
  );
}
