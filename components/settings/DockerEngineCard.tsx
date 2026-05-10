'use client';

import React from 'react';
import { Globe } from 'lucide-react';

export function DockerEngineCard() {
  return (
    <div className="card p-6 flex items-center justify-between opacity-70">
       <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-md bg-ui-accent flex items-center justify-center text-text-sub">
             <Globe className="w-5 h-5" />
          </div>
          <div>
             <h3 className="text-sm font-bold text-text-main">Docker Engine</h3>
             <p className="text-xs text-text-sub mt-0.5">unix:///var/run/docker.sock</p>
          </div>
       </div>
       <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Online</span>
       </div>
    </div>
  );
}
