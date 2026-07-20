'use client';

import React from 'react';
import { Layers, Box, HardDrive, Network, Image } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface DockerResourcesProps {
  systemInfo: any;
}

const formatBytes = (bytes: number): string => {
  if (!bytes || bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
};

export function DockerResources({ systemInfo }: DockerResourcesProps) {
  const s = systemInfo?.storage || {};
  const cs = systemInfo?.containerStats || {};
  const imagesGB = (s.imagesBytes || 0) / 1024 ** 3;
  const volumesGB = (s.volumesBytes || 0) / 1024 ** 3;
  const dockerGB = (s.dockerBytes || 0) / 1024 ** 3;

  const breakdown = [
    { label: 'Images', value: imagesGB, icon: Image, color: '#a78bfa' },
    { label: 'Volumes', value: volumesGB, icon: HardDrive, color: '#818cf8' },
  ].filter(d => d.value > 0);

  const pieData = [
    ...breakdown.map(b => ({ name: b.label, value: b.value, color: b.color })),
  ];

  return (
    <div className="bg-surface border border-border rounded-md p-5">
      <h3 className="text-[15px] font-semibold text-text-primary mb-4">Docker resources</h3>

      {/* Container stats */}
      <div className="mb-4 pb-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-md bg-brand/10 text-brand flex items-center justify-center">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span className="text-[13px] font-medium text-text-secondary">Containers</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="text-[11px] text-text-tertiary mb-0.5">Total</div>
            <div className="text-[13px] font-semibold text-text-primary tabular-nums">{cs.total ?? 0}</div>
          </div>
          <div>
            <div className="text-[11px] text-text-tertiary mb-0.5">Running</div>
            <div className="text-[13px] font-semibold text-success tabular-nums">{cs.running ?? 0}</div>
          </div>
          <div>
            <div className="text-[11px] text-text-tertiary mb-0.5">Stopped</div>
            <div className="text-[13px] font-semibold text-text-tertiary tabular-nums">{cs.stopped ?? 0}</div>
          </div>
        </div>
      </div>

      {/* Docker disk usage */}
      <div className="mb-4 pb-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-md bg-brand/10 text-brand flex items-center justify-center">
            <Box className="w-3.5 h-3.5" />
          </div>
          <span className="text-[13px] font-medium text-text-secondary">Docker disk</span>
          <span className="ml-auto text-[13px] font-semibold text-text-primary tabular-nums">
            {dockerGB.toFixed(1)} GB
          </span>
        </div>

        {pieData.length > 0 ? (
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={16} outerRadius={28}
                    dataKey="value" stroke="none"
                    isAnimationActive={false}
                  >
                    {pieData.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5">
              {breakdown.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-text-secondary">{item.label}</span>
                  </div>
                  <span className="text-text-primary font-medium tabular-nums">{item.value.toFixed(1)} GB</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-[12px] text-text-tertiary">No Docker data usage reported</div>
        )}
      </div>

      {/* System info */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-md bg-brand/10 text-brand flex items-center justify-center">
            <Network className="w-3.5 h-3.5" />
          </div>
          <span className="text-[13px] font-medium text-text-secondary">Engine</span>
        </div>
        <div className="space-y-1.5 text-[12px]">
          <div className="flex justify-between">
            <span className="text-text-tertiary">Version</span>
            <span className="text-text-primary font-mono">{systemInfo?.dockerInfo?.serverVersion ?? '...'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-tertiary">CPUs</span>
            <span className="text-text-primary tabular-nums">{systemInfo?.dockerInfo?.cpus ?? '...'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-tertiary">Memory</span>
            <span className="text-text-primary tabular-nums">{systemInfo?.dockerInfo?.memTotal ?? '...'} GB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-tertiary">Images</span>
            <span className="text-text-primary tabular-nums">{systemInfo?.imagesCount ?? '...'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
