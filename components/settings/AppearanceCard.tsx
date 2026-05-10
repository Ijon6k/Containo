'use client';

import React from 'react';
import { Smartphone } from 'lucide-react';

interface AppearanceCardProps {
  theme: string;
  onToggleTheme: () => void;
}

export function AppearanceCard({ theme, onToggleTheme }: AppearanceCardProps) {
  return (
    <div className="card p-6">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-md bg-ui-accent flex items-center justify-center text-amber-500">
                <Smartphone className="w-5 h-5" />
             </div>
             <div>
                <h3 className="text-sm font-bold text-text-main tracking-tight">Appearance</h3>
                <p className="text-xs text-text-sub font-medium capitalize">Current theme: {theme}</p>
             </div>
          </div>
          <button 
            onClick={onToggleTheme}
            className="px-4 py-2 bg-ui-accent hover:bg-ui-border text-text-main rounded-md text-[10px] font-bold uppercase tracking-widest transition-all"
          >
             Switch Theme
          </button>
       </div>
    </div>
  );
}
