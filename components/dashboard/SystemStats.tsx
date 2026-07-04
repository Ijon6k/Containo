import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Server,
  Package,
  HardDrive,
  Activity,
  Cpu,
  BarChart3,
  AlignLeft,
  Layers,
  Zap,
  EyeOff,
} from "lucide-react";
import { Container } from "@/lib/types";
import { useMetricHistory } from "@/hooks/useMetricHistory";

interface SystemStatsProps {
  containers: Container[];
  systemInfo: any;
}

type ViewMode = "chart" | "bar" | "hidden";

const LinearBar = ({ value, color }: { value: number; color: string }) => (
  <div className="w-full h-1.5 bg-ui-accent rounded-full mt-3 overflow-hidden">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      className={`h-full ${color}`}
    />
  </div>
);

const HostAreaChart = ({
  value,
  strokeColor,
  fillColor,
  trigger,
}: {
  value: number;
  strokeColor: string;
  fillColor: string;
  trigger?: any;
}) => {
  const history = useMetricHistory(value, 30, trigger);
  const width = 300,
    height = 64,
    padding = 2;
  const points = history.map((val, index) => ({
    x: (index / (history.length - 1)) * width,
    y: height - padding - (val / 100) * (height - 2 * padding),
  }));
  const linePath =
    points.length > 0
      ? `M ${points[0].x} ${points[0].y} ` +
        points
          .slice(1)
          .map((p) => `L ${p.x} ${p.y}`)
          .join(" ")
      : "";
  const areaPath =
    points.length > 0 ? `${linePath} L ${width} ${height} L 0 ${height} Z` : "";
  const lastPoint = points[points.length - 1] || { x: width, y: height };
  const gradId = `grad-${strokeColor.replace("#", "")}`;
  return (
    <div className="h-16 w-full overflow-hidden mt-2 rounded-md bg-ui-accent/30 border border-ui-border/50 relative">
      <svg
        className="w-full h-full"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={fillColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <line
          x1="0"
          y1={height * 0.33}
          x2={width}
          y2={height * 0.33}
          stroke="var(--color-ui-border)"
          strokeOpacity="0.1"
          strokeDasharray="2 2"
        />
        <line
          x1="0"
          y1={height * 0.66}
          x2={width}
          y2={height * 0.66}
          stroke="var(--color-ui-border)"
          strokeOpacity="0.1"
          strokeDasharray="2 2"
        />
        {areaPath && (
          <path
            d={areaPath}
            fill={`url(#${gradId})`}
            className="transition-all duration-300"
          />
        )}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />
        )}
        {points.length > 0 && (
          <>
            <circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r="3"
              fill={strokeColor}
            />
            <circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r="6"
              fill={strokeColor}
              className="animate-ping"
              opacity="0.3"
            />
          </>
        )}
      </svg>
    </div>
  );
};

export const SystemStats = ({ containers, systemInfo }: SystemStatsProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>("chart");

  const sysCpu = systemInfo?.cpuUsage || 0;
  const sysMem = systemInfo?.memUsage || 0;
  const dockerCpu = systemInfo?.dockerCpu || 0;
  const dockerMem = systemInfo?.dockerMem || 0;
  const timestamp = systemInfo?.timestamp;
  const storage = systemInfo?.storage || {
    hostTotal: 1,
    hostFree: 0,
    hostUsed: 0,
    systemBytes: 0,
    dockerBytes: 0,
  };
  const systemGB = storage.systemBytes / 1024 ** 3 || 0;
  const dockerGB = storage.dockerBytes / 1024 ** 3 || 0;
  const freeGB = storage.hostFree / 1024 ** 3 || 0;
  const systemPercent = (storage.systemBytes / storage.hostTotal) * 100;
  const dockerPercent = (storage.dockerBytes / storage.hostTotal) * 100;

  const renderChart = (chartColor: string, barColor: string, value: number) => {
    if (viewMode === "bar") return <LinearBar value={value} color={barColor} />;
    return (
      <HostAreaChart
        value={value}
        strokeColor={chartColor}
        fillColor={chartColor}
        trigger={timestamp}
      />
    );
  };

  return (
    <div className="space-y-4 mb-10">
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
          <span className="text-[10px] font-bold text-text-sub uppercase tracking-widest">
            Real-time Metrics
          </span>
        </div>
        <div className="flex bg-ui-accent/50 rounded-lg p-1 border border-ui-border shadow-inner">
          <button
            onClick={() => setViewMode("chart")}
            className={`p-1.5 rounded-md transition-all ${viewMode === "chart" ? "bg-brand text-white shadow-md" : "text-text-sub hover:text-text-main"}`}
            title="Area Chart"
          >
            <BarChart3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode("bar")}
            className={`p-1.5 rounded-md transition-all ${viewMode === "bar" ? "bg-brand text-white shadow-md" : "text-text-sub hover:text-text-main"}`}
            title="Horizontal Bars"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode("hidden")}
            className="p-1.5 rounded-md transition-all text-text-sub hover:text-text-main"
            title="Hide Metrics"
          >
            <EyeOff className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {viewMode !== "hidden" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card p-8 bg-ui-bg border-ui-border rounded-lg relative overflow-hidden group transition-all hover:bg-ui-accent/30">
            <div className="absolute -right-2 -top-2 opacity-[0.03] group-hover:opacity-10 group-hover:text-brand transition-all duration-500 scale-110">
              <Cpu className="w-28 h-28" />
            </div>
            <div className="flex items-center gap-2 mb-8">
              <Server className="w-5 h-5 text-brand" />
              <span className="text-sm font-semibold text-text-sub uppercase tracking-wider">
                Host Resources
              </span>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <div className="flex justify-between text-sm font-medium text-text-sub mb-2">
                  <span>CPU Load</span>
                  <span className="text-text-main font-bold">{sysCpu}%</span>
                </div>
                {renderChart("#6366f1", "bg-indigo-500", sysCpu)}
              </div>
              <div>
                <div className="flex justify-between text-sm font-medium text-text-sub mb-2">
                  <span>Memory Use</span>
                  <span className="text-text-main font-bold">{sysMem}%</span>
                </div>
                {renderChart("#818cf8", "bg-indigo-400", sysMem)}
              </div>
            </div>
          </div>

          <div className="card p-8 bg-ui-bg border-ui-border rounded-lg relative overflow-hidden group transition-all hover:bg-ui-accent/30">
            <div className="absolute -right-2 -top-2 opacity-[0.02] group-hover:opacity-10 group-hover:text-emerald-500 transition-all duration-700 scale-125 rotate-12">
              <Package className="w-36 h-36" />
            </div>
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-semibold text-text-sub uppercase tracking-wider">
                  Docker Engine
                </span>
              </div>
              <span className="text-xs font-mono text-text-sub">
                {systemInfo?.dockerInfo?.serverVersion || "..."}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 relative z-10">
              <div className="flex justify-between items-center p-4 rounded-md bg-ui-accent border border-ui-border">
                <span className="text-sm text-text-sub font-medium">
                  Deployed Units
                </span>
                <span className="text-2xl font-bold text-text-main font-mono">
                  {containers.length}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-md bg-ui-accent border border-ui-border">
                <span className="text-sm text-text-sub font-medium">
                  Running Now
                </span>
                <span className="text-2xl font-bold text-emerald-500 font-mono">
                  {containers.filter((c) => c.status === "running").length}
                </span>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-between text-xs font-semibold text-text-sub uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
              <span className="font-mono">
                v{systemInfo?.dockerInfo?.serverVersion || "..."}
              </span>
              <Activity className="w-4 h-4" />
            </div>
          </div>

          <div className="card p-8 bg-ui-bg border-ui-border rounded-lg relative overflow-hidden group transition-all hover:bg-ui-accent/30">
            <div className="absolute -right-2 -top-2 opacity-[0.03] group-hover:opacity-10 group-hover:text-amber-500 transition-all duration-500 scale-110">
              <Zap className="w-28 h-28" />
            </div>
            <div className="flex items-center gap-2 mb-8">
              <Activity className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-semibold text-text-sub uppercase tracking-wider">
                Load Impact
              </span>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <div className="flex justify-between text-sm font-medium text-text-sub mb-2">
                  <span>Docker CPU</span>
                  <span className="text-amber-500 font-bold">{dockerCpu}%</span>
                </div>
                {renderChart("#f59e0b", "bg-amber-500", dockerCpu)}
              </div>
              <div>
                <div className="flex justify-between text-sm font-medium text-text-sub mb-2">
                  <span>Docker RAM</span>
                  <span className="text-amber-500 font-bold">{dockerMem}%</span>
                </div>
                {renderChart("#d97706", "bg-amber-600", dockerMem)}
              </div>
            </div>
          </div>

          <div className="card p-8 bg-ui-bg border-ui-border rounded-lg relative overflow-hidden group transition-all hover:bg-ui-accent/30">
            <div className="absolute -right-2 -top-2 opacity-[0.03] group-hover:opacity-10 group-hover:text-indigo-500 transition-all duration-500 scale-110">
              <HardDrive className="w-28 h-28" />
            </div>
            <div className="flex items-center gap-2 mb-8">
              <HardDrive className="w-5 h-5 text-indigo-500" />
              <span className="text-sm font-semibold text-text-sub uppercase tracking-wider">
                Storage Health
              </span>
            </div>
            <div className="space-y-6">
              <div className="flex items-end justify-between">
                <div className="space-y-2">
                  <p className="text-xs text-text-sub uppercase font-bold tracking-widest opacity-60">
                    Free Capacity
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-text-main font-mono leading-none">
                      {freeGB.toFixed(1)}
                    </span>
                    <span className="text-sm text-text-sub font-bold uppercase font-mono">
                      GB
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-indigo-500 font-mono leading-none">
                    {((storage.hostUsed / storage.hostTotal) * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-text-sub uppercase font-bold mt-2">
                    Used
                  </p>
                </div>
              </div>
              <div className="w-full h-4 bg-ui-accent rounded-md overflow-hidden flex border border-ui-border p-0.5">
                <motion.div
                  title="System / OS"
                  initial={{ width: 0 }}
                  animate={{ width: `${systemPercent}%` }}
                  className="h-full bg-slate-400 rounded-l-sm"
                />
                <motion.div
                  title="Docker Data"
                  initial={{ width: 0 }}
                  animate={{ width: `${dockerPercent}%` }}
                  className="h-full bg-brand"
                />
                <div
                  className="flex-1 h-full bg-transparent"
                  title="Free Space"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-slate-400" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-text-sub uppercase font-bold leading-none">
                      System
                    </span>
                    <span className="text-sm font-bold text-text-main font-mono leading-none mt-1.5">
                      {systemGB.toFixed(1)} GB
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-text-sub uppercase font-bold leading-none">
                      Docker
                    </span>
                    <span className="text-sm font-bold text-text-main font-mono leading-none mt-1.5">
                      {dockerGB.toFixed(1)} GB
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
