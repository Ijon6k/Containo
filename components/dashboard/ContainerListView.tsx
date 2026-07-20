'use client';

import React from 'react';
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
  onOpenTerminal: (container: Container) => void;
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
  onOpenTerminal,
  onDelete,
  onOpenWebUI,
}: ContainerListViewProps) {
  const toggleExpand = (id: string) => {
    setExpandedStatsIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  if (containers.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-md p-12 text-center">
        <p className="text-base text-text-tertiary">No containers found</p>
      </div>
    );
  }

  return (
    <div className="space-y-[2px]">
      {containers.map(c => {
        const isExpanded = expandedStatsIds.includes(c.id);
        return (
          <div key={c.id}>
            <ContainerCard
              container={c}
              isExpanded={isExpanded}
              onToggleExpand={() => toggleExpand(c.id)}
              onToggleStatus={onToggleStatus}
              onRestart={onRestart}
              onOpenLogs={onOpenLogs}
              onOpenTerminal={onOpenTerminal}
              onDelete={onDelete}
              onOpenWebUI={onOpenWebUI}
            />
            {isExpanded && (
              <StatsPanel stats={stats[c.id]} />
            )}
          </div>
        );
      })}
    </div>
  );
}
