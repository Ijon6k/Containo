import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { ConfirmDialog } from '@/hooks/useNotifications';

interface ConfirmModalProps {
  dialog: ConfirmDialog;
  onClose: () => void;
}

export const ConfirmModal = ({ dialog, onClose }: ConfirmModalProps) => {
  return (
    <AnimatePresence>
      {dialog.isOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 bg-zinc-950/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="card max-w-md w-full p-6 shadow-2xl"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
              dialog.type === 'danger' ? 'bg-rose-500/10 text-rose-500' : 
              dialog.type === 'warning' ? 'bg-amber-500/10 text-amber-500' : 
              'bg-blue-500/10 text-blue-500'
            }`}>
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-text-main mb-2">{dialog.title}</h3>
            <p className="text-text-sub text-sm leading-relaxed mb-6">
              {dialog.message}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-md bg-ui-accent hover:bg-ui-accent/80 text-text-main font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={dialog.onConfirm}
                className={`flex-1 px-4 py-2 rounded-md text-white font-bold transition-all ${
                  dialog.type === 'danger' ? 'bg-rose-500 hover:bg-rose-600' : 
                  dialog.type === 'warning' ? 'bg-amber-500 hover:bg-amber-600' : 
                  'bg-brand hover:bg-brand/90'
                }`}
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
