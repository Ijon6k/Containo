'use client';

import React, { useState } from 'react';
import { SettingsNav, type SettingsTab } from './settings/SettingsNav';
import { AppearanceCard } from './settings/AppearanceCard';
import { DockerEngineCard } from './settings/DockerEngineCard';
import { type Theme } from '@/components/providers/ThemeProvider';

interface SettingsProps {
  theme: Theme;
  onSetTheme: (t: Theme) => void;
  systemInfo?: any;
}

export default function SettingsView({ theme, onSetTheme, systemInfo }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">Settings</h2>
        <p className="text-sm text-text-secondary mt-1">
          Interface preferences and Docker engine status.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        <div className="md:col-span-1">
          <SettingsNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <div className="md:col-span-3 space-y-6">
          {activeTab === 'appearance' && (
            <AppearanceCard theme={theme} onSetTheme={onSetTheme} />
          )}

          {activeTab === 'engine' && (
            <DockerEngineCard systemInfo={systemInfo} />
          )}

          {activeTab === 'account' && (
            <div className="card-floating border border-border rounded-md p-6 space-y-4">
              <div>
                <h3 className="text-base font-semibold text-text-primary">Account Session</h3>
                <p className="text-sm text-text-secondary mt-1">
                  Active administrator session information.
                </p>
              </div>

              <div className="border border-border/80 rounded-md p-4 bg-surface2/40 flex items-center justify-between text-sm">
                <span className="text-text-secondary font-medium">Session Token</span>
                <span className="font-mono text-xs font-semibold text-success">Valid JWT Session</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
