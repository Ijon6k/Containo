'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Play, 
  Square, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  FolderOpen, 
  Box 
} from 'lucide-react';
import { Container } from '@/lib/types';
import { ContainerCard } from './ContainerCard';
import { StatsPanel } from './StatsPanel';
import { Stack } from './StackListView';

interface StackCardProps {
  stack: Stack;
  isExpanded: boolean;
  onToggleExpand: () => void;
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

export function StackCard({
  stack,
  isExpanded,
  onToggleExpand,
  expandedStatsIds,
  setExpandedStatsIds,
  stats,
  onToggleStatus,
  onRestart,
  onOpenLogs,
  onOpenTerminal,
  onDelete,
  onOpenWebUI,
  startContainer,
  stopContainer,
  addToast,
  showConfirm
}: StackCardProps) {
  const runningCount = stack.containers.filter(c => c.status === 'running').length;
  const totalCount = stack.containers.length;
  const allRunning = runningCount === totalCount;
  const someRunning = runningCount > 0 && !allRunning;

  const composeWorkingDir = stack.containers.find(c => c.composeWorkingDir)?.composeWorkingDir;
  const composeConfig = stack.containers.find(c => c.composeConfig)?.composeConfig;

  const displayTitle = stack.isCompose 
    ? stack.name.split(/[-_]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Standalone / Independent';

  const handleStartStack = async () => {
    const inactive = stack.containers.filter(c => c.status !== 'running');
    if (inactive.length === 0) {
      addToast(`All containers in ${stack.name} are already running`);
      return;
    }
    
    addToast(`Starting stack "${stack.name}"...`);
    try {
      await Promise.all(inactive.map(c => startContainer(c.id)));
      addToast(`Stack "${stack.name}" started successfully`);
    } catch (err: any) {
      addToast(`Failed to start some containers: ${err.message || err}`, 'error');
    }
  };

  const handleStopStack = async () => {
    const active = stack.containers.filter(c => c.status === 'running');
    if (active.length === 0) {
      addToast(`All containers in ${stack.name} are already stopped`);
      return;
    }

    showConfirm(
      'Stop stack',
      `Are you sure you want to stop all running containers in stack "${stack.name}"?`,
      async () => {
        addToast(`Stopping stack "${stack.name}"...`);
        try {
          await Promise.all(active.map(c => stopContainer(c.id)));
          addToast(`Stack "${stack.name}" stopped successfully`);
        } catch (err: any) {
          addToast(`Failed to stop some containers: ${err.message || err}`, 'error');
        }
      },
      'warning'
    );
  };

  const handleRestartStack = async () => {
    showConfirm(
      'Restart stack',
      `Are you sure you want to restart all containers in stack "${stack.name}"?`,
      async () => {
        addToast(`Restarting stack "${stack.name}"...`);
        try {
          await Promise.all(stack.containers.map((c) => onRestart(c.id, c.name)));
          addToast(`Stack "${stack.name}" restarted successfully`);
        } catch (err: any) {
          addToast(`Failed to restart stack: ${err.message || err}`, 'error');
        }
      }
    );
  };

  return (
    <div className="bg-surface border border-border rounded-md overflow-hidden shadow-lg transition-all">
      {/* Stack Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4 border-b border-border/50 bg-surface2/20">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onToggleExpand}
            className="p-1 rounded-sm hover:bg-hover text-text-secondary hover:text-text-primary transition-colors shrink-0"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <div className="p-2 rounded-sm bg-brand/10 text-brand shrink-0">
            {stack.isCompose ? <FolderOpen className="w-5 h-5" /> : <Box className="w-5 h-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-md font-semibold text-text-primary flex items-center gap-2">
              {displayTitle} 
              {stack.isCompose && (
                <span className="text-[12px] font-medium bg-brand/10 text-brand px-2 py-0.5 rounded-full shrink-0">
                  compose stack
                </span>
              )}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1">
              <p className="text-sm text-text-secondary font-mono">
                {runningCount} / {totalCount} containers active
              </p>
              {stack.isCompose && (composeWorkingDir || composeConfig) && (
                <div 
                  className="flex items-center gap-1.5 text-[12px] text-text-secondary font-mono bg-surface2 border border-border/50 px-2 py-0.5 rounded-sm max-w-[280px] sm:max-w-[360px] md:max-w-md truncate cursor-help"
                  title={`Working Directory: ${composeWorkingDir || 'N/A'}\nConfig File: ${composeConfig || 'N/A'}`}
                >
                  <FolderOpen className="w-3 h-3 text-brand/80 shrink-0" />
                  <span className="truncate">{composeWorkingDir || composeConfig}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bulk Actions & Badge */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="flex items-center gap-1.5 bg-surface2 p-1 rounded-sm border border-border">
            <button
              onClick={handleStartStack}
              className="p-1.5 rounded-md hover:bg-success-bg text-text-secondary hover:text-success transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-secondary"
              title="Start stack"
              disabled={allRunning}
            >
              <Play className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleStopStack}
              className="p-1.5 rounded-md hover:bg-danger-bg text-text-secondary hover:text-danger transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-secondary"
              title="Stop stack"
              disabled={runningCount === 0}
            >
              <Square className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRestartStack}
              className="p-1.5 rounded-md hover:bg-brand/10 text-text-secondary hover:text-brand transition-colors"
              title="Restart stack"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className={`px-2 py-0.5 rounded-md text-[12px] font-semibold border ${
            allRunning 
              ? 'bg-success-bg text-success border-success/20' 
              : someRunning 
                ? 'bg-warning-bg text-warning border-warning/20 animate-pulse' 
                : 'bg-danger-bg text-danger border-danger/20'
          }`}>
            {allRunning ? 'Running' : someRunning ? 'Partial' : 'Stopped'}
          </span>
        </div>
      </div>

      {/* Collapsible Containers List */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-border">
              <div className="grid grid-cols-12 gap-4 px-6 py-2 bg-surface2/30 border-b border-border">
                <div className="col-span-1 text-[12px] font-semibold text-text-secondary">Status</div>
                <div className="col-span-3 text-[12px] font-semibold text-text-secondary">Container name</div>
                <div className="col-span-3 text-[12px] font-semibold text-text-secondary">Image</div>
                <div className="col-span-2 text-[12px] font-semibold text-text-secondary">Ports</div>
                <div className="col-span-3 text-[12px] font-semibold text-text-secondary text-right">Operations</div>
              </div>
              
              <div className="divide-y divide-border">
                {stack.containers.map((c) => (
                  <React.Fragment key={c.id}>
                    <ContainerCard 
                      container={c}
                      isExpanded={expandedStatsIds.includes(c.id)}
                      onToggleExpand={() => setExpandedStatsIds(prev => 
                        prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id]
                      )}
                      onToggleStatus={onToggleStatus}
                      onRestart={onRestart}
                      onOpenLogs={onOpenLogs}
                      onOpenTerminal={onOpenTerminal}
                      onDelete={onDelete}
                      onOpenWebUI={onOpenWebUI}
                    />
                    <AnimatePresence>
                      {expandedStatsIds.includes(c.id) && (
                        <StatsPanel stats={stats[c.id]} />
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
