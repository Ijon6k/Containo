import React from 'react';
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
    <div className={`transition-all ${isExpanded ? 'bg-white/[0.02]' : 'hover:bg-white/[0.01]'}`}>
      <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center group border-b border-white/[0.05]">
        {/* Status Column */}
        <div className="col-span-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
            c.status === 'running' 
              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
          }`}>
            {c.status}
          </span>
        </div>

        {/* Name Column */}
        <div className="col-span-3 min-w-0">
          <h3 className="text-sm font-bold text-text-main truncate">{c.name}</h3>
        </div>

        {/* Image Column */}
        <div className="col-span-4 min-w-0">
          <p className="text-[10px] text-text-sub font-mono uppercase truncate">{c.image}</p>
        </div>

        {/* Actions Column */}
        <div className="col-span-3 flex items-center justify-end gap-1">
          <button 
            onClick={onToggleExpand}
            className={`p-1.5 rounded-md transition-colors ${
              isExpanded
                ? 'bg-brand text-white dark:bg-brand/20 dark:text-brand'
                : 'hover:bg-ui-accent text-text-sub hover:text-brand'
            }`}
            title="Monitoring Stats"
          >
            <Activity className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => onToggleStatus(c.id)}
            className={`p-1.5 rounded-md transition-colors ${
              c.status === 'running' 
                ? 'hover:bg-amber-50 dark:hover:bg-amber-500/10 text-text-sub hover:text-amber-500' 
                : 'hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-text-sub hover:text-emerald-500'
            }`}
            title={c.status === 'running' ? 'Stop' : 'Start'}
          >
            {c.status === 'running' ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button 
            onClick={() => onRestart(c.id, c.name)}
            className="p-1.5 rounded-md hover:bg-ui-accent text-text-sub hover:text-indigo-500 transition-colors"
            title="Restart"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {c.status === 'running' && (
            <button 
              onClick={() => onOpenWebUI(c)}
              className="p-1.5 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-500 transition-colors"
              title="Open Web UI"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}

          <button 
            onClick={() => onOpenLogs(c)}
            className="p-1.5 rounded-md hover:bg-ui-accent text-text-sub hover:text-text-main transition-colors"
            title="Logs"
          >
            <TerminalIcon className="w-4 h-4" />
          </button>

          <button 
            onClick={() => onDelete(c)}
            className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-500/10 text-text-sub hover:text-rose-500 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
