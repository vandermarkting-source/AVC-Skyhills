'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface BetOption {
  id: string;
  label: string;
  odds: number;
  emoji?: string;
}

interface FunBet {
  id: string;
  title: string;
  category: string;
  emoji: string;
  options: BetOption[];
  deadline: string;
  participants: number;
  status: 'open' | 'closing-soon' | 'closed';
  isPopular?: boolean;
}

interface FunBetCardProps {
  bet: FunBet;
  userPoints: number;
  onPlaceBet: (betId: string, optionId: string, stake: number) => void;
}

const FunBetCard = ({ bet, userPoints, onPlaceBet }: FunBetCardProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [stake, setStake] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleStakeChange = (value: string) => {
    const numValue = value.replace(/[^0-9]/g, '');
    if (numValue === '' || parseInt(numValue) <= userPoints) {
      setStake(numValue);
    }
  };

  const handlePlaceBet = () => {
    if (selectedOption && stake && parseInt(stake) > 0) {
      setShowConfirmation(true);
    }
  };

  const confirmBet = () => {
    if (selectedOption && stake) {
      onPlaceBet(bet.id, selectedOption, parseInt(stake));
      setSelectedOption(null);
      setStake('');
      setShowConfirmation(false);
    }
  };

  const selectedOptionData = bet.options.find((opt) => opt.id === selectedOption);
  const potentialWin =
    selectedOptionData && stake ? Math.round(parseInt(stake) * selectedOptionData.odds) : 0;

  const getStatusBadge = () => {
    if (bet.status === 'closing-soon') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-warning text-warning-foreground text-xs font-medium rounded-sm">
          <Icon name="ClockIcon" size={14} />
          Bijna sluiten
        </span>
      );
    }
    if (bet.status === 'closed') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-text-secondary text-xs font-medium rounded-sm">
          <Icon name="LockClosedIcon" size={14} />
          Gesloten
        </span>
      );
    }
    return null;
  };

  return (
    <>
      <div className="bg-card border border-border rounded-md shadow-card hover:shadow-modal transition-micro overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border bg-muted">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <span className="text-4xl" role="img" aria-label={bet.category}>
                {bet.emoji}
              </span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-text-primary mb-1">{bet.title}</h3>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Icon name="TagIcon" size={16} />
                  <span>{bet.category}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {getStatusBadge()}
              {bet.isPopular && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent text-accent-foreground text-xs font-medium rounded-sm">
                  <Icon name="FireIcon" size={14} />
                  Populair
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Betting Options */}
        <div className="p-4">
          <div className="space-y-2 mb-4">
            {bet.options.map((option) => (
              <button
                key={option.id}
                onClick={() => bet.status !== 'closed' && setSelectedOption(option.id)}
                disabled={bet.status === 'closed'}
                className={`w-full flex items-center justify-between p-3 rounded-sm border-2 transition-micro ${
                  selectedOption === option.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50 hover:bg-muted'
                } ${bet.status === 'closed' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-2">
                  {option.emoji && (
                    <span className="text-2xl" role="img" aria-label={option.label}>
                      {option.emoji}
                    </span>
                  )}
                  <span className="font-medium text-text-primary">{option.label}</span>
                </div>
                <span className="font-data text-lg font-semibold text-primary">
                  {option.odds.toFixed(2)}x
                </span>
              </button>
            ))}
          </div>

          {/* Stake Input */}
          {bet.status !== 'closed' && selectedOption && (
            <div className="space-y-3 p-3 bg-muted rounded-sm">
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
                    className="w-full px-4 py-2 pr-12 border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Icon name="CurrencyDollarIcon" size={20} className="text-primary" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-text-secondary">
                  <span>Beschikbaar: {userPoints} punten</span>
                  {stake && parseInt(stake) > 0 && (
                    <span className="text-success font-medium">
                      Mogelijke winst: {potentialWin} punten
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={handlePlaceBet}
                disabled={!stake || parseInt(stake) === 0}
                className="w-full px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-sm hover:bg-secondary transition-micro disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Plaats weddenschap
              </button>
            </div>
          )}

          {/* Info Footer */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border text-sm text-text-secondary">
            <div className="flex items-center gap-2">
              <Icon name="UsersIcon" size={16} />
              <span>{bet.participants} deelnemers</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="ClockIcon" size={16} />
              <span>Sluit: {bet.deadline}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-modal p-4">
          <div className="bg-popover border border-border rounded-md shadow-elevated max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl" role="img" aria-label="confirmation">
                    {bet.emoji}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-text-primary">Bevestig weddenschap</h3>
              </div>

              <div className="space-y-3 mb-6">
                <div className="p-3 bg-muted rounded-sm">
                  <p className="text-sm text-text-secondary mb-1">Weddenschap</p>
                  <p className="font-medium text-text-primary">{bet.title}</p>
                </div>
                <div className="p-3 bg-muted rounded-sm">
                  <p className="text-sm text-text-secondary mb-1">Jouw keuze</p>
                  <p className="font-medium text-text-primary">{selectedOptionData?.label}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted rounded-sm">
                    <p className="text-sm text-text-secondary mb-1">Inzet</p>
                    <p className="font-data font-semibold text-text-primary">{stake} punten</p>
                  </div>
                  <div className="p-3 bg-muted rounded-sm">
                    <p className="text-sm text-text-secondary mb-1">Mogelijke winst</p>
                    <p className="font-data font-semibold text-success">{potentialWin} punten</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 px-4 py-2 border border-border text-text-primary font-medium rounded-sm hover:bg-muted transition-micro"
                >
                  Annuleren
                </button>
                <button
                  onClick={confirmBet}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-sm hover:bg-secondary transition-micro"
                >
                  Bevestigen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FunBetCard;
