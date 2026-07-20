import React from 'react';
import { cva } from 'class-variance-authority';
import {
  ExternalLink,
  RotateCcw,
  Play,
  Square,
  Activity,
  Terminal,
  ScrollText,
  Trash2,
} from 'lucide-react';
import { Container } from '@/lib/types';

interface ContainerCardProps {
  container: Container;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleStatus: (id: string) => void;
  onRestart: (id: string, name: string) => void;
  onOpenLogs: (container: Container) => void;
  onOpenTerminal: (container: Container) => void;
  onDelete: (container: Container) => void;
  onOpenWebUI: (container: Container) => void;
}

const statusBadge = cva(
  "px-2 py-0.5 rounded text-[11px] font-medium border",
  {
    variants: {
      status: {
        running: "bg-success/10 text-success border-success/15",
        exited: "bg-text-tertiary/10 text-text-tertiary border-text-tertiary/15",
      },
    },
    defaultVariants: { status: "exited" },
  }
);

const actionBtn =
  "p-1.5 rounded-md transition-colors text-text-tertiary hover:text-text-primary hover:bg-hover";

export const ContainerCard = ({
  container: c,
  isExpanded,
  onToggleExpand,
  onToggleStatus,
  onRestart,
  onOpenLogs,
  onOpenTerminal,
  onDelete,
  onOpenWebUI,
}: ContainerCardProps) => {
  const isRunning = c.status === 'running';

  return (
    <div
      className={`bg-surface border border-border rounded-sm px-4 py-3 group transition-colors ${
        isExpanded ? 'border-brand/30' : 'hover:border-border-hover'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Status */}
        <span className={statusBadge({ status: c.status as 'running' | 'exited' })}>
          {c.status}
        </span>

        {/* Name */}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <h3 className="text-base font-semibold text-text-primary truncate group-hover:text-brand transition-colors">
            {c.name}
          </h3>
          <span className="text-[13px] font-mono text-text-tertiary truncate hidden sm:inline">
            {c.image}
          </span>
        </div>

        {/* Ports */}
        <span className="text-[13px] font-mono text-text-secondary hidden md:block tabular-nums">
          {c.ports || '—'}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={isRunning ? onToggleExpand : undefined}
            disabled={!isRunning}
            className={`p-1.5 rounded-md transition-colors ${
              !isRunning
                ? 'text-text-tertiary/20 cursor-not-allowed'
                : isExpanded
                  ? 'bg-brand/10 text-brand'
                  : 'text-text-tertiary hover:text-brand hover:bg-hover'
            }`}
            aria-label="Toggle stats"
          >
            <Activity className="w-4 h-4" />
          </button>

          <button
            onClick={() => onToggleStatus(c.id)}
            className={`p-1.5 rounded-md transition-colors ${
              isRunning
                ? 'text-text-tertiary hover:text-warning hover:bg-hover'
                : 'text-text-tertiary hover:text-success hover:bg-hover'
            }`}
            aria-label={isRunning ? 'Stop container' : 'Start container'}
          >
            {isRunning ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={() => onRestart(c.id, c.name)}
            className={actionBtn}
            aria-label="Restart container"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {isRunning && c.hostPorts.length > 0 && (
            <button
              onClick={() => onOpenWebUI(c)}
              className="p-1.5 rounded-md text-success hover:bg-success-bg transition-colors"
              aria-label="Open web interface"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => onOpenLogs(c)}
            className={actionBtn}
            aria-label="View logs"
          >
            <ScrollText className="w-4 h-4" />
          </button>

          <button
            onClick={() => onOpenTerminal(c)}
            className={actionBtn}
            aria-label="Open terminal"
          >
            <Terminal className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(c)}
            className="p-1.5 rounded-md text-text-tertiary hover:text-danger hover:bg-danger-bg transition-colors"
            aria-label="Delete container"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
