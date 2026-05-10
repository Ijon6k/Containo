'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthFlow from '@/components/AuthFlow';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const setup = localStorage.getItem('containo_setup');
    if (!setup) {
      router.replace('/setup');
    }
  }, [router]);

  return (
    <AuthFlow
      type="login"
      onComplete={() => {
        sessionStorage.setItem('containo_auth', 'true');
        router.push('/dashboard');
      }}
    />
  );
}
