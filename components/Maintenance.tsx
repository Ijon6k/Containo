'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Trash2, 
  Zap, 
  RotateCcw, 
  AlertTriangle,
  CheckCircle2,
  HardDrive,
  Info
} from 'lucide-react';
import { Container } from '@/lib/types';

interface MaintenanceProps {
  containers: Container[];
  setContainers: React.Dispatch<React.SetStateAction<Container[]>>;
  addToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function Maintenance({ containers, setContainers, addToast }: MaintenanceProps) {
  const [isPruning, setIsPruning] = useState(false);
  const [autoHeal, setAutoHeal] = useState(true);

  const handlePrune = () => {
    setIsPruning(true);
    setTimeout(() => {
      setIsPruning(false);
      addToast('Unused images and volumes pruned');
    }, 1500);
  };

  const healthScore = 94;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-text-main">Maintenance</h2>
        <p className="text-text-sub text-sm">Keep your system optimized and healthy.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6 flex flex-col items-center text-center">
            <div className="relative w-32 h-32 flex items-center justify-center mb-4">
               <svg className="w-full h-full -rotate-90">
                  <circle 
                    cx="64" cy="64" r="58" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="8"
                    className="text-ui-accent"
                  />
                  <motion.circle 
                    cx="64" cy="64" r="58" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="8"
                    strokeDasharray="364.4"
                    initial={{ strokeDashoffset: 364.4 }}
                    animate={{ strokeDashoffset: 364.4 * (1 - healthScore / 100) }}
                    className="text-brand"
                  />
               </svg>
               <span className="absolute text-3xl font-bold text-text-main">{healthScore}%</span>
            </div>
            <h3 className="text-lg font-bold text-text-main">System Health</h3>
            <p className="text-sm text-text-sub mt-1">Your infrastructure is performing optimally.</p>
          </div>

          <div className="card p-6">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                   <Zap className="w-4 h-4 text-amber-500" />
                   <span className="text-sm font-bold text-text-main">Auto-Healing</span>
                </div>
                <button 
                  onClick={() => setAutoHeal(!autoHeal)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${autoHeal ? 'bg-brand' : 'bg-ui-accent'}`}
                >
                  <motion.div 
                    animate={{ x: autoHeal ? 22 : 2 }}
                    className="absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm" 
                  />
                </button>
             </div>
             <p className="text-xs text-text-sub leading-relaxed">
                Automatically restarts containers if they crash or become unresponsive.
             </p>
          </div>
        </div>

        {/* Storage & Optimization */}
        <div className="lg:col-span-2 space-y-6">
           <div className="card p-6">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-500">
                    <HardDrive className="w-5 h-5" />
                 </div>
                 <h3 className="text-lg font-bold text-text-main">Storage Analysis</h3>
              </div>
              
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between text-xs font-bold text-text-sub mb-2 uppercase tracking-wider">
                       <span>Docker Images</span>
                       <span>12.4 GB</span>
                    </div>
                    <div className="w-full h-2 bg-ui-accent rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-500 w-[65%]" />
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-xs font-bold text-text-sub mb-2 uppercase tracking-wider">
                       <span>Volumes (Data)</span>
                       <span>4.8 GB</span>
                    </div>
                    <div className="w-full h-2 bg-ui-accent rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 w-[25%]" />
                    </div>
                 </div>
              </div>
           </div>

           <div className="card p-6 bg-rose-50/30 dark:bg-rose-500/5 border-rose-100 dark:border-rose-100/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                 <div className="flex items-start gap-4">
                    <div className="p-2 rounded-md bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400">
                       <Trash2 className="w-5 h-5" />
                    </div>
                    <div>
                       <h3 className="text-sm font-bold text-text-main">Deep Prune</h3>
                       <p className="text-xs text-text-sub mt-1 max-w-md">
                          Remove all unused containers, networks, images, and optionally, volumes. This can free up significant disk space.
                       </p>
                    </div>
                 </div>
                 <button 
                  onClick={handlePrune}
                  disabled={isPruning}
                  className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-md text-sm font-bold shadow-sm transition-colors disabled:opacity-50 shrink-0"
                 >
                    {isPruning ? 'Optimizing...' : 'Prune Now'}
                 </button>
              </div>
           </div>

           <div className="p-4 bg-ui-accent/50 rounded-md border border-ui-border flex items-start gap-3">
              <Info className="w-4 h-4 text-text-sub mt-0.5" />
              <p className="text-xs text-text-sub leading-relaxed">
                 Regular maintenance helps prevent performance degradation. It's recommended to prune your system at least once a month.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
