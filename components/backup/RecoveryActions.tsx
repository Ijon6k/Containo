'use client';

import React from 'react';
import { Shield, Download, Upload } from 'lucide-react';

interface RecoveryActionsProps {
  onBackupAll: () => void;
  onImportBackup: () => void;
  isRestoring: boolean;
}

export function RecoveryActions({ onBackupAll, onImportBackup, isRestoring }: RecoveryActionsProps) {
  return (
    <div className="card p-6">
       <h3 className="text-sm font-bold text-text-main mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          Recovery Actions
       </h3>
       
       <div className="space-y-3">
          <button 
            onClick={onBackupAll}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-ui-accent hover:bg-ui-border text-text-main rounded-md text-xs font-bold transition-all"
          >
             <Download className="w-4 h-4" />
             Backup All
          </button>
          <button 
           onClick={onImportBackup}
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
  );
}
