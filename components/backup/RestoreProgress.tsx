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
      className="bg-surface border border-brand/20 rounded-md p-6 bg-brand/5"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-[12px] font-medium text-brand">Restoring...</span>
        <span className="text-sm font-semibold text-brand">{restoreProgress}%</span>
      </div>
      <div className="w-full h-1.5 bg-brand/10 rounded-full overflow-hidden mb-4">
        <motion.div 
          className="h-full bg-brand"
          initial={{ width: 0 }}
          animate={{ width: `${restoreProgress}%` }}
        />
      </div>
      <p className="text-[12px] font-medium text-text-secondary text-center">{restoreStep}</p>
    </motion.div>
  );
}
