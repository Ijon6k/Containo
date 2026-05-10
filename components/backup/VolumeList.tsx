'use client';

import React, { useState } from 'react';
import { Database, Search, Archive, HardDrive, Box, Clock, Download, Trash2, ChevronRight } from 'lucide-react';
import { Volume } from '@/lib/types';

interface VolumeListProps {
  volumes: Volume[];
  onBackupIndividual: (name: string) => void;
  onDeleteVolume: (name: string) => void;
}

export function VolumeList({ volumes, onBackupIndividual, onDeleteVolume }: VolumeListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVolumes = volumes.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-ui-border flex items-center justify-between bg-ui-bg">
         <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-brand" />
            <h3 className="text-sm font-bold text-text-main">Persistent Volumes</h3>
         </div>
         <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-sub" />
            <input 
              type="text"
              placeholder="Search volumes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field py-1.5 pl-10 pr-4 text-sm w-48"
            />
          </div>
      </div>

      <div className="divide-y divide-ui-border">
        {filteredVolumes.map((vol) => (
          <div key={vol.id} className="p-4 hover:bg-ui-accent/20 transition-colors group flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-md bg-ui-accent flex items-center justify-center text-text-sub group-hover:text-brand transition-colors">
                  <Archive className="w-5 h-5" />
               </div>
               <div>
                  <p className="text-sm font-semibold text-text-main">{vol.name}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                     <span className="text-[10px] font-bold text-text-sub uppercase tracking-wider flex items-center gap-1">
                        <HardDrive className="w-3 h-3" /> {vol.size}
                     </span>
                     <span className="text-[10px] font-bold text-text-sub uppercase tracking-wider flex items-center gap-1">
                        <Box className="w-3 h-3" /> {vol.driver}
                     </span>
                     <span className="text-[10px] font-bold text-text-sub uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {vol.createdAt !== 'N/A' ? new Date(vol.createdAt).toLocaleDateString() : 'N/A'}
                     </span>
                     <span className="text-[10px] font-mono text-text-sub/60 truncate max-w-[200px] hidden sm:block" title={vol.mountpoint}>
                        {vol.mountpoint}
                     </span>
                  </div>
               </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onBackupIndividual(vol.name)}
                className="p-2 hover:bg-emerald-500/10 rounded-md text-text-sub hover:text-emerald-500 transition-all"
                title="Backup Volume"
              >
                 <Download className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onDeleteVolume(vol.name)}
                className="p-2 hover:bg-rose-500/10 rounded-md text-text-sub hover:text-rose-500 transition-all"
                title="Delete Volume"
              >
                 <Trash2 className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-ui-accent rounded-md text-text-sub hover:text-text-main transition-all">
                 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
   </div>
  );
}
