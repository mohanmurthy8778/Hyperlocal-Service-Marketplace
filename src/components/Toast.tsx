import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Toast: React.FC = () => {
  const { activeToast } = useApp();

  return (
    <AnimatePresence>
      {activeToast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-border-primary bg-bg-card p-4 shadow-xl dark:border-border-primary dark:bg-bg-card"
          id="toast-notification"
        >
          {activeToast.type === 'success' && (
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          )}
          {activeToast.type === 'error' && (
            <AlertCircle className="h-5 w-5 text-rose-500" />
          )}
          {activeToast.type === 'info' && (
            <Info className="h-5 w-5 text-primary" />
          )}
          <span className="text-sm font-medium text-secondary-text">
            {activeToast.message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
