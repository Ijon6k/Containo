import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon, X, Copy, Check } from 'lucide-react';
import { Container } from '@/lib/types';
import { useState } from 'react';

interface TerminalModalProps {
  container: Container | null;
  onClose: () => void;
}

export const TerminalModal = ({ container, onClose }: TerminalModalProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!container) return;
    navigator.clipboard.writeText(`docker exec -it ${container.name} sh`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {container && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-zinc-950/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }}
            className="card w-full max-w-2xl flex flex-col"
          >
            <div className="p-6 border-b border-ui-border flex justify-between items-center">
              <div className="flex items-center gap-3">
                <TerminalIcon className="w-5 h-5 text-brand" />
                <h3 className="font-bold text-text-main">Terminal: {container.name}</h3>
              </div>
              <button onClick={onClose}>
                <X className="w-6 h-6 text-text-sub hover:text-rose-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-4 rounded-md text-sm">
                <strong>WIP (Work In Progress):</strong> Interactive web terminal is coming soon! For now, you can copy the command below and paste it into your local terminal to access the container shell.
              </div>
              
              <div className="relative">
                <div className="bg-zinc-950 border border-white/5 p-4 rounded-md font-mono text-sm text-zinc-300">
                  docker exec -it {container.name} sh
                </div>
                <button 
                  onClick={handleCopy}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-md transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-400" />}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
