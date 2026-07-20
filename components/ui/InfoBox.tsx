'use client';

import React from 'react';
import { Info, AlertTriangle, ShieldCheck } from 'lucide-react';

interface InfoBoxProps {
  variant?: 'info' | 'warn' | 'success';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function InfoBox({ variant = 'info', title, children, className = '' }: InfoBoxProps) {
  const configs: Record<string, { icon: React.ReactNode; borderClass: string; textClass: string; iconBg: string }> = {
    info: {
      icon: <Info className="w-4 h-4" />,
      borderClass: 'border-brand/15',
      textClass: 'text-text-secondary',
      iconBg: 'bg-brand/10 text-brand',
    },
    warn: {
      icon: <AlertTriangle className="w-4 h-4" />,
      borderClass: 'border-warning/20',
      textClass: 'text-text-secondary',
      iconBg: 'bg-warning-bg text-warning',
    },
    success: {
      icon: <ShieldCheck className="w-4 h-4" />,
      borderClass: 'border-success/20',
      textClass: 'text-text-secondary',
      iconBg: 'bg-success-bg text-success',
    },
  };

  const config = configs[variant];

  return (
    <div className={`bg-surface border ${config.borderClass} rounded-md p-4 flex gap-3 ${className}`}>
      <div className={`w-8 h-8 rounded-sm flex items-center justify-center shrink-0 ${config.iconBg}`}>
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        {title && (
          <p className="text-base font-semibold text-text-primary mb-0.5">{title}</p>
        )}
        <div className={`text-base leading-relaxed ${title ? config.textClass : config.textClass}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
