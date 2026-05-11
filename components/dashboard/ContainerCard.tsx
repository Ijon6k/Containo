import React from 'react';
import { cva } from 'class-variance-authority';
import { 
  ExternalLink, 
  RotateCcw, 
  Play, 
  Square, 
  Activity, 
  Terminal as TerminalIcon,
  Trash2
} from 'lucide-react';
import { Container } from '@/lib/types';

interface ContainerCardProps {
  container: Container;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleStatus: (id: string) => void;
  onRestart: (id: string, name: string) => void;
  onOpenLogs: (container: Container) => void;
  onDelete: (container: Container) => void;
  onOpenWebUI: (container: Container) => void;
}

const statusBadge = cva(
  "px-2 py-0.5 rounded-sm text-[10px] font-black uppercase border tracking-widest",
  {
    variants: {
      status: {
        running: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        exited: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      }
    },
    defaultVariants: {
      status: "exited",
    }
  }
);

export const ContainerCard = ({ 
  container: c, 
  isExpanded, 
  onToggleExpand, 
  onToggleStatus, 
  onRestart, 
  onOpenLogs,
  onDelete,
  onOpenWebUI
}: ContainerCardProps) => {
  return (
    <div className={`transition-all ${isExpanded ? 'bg-ui-accent/30' : 'hover:bg-ui-accent/10'}`}>
      <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center group border-b border-ui-border">
        {/* Status Column */}
        <div className="col-span-2">
          <span className={statusBadge({ status: c.status as 'running' | 'exited' })}>
            {c.status}
          </span>
        </div>

        {/* Name Column */}
        <div className="col-span-3 min-w-0">
          <h3 className="text-sm font-semibold text-text-main truncate group-hover:text-brand transition-colors uppercase tracking-tight">{c.name}</h3>
        </div>

        {/* Image Column */}
        <div className="col-span-4 min-w-0">
          <p className="text-sm text-text-sub font-mono truncate opacity-60 group-hover:opacity-100 transition-opacity">{c.image}</p>
        </div>

        {/* Actions Column */}
        <div className="col-span-3 flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={onToggleExpand}
            className={`p-2 rounded-md transition-all ${
              isExpanded
                ? 'bg-brand text-white shadow-sm'
                : 'hover:bg-ui-accent text-text-sub hover:text-brand'
            }`}
            title="Telemetry"
          >
            <Activity className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => onToggleStatus(c.id)}
            className={`p-2 rounded-md transition-colors ${
              c.status === 'running' 
                ? 'hover:bg-amber-500/10 text-text-sub hover:text-amber-500' 
                : 'hover:bg-emerald-500/10 text-text-sub hover:text-emerald-500'
            }`}
            title={c.status === 'running' ? 'Shutdown' : 'Initialize'}
          >
            {c.status === 'running' ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button 
            onClick={() => onRestart(c.id, c.name)}
            className="p-2 rounded-md hover:bg-ui-accent text-text-sub hover:text-brand transition-colors"
            title="Restart"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {c.status === 'running' && (
            <button 
              onClick={() => onOpenWebUI(c)}
              className="p-2 rounded-md hover:bg-emerald-500/10 text-emerald-500 transition-colors"
              title="Web Access"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}

          <button 
            onClick={() => onOpenLogs(c)}
            className="p-2 rounded-md hover:bg-ui-accent text-text-sub hover:text-text-main transition-colors"
            title="Logs"
          >
            <TerminalIcon className="w-4 h-4" />
          </button>

          <button 
            onClick={() => onDelete(c)}
            className="p-2 rounded-md hover:bg-rose-500/10 text-text-sub hover:text-rose-500 transition-colors"
            title="Decommission"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
