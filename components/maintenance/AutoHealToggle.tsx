'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface AutoHealToggleProps {
  autoHeal: boolean;
  setAutoHeal: (value: boolean) => void;
}

export function AutoHealToggle({ autoHeal, setAutoHeal }: AutoHealToggleProps) {
  return (
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
  );
}
