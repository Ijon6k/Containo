"use client";

import React, { useState } from "react";
import { Cpu, Layers, HardDrive, Package, EyeOff, Eye } from "lucide-react";
import { AreaChart, Area, YAxis, PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Container } from "@/lib/types";

interface SystemStatsProps {
  containers: Container[];
  systemInfo: any;
}

const MiniArea = ({ data, color, dataKey }: { data: { v: number }[]; color: string; dataKey: string }) => (
  <div className="flex-1 min-h-0">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.15} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis domain={[0, 100]} hide />
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
          fill={`url(#grad-${dataKey})`} isAnimationActive={false} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export const SystemStats = ({ containers, systemInfo }: SystemStatsProps) => {
  const [visible, setVisible] = useState(true);
  const sysCpu = systemInfo?.cpuUsage || 0;
  const sysMem = systemInfo?.memUsage || 0;
  const dockerCpu = systemInfo?.dockerCpu || 0;
  const dockerMem = systemInfo?.dockerMem || 0;
  const timestamp = systemInfo?.timestamp;
  const running = containers.filter((c) => c.status === "running").length;
  const total = containers.length;
  const s = systemInfo?.storage || { hostTotal: 1, hostFree: 0, hostUsed: 0, systemBytes: 0, dockerBytes: 0 };
  const systemGB = s.systemBytes / 1024 ** 3 || 0;
  const dockerGB = s.dockerBytes / 1024 ** 3 || 0;
  const hostTotalGB = s.hostTotal / 1024 ** 3 || 0;
  const freeGB = s.hostFree / 1024 ** 3 || 0;
  const usedPct = (s.hostUsed / s.hostTotal) * 100 || 0;
  const freePct = (freeGB / hostTotalGB) * 100 || 0;
  const dockerVersion = systemInfo?.dockerInfo?.serverVersion || "...";

  const [cpuHistory, setCpuHistory] = useState<{ v: number }[]>(Array.from({ length: 30 }, () => ({ v: 0 })));
  const [memHistory, setMemHistory] = useState<{ v: number }[]>(Array.from({ length: 30 }, () => ({ v: 0 })));

  React.useEffect(() => {
    setCpuHistory(prev => { const next = [...prev, { v: sysCpu }]; return next.length > 30 ? next.slice(next.length - 30) : next; });
    setMemHistory(prev => { const next = [...prev, { v: sysMem }]; return next.length > 30 ? next.slice(next.length - 30) : next; });
  }, [timestamp, sysCpu, sysMem]);

  function storageFreeColor(pct: number): string {
    if (pct <= 10) return '#f87171'; if (pct <= 25) return '#fbbf24'; if (pct <= 50) return '#a78bfa'; return '#34d399';
  }

  const storageData = [
    { name: "System", value: systemGB, color: "#555555" },
    { name: "Docker", value: dockerGB, color: "#a78bfa" },
    { name: "Free", value: Math.max(0, hostTotalGB - systemGB - dockerGB), color: "transparent" },
  ].filter(d => d.value > 0);

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2 px-0.5">
        <span className="text-[12px] text-text-tertiary">System metrics</span>
        <button onClick={() => setVisible(!visible)}
          className="p-1 rounded-md hover:bg-hover text-text-tertiary hover:text-text-secondary transition-colors"
          aria-label={visible ? "Hide system metrics" : "Show system metrics"}>
          {visible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
        </button>
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 transition-all duration-300 ${visible ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
        {visible && <>
          {/* CPU */}
          <div className="bg-surface border border-border rounded-md p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-brand/10 text-brand flex items-center justify-center shrink-0"><Cpu className="w-3.5 h-3.5" /></div>
              <div><div className="text-[13px] font-medium text-text-secondary leading-tight">CPU</div><div className="text-[11px] text-text-tertiary leading-tight">Host</div></div>
              <span className="ml-auto text-lg font-semibold text-text-primary tabular-nums">{sysCpu}%</span>
            </div>
            <MiniArea data={cpuHistory} color="#a78bfa" dataKey="cpu" />
          </div>
          {/* Memory */}
          <div className="bg-surface border border-border rounded-md p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-brand/10 text-brand flex items-center justify-center shrink-0"><Layers className="w-3.5 h-3.5" /></div>
              <div><div className="text-[13px] font-medium text-text-secondary leading-tight">Memory</div><div className="text-[11px] text-text-tertiary leading-tight">Host</div></div>
              <span className="ml-auto text-lg font-semibold text-text-primary tabular-nums">{sysMem}%</span>
            </div>
            <MiniArea data={memHistory} color="#818cf8" dataKey="mem" />
          </div>
          {/* Docker Load */}
          <div className="bg-surface border border-border rounded-md p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-md bg-brand/10 text-brand flex items-center justify-center shrink-0"><Package className="w-3.5 h-3.5" /></div>
              <span className="text-[13px] font-medium text-text-secondary">Docker load</span>
              <span className="ml-auto text-[11px] text-text-tertiary font-mono">v{dockerVersion}</span>
            </div>
            <div className="space-y-3 flex-1">
              <div>
                <div className="flex items-center justify-between mb-1"><span className="text-[12px] text-text-tertiary">CPU</span><span className="text-[13px] font-semibold text-text-primary tabular-nums">{dockerCpu}%</span></div>
                <div className="h-1 bg-hover rounded-full overflow-hidden">
                  <div className="h-full bg-brand rounded-full transition-all duration-500" style={{ width: `${Math.min(dockerCpu, 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1"><span className="text-[12px] text-text-tertiary">RAM</span><span className="text-[13px] font-semibold text-text-primary tabular-nums">{dockerMem}%</span></div>
                <div className="h-1 bg-hover rounded-full overflow-hidden">
                  <div className="h-full bg-brand rounded-full transition-all duration-500" style={{ width: `${Math.min(dockerMem, 100)}%` }} />
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[12px]">
              <span className="text-text-tertiary">Containers</span>
              <span className="font-medium tabular-nums"><span className="text-success">{running}</span><span className="text-text-tertiary"> / {total}</span></span>
            </div>
          </div>
          {/* Storage */}
          <div className="bg-surface border border-border rounded-md p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-md bg-brand/10 text-brand flex items-center justify-center shrink-0"><HardDrive className="w-3.5 h-3.5" /></div>
              <span className="text-[13px] font-medium text-text-secondary">Storage</span>
              <span className="ml-auto text-lg font-semibold text-text-primary tabular-nums">{usedPct.toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <div className="w-[70px] h-[70px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={storageData} cx="50%" cy="50%" innerRadius={20} outerRadius={32} dataKey="value" stroke="none" isAnimationActive={false}>
                      {storageData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, fontSize: 12 }}
                      formatter={(val, name) => [`${Number(val).toFixed(0)} GB`, String(name)]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2 text-[12px]">
                <div><div className="flex items-center gap-1.5 mb-0.5"><div className="w-2 h-2 rounded-sm bg-[#555] shrink-0" /><span className="text-text-tertiary">System</span></div><span className="text-[13px] font-semibold text-text-primary tabular-nums">{systemGB.toFixed(0)} GB</span></div>
                <div><div className="flex items-center gap-1.5 mb-0.5"><div className="w-2 h-2 rounded-sm bg-brand shrink-0" /><span className="text-text-tertiary">Docker</span></div><span className="text-[13px] font-semibold text-text-primary tabular-nums">{dockerGB.toFixed(0)} GB</span></div>
              </div>
            </div>
            <div className="flex items-center justify-between text-[12px] mt-2 pt-2 border-t border-border">
              <span className="text-text-tertiary">{hostTotalGB.toFixed(0)} GB total</span>
              <span className="font-medium tabular-nums" style={{ color: storageFreeColor(freePct) }}>{freeGB.toFixed(0)} GB free</span>
            </div>
          </div>
        </>}
      </div>
    </div>
  );
};
