'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { NotificationProvider, useNotify } from '@/components/providers/NotificationProvider';
import { ThemeProvider, useTheme } from '@/components/providers/ThemeProvider';
import { WebSocketProvider } from '@/components/providers/WebSocketProvider';

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { toasts, confirmDialog, closeConfirm } = useNotify();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.replace('/login');
    } catch (err) {
      console.error('Logout failed');
      router.replace('/login');
    }
  };

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
        <WebSocketProvider>
          <DashboardLayoutInner>{children}</DashboardLayoutInner>
        </WebSocketProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
