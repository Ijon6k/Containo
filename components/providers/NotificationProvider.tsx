'use client';

import React, { createContext, useContext } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import type { Toast, ConfirmDialog } from '@/hooks/useNotifications';

interface NotificationContextType {
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'error') => void;
  confirmDialog: ConfirmDialog;
  showConfirm: (title: string, message: string, onConfirm: () => void, type?: 'danger' | 'warning' | 'info') => void;
  closeConfirm: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const notifications = useNotifications();

  return (
    <NotificationContext.Provider value={notifications}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotify = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotify must be used within NotificationProvider');
  return ctx;
};
