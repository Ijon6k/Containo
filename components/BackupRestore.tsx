'use client';

import React, { useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';
import { Volume } from '@/lib/types';
import { VolumeList } from './backup/VolumeList';
import { RecoveryActions } from './backup/RecoveryActions';
import { RestoreProgress } from './backup/RestoreProgress';
import { useBackupRestore } from '@/hooks/useBackupRestore';

interface BackupRestoreProps {
  volumes: Volume[];
  addToast: (msg: string, type?: 'success' | 'error') => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, type?: 'danger' | 'warning' | 'info') => void;
  fetchVolumes: () => Promise<void>;
}

export default function BackupRestore({ volumes, addToast, showConfirm, fetchVolumes }: BackupRestoreProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    isRestoring,
    restoreProgress,
    restoreStep,
    handleFileChange,
    handleBackupAll,
    handleBackupIndividual
  } = useBackupRestore({ addToast, fetchVolumes, fileInputRef });

  const handleDeleteVolume = async (name: string) => {
    showConfirm('Delete Volume', `Are you sure you want to delete volume ${name}?`, async () => {
      try {
        const res = await fetch(`/api/volumes/${name}`, { method: 'DELETE' });
        if (res.ok) {
          addToast('Volume deleted');
          fetchVolumes();
        } else {
          addToast('Delete failed', 'error');
        }
      } catch (e) {
        addToast('Delete failed', 'error');
      }
    }, 'danger');
  };

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
           <VolumeList 
             volumes={volumes}
             onBackupIndividual={handleBackupIndividual}
             onDeleteVolume={handleDeleteVolume}
           />

           <div className="p-4 bg-blue-50/50 dark:bg-blue-500/5 rounded-md border border-blue-100 dark:border-blue-500/20 flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-500 mt-0.5" />
              <p className="text-xs text-text-sub leading-relaxed">
                 Snapshots are taken daily at 02:00 AM. You can find the raw archive files in your host's backup directory.
              </p>
           </div>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
           <input 
             type="file" 
             ref={fileInputRef} 
             onChange={handleFileChange} 
             accept=".tar,.zip,.gz" 
             className="hidden" 
           />
           
           <RecoveryActions 
             onBackupAll={handleBackupAll}
             onImportBackup={() => fileInputRef.current?.click()}
             isRestoring={isRestoring}
           />

           <AnimatePresence>
             {isRestoring && (
               <RestoreProgress 
                 restoreProgress={restoreProgress}
                 restoreStep={restoreStep}
               />
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
