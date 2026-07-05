'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Settings2, AlertCircle } from 'lucide-react';
import { ContainerFormValues } from './schema';

export const BasicSettings = () => {
  const { register, formState: { errors } } = useFormContext<ContainerFormValues>();

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 border-b border-ui-border pb-4">
        <Settings2 className="w-5 h-5 text-text-sub" />
        <h3 className="text-base font-semibold text-text-main">Basic Settings</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-sub">Container Name</label>
          <input 
            {...register('name')}
            placeholder="app-name"
            className={`w-full bg-ui-accent border ${errors.name ? 'border-red-500' : 'border-ui-border'} rounded-md px-4 py-3 text-sm text-text-main focus:border-brand/50 outline-none`}
          />
          {errors.name && (
            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3" /> {errors.name.message as string}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-sub">Image</label>
          <input 
            {...register('image')}
            placeholder="nginx:latest"
            className={`w-full bg-ui-accent border ${errors.image ? 'border-red-500' : 'border-ui-border'} rounded-md px-4 py-3 text-sm text-text-main focus:border-brand/50 outline-none`}
          />
          {errors.image && (
            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3" /> {errors.image.message as string}
            </p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-sub">Run Command (Optional)</label>
        <input 
          {...register('command')}
          placeholder="e.g. npm start"
          className="w-full bg-ui-accent border border-ui-border rounded-md px-4 py-3 text-sm text-text-main focus:border-brand/50 outline-none"
        />
        <p className="text-xs text-text-sub opacity-70">Overrides the default command specified by the image.</p>
      </div>
    </section>
  );
};
