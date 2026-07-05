'use client';

import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Cpu, Database, ShieldCheck, HardDrive, RefreshCw, Tags } from 'lucide-react';
import { ContainerFormValues } from './schema';

export const AdvancedSettings = () => {
  const { register } = useFormContext<ContainerFormValues>();
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-4">
      <button 
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm font-semibold text-text-sub hover:text-text-main transition-all"
      >
        {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {showAdvanced ? 'Fewer options' : 'More options'}
      </button>

      <AnimatePresence>
        {showAdvanced && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-8 bg-ui-accent/50 border border-ui-border p-6 rounded-md"
          >
            {/* Resources & Privileges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-sub flex items-center gap-2">
                  <Cpu className="w-4 h-4" /> CPU Shares
                </label>
                <input {...register('cpu')} type="number" placeholder="1024" className="w-full bg-ui-bg border border-ui-border rounded-md px-4 py-2.5 text-sm text-text-main focus:border-brand/50 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-sub flex items-center gap-2">
                  <Database className="w-4 h-4" /> RAM (MB)
                </label>
                <input {...register('memory')} type="number" placeholder="512" className="w-full bg-ui-bg border border-ui-border rounded-md px-4 py-2.5 text-sm text-text-main focus:border-brand/50 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-sub flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Privileged
                </label>
                <select {...register('privileged')} className="w-full bg-ui-bg border border-ui-border rounded-md px-4 py-2.5 text-sm text-text-main font-semibold outline-none appearance-none">
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
            </div>

            <hr className="border-ui-border" />

            {/* Storage, Restart & Labels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-sub flex items-center gap-2">
                    <HardDrive className="w-4 h-4" /> Volumes
                  </label>
                  <textarea 
                    {...register('volumes')}
                    placeholder="/host/path:/container/path&#10;my-volume:/app/data"
                    className="w-full bg-ui-bg border border-ui-border rounded-md px-4 py-3 text-sm text-text-main focus:border-brand/50 outline-none h-24 resize-none custom-scrollbar"
                  />
                  <p className="text-xs text-text-sub opacity-70">One per line, mapping host to container.</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-sub flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" /> Restart Policy
                  </label>
                  <select {...register('restartPolicy')} className="w-full bg-ui-bg border border-ui-border rounded-md px-4 py-3 text-sm text-text-main font-semibold outline-none appearance-none">
                    <option value="no">No</option>
                    <option value="always">Always</option>
                    <option value="unless-stopped">Unless Stopped</option>
                    <option value="on-failure">On Failure</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-sub flex items-center gap-2">
                  <Tags className="w-4 h-4" /> Labels
                </label>
                <textarea 
                  {...register('labels')}
                  placeholder="traefik.enable=true&#10;environment=production"
                  className="w-full bg-ui-bg border border-ui-border rounded-md px-4 py-3 text-sm text-text-main focus:border-brand/50 outline-none h-32 resize-none custom-scrollbar"
                />
                <p className="text-xs text-text-sub opacity-70">Metadata labels, one per line (KEY=VALUE).</p>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
