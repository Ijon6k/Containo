'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from '@/components/Dashboard';
import { useNotify } from '@/components/providers/NotificationProvider';
import { useWS } from '@/components/providers/WebSocketProvider';
import { useContainers } from '@/hooks/useContainers';

export default function DashboardPage() {
  const router = useRouter();
  const { addToast, showConfirm } = useNotify();
  const [systemInfo, setSystemInfo] = useState<any>(null);

  const { subscribe } = useWS();

  const fetchSystemInfo = useCallback(async () => {
    try {
      const res = await fetch('/api/system');
      if (res.ok) setSystemInfo(await res.json());
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchSystemInfo();

    const unsubSystem = subscribe('system:update', (data) => {
      setSystemInfo(data);
    });

    return () => {
      unsubSystem();
    };
  }, [fetchSystemInfo, subscribe]);

  return (
    <Dashboard
      addToast={addToast}
      showConfirm={showConfirm}
      systemInfo={systemInfo}
      onNavigateToDeploy={() => router.push('/deploy')}
    />
  );
}
