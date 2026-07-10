import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-border-primary bg-bg-card p-6 shadow-2xl dark:border-border-primary dark:bg-bg-card transition-colors duration-200"
            id={`modal-dialog-${title.toLowerCase().replace(' ', '-')}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-primary pb-4 dark:border-border-primary">
              <h3 className="text-lg font-bold text-primary-text">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-secondary-text hover:bg-bg-secondary hover:text-secondary-text dark:hover:bg-bg-secondary dark:bg-bg-card dark:hover:text-white"
                id="modal-close-btn"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="mt-4 max-h-[70vh] overflow-y-auto pr-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
