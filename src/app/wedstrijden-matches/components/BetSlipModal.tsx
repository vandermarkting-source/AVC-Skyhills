'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface BetSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  bet: {
    matchId: number;
    homeTeam: string;
    awayTeam: string;
    betType: string;
    odds: number;
  } | null;
  userPoints: number;
  onConfirmBet: (stake: number) => void;
}

const BetSlipModal = ({ isOpen, onClose, bet, userPoints, onConfirmBet }: BetSlipModalProps) => {
  const [stake, setStake] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setStake('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !bet) return null;

  const stakeNumber = parseFloat(stake) || 0;
  const potentialPayout = stakeNumber * bet.odds;

  const handleStakeChange = (value: string) => {
    setError('');

    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setStake(value);

      const numValue = parseFloat(value);
      if (numValue > userPoints) {
        setError('Onvoldoende punten beschikbaar');
      } else if (numValue < 10 && value !== '') {
        setError('Minimale inzet is 10 punten');
      }
    }
  };

  const handleQuickStake = (amount: number) => {
    if (amount <= userPoints) {
      setStake(amount.toString());
      setError('');
    } else {
      setError('Onvoldoende punten beschikbaar');
    }
  };

  const handleConfirm = () => {
    const numStake = parseFloat(stake);

    if (!numStake || numStake < 10) {
      setError('Minimale inzet is 10 punten');
      return;
    }

    if (numStake > userPoints) {
      setError('Onvoldoende punten beschikbaar');
      return;
    }

    onConfirmBet(numStake);
  };

  const getBetTypeLabel = () => {
    const labels: { [key: string]: string } = {
      home: `${bet.homeTeam} wint`,
      draw: 'Gelijkspel',
      away: `${bet.awayTeam} wint`,
    };
    return labels[bet.betType] || bet.betType;
  };

  if (!isHydrated) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-modal p-4">
        <div className="bg-card rounded-md shadow-elevated w-full max-w-md p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-12 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-modal p-4">
      <div className="bg-card rounded-md shadow-elevated w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-primary">Weddenschap plaatsen</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-sm transition-micro">
            <Icon name="XMarkIcon" size={24} className="text-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Match Info */}
          <div className="bg-muted p-4 rounded-sm">
            <div className="text-sm text-text-secondary mb-2">Wedstrijd</div>
            <div className="font-semibold text-text-primary">
              {bet.homeTeam} vs {bet.awayTeam}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-text-secondary">Keuze:</span>
              <span className="font-medium text-primary">{getBetTypeLabel()}</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-sm text-text-secondary">Odds:</span>
              <span className="font-data font-bold text-primary text-lg">
                {bet.odds.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Stake Input */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Inzet (punten)
            </label>
            <div className="relative">
              <input
                type="text"
                value={stake}
                onChange={(e) => handleStakeChange(e.target.value)}
                placeholder="Voer inzet in"
                className={`w-full px-4 py-3 border-2 rounded-sm font-data text-lg ${
                  error ? 'border-error focus:border-error' : 'border-border focus:border-primary'
                } focus:outline-none transition-micro`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
                punten
              </div>
            </div>
            {error && (
              <div className="mt-2 flex items-center gap-2 text-error text-sm">
                <Icon name="ExclamationCircleIcon" size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Quick Stake Buttons */}
          <div>
            <div className="text-sm text-text-secondary mb-2">Snelle keuze</div>
            <div className="grid grid-cols-4 gap-2">
              {[50, 100, 250, 500].map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleQuickStake(amount)}
                  disabled={amount > userPoints}
                  className={`py-2 px-3 rounded-sm font-medium text-sm transition-micro ${
                    amount > userPoints
                      ? 'bg-muted text-text-secondary cursor-not-allowed'
                      : 'bg-primary text-primary-foreground hover:bg-secondary'
                  }`}
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          {/* Potential Payout */}
          <div className="bg-success/10 border border-success/20 p-4 rounded-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Mogelijke winst:</span>
              <span className="font-data font-bold text-success text-xl">
                {potentialPayout.toFixed(2)} punten
              </span>
            </div>
            <div className="mt-2 text-xs text-text-secondary">
              Inclusief inzet van {stakeNumber.toFixed(2)} punten
            </div>
          </div>

          {/* Available Points */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Beschikbare punten:</span>
            <span className="font-data font-semibold text-text-primary">
              {userPoints.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border-2 border-border rounded-sm font-semibold text-text-primary hover:bg-muted transition-micro"
          >
            Annuleren
          </button>
          <button
            onClick={handleConfirm}
            disabled={!stake || !!error || stakeNumber < 10}
            className={`flex-1 py-3 px-4 rounded-sm font-semibold transition-micro ${
              !stake || !!error || stakeNumber < 10
                ? 'bg-muted text-text-secondary cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-secondary'
            }`}
          >
            Bevestigen
          </button>
        </div>
      </div>
    </div>
  );
};

export default BetSlipModal;
