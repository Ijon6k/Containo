'use client';

import React from 'react';
import { Container } from '@/lib/types';
import { ContainerGridCard } from './ContainerGridCard';

interface ContainerGridViewProps {
  containers: Container[];
  stats: any;
  onToggleStatus: (id: string) => void;
  onRestart: (id: string, name: string) => void;
  onOpenLogs: (container: Container) => void;
  onOpenTerminal: (container: Container) => void;
  onDelete: (container: Container) => void;
  onOpenWebUI: (container: Container) => void;
}

export function ContainerGridView({
  containers,
  stats,
  onToggleStatus,
  onRestart,
  onOpenLogs,
  onOpenTerminal,
  onDelete,
  onOpenWebUI,
}: ContainerGridViewProps) {
  if (containers.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-md p-12 text-center col-span-full">
        <p className="text-base text-text-tertiary">No containers found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {containers.map((c) => (
        <ContainerGridCard
          key={c.id}
          container={c}
          stats={stats[c.id]}
          onToggleStatus={onToggleStatus}
          onRestart={onRestart}
          onOpenLogs={onOpenLogs}
          onOpenTerminal={onOpenTerminal}
          onDelete={onDelete}
          onOpenWebUI={onOpenWebUI}
        />
      ))}
    </div>
  );
}
