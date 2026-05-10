'use client';

import { useState } from 'react';

interface UsePruneProps {
  addToast: (msg: string, type?: 'success' | 'error') => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, type?: 'danger' | 'warning' | 'info') => void;
  fetchSystemInfo: () => Promise<void>;
}

export function usePrune({ addToast, showConfirm, fetchSystemInfo }: UsePruneProps) {
  const [isPruning, setIsPruning] = useState(false);

  const handlePrune = () => {
    showConfirm(
      'System Deep Prune',
      'Are you sure? This will remove all unused containers, images, and networks. This action can free up disk space but deleted items cannot be recovered.',
      async () => {
        setIsPruning(true);
        try {
          const res = await fetch('/api/system', {
            method: 'POST',
            body: JSON.stringify({ action: 'prune' })
          });
          if (res.ok) {
            addToast('System pruned successfully');
            fetchSystemInfo();
          } else {
            addToast('Prune failed', 'error');
          }
        } catch (e) {
          addToast('Prune failed', 'error');
        } finally {
          setIsPruning(false);
        }
      },
      'danger'
    );
  };

  return {
    isPruning,
    handlePrune
  };
}
