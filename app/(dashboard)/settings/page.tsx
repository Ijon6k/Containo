'use client';

import React from 'react';
import SettingsView from '@/components/Settings';
import { useNotify } from '@/components/providers/NotificationProvider';
import { useTheme } from '@/components/providers/ThemeProvider';

export default function SettingsPage() {
  const { addToast } = useNotify();
  const { theme, toggleTheme } = useTheme();

  return (
    <SettingsView
      theme={theme}
      toggleTheme={toggleTheme}
      addToast={addToast}
    />
  );
}
