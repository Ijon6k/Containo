import { useState, useEffect } from 'react';
import { ContainerStats } from '@/lib/types';
import { useWS } from '@/components/providers/WebSocketProvider';

export const useStats = (expandedStatsIds: string[]) => {
  const [stats, setStats] = useState<Record<string, ContainerStats>>({});
  const { sendMessage, subscribe, isConnected } = useWS();

  useEffect(() => {
    if (expandedStatsIds.length === 0) return;

    // Subscribe to stats for these IDs
    sendMessage('stats:subscribe', expandedStatsIds);

    // Listen for updates
    const unsubscribe = subscribe('stats:update', (data) => {
      setStats(prev => ({ ...prev, ...data }));
    });

    return () => {
      unsubscribe();
      sendMessage('stats:unsubscribe', expandedStatsIds);
    };
  }, [expandedStatsIds, sendMessage, subscribe, isConnected]);

  return { stats };
};
