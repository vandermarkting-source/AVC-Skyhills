'use client';

import { useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  potentialWin: number;
}

const SuccessModal = ({ isOpen, onClose, message, potentialWin }: SuccessModalProps) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isOpen && isHydrated) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isHydrated, onClose]);

  if (!isOpen) return null;

  if (!isHydrated) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-modal p-4">
        <div className="bg-card rounded-md shadow-elevated p-6 max-w-sm w-full">
          <div className="animate-pulse space-y-4">
            <div className="h-16 w-16 bg-muted rounded-full mx-auto"></div>
            <div className="h-6 bg-muted rounded w-3/4 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-modal p-4">
      <div className="bg-card rounded-md shadow-elevated p-8 max-w-sm w-full text-center animate-pulse-subtle">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="CheckIcon" size={32} className="text-success-foreground" />
        </div>

        {/* Message */}
        <h3 className="text-xl font-bold text-text-primary mb-2">Weddenschap geplaatst!</h3>
        <p className="text-text-secondary mb-4">{message}</p>

        {/* Potential Win */}
        <div className="bg-success/10 border border-success/20 p-4 rounded-sm mb-6">
          <div className="text-sm text-text-secondary mb-1">Mogelijke winst</div>
          <div className="font-data font-bold text-success text-2xl">
            {potentialWin.toFixed(2)} punten
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-sm font-semibold hover:bg-secondary transition-micro"
        >
          Sluiten
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
