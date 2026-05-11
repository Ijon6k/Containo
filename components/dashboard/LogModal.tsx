import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon, X } from 'lucide-react';
import { Container } from '@/lib/types';

interface LogModalProps {
  container: Container | null;
  onClose: () => void;
}

export const LogModal = ({ container, onClose }: LogModalProps) => {
  return (
    <AnimatePresence>
      {container && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-zinc-950/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }}
            className="card w-full max-w-4xl h-[80vh] flex flex-col"
          >
            <div className="p-6 border-b border-ui-border flex justify-between items-center">
              <div className="flex items-center gap-3">
                <TerminalIcon className="w-5 h-5 text-brand" />
                <h3 className="font-bold text-text-main">Logs: {container.name}</h3>
              </div>
              <button onClick={onClose}>
                <X className="w-6 h-6 text-text-sub hover:text-rose-500" />
              </button>
            </div>
            <div className="flex-1 bg-zinc-950 p-6 overflow-y-auto font-mono text-xs text-zinc-400">
              {(!container.logs || container.logs.length === 0) ? (
                <div className="text-zinc-600 italic">No logs available for this container.</div>
              ) : (
                container.logs.map((log, i) => (
                  <div key={i} className="py-0.5 border-b border-white/5">{log}</div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
