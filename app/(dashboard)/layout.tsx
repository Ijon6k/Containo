'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { NotificationProvider, useNotify } from '@/components/providers/NotificationProvider';
import { useTheme } from '@/components/providers/ThemeProvider';
import { WebSocketProvider } from '@/components/providers/WebSocketProvider';

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { toasts, confirmDialog, closeConfirm } = useNotify();
  const { theme, cycleTheme } = useTheme();

  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved === 'true') {
      setIsCollapsed(true);
    }
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed(prev => {
      const newVal = !prev;
      localStorage.setItem('sidebar-collapsed', String(newVal));
      return newVal;
    });
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.replace('/login');
    } catch {
      router.replace('/login');
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-text-primary">
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        onLogout={handleLogout}
        theme={theme}
        cycleTheme={cycleTheme}
      />

      <main
        className={`flex-1 transition-[margin] duration-200 ${
          isCollapsed ? 'lg:ml-[64px]' : 'lg:ml-[220px]'
        } p-4 md:p-8 min-h-screen overflow-y-auto`}
      >
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
    <NotificationProvider>
      <WebSocketProvider>
        <DashboardLayoutInner>{children}</DashboardLayoutInner>
      </WebSocketProvider>
    </NotificationProvider>
  );
}
