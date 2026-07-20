import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { ConfirmDialog } from '@/hooks/useNotifications';

interface ConfirmModalProps {
  dialog: ConfirmDialog;
  onClose: () => void;
}

export const ConfirmModal = ({ dialog, onClose }: ConfirmModalProps) => {
  const colorMap: Record<string, { bg: string; text: string; btn: string }> = {
    danger: { bg: 'bg-danger-bg text-danger', text: 'text-danger', btn: 'bg-danger hover:bg-danger/80' },
    warning: { bg: 'bg-warning-bg text-warning', text: 'text-warning', btn: 'bg-warning hover:bg-warning/80' },
    info: { bg: 'bg-brand/10 text-brand', text: 'text-brand', btn: 'bg-brand hover:bg-brand-hover' },
  };

  const c = colorMap[dialog.type] || colorMap.info;

  return (
    <AnimatePresence>
      {dialog.isOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="bg-surface border border-border rounded-md max-w-md w-full p-6 shadow-2xl"
          >
            <div className={`w-10 h-10 rounded-sm flex items-center justify-center mb-4 ${c.bg}`}>
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-1.5">{dialog.title}</h3>
            <p className="text-base text-text-secondary leading-relaxed mb-5">
              {dialog.message}
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={onClose}
                className="flex-1 h-9 rounded-sm bg-surface2 hover:bg-hover text-text-secondary text-base font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={dialog.onConfirm}
                className={`flex-1 h-9 rounded-sm text-white text-base font-medium transition-colors ${c.btn}`}
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
