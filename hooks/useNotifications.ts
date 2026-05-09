import { useState, useCallback } from 'react';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

export interface ConfirmDialog {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  type: 'danger' | 'warning' | 'info';
}

export const useNotifications = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'danger'
  });

  const addToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const showConfirm = useCallback((
    title: string, 
    message: string, 
    onConfirm: () => void, 
    type: 'danger' | 'warning' | 'info' = 'danger'
  ) => {
    setConfirmDialog({ 
      isOpen: true, 
      title, 
      message, 
      onConfirm: () => {
        onConfirm();
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }, 
      type 
    });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  }, []);

  return {
    toasts,
    addToast,
    confirmDialog,
    showConfirm,
    closeConfirm
  };
};
