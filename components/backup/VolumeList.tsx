'use client';

import React, { useState } from 'react';
import { Database, Search, Archive, HardDrive, Box, Clock, Download, Trash2, ChevronRight, Upload } from 'lucide-react';
import { Volume } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface VolumeListProps {
   volumes: Volume[];
   onBackupIndividual: (name: string) => void;
   onDeleteVolume: (name: string) => void;
   onRestoreIndividual: (name: string) => void;
}

export function VolumeList({ volumes, onBackupIndividual, onDeleteVolume, onRestoreIndividual }: VolumeListProps) {
   const [searchTerm, setSearchTerm] = useState('');

   const filteredVolumes = volumes.filter(v =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase())
   );

   return (
      <div className="bg-surface border border-border rounded-md overflow-hidden">
         <div className="p-4 border-b border-border flex items-center justify-between bg-surface2">
            <div className="flex items-center gap-2">
               <Database className="w-4 h-4 text-brand" />
               <h3 className="text-base font-semibold text-text-primary">Persistent Volumes</h3>
            </div>
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
               <input
                  type="text"
                  placeholder="Search volumes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="py-1.5 pl-10 pr-4 text-base w-48 bg-surface border border-border rounded-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
               />
            </div>
         </div>

         <div className="divide-y divide-border">
            {filteredVolumes.map((vol) => (
               <div key={vol.id} className="p-4 hover:bg-hover transition-colors group flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-sm bg-hover flex items-center justify-center text-text-secondary group-hover:text-brand transition-colors">
                        <Archive className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-base font-semibold text-text-primary">{vol.name}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                           <span className="text-[12px] font-medium text-text-secondary flex items-center gap-1">
                              <HardDrive className="w-3 h-3" /> {vol.size}
                           </span>
                           <span className="text-[12px] font-medium text-text-secondary flex items-center gap-1">
                              <Box className="w-3 h-3" /> {vol.driver}
                           </span>
                           <span className="text-[12px] font-medium text-text-secondary flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {vol.createdAt !== 'N/A' ? formatDistanceToNow(new Date(vol.createdAt), { addSuffix: true }) : 'N/A'}
                           </span>
                           <span className="text-[12px] font-mono text-text-tertiary truncate max-w-[200px] hidden sm:block" title={vol.mountpoint}>
                              {vol.mountpoint}
                           </span>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-2">
                     <button
                        onClick={() => onBackupIndividual(vol.name)}
                        className="p-2 hover:bg-success/10 rounded-sm text-text-secondary hover:text-success transition-all"
                        title="Backup Volume"
                     >
                        <Download className="w-4 h-4" />
                     </button>
                     <button
                        onClick={() => onRestoreIndividual(vol.name)}
                        className="p-2 hover:bg-brand/10 rounded-sm text-text-secondary hover:text-brand transition-all"
                        title="Restore to Volume"
                     >
                        <Upload className="w-4 h-4" />
                     </button>
                     <button
                        onClick={() => onDeleteVolume(vol.name)}
                        className="p-2 hover:bg-danger-bg rounded-sm text-text-secondary hover:text-danger transition-all"
                        title="Delete Volume"
                     >
                        <Trash2 className="w-4 h-4" />
                     </button>
                     <button className="p-2 hover:bg-hover rounded-sm text-text-secondary hover:text-text-primary transition-all">
                        <ChevronRight className="w-4 h-4" />
                     </button>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}
