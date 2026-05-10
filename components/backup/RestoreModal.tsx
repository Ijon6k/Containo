'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Box, Database, Upload, AlertCircle } from 'lucide-react';
import { Container, Volume } from '@/lib/types';

interface RestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  containers: Container[];
  volumes: Volume[];
  onConfirm: (targetVolume: string) => void;
}

export function RestoreModal({ isOpen, onClose, containers, volumes, onConfirm }: RestoreModalProps) {
  const [selectedTarget, setSelectedTarget] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="bg-ui-bg/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden"
      >
        <div className="p-4 border-b border-ui-border flex items-center justify-between">
          <div className="flex items-center gap-2">
             <Upload className="w-4 h-4 text-brand" />
             <h3 className="text-sm font-bold text-text-main uppercase tracking-tight">Real System Restore</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-ui-accent rounded-md transition-colors">
            <X className="w-4 h-4 text-text-sub" />
          </button>
        </div>

        <div className="p-6 space-y-6">
           <div>
              <label className="text-[10px] font-bold text-text-sub uppercase tracking-widest mb-3 block">
                 Step 1: Select Target Volume/Container
              </label>
              <div className="space-y-2 max-h-[350px] overflow-y-auto custom-scrollbar pr-1 py-1">
                 {volumes.map(vol => (
                   <motion.button
                     whileHover={{ x: 4 }}
                     whileTap={{ scale: 0.98 }}
                     key={vol.id}
                     onClick={() => setSelectedTarget(vol.name)}
                     className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left group ${
                       selectedTarget === vol.name 
                         ? 'border-brand bg-brand/10 ring-1 ring-brand shadow-[0_0_15px_-3px_rgba(var(--brand-rgb),0.3)]' 
                         : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10'
                     }`}
                   >
                      <div className="flex items-center gap-4">
                         <div className={`p-2 rounded-lg transition-colors ${
                           selectedTarget === vol.name ? 'bg-brand text-white' : 'bg-ui-accent text-text-sub group-hover:text-text-main'
                         }`}>
                            <Database className="w-4 h-4" />
                         </div>
                         <div>
                            <p className={`text-xs font-bold transition-colors ${
                              selectedTarget === vol.name ? 'text-brand' : 'text-text-main'
                            }`}>{vol.name}</p>
                            <p className="text-[10px] text-text-sub opacity-60 font-mono mt-0.5">{vol.mountpoint}</p>
                         </div>
                      </div>
                      {selectedTarget === vol.name && (
                        <motion.div 
                          layoutId="active-indicator"
                          className="w-2 h-2 rounded-full bg-brand shadow-[0_0_8px_rgba(var(--brand-rgb),0.8)]" 
                        />
                      )}
                   </motion.button>
                 ))}
                 
                 {volumes.length === 0 && (
                   <div className="p-8 text-center bg-ui-accent/20 rounded-lg border border-dashed border-ui-border">
                      <AlertCircle className="w-8 h-8 text-text-sub/30 mx-auto mb-2" />
                      <p className="text-xs text-text-sub">No volumes detected</p>
                   </div>
                 )}
              </div>
           </div>

           <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-lg flex gap-3">
              <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-text-sub leading-relaxed">
                 Restoring will overwrite existing data in the target volume. This action uses real Docker extraction and cannot be undone.
              </p>
           </div>
        </div>

        <div className="p-4 bg-ui-accent/30 border-t border-ui-border flex gap-3">
           <button 
             onClick={onClose}
             className="flex-1 px-4 py-2 text-xs font-bold text-text-sub hover:text-text-main transition-colors"
           >
              Cancel
           </button>
           <button 
             disabled={!selectedTarget}
             onClick={() => onConfirm(selectedTarget)}
             className="flex-1 px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded-md text-xs font-bold transition-all disabled:opacity-50 disabled:grayscale"
           >
              Next: Select File
           </button>
        </div>
      </motion.div>
    </div>
  );
}
