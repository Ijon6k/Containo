'use client';

import React from 'react';

export type SettingsTab = 'appearance' | 'engine' | 'account';

interface SettingsNavProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

export function SettingsNav({ activeTab, onTabChange }: SettingsNavProps) {
  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'appearance', label: 'Appearance' },
    { id: 'engine', label: 'Docker Engine' },
    { id: 'account', label: 'Account' },
  ];

  return (
    <nav className="flex flex-col gap-0.5" aria-label="Settings navigation">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`px-3 py-2 rounded-md text-sm font-medium text-left transition-colors ${
              isActive
                ? 'bg-hover text-text-primary font-semibold'
                : 'text-text-secondary hover:text-text-primary hover:bg-hover/50'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
