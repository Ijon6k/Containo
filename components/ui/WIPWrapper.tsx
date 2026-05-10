'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

interface WIPWrapperProps {
  children: React.ReactNode;
  label?: string;
}

export function WIPWrapper({ children, label = 'Coming Soon' }: WIPWrapperProps) {
  return (
    <div className="relative group overflow-hidden rounded-lg">
      {/* Overlay */}
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-ui-bg/40 backdrop-blur-[2px] border border-white/5 cursor-not-allowed select-none group-hover:bg-ui-bg/50 transition-colors duration-300">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand/10 backdrop-blur-md border border-brand/20 px-3 py-1.5 rounded-full flex items-center gap-2"
        >
          <Lock className="w-3 h-3 text-brand" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand">{label}</span>
        </motion.div>
      </div>

      {/* Content Silhouette */}
      <div className="pointer-events-none opacity-40 grayscale-[0.5] blur-[0.5px]">
        {children}
      </div>
    </div>
  );
}
