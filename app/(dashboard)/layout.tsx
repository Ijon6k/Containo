'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { NotificationProvider, useNotify } from '@/components/providers/NotificationProvider';
import { ThemeProvider, useTheme } from '@/components/providers/ThemeProvider';

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { toasts, confirmDialog, closeConfirm } = useNotify();
  const { theme, toggleTheme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const setup = localStorage.getItem('containo_setup');
    if (!setup) {
      router.replace('/setup');
      return;
    }

    const auth = sessionStorage.getItem('containo_auth');
    if (!auth) {
      router.replace('/login');
      return;
    }

    setIsAuthenticated(true);
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('containo_auth');
    setIsAuthenticated(false);
    router.replace('/login');
  };

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ui-bg">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-ui-bg text-text-main transition-colors duration-300">
      <Sidebar
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main className="flex-1 lg:ml-64 p-4 md:p-10 min-h-screen overflow-y-auto bg-background">
        <div className="max-w-[1400px] mx-auto w-full">
          {children}
        </div>
      </main>

      <ToastContainer toasts={toasts} />
      <ConfirmModal dialog={confirmDialog} onClose={closeConfirm} />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <DashboardLayoutInner>{children}</DashboardLayoutInner>
      </NotificationProvider>
    </ThemeProvider>
  );
}
