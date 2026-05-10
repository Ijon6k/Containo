'use client';

import React, { useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';
import { Volume, Container } from '@/lib/types';
import { VolumeList } from './backup/VolumeList';
import { RecoveryActions } from './backup/RecoveryActions';
import { RestoreProgress } from './backup/RestoreProgress';
import { RestoreModal } from './backup/RestoreModal';
import { InfoBox } from '@/components/ui/InfoBox';
import { useBackupRestore } from '@/hooks/useBackupRestore';

interface BackupRestoreProps {
  volumes: Volume[];
  containers: Container[];
  addToast: (msg: string, type?: 'success' | 'error') => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, type?: 'danger' | 'warning' | 'info') => void;
  fetchVolumes: () => Promise<void>;
}

export default function BackupRestore({ volumes, containers, addToast, showConfirm, fetchVolumes }: BackupRestoreProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTarget, setActiveTarget] = useState<string | null>(null);
  
  const {
    isRestoring,
    restoreProgress,
    restoreStep,
    handleFileChange,
    handleBackupAll,
    handleBackupIndividual
  } = useBackupRestore({ addToast, fetchVolumes, fileInputRef });

  const handleOpenImport = (targetVolume?: string) => {
    if (targetVolume) {
       setActiveTarget(targetVolume);
       fileInputRef.current?.click();
    } else {
       setIsModalOpen(true);
    }
  };

  const handleModalConfirm = (targetVolume: string) => {
    setActiveTarget(targetVolume);
    setIsModalOpen(false);
    // Slight delay to ensure modal closes before file dialog opens
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  const handleDeleteVolume = async (name: string) => {
    showConfirm('Delete Volume', `Are you sure you want to delete volume ${name}?`, async () => {
      try {
        const res = await fetch(`/api/volumes/${name}`, { method: 'DELETE' });
        const data = await res.json();

        if (res.ok) {
          addToast('Volume deleted');
          fetchVolumes();
        } else {
          // Handle specific Docker errors more gracefully
          let errorMessage = data.error || 'Delete failed';
          if (res.status === 409) {
            errorMessage = `Volume is in use. You must REMOVE (delete) the containers using it, not just stop them.`;
          }
          addToast(errorMessage, 'error');
        }
      } catch (e) {
        addToast('Connection error', 'error');
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

      <InfoBox title="Critical Awareness" variant="warn">
        Volume data is indexed by its <span className="text-amber-500 font-bold">Unique Name</span>. 
        If you change the volume name in your Docker configuration, existing backups will no longer be automatically mapped. 
        Keep your volume naming consistent to ensure seamless one-click restoration.
      </InfoBox>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main List */}
        <div className="lg:col-span-2 space-y-4">
            <VolumeList 
              volumes={volumes}
              onBackupIndividual={handleBackupIndividual}
              onDeleteVolume={handleDeleteVolume}
              onRestoreIndividual={handleOpenImport}
            />
         </div>

         {/* Actions Sidebar */}
         <div className="space-y-6">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={(e) => handleFileChange(e, activeTarget || undefined)} 
              accept=".tar,.zip,.gz" 
              className="hidden" 
            />
            
            <RecoveryActions 
              onBackupAll={handleBackupAll}
              onImportBackup={() => handleOpenImport()}
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

            <RestoreModal 
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              containers={containers}
              volumes={volumes}
              onConfirm={handleModalConfirm}
            />
         </div>
      </div>
    </div>
  );
}
