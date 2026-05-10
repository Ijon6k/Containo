'use client';

import React from 'react';
import { Info, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface InfoBoxProps {
  variant?: 'info' | 'warn' | 'success';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function InfoBox({ variant = 'info', title, children, className = '' }: InfoBoxProps) {
  const configs = {
    info: {
      bg: 'bg-brand/5',
      border: 'border-brand/10',
      icon: <Info className="w-5 h-5 text-brand" />,
      titleColor: 'text-brand',
      accent: 'bg-brand/10'
    },
    warn: {
      bg: 'bg-amber-500/5',
      border: 'border-amber-500/20',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      titleColor: 'text-amber-500',
      accent: 'bg-amber-500/10'
    },
    success: {
      bg: 'bg-emerald-500/5',
      border: 'border-emerald-500/20',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
      titleColor: 'text-emerald-500',
      accent: 'bg-emerald-500/10'
    }
  };

  const config = configs[variant];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${config.bg} ${config.border} border rounded-2xl p-5 flex gap-5 ${className}`}
    >
      <div className={`${config.accent} p-2.5 h-fit rounded-xl shrink-0`}>
        {config.icon}
      </div>
      <div className="flex-1 space-y-1">
        {title && (
          <h4 className={`text-[10px] font-bold uppercase tracking-[0.2em] ${config.titleColor}`}>
            {title}
          </h4>
        )}
        <div className="text-sm text-text-sub leading-relaxed font-medium">
          {children}
        </div>
      </div>
    </motion.div>
  );
}
