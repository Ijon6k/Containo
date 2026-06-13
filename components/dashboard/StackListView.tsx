'use client';

import React, { useState } from 'react';
import { Container } from '@/lib/types';
import { StackCard } from './StackCard';

export interface Stack {
  name: string;
  isCompose: boolean;
  containers: Container[];
}

interface StackListViewProps {
  stacks: Stack[];
  expandedStatsIds: string[];
  setExpandedStatsIds: React.Dispatch<React.SetStateAction<string[]>>;
  stats: any;
  onToggleStatus: (id: string) => void;
  onRestart: (id: string, name: string) => void;
  onOpenLogs: (container: Container) => void;
  onOpenTerminal: (container: Container) => void;
  onDelete: (container: Container) => void;
  onOpenWebUI: (container: Container) => void;
  startContainer: (id: string) => Promise<any>;
  stopContainer: (id: string) => Promise<any>;
  addToast: (msg: string, type?: 'success' | 'error') => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, type?: 'danger' | 'warning' | 'info') => void;
}

export function StackListView({
  stacks,
  ...props
}: StackListViewProps) {
  const [expandedStacks, setExpandedStacks] = useState<string[]>(stacks.map(s => s.name));

  const toggleStackExpand = (name: string) => {
    setExpandedStacks(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  return (
    <div className="space-y-6">
      {stacks.map((stack) => (
        <StackCard
          key={stack.name}
          stack={stack}
          isExpanded={expandedStacks.includes(stack.name)}
          onToggleExpand={() => toggleStackExpand(stack.name)}
          {...props}
        />
      ))}
    </div>
  );
}
