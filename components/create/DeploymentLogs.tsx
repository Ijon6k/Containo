import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon, CheckCircle2 } from 'lucide-react';

interface DeploymentLogsProps {
  logs: string[];
  pullProgress: Record<string, any>;
  onClose: () => void;
  isComplete: boolean;
}

export const DeploymentLogs = ({ logs, pullProgress, onClose, isComplete }: DeploymentLogsProps) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-brand/10 text-brand animate-pulse">
            <TerminalIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-main">Deployment in Progress</h3>
            <p className="text-xs text-text-sub">Streaming real-time Docker engine events...</p>
          </div>
        </div>
        {isComplete && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            Complete
          </motion.div>
        )}
      </div>

      {/* Pull Progress Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.entries(pullProgress).map(([id, info]) => (
          <div key={id} className="bg-ui-accent/50 p-3 rounded-lg border border-ui-border">
            <div className="flex justify-between text-[10px] font-bold text-text-sub mb-2 uppercase tracking-widest">
              <span className="truncate max-w-[100px]">{id}</span>
              <span>{info.status}</span>
            </div>
            {info.progressDetail?.total && (
              <div className="w-full h-1.5 bg-ui-accent rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(info.progressDetail.current / info.progressDetail.total) * 100}%` }}
                  className="h-full bg-brand"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Terminal Logs */}
      <div 
        ref={scrollRef}
        className="bg-zinc-950 rounded-lg p-4 h-64 overflow-y-auto font-mono text-xs border border-white/5 shadow-inner"
      >
        <AnimatePresence mode="popLayout">
          {logs.map((log, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="py-1 text-zinc-400 border-b border-white/5 last:border-0"
            >
              <span className="text-zinc-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
              {log}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isComplete && (
        <button 
          onClick={onClose} 
          className="w-full bg-brand hover:bg-brand/90 text-white px-6 py-2 rounded-md font-bold shadow-sm transition-all active:scale-95"
        >
          Back to Dashboard
        </button>
      )}
    </div>
  );
};
