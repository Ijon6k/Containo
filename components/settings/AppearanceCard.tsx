'use client';

import React from 'react';
import { type Theme } from '@/components/providers/ThemeProvider';

interface AppearanceCardProps {
  theme: Theme;
  onSetTheme: (theme: Theme) => void;
}

const themeOptions: { key: Theme; label: string; desc: string; previewBg: string; previewBorder: string }[] = [
  {
    key: 'dark',
    label: 'Pitch Black',
    desc: 'High contrast OLED dark mode',
    previewBg: 'bg-[#000000]',
    previewBorder: 'border-[#262626]',
  },
  {
    key: 'dim',
    label: 'Dim Slate',
    desc: 'Layered slate with subtle blue hint & crisp cards',
    previewBg: 'bg-[#11141a]',
    previewBorder: 'border-[#30394a]',
  },
  {
    key: 'light',
    label: 'Light',
    desc: 'Clean bright light mode',
    previewBg: 'bg-[#f6f7f9]',
    previewBorder: 'border-[#cbd5e1]',
  },
];

export function AppearanceCard({ theme, onSetTheme }: AppearanceCardProps) {
  return (
    <div className="card-floating border border-border rounded-md p-6 space-y-6">
      <div>
        <h3 className="text-base font-semibold text-text-primary">Theme Appearance</h3>
        <p className="text-sm text-text-secondary mt-1">
          Select your preferred interface color scheme and elevation palette.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {themeOptions.map((opt) => {
          const isSelected = theme === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onSetTheme(opt.key)}
              className={`group flex flex-col p-4 rounded-md border text-left transition-all ${
                isSelected
                  ? 'border-brand bg-brand-muted/40 ring-1 ring-brand/40 shadow-xs'
                  : 'border-border bg-surface2/40 hover:border-border-hover hover:bg-surface2'
              }`}
            >
              {/* Minimalist Theme Swatch */}
              <div className={`w-full h-12 rounded border mb-3 ${opt.previewBg} ${opt.previewBorder} flex items-center justify-end px-2.5 gap-1.5`}>
                <div className="w-2 h-2 rounded-full bg-brand" />
                <div className="w-8 h-1.5 rounded bg-text-tertiary opacity-30" />
              </div>

              <div className="flex items-center justify-between w-full mb-1">
                <span className={`text-sm ${isSelected ? 'text-text-primary font-semibold' : 'text-text-primary font-medium'}`}>
                  {opt.label}
                </span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-brand" />
                )}
              </div>
              <span className="text-xs text-text-tertiary">{opt.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
