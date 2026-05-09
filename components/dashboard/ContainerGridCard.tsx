import React from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Terminal, 
  Trash2, 
  ExternalLink,
  Activity,
  Database,
  Cpu,
  Box,
  Network,
  Zap
} from 'lucide-react';
import { Container, ContainerStats } from '@/lib/types';

interface ContainerGridCardProps {
  container: Container;
  stats: ContainerStats | null;
  onToggleStatus: (id: string) => void;
  onRestart: (id: string, name: string) => void;
  onOpenLogs: (container: Container) => void;
  onDelete: (container: Container) => void;
  onOpenWebUI: (container: Container) => void;
}

export const ContainerGridCard = ({ 
  container: c, 
  stats,
  onToggleStatus,
  onRestart,
  onOpenLogs,
  onDelete,
  onOpenWebUI
}: ContainerGridCardProps) => {
  const isRunning = c.status === 'running';
  const cpuVal = stats?.cpuPercentage || 0;
  const memVal = stats?.memoryPercentage || 0;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative bg-ui-bg border border-ui-border rounded-lg overflow-hidden hover:border-brand/40 transition-all duration-300 flex flex-col h-full shadow-sm"
    >
      {/* Top Status Line Indicator */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-ui-accent overflow-hidden">
        {isRunning && (
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${cpuVal}%` }}
            className="h-full bg-brand shadow-[0_0_10px_rgba(99,102,241,0.3)]"
          />
        )}
      </div>

      {/* Header Section */}
      <div className="p-5 flex items-start justify-between bg-ui-accent/30 border-b border-ui-border">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-rose-500'}`} />
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isRunning ? 'text-emerald-500' : 'text-rose-500'}`}>
              {c.status}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-text-main truncate leading-tight mb-1.5 group-hover:text-brand transition-colors uppercase">
            {c.name}
          </h3>
          <div className="flex items-center gap-2 opacity-60">
             <Box className="w-3.5 h-3.5 text-text-sub" />
             <span className="text-xs font-mono truncate max-w-[150px] text-text-sub">{c.image}</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1.5">
           <span className="text-[10px] font-mono text-text-sub opacity-50 uppercase tracking-tighter">ID: {c.id.substring(0, 8)}</span>
           <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-brand/10 border border-brand/20 text-[10px] font-bold text-brand uppercase tracking-tighter">
              NODE-01
           </div>
        </div>
      </div>

      {/* Real-time Diagnostics Section */}
      <div className="p-5 flex-grow space-y-5">
        {isRunning ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-text-sub uppercase tracking-wider">
                  <div className="flex items-center gap-1.5"><Cpu className="w-4 h-4 text-brand" /> CPU</div>
                  <span className="text-sm text-text-main font-mono font-bold">{cpuVal.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 bg-ui-accent rounded-full overflow-hidden">
                   <motion.div animate={{ width: `${cpuVal}%` }} className="h-full bg-brand" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-text-sub uppercase tracking-wider">
                  <div className="flex items-center gap-1.5"><Database className="w-4 h-4 text-emerald-500" /> RAM</div>
                  <span className="text-sm text-text-main font-mono font-bold">{memVal.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 bg-ui-accent rounded-full overflow-hidden">
                   <motion.div animate={{ width: `${memVal}%` }} className="h-full bg-emerald-500" />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-ui-border grid grid-cols-2 gap-4">
               <div className="flex items-center gap-3">
                  <Network className="w-4 h-4 text-text-sub opacity-50" />
                  <div className="flex flex-col">
                     <span className="text-[10px] text-text-sub uppercase font-bold leading-none tracking-wider">Net IO</span>
                     <span className="text-sm font-mono font-bold text-text-main mt-1.5">{(stats?.networkRxMB || 0).toFixed(1)}MB</span>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-amber-500 opacity-50" />
                  <div className="flex flex-col">
                     <span className="text-[10px] text-text-sub uppercase font-bold leading-none tracking-wider">Health</span>
                     <span className="text-sm font-mono font-bold text-emerald-500 mt-1.5 uppercase">Optimal</span>
                  </div>
               </div>
            </div>
          </>
        ) : (
          <div className="h-28 flex items-center justify-center border border-dashed border-ui-border rounded-md bg-ui-accent/30">
             <div className="flex flex-col items-center gap-3 opacity-30 text-text-sub">
                <Activity className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-[0.2em]">Module Offline</span>
             </div>
          </div>
        )}
      </div>

      {/* Advanced Action Dock */}
      <div className="p-2.5 bg-ui-accent border-t border-ui-border flex items-center justify-around">
        <button 
          onClick={() => onToggleStatus(c.id)}
          className={`p-2.5 rounded-md transition-all ${
            isRunning ? 'hover:bg-amber-500/10 text-text-sub hover:text-amber-500' : 'hover:bg-emerald-500/10 text-text-sub hover:text-emerald-500'
          }`}
          title={isRunning ? 'Shutdown' : 'Initialize'}
        >
          {isRunning ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        <div className="w-[1px] h-5 bg-ui-border" />

        <button 
          onClick={() => onRestart(c.id, c.name)}
          className="p-2.5 rounded-md hover:bg-brand/10 text-text-sub hover:text-brand transition-all"
          title="Restart Module"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button 
          onClick={() => onOpenWebUI(c)}
          disabled={!isRunning}
          className="p-2.5 rounded-md hover:bg-emerald-500/10 text-text-sub hover:text-emerald-500 transition-all disabled:opacity-20"
          title="Access UI"
        >
          <ExternalLink className="w-4 h-4" />
        </button>

        <button 
          onClick={() => onOpenLogs(c)}
          className="p-2.5 rounded-md hover:bg-ui-accent-light text-text-sub hover:text-text-main transition-all"
          title="Telemetry"
        >
          <Terminal className="w-4 h-4" />
        </button>

        <button 
          onClick={() => onDelete(c)}
          className="p-2.5 rounded-md hover:bg-rose-500/10 text-text-sub hover:text-rose-500 transition-all"
          title="Decommission"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
