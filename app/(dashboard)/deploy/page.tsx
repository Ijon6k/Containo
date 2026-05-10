'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import CreateContainerFlow from '@/components/CreateContainerFlow';
import { useNotify } from '@/components/providers/NotificationProvider';

export default function DeployPage() {
  const router = useRouter();
  const { addToast } = useNotify();

  return (
    <CreateContainerFlow
      addToast={addToast}
      onBack={() => router.push('/dashboard')}
    />
  );
}
