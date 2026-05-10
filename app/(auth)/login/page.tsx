'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthFlow from '@/components/AuthFlow';

export default function LoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkSetup() {
      try {
        const res = await fetch('/api/auth/setup');
        const data = await res.json();
        if (data.setupNeeded) {
          router.replace('/setup');
        } else {
          setChecking(false);
        }
      } catch (err) {
        console.error('Failed to check setup status');
        setChecking(false);
      }
    }
    checkSetup();
  }, [router]);

  if (checking) return null;

  return (
    <AuthFlow
      type="login"
      onComplete={() => {
        router.push('/dashboard');
      }}
    />
  );
}
