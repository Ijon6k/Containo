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
  onDelete: (container: Container) => void;
  onOpenWebUI: (container: Container) => void;
}

export function ContainerGridView({
  containers,
  stats,
  onToggleStatus,
  onRestart,
  onOpenLogs,
  onDelete,
  onOpenWebUI
}: ContainerGridViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {containers.length === 0 ? (
        <div className="col-span-full p-12 text-center text-text-sub font-mono text-[10px] uppercase tracking-widest card bg-ui-bg border-ui-border rounded-md">No operational units detected.</div>
      ) : (
        containers.map((c) => (
          <ContainerGridCard 
            key={c.id}
            container={c}
            stats={stats[c.id]}
            onToggleStatus={onToggleStatus}
            onRestart={onRestart}
            onOpenLogs={onOpenLogs}
            onDelete={onDelete}
            onOpenWebUI={onOpenWebUI}
          />
        ))
      )}
    </div>
  );
}
