import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Globe,
  HardDrive,
  Minus,
  Network,
  Plus,
  Plug,
  RotateCcw,
} from "lucide-react";
import { ServiceData, ComposeNetwork, ComposeVolume } from "@/lib/types";

interface VisualizerTabProps {
  services: ServiceData[];
  networks?: ComposeNetwork[];
  volumes?: ComposeVolume[];
}

type ServiceNode = {
  id: string;
  name: string;
  image: string;
  ports: string[];
  dependencies: string[];
  depNames: string[];
  missingDeps: string[];
  networks: string[];
  volumes: string[];
  issues: string[];
  isReady: boolean;
  layer: number;
  column: number;
};

const VP_W = 800;
const VP_H = 500;
const NODE_W = 190;
const NODE_H = 74;
const GAP_X = 110;
const GAP_Y = 100;
const PADDING = 60;

export const VisualizerTab = ({ services, networks = [], volumes = [] }: VisualizerTabProps) => {
  const parseList = React.useCallback((value?: string) => {
    if (!value) return [];
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }, []);

  const nodes = React.useMemo(() => {
    const names = new Set(services.map((s) => s.name.trim()).filter(Boolean));

    const raw: Omit<ServiceNode, "layer" | "column">[] = services.map((service) => {
      const dependencies = parseList(service.depends_on);
      const ports = parseList(service.ports);
      const svcNetworks = parseList(service.networks);
      const svcVolumes = parseList(service.volumes);
      const issues: string[] = [];

      if (!service.name.trim()) issues.push("No name");
      if (!service.image.trim()) issues.push("No image");

      const missingDeps = dependencies.filter((d) => !names.has(d));
      if (missingDeps.length > 0) issues.push(`Missing dep: ${missingDeps.join(", ")}`);

      return {
        id: service.id,
        name: service.name || `svc-${service.id}`,
        image: service.image,
        ports,
        dependencies,
        depNames: dependencies,
        missingDeps,
        networks: svcNetworks,
        volumes: svcVolumes,
        issues,
        isReady: issues.length === 0,
      };
    });

    const resolved = new Map<string, ServiceNode>();
    const inStack = new Set<string>();

    function assignLayerRecursive(
      node: Omit<ServiceNode, "layer" | "column">,
      visited: Set<string> = new Set(),
    ): number {
      if (resolved.has(node.id)) return resolved.get(node.id)!.layer;
      if (visited.has(node.id)) {
        // Cycle detected — place at layer 0 with a warning
        const existing = resolved.get(node.id);
        if (existing && !existing.issues.some((i) => i.includes("Cycle"))) {
          existing.issues.push("Cycle detected in dependency graph");
        }
        return 0;
      }
      inStack.add(node.id);
      visited.add(node.id);

      let maxDepLayer = -1;
      for (const depName of node.depNames) {
        const dep = raw.find((r) => r.name === depName);
        if (dep) {
          maxDepLayer = Math.max(maxDepLayer, assignLayerRecursive(dep, visited));
        }
      }

      const layer = maxDepLayer + 1;
      inStack.delete(node.id);
      resolved.set(node.id, { ...node, layer, column: 0, isReady: node.issues.length === 0 });
      return layer;
    }

    raw.forEach((r) => assignLayerRecursive(r));

    const layers = new Map<number, ServiceNode[]>();
    resolved.forEach((n) => {
      const existing = layers.get(n.layer) ?? [];
      existing.push(n);
      layers.set(n.layer, existing);
    });

    layers.forEach((layerNodes) => {
      layerNodes.forEach((n, i) => {
        n.column = i;
      });
    });

    return Array.from(resolved.values()).sort((a, b) => a.layer - b.layer || a.column - b.column);
  }, [parseList, services]);

  const [selectedNodeId, setSelectedNodeId] = React.useState<string>("");
  const [inspectorOpen, setInspectorOpen] = React.useState(false);

  const svgRef = React.useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = React.useState({ x: 0, y: 0, w: VP_W, h: VP_H });
  const [isPanning, setIsPanning] = React.useState(false);
  const panStart = React.useRef({ x: 0, y: 0, vx: 0, vy: 0 });

  const nodePositions = React.useMemo(() => {
    const positions = new Map<string, { x: number; y: number }>();
    nodes.forEach((n) => {
      const layerIndex = n.layer;
      const maxCol = Math.max(0, ...nodes.filter((nn) => nn.layer === layerIndex).map((nn) => nn.column));
      const totalCols = maxCol + 1;
      const rowWidth = totalCols * (NODE_W + GAP_X) - GAP_X;
      const startX = VP_W / 2 - rowWidth / 2 + PADDING / 2;
      const x = startX + n.column * (NODE_W + GAP_X);
      const y = PADDING + layerIndex * (NODE_H + GAP_Y);
      positions.set(n.id, { x, y });
    });
    return positions;
  }, [nodes]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const handleNodeClick = (id: string) => {
    if (selectedNodeId === id && inspectorOpen) {
      setInspectorOpen(false);
      return;
    }
    setSelectedNodeId(id);
    setInspectorOpen(true);
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const scale = e.deltaY > 0 ? 1.15 : 1 / 1.15;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = ((e.clientX - rect.left) / rect.width) * viewBox.w;
    const my = ((e.clientY - rect.top) / rect.height) * viewBox.h;
    setViewBox((prev) => {
      const nw = Math.max(200, prev.w * scale);
      const nh = Math.max(150, prev.h * scale);
      const nx = prev.x + mx * (1 - scale);
      const ny = prev.y + my * (1 - scale);
      return { x: nx, y: ny, w: nw, h: nh };
    });
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, vx: viewBox.x, vy: viewBox.y };
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isPanning) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scaleX = viewBox.w / rect.width;
    const scaleY = viewBox.h / rect.height;
    setViewBox((prev) => ({
      ...prev,
      x: panStart.current.vx - dx * scaleX,
      y: panStart.current.vy - dy * scaleY,
    }));
  };

  const handleMouseUp = () => setIsPanning(false);

  const resetView = () => setViewBox({ x: 0, y: 0, w: VP_W, h: VP_H });

  const zoomIn = () => setViewBox((prev) => {
    const s = 0.85;
    return { x: prev.x + prev.w * (1 - s) / 2, y: prev.y + prev.h * (1 - s) / 2, w: prev.w * s, h: prev.h * s };
  });

  const zoomOut = () => setViewBox((prev) => {
    const s = 1 / 0.85;
    return { x: prev.x + prev.w * (1 - s) / 2, y: prev.y + prev.h * (1 - s) / 2, w: prev.w * s, h: prev.h * s };
  });

  const summary = React.useMemo(() => {
    const exposed = nodes.filter((n) => n.ports.length > 0).length;
    const totalDeps = nodes.reduce((c, n) => c + n.dependencies.length, 0);
    const warnings = nodes.reduce((c, n) => c + n.issues.length, 0);
    const readyCount = nodes.filter((n) => n.isReady).length;
    return { exposed, totalDeps, warnings, readyCount };
  }, [nodes]);

  if (services.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 text-text-secondary">
        <div className="w-16 h-16 rounded-full bg-surface2 flex items-center justify-center">
          <Network className="w-8 h-8 text-text-tertiary" />
        </div>
        <p className="text-base font-medium">No services configured yet</p>
        <p className="text-sm text-text-tertiary">Add at least one service to visualize the stack topology.</p>
      </div>
    );
  }

  // ── SVG uses the theme tokens via CSS variables ──
  const edgeColor = "var(--text-tertiary)";
  const edgeSelected = "var(--brand)";
  const nodeFill = "var(--surface2)";
  const nodeBorder = "var(--border)";
  const textPrimary = "var(--text-primary)";
  const textTertiary = "var(--text-tertiary)";
  const badgeFill = "var(--brand)";

  return (
    <div className="h-full min-h-0 flex flex-col gap-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Services", value: `${summary.readyCount}/${nodes.length} ready`, icon: CheckCircle2, color: summary.warnings === 0 ? "text-success" : "text-warning" },
          { label: "Exposed", value: summary.exposed, hint: "public entrypoints", icon: Globe },
          { label: "Dependencies", value: summary.totalDeps, hint: "service links", icon: Plug },
          { label: "Warnings", value: summary.warnings, hint: summary.warnings === 0 ? "stack valid" : "needs attention", icon: AlertTriangle, color: summary.warnings > 0 ? "text-warning" : "text-success" },
        ].map((item) => (
          <div key={item.label} className="rounded-md border border-border bg-surface2/40 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-text-tertiary">{item.label}</span>
              <item.icon className={`w-4 h-4 ${item.color ?? "text-brand"}`} />
            </div>
            <div className="mt-2 text-xl font-semibold text-text-primary tabular-nums">{item.value}</div>
            {item.hint && <div className="text-[12px] text-text-tertiary">{item.hint}</div>}
          </div>
        ))}
      </div>

      <div className="flex-1 min-h-0 relative rounded-md border border-border bg-surface overflow-hidden">
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
          <div className="flex bg-surface2/80 backdrop-blur rounded-sm border border-border">
            <button onClick={zoomIn} className="p-1.5 hover:bg-hover text-text-secondary hover:text-text-primary transition-colors" aria-label="Zoom in">
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button onClick={zoomOut} className="p-1.5 hover:bg-hover text-text-secondary hover:text-text-primary transition-colors" aria-label="Zoom out">
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button onClick={resetView} className="p-1.5 hover:bg-hover text-text-secondary hover:text-text-primary transition-colors border-l border-border" aria-label="Reset view">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-3 text-[12px] text-text-secondary bg-surface2/80 backdrop-blur rounded-sm border border-border px-3 py-1.5">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-success" /> Ready</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-warning" /> Warning</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-danger" /> Incomplete</div>
        </div>

        <svg
          ref={svgRef}
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
          className={`w-full h-full ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill={edgeColor} />
            </marker>
            <filter id="node-shadow">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.15" />
            </filter>
          </defs>

          {nodes.map((node) =>
            node.depNames.map((depName) => {
              const target = nodes.find((n) => n.name === depName);
              if (!target) return null;
              const from = nodePositions.get(node.id);
              const to = nodePositions.get(target.id);
              if (!from || !to) return null;

              const x1 = from.x + NODE_W / 2;
              const y1 = from.y;
              const x2 = to.x + NODE_W / 2;
              const y2 = to.y + NODE_H;
              const cpOffset = Math.min(40, Math.abs(y1 - y2) / 2);

              return (
                <path
                  key={`edge-${node.id}-${depName}`}
                  d={`M${x1} ${y1} C${x1} ${y1 - cpOffset}, ${x2} ${y2 + cpOffset}, ${x2} ${y2}`}
                  fill="none"
                  stroke={selectedNodeId === node.id || selectedNodeId === target.id ? edgeSelected : edgeColor}
                  strokeWidth={selectedNodeId === node.id || selectedNodeId === target.id ? 1.5 : 1}
                  strokeDasharray={node.missingDeps.includes(depName) ? "4 3" : undefined}
                  markerEnd={node.missingDeps.includes(depName) ? undefined : "url(#arrowhead)"}
                  opacity={0.5}
                />
              );
            })
          )}

          {nodes.map((node) => {
            const pos = nodePositions.get(node.id);
            if (!pos) return null;

            const isSelected = selectedNodeId === node.id;
            const statusColor = node.isReady ? "var(--success)" : node.missingDeps.length > 0 ? "var(--danger)" : "var(--warning)";
            const statusBg = node.isReady ? "var(--success-bg)" : node.missingDeps.length > 0 ? "var(--danger-bg)" : "var(--warning-bg)";

            return (
              <g key={node.id} onClick={() => handleNodeClick(node.id)} style={{ cursor: "pointer" }}>
                <rect
                  x={pos.x}
                  y={pos.y}
                  width={NODE_W}
                  height={NODE_H}
                  rx={6}
                  fill={isSelected ? "var(--brand)" : nodeFill}
                  fillOpacity={isSelected ? 0.08 : 1}
                  stroke={isSelected ? edgeSelected : nodeBorder}
                  strokeWidth={isSelected ? 1.5 : 1}
                  filter={isSelected ? "url(#node-shadow)" : undefined}
                />

                <circle cx={pos.x + 14} cy={pos.y + 18} r={4} fill={statusColor} />

                <text x={pos.x + 26} y={pos.y + 22} fontSize={13} fontWeight={600} fill={textPrimary} textAnchor="start">
                  {node.name.length > 18 ? node.name.slice(0, 17) + "\u2026" : node.name}
                </text>

                <text x={pos.x + 14} y={pos.y + 44} fontSize={11} fontWeight={400} fill={textTertiary} textAnchor="start">
                  {node.image ? (node.image.length > 30 ? node.image.slice(0, 29) + "\u2026" : node.image) : "no-image"}
                </text>

                {node.ports.length > 0 && (
                  <g>
                    <rect x={pos.x + 14} y={pos.y + 54} width={38} height={16} rx={3} fill={badgeFill} opacity={0.12} />
                    <text x={pos.x + 33} y={pos.y + 65} fontSize={10} fontWeight={500} fill={badgeFill} textAnchor="middle">Ports</text>
                  </g>
                )}

                {node.volumes.length > 0 && (
                  <g>
                    <rect x={node.ports.length > 0 ? pos.x + 58 : pos.x + 14} y={pos.y + 54} width={46} height={16} rx={3} fill={badgeFill} opacity={0.12} />
                    <text x={node.ports.length > 0 ? pos.x + 81 : pos.x + 37} y={pos.y + 65} fontSize={10} fontWeight={500} fill={badgeFill} textAnchor="middle">Volumes</text>
                  </g>
                )}

                {!node.isReady && (
                  <g>
                    <rect x={pos.x + NODE_W - 22} y={pos.y + 8} width={16} height={16} rx={3} fill={statusBg} />
                    <text x={pos.x + NODE_W - 14} y={pos.y + 20} fontSize={11} fontWeight={700} fill={statusColor} textAnchor="middle">!</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {inspectorOpen && selectedNode && (
        <div className="rounded-md border border-brand/30 bg-surface px-5 py-4 space-y-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-sm ${selectedNode.isReady ? "bg-success-bg text-success" : "bg-warning-bg text-warning"}`}>
                {selectedNode.isReady ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              </div>
              <div>
                <h3 className="text-base font-semibold text-text-primary">{selectedNode.name}</h3>
                <p className="text-sm font-mono text-text-secondary">{selectedNode.image || "no-image-selected"}</p>
              </div>
            </div>
            <button
              onClick={() => setInspectorOpen(false)}
              className="p-1.5 hover:bg-hover rounded-sm text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Close inspector"
            >
              <ChevronDown className="w-4 h-4 rotate-180" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="rounded-sm border border-border bg-surface2/30 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-2">
                <Globe className="w-4 h-4 text-brand" /> Exposure
              </div>
              <div className="text-text-secondary">
                {selectedNode.ports.length > 0 ? selectedNode.ports.join(", ") : "Internal only"}
              </div>
            </div>
            <div className="rounded-sm border border-border bg-surface2/30 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-2">
                <Plug className="w-4 h-4 text-brand" /> Dependencies
              </div>
              <div className="text-text-secondary">
                {selectedNode.depNames.length > 0 ? selectedNode.depNames.join(", ") : "None"}
                {selectedNode.missingDeps.length > 0 && (
                  <div className="mt-1 text-warning">Missing: {selectedNode.missingDeps.join(", ")}</div>
                )}
              </div>
            </div>
            <div className="rounded-sm border border-border bg-surface2/30 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-2">
                <HardDrive className="w-4 h-4 text-brand" /> Storage
              </div>
              <div className="text-text-secondary">
                {selectedNode.volumes.length > 0 ? selectedNode.volumes.join(", ") : "Ephemeral"}
              </div>
            </div>
          </div>

          {selectedNode.issues.length > 0 && (
            <div className="rounded-sm border border-warning/20 bg-warning-bg px-3 py-2 text-sm text-warning">
              {selectedNode.issues.join(" · ")}
            </div>
          )}
        </div>
      )}

      {(networks.length > 0 || volumes.length > 0) && (
        <div className="flex flex-wrap items-center gap-3 text-[12px] text-text-tertiary shrink-0">
          {networks.filter((n) => n.name.trim()).length > 0 && (
            <span className="flex items-center gap-1.5"><Network className="w-3 h-3" /> {networks.filter((n) => n.name.trim()).length} custom networks</span>
          )}
          {volumes.filter((v) => v.name.trim()).length > 0 && (
            <span className="flex items-center gap-1.5"><HardDrive className="w-3 h-3" /> {volumes.filter((v) => v.name.trim()).length} named volumes</span>
          )}
        </div>
      )}
    </div>
  );
};
