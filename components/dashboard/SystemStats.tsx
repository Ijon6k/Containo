"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  MemoryStick,
  HardDrive,
  Package,
  EyeOff,
  Eye,
} from "lucide-react";
import {
  AreaChart,
  Area,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { Container } from "@/lib/types";

interface SystemStatsProps {
  containers: Container[];
  systemInfo: any;
}

const MiniArea = ({
  data,
  color,
  dataKey,
}: {
  data: { v: number }[];
  color: string;
  dataKey: string;
}) => (
  <div className="flex-1 min-h-[44px]">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis domain={[0, 100]} hide />
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.75}
          fill={`url(#grad-${dataKey})`}
          isAnimationActive={false}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

function storageFreeColor(pct: number): string {
  if (pct <= 10) return "var(--danger)";
  if (pct <= 25) return "var(--warning)";
  if (pct <= 50) return "var(--brand)";
  return "var(--success)";
}

export const SystemStats = ({ containers, systemInfo }: SystemStatsProps) => {
  const [visible, setVisible] = useState(true);

  const sysCpu = systemInfo?.cpuUsage || 0;
  const sysMem = systemInfo?.memUsage || 0;
  const dockerCpu = systemInfo?.dockerCpu || 0;
  const dockerMem = systemInfo?.dockerMem || 0;
  const timestamp = systemInfo?.timestamp;
  const running = containers.filter((c) => c.status === "running").length;
  const total = containers.length;

  const s = systemInfo?.storage || {
    hostTotal: 1,
    hostFree: 0,
    hostUsed: 0,
    systemBytes: 0,
    dockerBytes: 0,
  };
  const systemGB = s.systemBytes / 1024 ** 3 || 0;
  const dockerGB = s.dockerBytes / 1024 ** 3 || 0;
  const hostTotalGB = s.hostTotal / 1024 ** 3 || 0;
  const freeGB = s.hostFree / 1024 ** 3 || 0;
  const usedPct = (s.hostUsed / s.hostTotal) * 100 || 0;
  const freePct = (freeGB / hostTotalGB) * 100 || 0;
  const dockerVersion = systemInfo?.dockerInfo?.serverVersion || "—";

  const [cpuHistory, setCpuHistory] = useState<{ v: number }[]>(() =>
    Array.from({ length: 30 }, () => ({ v: 0 })),
  );
  const [memHistory, setMemHistory] = useState<{ v: number }[]>(() =>
    Array.from({ length: 30 }, () => ({ v: 0 })),
  );

  useEffect(() => {
    setCpuHistory((prev) => {
      const next = [...prev, { v: sysCpu }];
      return next.length > 30 ? next.slice(next.length - 30) : next;
    });
    setMemHistory((prev) => {
      const next = [...prev, { v: sysMem }];
      return next.length > 30 ? next.slice(next.length - 30) : next;
    });
  }, [timestamp, sysCpu, sysMem]);

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3 px-0.5">
        <span className="text-sm font-semibold text-text-secondary tracking-tight">
          System metrics
        </span>
        <button
          onClick={() => setVisible(!visible)}
          className="p-1.5 rounded-md hover:bg-hover text-text-tertiary hover:text-text-secondary transition-colors"
          aria-label={visible ? "Hide system metrics" : "Show system metrics"}
        >
          {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-300 ${
          visible ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
        }`}
      >
        {visible && (
          <>
            {/* CPU */}
            <MetricCard
              icon={<Cpu className="w-4 h-4" />}
              label="CPU"
              sublabel="Host load"
              value={`${sysCpu}%`}
            >
              <MiniArea data={cpuHistory} color="#7c3aed" dataKey="cpu" />
            </MetricCard>

            {/* Memory */}
            <MetricCard
              icon={<MemoryStick className="w-4 h-4" />}
              label="Memory"
              sublabel="Host usage"
              value={`${sysMem}%`}
            >
              <MiniArea data={memHistory} color="#6366f1" dataKey="mem" />
            </MetricCard>

            {/* Docker Load */}
            <MetricCard
              icon={<Package className="w-4 h-4" />}
              label="Docker load"
              sublabel={`Engine v${dockerVersion}`}
            >
              <div className="space-y-3 flex-1 mt-1">
                <ProgressRow
                  label="CPU"
                  percent={dockerCpu}
                  colorClass="bg-brand"
                />
                <ProgressRow
                  label="RAM"
                  percent={dockerMem}
                  colorClass="bg-indigo-500"
                />
              </div>
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs text-text-tertiary">Containers</span>
                <span className="text-sm font-semibold tabular-nums">
                  <span className="text-success">{running}</span>
                  <span className="text-text-tertiary"> / {total}</span>
                </span>
              </div>
            </MetricCard>

            {/* Storage — refactored layout */}
            <div className="bg-surface border border-border rounded-md card-shadow p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-brand/10 text-brand flex items-center justify-center shrink-0">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-semibold text-text-primary leading-tight">
                    Storage
                  </div>
                  <div className="text-xs text-text-tertiary leading-tight">
                    Host disk usage
                  </div>
                </div>
                <span className="text-xl font-bold text-text-primary tabular-nums">
                  {usedPct.toFixed(0)}%
                </span>
              </div>

              {/* Stacked bar — clearer at-a-glance than a tiny donut */}
              <div className="h-3 w-full rounded-full overflow-hidden bg-surface2 flex">
                <div
                  className="h-full bg-slate-500 transition-all duration-500"
                  style={{
                    width: `${hostTotalGB ? (systemGB / hostTotalGB) * 100 : 0}%`,
                  }}
                  title={`System ${systemGB.toFixed(1)} GB`}
                />
                <div
                  className="h-full bg-brand transition-all duration-500"
                  style={{
                    width: `${hostTotalGB ? (dockerGB / hostTotalGB) * 100 : 0}%`,
                  }}
                  title={`Docker ${dockerGB.toFixed(1)} GB`}
                />
              </div>

              {/* Breakdown rows */}
              <div className="space-y-2.5">
                <StorageRow
                  swatch="bg-slate-500"
                  label="System"
                  usedGB={systemGB}
                  totalGB={hostTotalGB}
                />
                <StorageRow
                  swatch="bg-brand"
                  label="Docker"
                  usedGB={dockerGB}
                  totalGB={hostTotalGB}
                />
                <StorageRow
                  swatch="bg-emerald-500"
                  label="Free"
                  usedGB={freeGB}
                  totalGB={hostTotalGB}
                  valueColor={storageFreeColor(freePct)}
                  showPercent={false}
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs text-text-tertiary">
                  {hostTotalGB.toFixed(0)} GB total
                </span>
                <span
                  className="text-xs font-semibold tabular-nums"
                  style={{ color: storageFreeColor(freePct) }}
                >
                  {freeGB.toFixed(0)} GB free
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  value?: string;
  children?: React.ReactNode;
}

function MetricCard({
  icon,
  label,
  sublabel,
  value,
  children,
}: MetricCardProps) {
  return (
    <div className="bg-surface border border-border rounded-md card-shadow p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-md bg-brand/10 text-brand flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-base font-semibold text-text-primary leading-tight">
            {label}
          </div>
          <div className="text-xs text-text-tertiary leading-tight truncate">
            {sublabel}
          </div>
        </div>
        {value && (
          <span className="text-xl font-bold text-text-primary tabular-nums">
            {value}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function ProgressRow({
  label,
  percent,
  colorClass,
}: {
  label: string;
  percent: number;
  colorClass: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-text-secondary">{label}</span>
        <span className="text-sm font-semibold text-text-primary tabular-nums">
          {percent}%
        </span>
      </div>
      <div className="h-1.5 bg-hover rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}

function StorageRow({
  swatch,
  label,
  usedGB,
  totalGB,
  valueColor,
  showPercent = true,
}: {
  swatch: string;
  label: string;
  usedGB: number;
  totalGB: number;
  valueColor?: string;
  showPercent?: boolean;
}) {
  const pct = totalGB > 0 ? (usedGB / totalGB) * 100 : 0;
  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-2.5 h-2.5 rounded-sm ${swatch} shrink-0`} />
      <span className="text-xs font-medium text-text-secondary w-16 shrink-0">
        {label}
      </span>
      <span
        className="text-sm font-semibold text-text-primary tabular-nums flex-1 text-right"
        style={valueColor ? { color: valueColor } : undefined}
      >
        {usedGB.toFixed(1)} GB
      </span>
      {showPercent && (
        <span className="text-xs text-text-tertiary tabular-nums w-10 text-right">
          {pct.toFixed(0)}%
        </span>
      )}
    </div>
  );
}
