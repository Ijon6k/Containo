"use client";

import React, { useState } from "react";
import { Container } from "@/lib/types";
import { PruneAction } from "./maintenance/PruneAction";
import { Skeleton, SkeletonCard } from "./ui/Skeleton";
import { Layers, Box, HardDrive, Network, Image, Server } from "lucide-react";

interface MaintenanceProps {
  containers: Container[];
  systemInfo: any;
  addToast: (msg: string, type?: "success" | "error") => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, type?: "danger" | "warning" | "info") => void;
  onPrune: (options: string[]) => Promise<void>;
}

export default function Maintenance({
  systemInfo,
  addToast,
  showConfirm,
  onPrune,
}: MaintenanceProps) {
  const [isPruning, setIsPruning] = useState(false);

  const handlePrune = (options: string[]) => {
    if (options.length === 0) return;
    showConfirm(
      "Prune resources",
      `This will prune: ${options.join(", ")}. This action cannot be undone.`,
      async () => {
        setIsPruning(true);
        try { await onPrune(options); addToast("System pruned successfully"); }
        catch { addToast("Prune failed", "error"); }
        finally { setIsPruning(false); }
      },
      "danger",
    );
  };

  if (!systemInfo) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard /><SkeletonCard />
        </div>
        <SkeletonCard />
      </div>
    );
  }

  const s = systemInfo.storage || {};
  const cs = systemInfo.containerStats || {};
  const di = systemInfo.dockerInfo || {};
  const imagesGB = (s.imagesBytes || 0) / 1024 ** 3;
  const volumesGB = (s.volumesBytes || 0) / 1024 ** 3;
  const systemGB = s.systemBytes / 1024 ** 3 || 0;
  const dockerGB = s.dockerBytes / 1024 ** 3 || 0;
  const freeGB = s.hostFree / 1024 ** 3 || 0;
  const hostTotalGB = s.hostTotal / 1024 ** 3 || 0;
  const usedPct = (s.hostUsed / s.hostTotal) * 100 || 0;
  const systemPct = (s.systemBytes / s.hostTotal) * 100 || 0;
  const dockerPct = (s.dockerBytes / s.hostTotal) * 100 || 0;
  const freePct = (freeGB / hostTotalGB) * 100 || 0;

  function freeLabelColor(p: number) { return p <= 10 ? 'text-danger' : p <= 25 ? 'text-warning' : 'text-success'; }

  const metaCards = [
    { icon: Layers, label: 'Containers', value: `${cs.running ?? 0} / ${cs.total ?? 0}`, sub: 'running / total' },
    { icon: Image, label: 'Images', value: `${systemInfo.imagesCount ?? 0}`, sub: `${imagesGB.toFixed(1)} GB` },
    { icon: HardDrive, label: 'Volumes', value: `${volumesGB.toFixed(1)} GB`, sub: 'local volumes' },
    { icon: Server, label: 'Engine', value: `v${di.serverVersion ?? '...'}`, sub: `${di.cpus ?? '?'} CPUs · ${di.memTotal ?? '?'} GB` },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">Maintenance</h2>
        <p className="text-[13px] text-text-secondary mt-0.5">Monitor usage, prune waste, keep Docker healthy</p>
      </div>

      {/* Row 1 — Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metaCards.map((card) => (
          <div key={card.label} className="bg-surface border border-border rounded-md p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-brand/10 text-brand flex items-center justify-center shrink-0">
                <card.icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-[12px] text-text-tertiary">{card.label}</span>
            </div>
            <div className="text-[15px] font-semibold text-text-primary tabular-nums">{card.value}</div>
            <div className="text-[11px] text-text-tertiary mt-0.5">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Row 2 — Storage bar + insights + prune */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Storage analysis */}
        <div className="bg-surface border border-border rounded-md p-5 flex flex-col">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-md bg-brand/10 text-brand flex items-center justify-center shrink-0">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-text-primary">Storage</h3>
              <p className="text-[12px] text-text-tertiary">{hostTotalGB.toFixed(1)} GB total disk</p>
            </div>
            <span className="ml-auto text-lg font-semibold text-text-primary tabular-nums">{usedPct.toFixed(0)}% used</span>
          </div>

          {/* Native horizontal bar */}
          <div className="h-8 bg-hover rounded-full overflow-hidden flex border border-border/30 mb-4">
            <div
              className="h-full bg-[#555555] flex items-center justify-center text-[11px] text-white/70 font-medium transition-all duration-700"
              style={{ width: `${Math.max(systemPct, 0.5)}%`, minWidth: systemPct > 12 ? undefined : 0 }}
            >
              {systemPct > 12 ? `${systemGB.toFixed(0)} GB` : ''}
            </div>
            <div
              className="h-full bg-brand flex items-center justify-center text-[11px] text-white/70 font-medium transition-all duration-700"
              style={{ width: `${Math.max(dockerPct, 0.5)}%`, minWidth: dockerPct > 12 ? undefined : 0 }}
            >
              {dockerPct > 12 ? `${dockerGB.toFixed(0)} GB` : ''}
            </div>
            <div className="flex-1 h-full" />
          </div>

          <div className="grid grid-cols-3 gap-4 flex-1">
            <div>
              <div className="text-[12px] text-text-tertiary mb-1">System</div>
              <div className="text-[15px] font-semibold text-text-primary tabular-nums">{systemGB.toFixed(1)} GB</div>
              <div className="text-[11px] text-text-tertiary">{systemPct.toFixed(0)}% of disk</div>
            </div>
            <div>
              <div className="text-[12px] text-text-tertiary mb-1">Docker</div>
              <div className="text-[15px] font-semibold text-text-primary tabular-nums">{dockerGB.toFixed(1)} GB</div>
              <div className="text-[11px] text-text-tertiary">images + volumes</div>
            </div>
            <div>
              <div className="text-[12px] text-text-tertiary mb-1">Free</div>
              <div className={`text-[15px] font-semibold tabular-nums ${freeLabelColor(freePct)}`}>{freeGB.toFixed(1)} GB</div>
              <div className="text-[11px] text-text-tertiary">{freePct.toFixed(0)}% remaining</div>
            </div>
          </div>
        </div>

        {/* Right: Prune */}
        <PruneAction isPruning={isPruning} onPrune={handlePrune} />
      </div>
    </div>
  );
}
