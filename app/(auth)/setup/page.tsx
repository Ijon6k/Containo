'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import SetupForm from '@/components/auth/SetupForm';

export default function SetupPage() {
  const router = useRouter();

  return (
    <AuthLayout
      badge="Get started"
      title="Setup Administrator"
      subtitle="Initialize your administrator account to secure the system."
    >
      <SetupForm
        onComplete={() => {
          router.push('/login');
        }}
      />
    </AuthLayout>
  );
}
