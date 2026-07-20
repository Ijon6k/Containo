'use client';

import React from 'react';
import { Globe } from 'lucide-react';

export function DockerEngineCard() {
  return (
    <div className="bg-surface border border-border rounded-md p-6 flex items-center justify-between opacity-70">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-sm bg-hover flex items-center justify-center text-text-secondary">
          <Globe className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-text-primary">Docker Engine</h3>
          <p className="text-sm text-text-secondary mt-0.5">unix:///var/run/docker.sock</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-success" />
        <span className="text-[12px] font-medium text-success">Online</span>
      </div>
    </div>
  );
}
