import { useState, useRef, useMemo } from "react";
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

export const ComposeBuilder = ({
  onDeploy,
  onDeployExisting,
  isDeploying,
}: ComposeBuilderProps) => {
  const [stackName, setStackName] = useState("my-stack");
  const [targetDir, setTargetDir] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const serviceIdRef = useRef(3);
  const networkIdRef = useRef(1);
  const volumeIdRef = useRef(1);

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

  const [networks, setNetworks] = useState<ComposeNetwork[]>([]);
  const [volumes, setVolumes] = useState<ComposeVolume[]>([]);

  const [panelTab, setPanelTab] = useState<"services" | "networks" | "volumes">("services");
  const [rightTab, setRightTab] = useState<"visualizer" | "yaml" | "existing">("visualizer");

  const configuredServices = services.filter((s) => s.name.trim() && s.image.trim()).length;

  const addService = () => {
    const id = `s-${serviceIdRef.current++}`;
    setServices([...services, { id, name: `service-${serviceIdRef.current - 1}`, image: "", ports: "", env: "", volumes: "", restartPolicy: "unless-stopped", command: "", depends_on: "", networks: "" }]);
  };

  const updateService = (id: string, field: keyof ServiceData, value: string) => {
    setServices(services.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const removeService = (id: string) => {
    if (services.length > 1) setServices(services.filter((s) => s.id !== id));
  };

  const addNetwork = () => {
    const id = `net-${networkIdRef.current++}`;
    setNetworks([...networks, { id, name: `network-${networkIdRef.current - 1}`, driver: "bridge", subnet: "", gateway: "", external: false, labels: "" }]);
  };

  const updateNetwork = (id: string, field: keyof ComposeNetwork, value: string | boolean) => {
    setNetworks(networks.map((n) => (n.id === id ? { ...n, [field]: value } : n)));
  };

  const removeNetwork = (id: string) => {
    setNetworks(networks.filter((n) => n.id !== id));
  };

  const addVolume = () => {
    const id = `vol-${volumeIdRef.current++}`;
    setVolumes([...volumes, { id, name: `volume-${volumeIdRef.current - 1}`, driver: "local", type: "named" as const, source: "", target: "", labels: "" }]);
  };

  const updateVolume = (id: string, field: keyof ComposeVolume, value: string) => {
    setVolumes(volumes.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
  };

  const removeVolume = (id: string) => {
    setVolumes(volumes.filter((v) => v.id !== id));
  };

  const demoStack = () => {
    setServices([
      { id: "d1", name: "proxy", image: "ijon6k/containo-demo-proxy:latest", ports: "80:80", env: "", volumes: "", restartPolicy: "unless-stopped", command: "", depends_on: "frontend,backend", networks: "" },
      { id: "d2", name: "frontend", image: "ijon6k/containo-demo-frontend:latest", ports: "", env: "", volumes: "", restartPolicy: "unless-stopped", command: "", depends_on: "", networks: "" },
      { id: "d3", name: "backend", image: "ijon6k/containo-demo-backend:latest", ports: "", env: "", volumes: "", restartPolicy: "unless-stopped", command: "", depends_on: "", networks: "" },
    ]);
    setStackName("containo-demo");
  };

  const yamlContent = useMemo(() => {
    let yaml = "";
    // ponytail: strip newlines to prevent YAML key injection
    const safe = (v: string) => v.replace(/[\n\r]/g, '');

    yaml += "services:\n";
    services.forEach((s) => {
      yaml += `  ${safe(s.name)}:\n`;
      yaml += `    image: ${safe(s.image || "no-image")}\n`;
      if (s.ports) yaml += `    ports:\n      - "${safe(s.ports)}"\n`;
      if (s.restartPolicy && s.restartPolicy !== "no") yaml += `    restart: ${safe(s.restartPolicy)}\n`;
      if (s.env) {
        yaml += "    environment:\n";
        safe(s.env).split(",").forEach((e) => (yaml += `      - ${e.trim()}\n`));
      }
      if (s.volumes) {
        yaml += "    volumes:\n";
        safe(s.volumes).split(",").forEach((v) => (yaml += `      - ${v.trim()}\n`));
      }
      if (s.command) yaml += `    command: ${safe(s.command)}\n`;
      if (s.depends_on) {
        yaml += "    depends_on:\n";
        safe(s.depends_on).split(",").forEach((d) => (yaml += `      - ${d.trim()}\n`));
      }
      if (s.networks) {
        yaml += "    networks:\n";
        safe(s.networks).split(",").forEach((n) => (yaml += `      - ${n.trim()}\n`));
      }
    });

    const namedNets = networks.filter((n) => n.name.trim());
    if (namedNets.length > 0) {
      yaml += "\nnetworks:\n";
      namedNets.forEach((n) => {
        yaml += `  ${safe(n.name)}:\n`;
        if (n.driver && n.driver !== "bridge") yaml += `    driver: ${safe(n.driver)}\n`;
        if (n.external) {
          yaml += "    external: true\n";
        } else if (n.subnet || n.gateway) {
          yaml += "    ipam:\n      config:\n        -\n";
          if (n.subnet) yaml += `          subnet: "${safe(n.subnet)}"\n`;
          if (n.gateway) yaml += `          gateway: "${safe(n.gateway)}"\n`;
        }
        if (n.labels) {
          yaml += "    labels:\n";
          safe(n.labels).split(",").forEach((l) => {
            const [k, v] = l.split("=");
            if (k && v) yaml += `      ${k.trim()}: "${v.trim()}"\n`;
          });
        }
      });
    }

    const namedVols = volumes.filter((v) => v.type === "named" && v.name.trim());
    if (namedVols.length > 0) {
      yaml += "\nvolumes:\n";
      namedVols.forEach((v) => {
        yaml += `  ${safe(v.name)}:\n`;
        if (v.driver && v.driver !== "local") yaml += `    driver: ${safe(v.driver)}\n`;
        if (v.labels) {
          yaml += "    labels:\n";
          safe(v.labels).split(",").forEach((l) => {
            const [k, val] = l.split("=");
            if (k && val) yaml += `      ${k.trim()}: "${val.trim()}"\n`;
          });
        }
      });
    }

    return yaml;
  }, [services, networks, volumes]);

  return (
    <div className="flex flex-col gap-5 flex-1 min-h-0">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-stretch flex-1 min-h-0">
        {/* ── Left Panel: bg-surface zone, no outer border-box ── */}
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
                  <div className="flex items-center gap-2">
                    <button onClick={demoStack}
                      className="text-base font-semibold text-warning transition-all flex items-center gap-1.5 px-3 py-1.5 bg-warning-bg border border-warning/20 rounded-sm">
                      <Sparkles className="w-3.5 h-3.5" /> Demo
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex bg-surface2 rounded-sm p-0.5">
                    {[
                      { id: "services" as const, label: "Services", count: services.length },
                      { id: "networks" as const, label: "Networks", count: networks.length },
                      { id: "volumes" as const, label: "Volumes", count: volumes.length },
                    ].map((tab) => (
                      <button key={tab.id} onClick={() => setPanelTab(tab.id)}
                        className={`px-3 py-1.5 text-[13px] font-medium rounded-sm transition-colors ${
                          panelTab === tab.id ? "bg-surface border border-border text-brand" : "text-text-secondary hover:text-text-primary"
                        }`}>
                        {tab.label}
                        <span className={`ml-1.5 text-[11px] ${panelTab === tab.id ? "text-brand" : "text-text-tertiary"}`}>{tab.count}</span>
                      </button>
                    ))}
                  </div>
                  <button onClick={
                    panelTab === "services" ? addService :
                    panelTab === "networks" ? addNetwork :
                    addVolume
                  }
                    className="text-sm font-semibold text-brand transition-all flex items-center gap-2 px-3 py-1.5 bg-brand/10 border border-brand/20 rounded-sm">
                    <Plus className="w-3.5 h-3.5" /> Add {panelTab === "services" ? "service" : panelTab === "networks" ? "network" : "volume"}
                  </button>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar px-5 py-4">
              <div className="space-y-1 pr-1">
                {panelTab === "services" && services.map((service) => (
                  <ServiceCard key={service.id} service={service} updateService={updateService} removeService={removeService} />
                ))}
                {panelTab === "networks" && networks.map((network) => (
                  <NetworkCard key={network.id} network={network} updateNetwork={updateNetwork} removeNetwork={removeNetwork} />
                ))}
                {panelTab === "volumes" && volumes.map((volume) => (
                  <VolumeCard key={volume.id} volume={volume} updateVolume={updateVolume} removeVolume={removeVolume} />
                ))}
                {panelTab === "services" && services.length === 0 && (
                  <div className="py-16 text-center">
                    <p className="text-sm text-text-tertiary mb-4">No services yet. Add one to start building your stack.</p>
                    <button onClick={addService}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-brand/10 border border-brand/20 rounded-sm text-sm font-semibold text-brand hover:bg-brand/20 transition-all">
                      <Plus className="w-3.5 h-3.5" /> Add service
                    </button>
                  </div>
                )}
                {panelTab === "networks" && networks.length === 0 && (
                  <div className="py-16 text-center">
                    <p className="text-sm text-text-tertiary mb-4">No custom networks. Add one to configure subnet, gateway, or external networks.</p>
                    <button onClick={addNetwork}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-brand/10 border border-brand/20 rounded-sm text-sm font-semibold text-brand hover:bg-brand/20 transition-all">
                      <Plus className="w-3.5 h-3.5" /> Add network
                    </button>
                  </div>
                )}
                {panelTab === "volumes" && volumes.length === 0 && (
                  <div className="py-16 text-center">
                    <p className="text-sm text-text-tertiary mb-4">No named volumes. Add one to persist data across container restarts.</p>
                    <button onClick={addVolume}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-brand/10 border border-brand/20 rounded-sm text-sm font-semibold text-brand hover:bg-brand/20 transition-all">
                      <Plus className="w-3.5 h-3.5" /> Add volume
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Panel: full-bleed canvas ── */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex bg-surface2/50 border-b border-border">
            {[
              { id: "visualizer" as const, label: "Network view", icon: Box },
              { id: "yaml" as const, label: "YAML source", icon: FileCode },
              { id: "existing" as const, label: "Deploy existing", icon: FolderOpen },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setRightTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-3 py-4 text-base font-semibold transition-all ${
                  rightTab === tab.id ? "bg-surface text-brand border-b-2 border-brand" : "text-text-secondary hover:bg-hover"
                }`}>
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>
          <div className="flex-1 min-h-0 p-6 xl:p-8 overflow-hidden flex flex-col bg-surface">
            <div className="flex-1 min-h-0" style={{ opacity: rightTab === "visualizer" ? 1 : 0, transition: "opacity 0.15s", position: rightTab === "visualizer" ? "relative" : "absolute", pointerEvents: rightTab === "visualizer" ? "auto" : "none" }}>
              <VisualizerTab services={services} networks={networks} volumes={volumes} />
            </div>
            <div className="flex-1 min-h-0" style={{ opacity: rightTab === "yaml" ? 1 : 0, transition: "opacity 0.15s", position: rightTab === "yaml" ? "relative" : "absolute", pointerEvents: rightTab === "yaml" ? "auto" : "none" }}>
              <YamlPreview yamlContent={yamlContent} />
            </div>
            <div className="flex-1 min-h-0" style={{ opacity: rightTab === "existing" ? 1 : 0, transition: "opacity 0.15s", position: rightTab === "existing" ? "relative" : "absolute", pointerEvents: rightTab === "existing" ? "auto" : "none" }}>
              <LocalStackDeployer onDeployExisting={onDeployExisting || (() => {})} isDeploying={isDeploying} />
            </div>
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
              Stack verified ({services.length} services{networks.length > 0 ? `, ${networks.length} networks` : ""}{volumes.length > 0 ? `, ${volumes.length} volumes` : ""})
            </p>
            <div className="text-sm text-text-secondary mt-0.5 flex items-center gap-2">
              <span>{configuredServices}/{services.length} services ready · Save location:</span>
              {targetDir ? (
                <span className="font-mono text-brand truncate max-w-[200px]">{targetDir}</span>
              ) : (
                <span className="text-danger">Not selected</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <input type="text" value={stackName} onChange={(e) => setStackName(e.target.value)} placeholder="Stack name"
            className="bg-surface border border-border rounded-sm px-4 py-2.5 text-sm text-text-primary focus:border-brand/50 outline-none w-36 transition-colors" />
          <button onClick={() => setShowPicker(true)}
            className="bg-surface border border-border hover:border-brand/50 text-text-secondary hover:text-text-primary px-4 py-2.5 rounded-sm text-sm font-semibold transition-all flex items-center gap-2">
            <FolderOpen className="w-4 h-4" /> Browse
          </button>
          <button onClick={() => onDeploy(services, stackName, targetDir)}
            disabled={isDeploying || !stackName || !targetDir}
            className="bg-brand hover:bg-brand-hover text-white px-8 py-2.5 rounded-sm text-sm font-semibold transition-all active:scale-95 disabled:opacity-50">
            {isDeploying ? "Deploying..." : "Deploy stack"}
          </button>
        </div>
      </div>

      {showPicker && (
        <DirectoryPicker title="Select save location"
          onSelect={(path) => { setTargetDir(path); setShowPicker(false); }}
          onCancel={() => setShowPicker(false)}
          initialPath={targetDir || ""} />
      )}
    </div>
  );
};
