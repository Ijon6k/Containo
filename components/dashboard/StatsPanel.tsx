import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Database, Globe, Layers } from 'lucide-react';
import { ContainerStats } from '@/lib/types';

interface StatsPanelProps {
  stats: ContainerStats | null;
}

export const StatsPanel = ({ stats }: StatsPanelProps) => {
  if (!stats) {
    return (
      <div className="bg-ui-accent p-6 border-t border-b border-ui-border flex justify-center shadow-inner mb-4 mx-2 rounded-b-xl">
        <div className="flex items-center gap-3 text-text-sub text-sm font-semibold uppercase tracking-widest animate-pulse">
          <Activity className="w-4 h-4 text-brand" />
          Synchronizing Metrics...
        </div>
      </div>
    );
  }

  const items = [
    { label: 'CPU Usage', value: `${stats.cpuPercentage.toFixed(1)}%`, icon: Activity, color: 'text-indigo-500', bar: stats.cpuPercentage },
    { label: 'Memory', value: `${stats.memoryUsageMB.toFixed(0)}MB / ${stats.memoryLimitMB.toFixed(0)}MB`, icon: Database, color: 'text-emerald-500', bar: stats.memoryPercentage },
    { label: 'Network', value: `↓ ${stats.networkRxMB.toFixed(2)}MB / ↑ ${stats.networkTxMB.toFixed(2)}MB`, icon: Globe, color: 'text-brand', bar: 0 },
    { label: 'Block I/O', value: `R ${stats.blockReadMB.toFixed(1)}MB / W ${stats.blockWriteMB.toFixed(1)}MB`, icon: Layers, color: 'text-amber-500', bar: 0 },
  ];

  return (
    <motion.div 
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="bg-ui-accent/50 border-t-2 border-brand/20 border-b border-ui-border overflow-hidden shadow-inner relative z-0 mb-4 rounded-b-xl mx-2"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-x divide-ui-border">
        {items.map((item, i) => (
          <div key={i} className="p-5 space-y-4 group border-b sm:border-b-0 border-ui-border/50">
            <div className="flex items-center justify-between text-xs font-semibold text-text-sub uppercase tracking-wider group-hover:text-text-main transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded bg-ui-bg border border-ui-border group-hover:${item.color.replace('text', 'bg')}/10 transition-colors`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                {item.label}
              </div>
              <span className="text-sm font-mono font-bold text-text-main">{item.value}</span>
            </div>
            
            {item.bar > 0 ? (
              <div className="w-full h-1.5 bg-ui-bg rounded-full overflow-hidden border border-ui-border/50 p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, item.bar)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full ${item.color.replace('text', 'bg')}`}
                />
              </div>
            ) : (
              <div className="w-full h-1 bg-ui-border/50 rounded-full" />
            )}
          </div>
        ))}
      </div>
      {/* Active Sidebar Indicator */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand" />
    </motion.div>
  );
};
