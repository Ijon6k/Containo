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
      <div className="bg-black/20 p-4 sm:p-6 border-t border-white/5 flex justify-center">
        <div className="flex items-center gap-2 text-text-sub text-xs animate-pulse">
          <Activity className="w-4 h-4" />
          Waiting for metrics...
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
      className="bg-black/20 border-t border-white/5 overflow-hidden"
    >
      <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold text-text-sub uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <item.icon className={`w-3 h-3 ${item.color}`} />
                {item.label}
              </div>
              <span className="text-text-main">{item.value}</span>
            </div>
            {item.bar > 0 && (
              <div className="w-full h-1 bg-ui-accent rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, item.bar)}%` }}
                  className={`h-full ${item.color.replace('text', 'bg')}`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};
