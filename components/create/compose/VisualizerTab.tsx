import React from 'react';
import { motion } from 'framer-motion';
import { Network, Box } from 'lucide-react';
import { ServiceData } from '@/lib/types';

interface VisualizerTabProps {
  services: ServiceData[];
}

export const VisualizerTab = ({ services }: VisualizerTabProps) => {
  return (
    <motion.div 
      key="viz" 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="h-full flex flex-col items-center justify-center space-y-12"
    >
      <div className="flex items-center gap-3 px-5 py-2 bg-ui-accent border border-ui-border rounded-full shadow-sm">
        <Network className="w-4 h-4 text-brand" />
        <span className="text-xs font-bold text-text-sub uppercase tracking-widest">Stack Internal Network</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
        {services.map((s) => (
          <div key={s.id} className="p-5 bg-ui-bg border border-ui-border rounded-lg flex items-center gap-4 shadow-sm group hover:border-brand/40 transition-all">
            <div className="w-10 h-10 rounded-md bg-brand/10 flex items-center justify-center group-hover:bg-brand/20 transition-colors">
              <Box className="w-5 h-5 text-brand" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-text-main truncate uppercase tracking-tight">{s.name}</p>
              </div>
              <p className="text-xs font-mono text-text-sub truncate opacity-60 mt-1">{s.image || 'no-image-selected'}</p>
              
              {/* Extra visualization for advanced compose */}
              <div className="flex items-center gap-2 mt-2">
                {s.depends_on && (
                  <span className="text-[10px] px-2 py-0.5 bg-rose-500/10 text-rose-500 rounded border border-rose-500/20">Deps</span>
                )}
                {s.volumes && (
                  <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded border border-blue-500/20">Vols</span>
                )}
                {s.networks && (
                  <span className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-500 rounded border border-purple-500/20">Net</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
