import { useState, useEffect } from 'react';
import { ContainerStats } from '@/lib/types';

/**
 * Hook to manage a sliding window of numeric metrics.
 * @param currentValue The latest value to add to history
 * @param limit Number of data points to keep
 * @param trigger A value that changes on every update (e.g. timestamp) to force a shift
 */
export const useMetricHistory = (currentValue: number, limit: number = 40, trigger?: any) => {
  const [history, setHistory] = useState<number[]>(new Array(limit).fill(0));

  useEffect(() => {
    setHistory(prev => {
      const newHistory = [...prev.slice(1), currentValue];
      return newHistory;
    });
  }, [trigger, currentValue]); // Updates whenever a new trigger (timestamp) or value arrives

  return history;
};
