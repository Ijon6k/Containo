'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface RestoreProgressProps {
  restoreProgress: number;
  restoreStep: string;
}

export function RestoreProgress({ restoreProgress, restoreStep }: RestoreProgressProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="card p-6 border-brand/20 bg-brand/5"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-bold text-brand uppercase tracking-widest">Restoring...</span>
        <span className="text-xs font-bold text-brand">{restoreProgress}%</span>
      </div>
      <div className="w-full h-1.5 bg-brand/10 rounded-full overflow-hidden mb-4">
        <motion.div 
          className="h-full bg-brand"
          initial={{ width: 0 }}
          animate={{ width: `${restoreProgress}%` }}
        />
      </div>
      <p className="text-[10px] font-bold text-text-sub uppercase tracking-widest text-center">{restoreStep}</p>
    </motion.div>
  );
}
