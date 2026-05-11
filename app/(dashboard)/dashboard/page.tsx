'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from '@/components/Dashboard';
import { useNotify } from '@/components/providers/NotificationProvider';
import { useWS } from '@/components/providers/WebSocketProvider';
import { Container } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const { addToast, showConfirm } = useNotify();
  const [containers, setContainers] = useState<Container[]>([]);
  const [systemInfo, setSystemInfo] = useState<any>(null);

  const { subscribe } = useWS();

  const fetchContainers = useCallback(async () => {
    try {
      const res = await fetch('/api/containers');
      if (res.ok) setContainers(await res.json());
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchSystemInfo = useCallback(async () => {
    try {
      const res = await fetch('/api/system');
      if (res.ok) setSystemInfo(await res.json());
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchContainers();
    fetchSystemInfo();

    const unsubContainers = subscribe('containers:update', (data) => {
      setContainers(data);
    });

    const unsubSystem = subscribe('system:update', (data) => {
      setSystemInfo(data);
    });

    return () => {
      unsubContainers();
      unsubSystem();
    };
  }, [fetchContainers, fetchSystemInfo, subscribe]);

  return (
    <Dashboard
      containers={containers}
      setContainers={setContainers}
      addToast={addToast}
      showConfirm={showConfirm}
      systemInfo={systemInfo}
      onNavigateToDeploy={() => router.push('/deploy')}
    />
  );
}
