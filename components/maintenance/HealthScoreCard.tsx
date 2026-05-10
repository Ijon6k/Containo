'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface HealthScoreCardProps {
  systemInfo: any;
}

export function HealthScoreCard({ systemInfo }: HealthScoreCardProps) {
  const healthScore = systemInfo?.healthScore ?? 0;

  return (
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
  );
}
