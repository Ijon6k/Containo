import { useState, useEffect } from 'react';
import { ContainerStats } from '@/lib/types';

export const useStats = (expandedStatsIds: string[]) => {
  const [stats, setStats] = useState<Record<string, ContainerStats>>({});

  useEffect(() => {
    if (expandedStatsIds.length === 0) return;
    
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/containers/stats?ids=${expandedStatsIds.join(',')}`);
        if (res.ok) {
          const data = await res.json();
          setStats(prev => ({ ...prev, ...data }));
        }
      } catch (e) {
        console.error('Failed to fetch stats');
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [expandedStatsIds]);

  return { stats };
};
