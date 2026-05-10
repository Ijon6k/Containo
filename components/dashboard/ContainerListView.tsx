'use client';

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Container } from '@/lib/types';
import { ContainerCard } from './ContainerCard';
import { StatsPanel } from './StatsPanel';

interface ContainerListViewProps {
  containers: Container[];
  expandedStatsIds: string[];
  setExpandedStatsIds: React.Dispatch<React.SetStateAction<string[]>>;
  stats: any;
  onToggleStatus: (id: string) => void;
  onRestart: (id: string, name: string) => void;
  onOpenLogs: (container: Container) => void;
  onDelete: (container: Container) => void;
  onOpenWebUI: (container: Container) => void;
}

export function ContainerListView({
  containers,
  expandedStatsIds,
  setExpandedStatsIds,
  stats,
  onToggleStatus,
  onRestart,
  onOpenLogs,
  onDelete,
  onOpenWebUI
}: ContainerListViewProps) {
  return (
    <div className="card overflow-hidden border-white/5 bg-ui-bg rounded-md shadow-2xl">
      <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 bg-white/[0.02]">
        <div className="col-span-2 text-xs font-semibold text-text-sub uppercase tracking-wide">Status</div>
        <div className="col-span-3 text-xs font-semibold text-text-sub uppercase tracking-wide">Container Name</div>
        <div className="col-span-4 text-xs font-semibold text-text-sub uppercase tracking-wide">Image</div>
        <div className="col-span-3 text-xs font-semibold text-text-sub uppercase tracking-wide text-right">Operations</div>
      </div>
      <div className="divide-y divide-ui-border">
        {containers.length === 0 ? (
          <div className="p-12 text-center text-text-sub font-mono text-[10px] uppercase tracking-widest italic">No operational units detected.</div>
        ) : (
          containers.map((c) => (
            <React.Fragment key={c.id}>
              <ContainerCard 
                container={c}
                isExpanded={expandedStatsIds.includes(c.id)}
                onToggleExpand={() => setExpandedStatsIds(prev => prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id])}
                onToggleStatus={onToggleStatus}
                onRestart={onRestart}
                onOpenLogs={onOpenLogs}
                onDelete={onDelete}
                onOpenWebUI={onOpenWebUI}
              />
              <AnimatePresence>
                {expandedStatsIds.includes(c.id) && (
                  <StatsPanel stats={stats[c.id]} />
                )}
              </AnimatePresence>
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
}
