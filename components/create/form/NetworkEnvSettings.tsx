'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Network } from 'lucide-react';
import { ContainerFormValues } from './schema';

export const NetworkEnvSettings = () => {
  const { register } = useFormContext<ContainerFormValues>();

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Network className="w-5 h-5 text-text-secondary" />
        <h3 className="text-lg font-semibold text-text-primary">Network & environment</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-base font-medium text-text-secondary">Ports</label>
            <input 
              {...register('ports')}
              placeholder="e.g. 8080:80, 443:443"
              className="w-full bg-surface2 border border-border rounded-sm px-4 py-3 text-base text-text-primary focus:border-brand/50 outline-none"
            />
            <p className="text-sm text-text-tertiary opacity-70">Format: HostPort:ContainerPort</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-base font-medium text-text-secondary">Network mode</label>
            <select 
              {...register('networkMode')}
              className="w-full bg-surface2 border border-border rounded-sm px-4 py-3 text-base text-text-primary focus:border-brand/50 outline-none appearance-none"
            >
              <option value="">Default (bridge)</option>
              <option value="host">Host</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-base font-medium text-text-secondary">Environment variables</label>
          <textarea 
            {...register('env')}
            placeholder="NODE_ENV=production&#10;API_KEY=secret"
            className="w-full bg-surface2 border border-border rounded-sm px-4 py-3 text-base text-text-primary focus:border-brand/50 outline-none h-32 resize-none custom-scrollbar"
          />
          <p className="text-sm text-text-tertiary opacity-70">One per line, KEY=VALUE format.</p>
        </div>
      </div>
    </section>
  );
};
