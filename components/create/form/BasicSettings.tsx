'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Settings2, AlertCircle } from 'lucide-react';
import { ContainerFormValues } from './schema';

export const BasicSettings = () => {
  const { register, formState: { errors } } = useFormContext<ContainerFormValues>();

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Settings2 className="w-5 h-5 text-text-secondary" />
        <h3 className="text-lg font-semibold text-text-primary">Basic settings</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-base font-medium text-text-secondary">Container name</label>
          <input 
            {...register('name')}
            placeholder="app-name"
            className={`w-full bg-surface2 border ${errors.name ? 'border-danger' : 'border-border'} rounded-sm px-4 py-3 text-base text-text-primary focus:border-brand/50 outline-none`}
          />
          {errors.name && (
            <p className="text-sm text-danger flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3" /> {errors.name.message as string}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-base font-medium text-text-secondary">Image</label>
          <input 
            {...register('image')}
            placeholder="nginx:latest"
            className={`w-full bg-surface2 border ${errors.image ? 'border-danger' : 'border-border'} rounded-sm px-4 py-3 text-base text-text-primary focus:border-brand/50 outline-none`}
          />
          {errors.image && (
            <p className="text-sm text-danger flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3" /> {errors.image.message as string}
            </p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-base font-medium text-text-secondary">Run command (optional)</label>
        <input 
          {...register('command')}
          placeholder="e.g. npm start"
          className="w-full bg-surface2 border border-border rounded-sm px-4 py-3 text-base text-text-primary focus:border-brand/50 outline-none"
        />
        <p className="text-sm text-text-tertiary opacity-70">Overrides the default command specified by the image.</p>
      </div>
    </section>
  );
};
