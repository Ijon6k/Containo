'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, 
  Download, 
  Upload, 
  Archive, 
  RefreshCw, 
  Clock, 
  ChevronRight,
  Shield,
  Search,
  HardDrive,
  Info
} from 'lucide-react';
import { Volume } from '@/lib/types';

interface BackupRestoreProps {
  volumes: Volume[];
  addToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function BackupRestore({ volumes, addToast }: BackupRestoreProps) {
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [restoreStep, setRestoreStep] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleRestore = () => {
    setIsRestoring(true);
    setRestoreStep('Uploading Bundle...');
    
    let prog = 0;
    const interval = setInterval(() => {
      prog += 5;
      setRestoreProgress(prog);
      
      if (prog === 40) setRestoreStep('Verifying Integrity...');
      if (prog === 70) setRestoreStep('Extracting Volumes...');
      
      if (prog >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsRestoring(false);
          setRestoreProgress(0);
          addToast('Full system restore successful');
        }, 500);
      }
    }, 100);
  };

  const filteredVolumes = volumes.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-text-main">Backups</h2>
        <p className="text-text-sub text-sm">Manage persistent volume snapshots and data recovery.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main List */}
        <div className="lg:col-span-2 space-y-4">
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
                          <div className="flex items-center gap-4 mt-1">
                             <span className="text-[10px] font-bold text-text-sub uppercase tracking-wider flex items-center gap-1">
                                <HardDrive className="w-3 h-3" /> {vol.size}
                             </span>
                             <span className="text-[10px] font-bold text-text-sub uppercase tracking-wider flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {vol.lastBackup}
                             </span>
                          </div>
                       </div>
                    </div>
                    
                    <button className="p-2 hover:bg-ui-accent rounded-md text-text-sub hover:text-text-main transition-all">
                       <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
           </div>

           <div className="p-4 bg-blue-50/50 dark:bg-blue-500/5 rounded-md border border-blue-100 dark:border-blue-500/20 flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-500 mt-0.5" />
              <p className="text-xs text-text-sub leading-relaxed">
                 Snapshots are taken daily at 02:00 AM. You can find the raw archive files in your host's backup directory.
              </p>
           </div>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
           <div className="card p-6">
              <h3 className="text-sm font-bold text-text-main mb-4 flex items-center gap-2">
                 <Shield className="w-4 h-4 text-emerald-500" />
                 Recovery Actions
              </h3>
              
              <div className="space-y-3">
                 <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-ui-accent hover:bg-ui-border text-text-main rounded-md text-xs font-bold transition-all">
                    <Download className="w-4 h-4" />
                    Download All
                 </button>
                 <button 
                  onClick={handleRestore}
                  disabled={isRestoring}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 btn-primary rounded-md text-xs font-bold transition-all disabled:opacity-50"
                 >
                    <Upload className="w-4 h-4" />
                    {isRestoring ? 'Restoring...' : 'Import Backup'}
                 </button>
              </div>

              <div className="mt-6 pt-6 border-t border-ui-border">
                 <div className="flex justify-between text-[10px] font-bold text-text-sub uppercase tracking-widest mb-1">
                    <span>System Sync</span>
                    <span className="text-emerald-500">Active</span>
                 </div>
                 <p className="text-[10px] text-text-sub leading-relaxed">
                    Last integrity check passed 14 minutes ago.
                 </p>
              </div>
           </div>

           <AnimatePresence>
             {isRestoring && (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="card p-6 border-brand/20 bg-brand/5"
               >
                 <div className="flex items-center justify-between mb-4">
                   <span className="text-[10px] font-bold text-brand uppercase tracking-widest">Restoring...</span>
                   <span className="text-xs font-bold text-brand">{restoreProgress}%</span>
                 </div>
                 <div className="w-full h-1.5 bg-brand/10 rounded-full overflow-hidden mb-4">
                   <motion.div 
                     className="h-full bg-brand"
                     initial={{ width: 0 }}
                     animate={{ width: `${restoreProgress}%` }}
                   />
                 </div>
                 <p className="text-[10px] font-bold text-text-sub uppercase tracking-widest text-center">{restoreStep}</p>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
