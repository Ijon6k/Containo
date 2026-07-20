import React from 'react';
import { Activity, Database, Globe, Layers } from 'lucide-react';
import { ContainerStats } from '@/lib/types';

interface StatsPanelProps {
  stats: ContainerStats | null;
}

export const StatsPanel = ({ stats }: StatsPanelProps) => {
  if (!stats) {
    return (
      <div className="bg-surface2 border-l-2 border-brand mx-0 mb-2 px-4 py-3 rounded-r-lg text-[13px] text-text-tertiary flex items-center gap-2 transition-all duration-300">
        <Activity className="w-3.5 h-3.5 animate-pulse" />
        Connecting...
      </div>
    );
  }

  const items = [
    { label: 'CPU', value: `${stats.cpuPercentage.toFixed(1)}%`, bar: stats.cpuPercentage, icon: Activity, color: 'bg-brand', textColor: 'text-brand' },
    { label: 'Memory', value: `${stats.memoryUsageMB.toFixed(0)} / ${stats.memoryLimitMB.toFixed(0)} MB`, bar: stats.memoryPercentage, icon: Database, color: 'bg-success', textColor: 'text-success' },
    { label: 'Network', value: `↓ ${stats.networkRxMB.toFixed(1)}MB  ↑ ${stats.networkTxMB.toFixed(1)}MB`, bar: 0, icon: Globe, color: '', textColor: 'text-text-secondary' },
    { label: 'Block I/O', value: `R ${stats.blockReadMB.toFixed(1)}MB  W ${stats.blockWriteMB.toFixed(1)}MB`, bar: 0, icon: Layers, color: '', textColor: 'text-text-secondary' },
  ];

  return (
    <div className="bg-surface2 border-l-2 border-brand mx-0 mb-2 px-0 py-3 rounded-r-lg transition-all duration-300">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-4">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3 min-w-0">
            <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-surface ${item.textColor}`}>
              <item.icon className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] text-text-tertiary mb-0.5">{item.label}</div>
              <div className="text-[13px] font-mono text-text-primary leading-tight truncate">{item.value}</div>
              {item.bar > 0 && (
                <div className="h-1 bg-border rounded-full mt-1.5 overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(100, item.bar)}%` }} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
