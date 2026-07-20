'use client';

import React from 'react';

interface HealthScoreCardProps {
  systemInfo: any;
}

export function HealthScoreCard({ systemInfo }: HealthScoreCardProps) {
  const score = systemInfo?.healthScore ?? 0;
  const b = systemInfo?.healthBreakdown || { stability: 0, hygiene: 0, resources: 0 };
  const color = score >= 80 ? 'text-success' : score >= 60 ? 'text-warning' : 'text-danger';
  const strokeColor = score >= 80 ? '#34d399' : score >= 60 ? '#fbbf24' : '#f87171';
  const offset = 264 * (1 - score / 100);

  const items = [
    { label: 'Stability', pct: 40, pts: b.stability },
    { label: 'Hygiene', pct: 30, pts: b.hygiene },
    { label: 'Resources', pct: 30, pts: b.resources },
  ];

  return (
    <div className="bg-surface border border-border rounded-md p-5">
      <div className="flex items-start justify-between mb-5">
        <h3 className="text-[15px] font-semibold text-text-primary">System health</h3>
        <span className={`text-2xl font-bold ${color} tabular-nums`}>{score}</span>
      </div>
      <div className="flex items-center justify-center mb-5">
        <div className="relative w-28 h-28">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="7" className="text-hover" />
            <circle cx="50" cy="50" r="42" fill="none" stroke={strokeColor} strokeWidth="7"
              strokeDasharray={264} strokeLinecap="round"
              strokeDashoffset={offset}
              className="transition-[stroke-dashoffset] duration-700 ease-out" />
          </svg>
          <span className={`absolute inset-0 flex items-center justify-center text-xl font-bold ${color} tabular-nums`}>{score}</span>
        </div>
      </div>
      <div className="space-y-2.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-[12px]">
            <span className="text-text-tertiary">{item.label}</span>
            <span className="text-text-secondary tabular-nums">{item.pts} / {item.pct}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
