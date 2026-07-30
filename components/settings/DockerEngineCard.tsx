'use client';

import React from 'react';

interface DockerEngineCardProps {
  systemInfo?: any;
}

export function DockerEngineCard({ systemInfo }: DockerEngineCardProps) {
  const di = systemInfo?.dockerInfo || {};
  const cs = systemInfo?.containerStats || {};

  const specs = [
    { label: 'Socket Endpoint', value: 'unix:///var/run/docker.sock', mono: true },
    { label: 'Engine Version', value: di.serverVersion ? `v${di.serverVersion}` : 'Detecting...', mono: true },
    { label: 'Host Hardware', value: di.cpus ? `${di.cpus} CPUs, ${di.memTotal} GB RAM` : 'Detecting...' },
    { label: 'Container Runtime', value: cs.total !== undefined ? `${cs.running ?? 0} running, ${cs.total} total` : 'Detecting...' },
  ];

  return (
    <div className="card-floating border border-border rounded-md p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-text-primary">Docker Engine</h3>
          <p className="text-sm text-text-secondary mt-1">
            Local daemon connection status and system specifications.
          </p>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1 bg-success-bg border border-success/20 rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          <span className="text-xs font-semibold text-success">Active</span>
        </div>
      </div>

      <div className="border border-border/80 rounded-md divide-y divide-border/80 bg-surface2/40 overflow-hidden">
        {specs.map((spec) => (
          <div key={spec.label} className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 text-sm gap-1 hover:bg-hover/50 transition-colors">
            <span className="text-text-secondary font-medium">{spec.label}</span>
            <span className={`text-text-primary ${spec.mono ? 'font-mono text-xs' : 'font-semibold'}`}>
              {spec.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
