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
import { parseContainerPorts } from '@/lib/utils/network';

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
  "px-2 py-0.5 rounded text-[11px] font-medium border text-center shrink-0 w-[72px]",
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
  "p-1.5 rounded-md transition-colors text-text-tertiary hover:text-text-primary hover:bg-hover shrink-0";

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
  const portItems = parseContainerPorts(c);

  return (
    <div
      className={`bg-surface border border-border rounded-sm px-4 py-3 group transition-colors ${
        isExpanded ? 'border-brand/30' : 'hover:border-border-hover'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Status Badge (Fixed width 72px) */}
        <span className={statusBadge({ status: c.status as 'running' | 'exited' })}>
          {c.status}
        </span>

        {/* Name & Image (Flexible width) */}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <h3 className="text-base font-semibold text-text-primary truncate group-hover:text-brand transition-colors">
            {c.name}
          </h3>
          <span className="text-[13px] font-mono text-text-tertiary truncate hidden sm:inline">
            {c.image}
          </span>
        </div>

        {/* Network / Ports Column (Strict fixed width 280px, uniform right alignment) */}
        <div className="w-[280px] shrink-0 hidden md:flex items-center justify-end gap-1 font-mono text-[13px] tabular-nums whitespace-nowrap overflow-hidden text-right">
          {portItems.length === 0 ? (
            <span className="text-text-tertiary">{c.ports || 'N/A'}</span>
          ) : (
            portItems.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-text-tertiary/40 mr-0.5">,</span>}
                {item.isHostExposed && isRunning ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-brand hover:underline font-semibold transition-colors inline-flex items-center gap-1 shrink-0 leading-none"
                    title={`Open ${item.url} in new tab`}
                  >
                    <span>{item.raw}</span>
                    <ExternalLink className="w-3 h-3 text-brand/80 shrink-0 -translate-y-[1px]" />
                  </a>
                ) : (
                  <span className="text-text-tertiary shrink-0">
                    {item.raw}
                  </span>
                )}
              </React.Fragment>
            ))
          )}
        </div>

        {/* Actions Column (Strict fixed width 220px so network column position never shifts) */}
        <div className="w-[220px] shrink-0 flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={isRunning ? onToggleExpand : undefined}
            disabled={!isRunning}
            className={`p-1.5 rounded-md transition-colors shrink-0 ${
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
            className={`p-1.5 rounded-md transition-colors shrink-0 ${
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

          {/* Reserved slot for ExternalLink button so action group width is 100% constant */}
          {isRunning && c.hostPorts.length > 0 ? (
            <button
              onClick={() => onOpenWebUI(c)}
              className="p-1.5 rounded-md text-success hover:bg-success-bg transition-colors shrink-0"
              aria-label="Open web interface"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-7 h-7 shrink-0" />
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
            className="p-1.5 rounded-md text-text-tertiary hover:text-danger hover:bg-danger-bg transition-colors shrink-0"
            aria-label="Delete container"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
