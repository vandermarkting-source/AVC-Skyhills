'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Market {
  id: string;
  title: string;
  category: 'match' | 'fun';
  status: 'open' | 'closed' | 'settled';
  deadline: string;
  totalBets: number;
  totalStake: number;
  participants: number;
}

interface MarketCardProps {
  market: Market;
  onEdit: (id: string) => void;
  onClose: (id: string) => void;
  onSettle: (id: string) => void;
  onDelete: (id: string) => void;
}

const MarketCard = ({ market, onEdit, onClose, onSettle, onDelete }: MarketCardProps) => {
  const [showActions, setShowActions] = useState(false);

  const getStatusColor = () => {
    switch (market.status) {
      case 'open':
        return 'bg-success text-success-foreground';
      case 'closed':
        return 'bg-warning text-warning-foreground';
      case 'settled':
        return 'bg-muted text-text-secondary';
      default:
        return 'bg-muted text-text-secondary';
    }
  };

  const getStatusLabel = () => {
    switch (market.status) {
      case 'open':
        return 'Open';
      case 'closed':
        return 'Gesloten';
      case 'settled':
        return 'Afgerekend';
      default:
        return 'Onbekend';
    }
  };

  const getCategoryIcon = () => {
    return market.category === 'match' ? 'TrophyIcon' : 'SparklesIcon';
  };

  return (
    <div className="bg-card border border-border rounded-md p-4 hover:shadow-card transition-micro">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-primary/10 rounded-sm flex items-center justify-center flex-shrink-0">
            <Icon name={getCategoryIcon() as any} size={20} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text-primary mb-1 truncate">{market.title}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-sm font-medium ${getStatusColor()}`}>
                {getStatusLabel()}
              </span>
              <span className="text-xs text-text-secondary">
                {market.category === 'match' ? 'Wedstrijd' : 'Fun Bet'}
              </span>
            </div>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1.5 hover:bg-muted rounded-sm transition-micro"
          >
            <Icon name="EllipsisVerticalIcon" size={20} className="text-text-secondary" />
          </button>
          {showActions && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-md shadow-modal z-dropdown">
              <button
                onClick={() => {
                  onEdit(market.id);
                  setShowActions(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted transition-micro text-left"
              >
                <Icon name="PencilIcon" size={16} className="text-text-secondary" />
                <span className="text-sm text-text-primary">Bewerken</span>
              </button>
              {market.status === 'open' && (
                <button
                  onClick={() => {
                    onClose(market.id);
                    setShowActions(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted transition-micro text-left"
                >
                  <Icon name="LockClosedIcon" size={16} className="text-text-secondary" />
                  <span className="text-sm text-text-primary">Sluiten</span>
                </button>
              )}
              {market.status === 'closed' && (
                <button
                  onClick={() => {
                    onSettle(market.id);
                    setShowActions(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted transition-micro text-left"
                >
                  <Icon name="CheckCircleIcon" size={16} className="text-text-secondary" />
                  <span className="text-sm text-text-primary">Afrekenen</span>
                </button>
              )}
              <button
                onClick={() => {
                  onDelete(market.id);
                  setShowActions(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted transition-micro text-left border-t border-border"
              >
                <Icon name="TrashIcon" size={16} className="text-error" />
                <span className="text-sm text-error">Verwijderen</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
        <div>
          <p className="text-xs text-text-secondary mb-0.5">Deadline</p>
          <p className="text-sm font-medium text-text-primary">{market.deadline}</p>
        </div>
        <div>
          <p className="text-xs text-text-secondary mb-0.5">Weddenschappen</p>
          <p className="text-sm font-medium text-text-primary">{market.totalBets}</p>
        </div>
        <div>
          <p className="text-xs text-text-secondary mb-0.5">Deelnemers</p>
          <p className="text-sm font-medium text-text-primary">{market.participants}</p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondary">Totale inzet</span>
          <span className="font-data font-semibold text-primary">
            {market.totalStake.toLocaleString('nl-NL')} punten
          </span>
        </div>
      </div>
    </div>
  );
};

export default MarketCard;
