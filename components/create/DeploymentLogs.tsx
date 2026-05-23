import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon, CheckCircle2, Loader2, ChevronRight } from 'lucide-react';

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

  // Filter out pull events from main logs to keep it clean if they are shown in progress bars
  const displayLogs = logs.filter(log => !log.includes('[PULL]'));

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-ui-border pb-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-md bg-ui-accent ${!isComplete ? 'text-brand animate-pulse' : 'text-emerald-500'}`}>
            {isComplete ? <CheckCircle2 className="w-6 h-6" /> : <Loader2 className="w-6 h-6 animate-spin" />}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-text-main">
              {isComplete ? 'Deployment Finished' : 'Synchronizing Unit'}
            </h3>
            <p className="text-sm text-text-sub">
              {isComplete ? 'All layers verified and container started.' : 'Downloading and verifying container layers...'}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Pull Progress */}
      <AnimatePresence>
        {Object.keys(pullProgress).length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2"
          >
            {Object.entries(pullProgress).map(([id, info]) => {
              const progress = info.progressDetail?.total 
                ? (info.progressDetail.current / info.progressDetail.total) * 100 
                : info.status === 'Download complete' || info.status === 'Pull complete' ? 100 : 0;
              
              return (
                <div key={id} className="bg-ui-accent/50 px-4 py-3 rounded-md border border-ui-border flex items-center justify-between gap-6">
                  <div className="flex items-center gap-3 w-48 shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                    <span className="text-xs font-mono text-text-sub uppercase tracking-wider truncate">{id}</span>
                  </div>
                  
                  <div className="flex-1 relative h-1.5 bg-ui-border rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className={`absolute top-0 left-0 h-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : 'bg-brand'}`}
                    />
                  </div>

                  <span className="text-[10px] font-semibold text-text-sub uppercase tracking-widest px-2 py-0.5 bg-ui-bg rounded shrink-0 w-32 text-center truncate border border-ui-border/50">
                    {info.status}
                  </span>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clean Activity Feed */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-text-sub uppercase tracking-[0.2em] mb-4">
          <ChevronRight className="w-4 h-4" />
          Activity Feed
        </div>
        <div 
          ref={scrollRef}
          className="bg-ui-accent/30 border border-ui-border rounded-md p-6 h-64 overflow-y-auto font-mono text-sm custom-scrollbar shadow-inner"
        >
          <div className="space-y-3">
            {displayLogs.map((log, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-4 group"
              >
                <span className="text-text-sub opacity-30 select-none">{String(i + 1).padStart(2, '0')}</span>
                <span className={`${log.includes('[ERROR]') ? 'text-rose-500' : log.includes('[SUCCESS]') ? 'text-emerald-500' : 'text-text-main'}`}>
                  {log.replace(/\[.*?\]\s*/, '')}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {isComplete && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-6"
        >
          <button 
            onClick={onClose} 
            className="w-full bg-ui-accent hover:bg-ui-accent/80 text-text-main py-4 rounded-md font-semibold transition-all flex items-center justify-center gap-2 border border-ui-border"
          >
            Return to Infrastructure
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
};
