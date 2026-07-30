'use client';

import React, { useState, useEffect, useCallback } from 'react';
import BackupRestore from '@/components/BackupRestore';
import { useNotify } from '@/components/providers/NotificationProvider';
import { Volume, Container } from '@/lib/types';

export default function BackupsPage() {
  const { addToast, showConfirm } = useNotify();
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);

  const fetchVolumes = useCallback(async () => {
    try {
      const res = await fetch('/api/volumes');
      if (res.ok) setVolumes(await res.json());
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch('/api/volumes').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/containers').then((r) => (r.ok ? r.json() : null)),
    ]).then(([vData, cData]) => {
      if (!active) return;
      if (vData) setVolumes(vData);
      if (cData) setContainers(cData);
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <BackupRestore
      volumes={volumes}
      containers={containers}
      addToast={addToast}
      showConfirm={showConfirm}
      fetchVolumes={fetchVolumes}
    />
  );
}
