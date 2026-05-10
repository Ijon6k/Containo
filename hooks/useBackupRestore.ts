'use client';

import { useState, useCallback } from 'react';
import { Volume } from '@/lib/types';

interface UseBackupRestoreProps {
  addToast: (msg: string, type?: 'success' | 'error') => void;
  fetchVolumes: () => Promise<void>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function useBackupRestore({ addToast, fetchVolumes, fileInputRef }: UseBackupRestoreProps) {
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [restoreStep, setRestoreStep] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, targetVolume?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!targetVolume) {
      addToast('Please select a target volume/container first', 'error');
      return;
    }

    setIsRestoring(true);
    setRestoreStep(`Uploading ${file.name}...`);
    
    const formData = new FormData();
    formData.append('backup', file);
    formData.append('action', 'import');
    formData.append('targetVolume', targetVolume);

    try {
      const res = await fetch('/api/volumes', {
        method: 'POST',
        body: formData,
      });
      
      if (res.ok) {
        setRestoreProgress(50);
        setRestoreStep('Extracting data to volume...');
        
        setTimeout(() => {
           setRestoreProgress(100);
           setRestoreStep('Finalizing...');
           
           setTimeout(() => {
             setIsRestoring(false);
             setRestoreProgress(0);
             addToast(`${targetVolume} restored successfully`);
             fetchVolumes();
           }, 1000);
        }, 2000);
      } else {
        const error = await res.json();
        addToast(error.error || 'Import failed', 'error');
        setIsRestoring(false);
      }
    } catch (e) {
      addToast('Connection error during import', 'error');
      setIsRestoring(false);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleBackupAll = useCallback(async () => {
    addToast('Preparing system-wide backup bundle...');
    try {
      const res = await fetch('/api/volumes', {
        method: 'POST',
        body: JSON.stringify({ action: 'backup_all' })
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `containo_full_backup_${new Date().toISOString().split('T')[0]}.tar`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        addToast('Backup downloaded successfully');
      } else {
        addToast('Backup failed', 'error');
      }
    } catch (e) {
      addToast('Backup failed', 'error');
    }
  }, [addToast]);

  const handleBackupIndividual = useCallback(async (name: string) => {
    addToast(`Exporting ${name}...`);
    try {
      const res = await fetch(`/api/volumes/${name}`, { method: 'POST' });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name}_backup.tar`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        addToast(`${name} exported successfully`);
      } else {
        addToast('Export failed', 'error');
      }
    } catch (e) {
      addToast('Export failed', 'error');
    }
  }, [addToast]);

  return {
    isRestoring,
    restoreProgress,
    restoreStep,
    handleFileChange,
    handleBackupAll,
    handleBackupIndividual
  };
}
