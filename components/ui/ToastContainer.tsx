import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Toast } from '@/hooks/useNotifications';

interface ToastContainerProps {
  toasts: Toast[];
}

export const ToastContainer = ({ toasts }: ToastContainerProps) => {
  return (
    <div className="fixed bottom-6 right-6 z-[2000] flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${
              toast.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
            } backdrop-blur-md min-w-[240px]`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
