'use client';

import React from 'react';
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
          <Zap className="w-4 h-4 text-warning" />
          <span className="text-base font-bold text-text-primary">Auto-healing</span>
        </div>
        <button onClick={() => setAutoHeal(!autoHeal)}
          className={`w-10 h-5 rounded-full transition-colors relative ${autoHeal ? 'bg-brand' : 'bg-surface2'}`}>
          <div className="absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-200"
            style={{ transform: autoHeal ? 'translateX(22px)' : 'translateX(2px)' }} />
        </button>
      </div>
      <p className="text-sm text-text-secondary leading-relaxed">
        Automatically restarts containers if they crash or become unresponsive.
      </p>
    </div>
  );
}
