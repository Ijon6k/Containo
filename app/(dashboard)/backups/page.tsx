'use client';

import React, { useState, useEffect, useCallback } from 'react';
import BackupRestore from '@/components/BackupRestore';
import { useNotify } from '@/components/providers/NotificationProvider';
import { Volume } from '@/lib/types';

export default function BackupsPage() {
  const { addToast, showConfirm } = useNotify();
  const [volumes, setVolumes] = useState<Volume[]>([]);

  const fetchVolumes = useCallback(async () => {
    try {
      const res = await fetch('/api/volumes');
      if (res.ok) setVolumes(await res.json());
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchVolumes();
  }, [fetchVolumes]);

  return (
    <BackupRestore
      volumes={volumes}
      addToast={addToast}
      showConfirm={showConfirm}
      fetchVolumes={fetchVolumes}
    />
  );
}
