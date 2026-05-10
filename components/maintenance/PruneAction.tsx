'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';

interface PruneActionProps {
  isPruning: boolean;
  onPrune: () => void;
}

export function PruneAction({ isPruning, onPrune }: PruneActionProps) {
  return (
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
           onClick={onPrune}
           disabled={isPruning}
           className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-md text-sm font-bold shadow-sm transition-colors disabled:opacity-50 shrink-0"
          >
             {isPruning ? 'Optimizing...' : 'Prune Now'}
          </button>
       </div>
    </div>
  );
}
