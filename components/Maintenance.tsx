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
  showConfirm: (title: string, message: string, onConfirm: () => void, type?: 'danger' | 'warning' | 'info') => void;
  systemInfo: any;
  fetchSystemInfo: () => Promise<void>;
}

export default function Maintenance({ containers, setContainers, addToast, showConfirm, systemInfo, fetchSystemInfo }: MaintenanceProps) {
  const [isPruning, setIsPruning] = useState(false);
  const [autoHeal, setAutoHeal] = useState(true);
  const [storageView, setStorageView] = useState<'bar' | 'donut'>('bar');

  const handlePrune = () => {
    showConfirm(
      'System Deep Prune',
      'Are you sure? This will remove all unused containers, images, and networks. This action can free up disk space but deleted items cannot be recovered.',
      async () => {
        setIsPruning(true);
        try {
          const res = await fetch('/api/system', {
            method: 'POST',
            body: JSON.stringify({ action: 'prune' })
          });
          if (res.ok) {
            addToast('System pruned successfully');
            fetchSystemInfo();
          } else {
            addToast('Prune failed', 'error');
          }
        } catch (e) {
          addToast('Prune failed', 'error');
        } finally {
          setIsPruning(false);
        }
      },
      'danger'
    );
  };

  const healthScore = systemInfo?.healthScore ?? 0;

  if (!systemInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
        <p className="text-text-sub text-sm font-medium animate-pulse">Gathering system metrics...</p>
      </div>
    );
  }

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
            <div className="w-full mt-6 space-y-3">
               <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-text-sub">System Stability (40%)</span>
                  <span className="text-emerald-500">{systemInfo?.healthBreakdown?.stability || 0} pts</span>
               </div>
               <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-text-sub">Storage Hygiene (30%)</span>
                  <span className="text-indigo-500">{systemInfo?.healthBreakdown?.hygiene || 0} pts</span>
               </div>
               <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-text-sub">Resource Density (30%)</span>
                  <span className="text-amber-500">{systemInfo?.healthBreakdown?.resources || 0} pts</span>
               </div>
            </div>
            <p className="text-[10px] text-text-sub mt-6 italic">Stability only penalizes unexpected crashes (non-zero exit codes).</p>
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
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-500">
                       <HardDrive className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-text-main">Global Storage Analysis</h3>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="flex bg-ui-accent rounded-md p-0.5">
                       <button 
                         onClick={() => setStorageView('bar')}
                         className={`px-2 py-1 text-[10px] font-bold rounded-sm transition-all ${storageView === 'bar' ? 'bg-ui-bg shadow-sm text-brand' : 'text-text-sub'}`}
                       >
                          Bar
                       </button>
                       <button 
                         onClick={() => setStorageView('donut')}
                         className={`px-2 py-1 text-[10px] font-bold rounded-sm transition-all ${storageView === 'donut' ? 'bg-ui-bg shadow-sm text-brand' : 'text-text-sub'}`}
                       >
                          Donut
                       </button>
                    </div>
                    <span className="text-[10px] font-bold text-text-sub ml-2">Total: {((systemInfo?.storage?.hostTotal || 0) / (1024**3)).toFixed(1)} GB</span>
                 </div>
              </div>
              
              <div className="space-y-8">
                 {storageView === 'bar' ? (
                   <div className="space-y-3">
                      <div className="w-full h-8 bg-ui-accent rounded-lg overflow-hidden flex shadow-inner">
                         {/* OS / System */}
                         <motion.div 
                           title="System / OS"
                           initial={{ width: 0 }}
                           animate={{ width: `${((systemInfo?.storage?.systemBytes || 0) / (systemInfo?.storage?.hostTotal || 1)) * 100}%` }}
                           className="h-full bg-slate-500 border-r border-white/10"
                         />
                         {/* Docker Data */}
                         <motion.div 
                           title="Docker Data"
                           initial={{ width: 0 }}
                           animate={{ width: `${((systemInfo?.storage?.dockerBytes || 0) / (systemInfo?.storage?.hostTotal || 1)) * 100}%` }}
                           className="h-full bg-brand border-r border-white/10"
                         />
                         {/* Free Space */}
                         <div className="flex-1 h-full bg-emerald-500/20" title="Free Space" />
                      </div>
                   </div>
                 ) : (
                   <div className="flex justify-center py-4">
                      <div className="relative w-48 h-48">
                         <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            {/* Free Space Base */}
                            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="12" className="text-emerald-500/20" />
                            
                            {/* OS / System */}
                            {(() => {
                               const osPct = ((systemInfo?.storage?.systemBytes || 0) / (systemInfo?.storage?.hostTotal || 1)) * 100;
                               const dockerPct = ((systemInfo?.storage?.dockerBytes || 0) / (systemInfo?.storage?.hostTotal || 1)) * 100;
                               return (
                                 <>
                                   <motion.circle 
                                     cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="12"
                                     strokeDasharray={`${osPct * 2.51} 251`}
                                     initial={{ strokeDashoffset: 0 }}
                                     className="text-slate-500"
                                   />
                                   <motion.circle 
                                     cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="12"
                                     strokeDasharray={`${dockerPct * 2.51} 251`}
                                     strokeDashoffset={-osPct * 2.51}
                                     initial={{ opacity: 0 }}
                                     animate={{ opacity: 1 }}
                                     className="text-brand"
                                   />
                                 </>
                               );
                            })()}
                         </svg>
                         <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-[10px] font-bold text-text-sub uppercase tracking-tighter">Usage</span>
                            <span className="text-xl font-bold text-text-main">{(((systemInfo?.storage?.hostUsed || 0) / (systemInfo?.storage?.hostTotal || 1)) * 100).toFixed(0)}%</span>
                         </div>
                      </div>
                   </div>
                 )}

                 {/* Legend */}
                 <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-sm bg-slate-500" />
                       <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-text-sub uppercase tracking-tighter">System / OS</span>
                          <span className="text-xs font-bold text-text-main">{((systemInfo?.storage?.systemBytes || 0) / (1024**3)).toFixed(1)} GB</span>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-sm bg-brand" />
                       <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-text-sub uppercase tracking-tighter">Docker Data</span>
                          <span className="text-xs font-bold text-text-main">{((systemInfo?.storage?.dockerBytes || 0) / (1024**3)).toFixed(1)} GB</span>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-sm bg-emerald-500/30" />
                       <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-text-sub uppercase tracking-tighter">Free Space</span>
                          <span className="text-xs font-bold text-text-main">{((systemInfo?.storage?.hostFree || 0) / (1024**3)).toFixed(1)} GB</span>
                       </div>
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
