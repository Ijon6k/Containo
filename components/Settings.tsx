'use client';

import React, { useState } from 'react';
import { SettingsNav } from './settings/SettingsNav';
import { TelegramAlerts } from './settings/TelegramAlerts';
import { AppearanceCard } from './settings/AppearanceCard';
import { DockerEngineCard } from './settings/DockerEngineCard';
import { WIPWrapper } from '@/components/ui/WIPWrapper';

interface SettingsProps {
  theme: 'light' | 'dark' | 'wholesome';
  toggleTheme: () => void;
  addToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function SettingsView({ theme, toggleTheme, addToast }: SettingsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveTelegram = (token: string, chatId: string) => {
    setIsLoading(true);
    
    localStorage.setItem('containo_tg_token', token);
    localStorage.setItem('containo_tg_id', chatId);
    
    setTimeout(() => {
      setIsLoading(false);
      addToast('Settings updated and saved locally');
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-text-main">Settings</h2>
        <p className="text-text-sub text-sm">Configure notifications, security, and connection endpoints.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <SettingsNav />

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          <WIPWrapper label="MVP WIP">
            <TelegramAlerts onSave={handleSaveTelegram} isLoading={isLoading} />
          </WIPWrapper>
          <AppearanceCard theme={theme} onToggleTheme={toggleTheme} />
          <DockerEngineCard />
        </div>
      </div>
    </div>
  );
}
