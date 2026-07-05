'use client';

import React from 'react';
import { Layout, Terminal } from 'lucide-react';

interface ModeSwitcherProps {
  deploymentMode: 'form' | 'cli';
  setDeploymentMode: (mode: 'form' | 'cli') => void;
}

export const ModeSwitcher = ({ deploymentMode, setDeploymentMode }: ModeSwitcherProps) => {
  return (
    <div className="flex bg-ui-accent p-1 rounded-md border border-ui-border self-start">
      <button 
        type="button"
        onClick={() => setDeploymentMode('form')}
        className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-semibold transition-all ${deploymentMode === 'form' ? 'bg-ui-bg text-text-main shadow-sm' : 'text-text-sub hover:text-text-main'}`}
      >
        <Layout className="w-4 h-4" />
        Form Mode
      </button>
      <button 
        type="button"
        onClick={() => setDeploymentMode('cli')}
        className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-semibold transition-all ${deploymentMode === 'cli' ? 'bg-ui-bg text-text-main shadow-sm' : 'text-text-sub hover:text-text-main'}`}
      >
        <Terminal className="w-4 h-4" />
        CLI Mode
      </button>
    </div>
  );
};
