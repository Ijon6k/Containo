'use client';

import React, { useState, useEffect } from 'react';
import SettingsView from '@/components/Settings';
import { useTheme } from '@/components/providers/ThemeProvider';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [systemInfo, setSystemInfo] = useState<any>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/system')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data) setSystemInfo(data);
      })
      .catch(console.error);

    return () => {
      active = false;
    };
  }, []);

  return (
    <SettingsView
      theme={theme}
      onSetTheme={setTheme}
      systemInfo={systemInfo}
    />
  );
}
