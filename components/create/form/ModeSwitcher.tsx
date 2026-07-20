'use client';

import React from 'react';
import { Layout, Terminal } from 'lucide-react';

interface ModeSwitcherProps {
  deploymentMode: 'form' | 'cli';
  setDeploymentMode: (mode: 'form' | 'cli') => void;
}

export const ModeSwitcher = ({ deploymentMode, setDeploymentMode }: ModeSwitcherProps) => {
  return (
    <div className="flex bg-surface2 p-1 rounded-sm border border-border self-start">
      <button 
        type="button"
        onClick={() => setDeploymentMode('form')}
        className={`flex items-center gap-2 px-6 py-2 rounded-sm text-base font-semibold transition-all ${deploymentMode === 'form' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
      >
        <Layout className="w-4 h-4" />
        Form mode
      </button>
      <button 
        type="button"
        onClick={() => setDeploymentMode('cli')}
        className={`flex items-center gap-2 px-6 py-2 rounded-sm text-base font-semibold transition-all ${deploymentMode === 'cli' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
      >
        <Terminal className="w-4 h-4" />
        CLI mode
      </button>
    </div>
  );
};
