'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Maintenance from '@/components/Maintenance';
import { useNotify } from '@/components/providers/NotificationProvider';
import { Container } from '@/lib/types';
import { pruneSystem } from '@/lib/api/system-api';

const CACHE_KEY = 'containo_maintenance_cache';
const CACHE_TTL = 15000; // 15 detik

interface CacheEntry {
  containers: Container[];
  systemInfo: any;
  ts: number;
}

function readCache(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data: CacheEntry = JSON.parse(raw);
    if (Date.now() - data.ts > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function writeCache(containers: Container[], systemInfo: any) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ containers, systemInfo, ts: Date.now() }));
  } catch { /* quota exceeded, ignore */ }
}

export default function MaintenancePage() {
  const { addToast, showConfirm } = useNotify();
  const cached = readCache();
  const [containers, setContainers] = useState<Container[]>(cached?.containers ?? []);
  const [systemInfo, setSystemInfo] = useState<any>(cached?.systemInfo ?? null);

  const fetchContainers = useCallback(async () => {
    try {
      const res = await fetch('/api/containers');
      if (res.ok) {
        const data = await res.json();
        setContainers(data);
        return data;
      }
    } catch { /* ignore */ }
    return null;
  }, []);

  const fetchSystemInfo = useCallback(async () => {
    try {
      const res = await fetch('/api/system');
      if (res.ok) {
        const data = await res.json();
        setSystemInfo(data);
        return data;
      }
    } catch { /* ignore */ }
    return null;
  }, []);

  useEffect(() => {
    // Langsung fetch di background walau sudah ada cache
    fetchContainers();
    fetchSystemInfo();
    const interval = setInterval(fetchSystemInfo, 3000);
    return () => clearInterval(interval);
  }, [fetchContainers, fetchSystemInfo]);

  // Update cache saat data berubah
  useEffect(() => {
    if (systemInfo) writeCache(containers, systemInfo);
  }, [containers, systemInfo]);

  const handlePrune = async (options: string[]) => {
    await pruneSystem(options);
    const info = await fetchSystemInfo();
    if (info) writeCache(containers, info);
  };

  return (
    <Maintenance
      containers={containers}
      systemInfo={systemInfo}
      addToast={addToast}
      showConfirm={showConfirm}
      onPrune={handlePrune}
    />
  );
}
