'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AuthFlow from '@/components/AuthFlow';

export default function SetupPage() {
  const router = useRouter();

  return (
    <AuthFlow
      type="setup"
      onComplete={() => {
        router.push('/login');
      }}
    />
  );
}
