'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface SettlementOption {
  id: string;
  label: string;
  odds: number;
  totalBets: number;
  totalStake: number;
}

interface SettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketTitle: string;
  options: SettlementOption[];
  onSettle: (winningOptionId: string) => void;
}

const SettlementModal = ({
  isOpen,
  onClose,
  marketTitle,
  options,
  onSettle,
}: SettlementModalProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null;
  }

  if (!isOpen) return null;

  const selectedOptionData = options.find((opt) => opt.id === selectedOption);
  const totalPayout = selectedOptionData
    ? Math.round(selectedOptionData.totalStake * selectedOptionData.odds)
    : 0;

  const handleConfirmSettle = () => {
    if (selectedOption) {
      onSettle(selectedOption);
      setShowConfirm(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-modal p-4">
      <div className="bg-surface rounded-md w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-surface border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-primary">Markt afrekenen</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-sm transition-micro">
            <Icon name="XMarkIcon" size={24} className="text-text-secondary" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-muted rounded-md p-4">
            <h3 className="font-semibold text-text-primary mb-1">{marketTitle}</h3>
            <p className="text-sm text-text-secondary">
              Selecteer de winnende optie om de markt af te rekenen
            </p>
          </div>

          <div className="space-y-2">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={`w-full p-4 border rounded-md transition-micro text-left ${
                  selectedOption === option.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedOption === option.id ? 'border-primary bg-primary' : 'border-border'
                      }`}
                    >
                      {selectedOption === option.id && (
                        <Icon name="CheckIcon" size={14} className="text-primary-foreground" />
                      )}
                    </div>
                    <span className="font-semibold text-text-primary">{option.label}</span>
                  </div>
                  <span className="font-data font-bold text-primary text-lg">
                    {option.odds.toFixed(2)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 pl-8">
                  <div>
                    <p className="text-xs text-text-secondary mb-0.5">Weddenschappen</p>
                    <p className="text-sm font-medium text-text-primary">{option.totalBets}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary mb-0.5">Totale inzet</p>
                    <p className="text-sm font-medium text-text-primary">
                      {option.totalStake.toLocaleString('nl-NL')} punten
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedOption && (
            <div className="bg-success/10 border border-success rounded-md p-4">
              <div className="flex items-start gap-3">
                <Icon
                  name="InformationCircleIcon"
                  size={24}
                  className="text-success flex-shrink-0"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-text-primary mb-1">Uitbetaling overzicht</h4>
                  <p className="text-sm text-text-secondary mb-2">
                    Totaal uit te betalen:{' '}
                    <span className="font-data font-bold text-success">
                      {totalPayout.toLocaleString('nl-NL')} punten
                    </span>
                  </p>
                  <p className="text-xs text-text-secondary">
                    Punten worden automatisch toegevoegd aan winnende gebruikers
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-sm hover:bg-muted transition-micro"
            >
              Annuleren
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              disabled={!selectedOption}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-secondary transition-micro font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Afrekenen
            </button>
          </div>
        </div>

        {showConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-modal p-4">
            <div className="bg-surface rounded-md w-full max-w-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
                  <Icon name="ExclamationTriangleIcon" size={24} className="text-warning" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary">Bevestig afrekening</h3>
              </div>
              <p className="text-text-secondary mb-2">
                Je staat op het punt om deze markt af te rekenen met:
              </p>
              <div className="bg-muted rounded-md p-3 mb-4">
                <p className="font-semibold text-text-primary">{selectedOptionData?.label}</p>
                <p className="text-sm text-text-secondary mt-1">
                  Uitbetaling:{' '}
                  <span className="font-data font-bold text-primary">
                    {totalPayout.toLocaleString('nl-NL')} punten
                  </span>
                </p>
              </div>
              <p className="text-sm text-text-secondary mb-6">
                Deze actie kan niet ongedaan worden gemaakt. Weet je het zeker?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-sm hover:bg-muted transition-micro"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleConfirmSettle}
                  className="flex-1 px-4 py-2 bg-success text-success-foreground rounded-sm hover:opacity-90 transition-micro font-medium"
                >
                  Bevestigen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettlementModal;
