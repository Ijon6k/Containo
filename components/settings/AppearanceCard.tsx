'use client';

import React from 'react';
import { Sun, Moon, CloudSun } from 'lucide-react';

interface AppearanceCardProps {
  theme: string;
  onToggleTheme: () => void;
}

const themeOptions = [
  { key: 'dark', label: 'Pitch Black', icon: Moon },
  { key: 'dim', label: 'Dim', icon: CloudSun },
  { key: 'light', label: 'Light', icon: Sun },
] as const;

export function AppearanceCard({ theme, onToggleTheme }: AppearanceCardProps) {
  return (
    <div className="bg-surface border border-border rounded-md p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-sm bg-hover flex items-center justify-center text-brand">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary">Appearance</h3>
            <p className="text-sm text-text-secondary">
              Choose your preferred theme
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {themeOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={onToggleTheme}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-sm border transition-all ${
              theme === opt.key
                ? 'border-brand bg-brand/10 text-brand'
                : 'border-border bg-surface2 text-text-secondary hover:border-border-hover hover:text-text-primary'
            }`}
          >
            <opt.icon className="w-4 h-4" />
            <span className="text-[12px] font-medium">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
