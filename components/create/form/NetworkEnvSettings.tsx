'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Network } from 'lucide-react';
import { ContainerFormValues } from './schema';

export const NetworkEnvSettings = () => {
  const { register } = useFormContext<ContainerFormValues>();

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 border-b border-ui-border pb-4">
        <Network className="w-5 h-5 text-text-sub" />
        <h3 className="text-base font-semibold text-text-main">Network & Environment</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-sub">Ports</label>
            <input 
              {...register('ports')}
              placeholder="e.g. 8080:80, 443:443"
              className="w-full bg-ui-accent border border-ui-border rounded-md px-4 py-3 text-sm text-text-main focus:border-brand/50 outline-none"
            />
            <p className="text-xs text-text-sub opacity-70">Format: HostPort:ContainerPort</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-sub">Network Mode</label>
            <select 
              {...register('networkMode')}
              className="w-full bg-ui-accent border border-ui-border rounded-md px-4 py-3 text-sm text-text-main focus:border-brand/50 outline-none appearance-none"
            >
              <option value="">Default (bridge)</option>
              <option value="host">Host</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-sub">Environment Variables</label>
          <textarea 
            {...register('env')}
            placeholder="NODE_ENV=production&#10;API_KEY=secret"
            className="w-full bg-ui-accent border border-ui-border rounded-md px-4 py-3 text-sm text-text-main focus:border-brand/50 outline-none h-32 resize-none custom-scrollbar"
          />
          <p className="text-xs text-text-sub opacity-70">One per line, KEY=VALUE format.</p>
        </div>
      </div>
    </section>
  );
};
