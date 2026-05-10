'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HardDrive } from 'lucide-react';

interface StorageAnalysisProps {
  systemInfo: any;
}

export function StorageAnalysis({ systemInfo }: StorageAnalysisProps) {
  const [storageView, setStorageView] = useState<'bar' | 'donut'>('bar');

  return (
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
  );
}
