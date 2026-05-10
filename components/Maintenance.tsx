'use client';

import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { Container } from '@/lib/types';
import { HealthScoreCard } from './maintenance/HealthScoreCard';
import { AutoHealToggle } from './maintenance/AutoHealToggle';
import { StorageAnalysis } from './maintenance/StorageAnalysis';
import { PruneAction } from './maintenance/PruneAction';
import { usePrune } from '@/hooks/usePrune';

interface MaintenanceProps {
  containers: Container[];
  setContainers: React.Dispatch<React.SetStateAction<Container[]>>;
  addToast: (msg: string, type?: 'success' | 'error') => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, type?: 'danger' | 'warning' | 'info') => void;
  systemInfo: any;
  fetchSystemInfo: () => Promise<void>;
}

export default function Maintenance({ 
  containers, 
  setContainers, 
  addToast, 
  showConfirm, 
  systemInfo, 
  fetchSystemInfo 
}: MaintenanceProps) {
  const [autoHeal, setAutoHeal] = useState(true);
  const { isPruning, handlePrune } = usePrune({ addToast, showConfirm, fetchSystemInfo });

  if (!systemInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
        <p className="text-text-sub text-sm font-medium animate-pulse">Gathering system metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-text-main">Maintenance</h2>
        <p className="text-text-sub text-sm">Keep your system optimized and healthy.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Card */}
        <div className="lg:col-span-1 space-y-6">
          <HealthScoreCard systemInfo={systemInfo} />
          <AutoHealToggle autoHeal={autoHeal} setAutoHeal={setAutoHeal} />
        </div>

        {/* Storage & Optimization */}
        <div className="lg:col-span-2 space-y-6">
            <StorageAnalysis systemInfo={systemInfo} />
            <PruneAction isPruning={isPruning} onPrune={handlePrune} />

            <div className="p-4 bg-ui-accent/50 rounded-md border border-ui-border flex items-start gap-3">
               <Info className="w-4 h-4 text-text-sub mt-0.5" />
               <p className="text-xs text-text-sub leading-relaxed">
                  Regular maintenance helps prevent performance degradation. It's recommended to prune your system at least once a month.
               </p>
            </div>
        </div>
      </div>
    </div>
  );
}
