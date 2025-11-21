'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface MatchCardProps {
  match: {
    id: number;
    homeTeam: string;
    awayTeam: string;
    date: string;
    time: string;
    competition: string;
    status: 'live' | 'new' | 'closing-soon' | 'closed';
    odds: {
      home: number;
      away: number;
    };
    betTypes: string[];
    extraOptions: Array<{ id: string; label: string; odds: number }>;
  };
  onPlaceBet: (matchId: number, betType: string, odds: number, betOptionId?: string) => void;
}

const MatchCard = ({ match, onPlaceBet }: MatchCardProps) => {
  const [hoveredOdd, setHoveredOdd] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);

  const getStatusBadge = () => {
    const badges = {
      live: { text: 'Live', className: 'bg-error text-error-foreground' },
      new: { text: 'Nieuw', className: 'bg-success text-success-foreground' },
      'closing-soon': { text: 'Bijna sluiten', className: 'bg-warning text-warning-foreground' },
      closed: { text: 'Gesloten', className: 'bg-muted text-text-secondary' },
    };

    const badge = badges[match.status];
    return (
      <span className={`px-2 py-1 rounded-sm text-xs font-semibold ${badge.className}`}>
        {badge.text}
      </span>
    );
  };

  const isBettingDisabled = match.status === 'closed';

  return (
    <div className="bg-card border border-border rounded-md shadow-card hover:shadow-modal transition-micro overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-muted border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="TrophyIcon" size={20} className="text-primary" />
          <span className="text-sm font-medium text-text-secondary">{match.competition}</span>
        </div>
        {getStatusBadge()}
      </div>

      {/* Teams */}
      <div className="p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex-1 text-center">
            <span className="font-semibold text-text-primary">{match.homeTeam}</span>
          </div>

          {/* VS */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-text-secondary">VS</span>
            <div className="flex items-center gap-1 text-xs text-text-secondary">
              <Icon name="CalendarIcon" size={14} />
              <span>{match.date}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-text-secondary">
              <Icon name="ClockIcon" size={14} />
              <span>{match.time}</span>
            </div>
          </div>

          <div className="flex-1 text-center">
            <span className="font-semibold text-text-primary">{match.awayTeam}</span>
          </div>
        </div>

        {/* Odds zonder gelijkspel */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => !isBettingDisabled && onPlaceBet(match.id, 'home', match.odds.home)}
            onMouseEnter={() => setHoveredOdd('home')}
            onMouseLeave={() => setHoveredOdd(null)}
            disabled={isBettingDisabled}
            className={`p-4 rounded-sm border-2 transition-all ${
              isBettingDisabled
                ? 'border-border bg-muted cursor-not-allowed opacity-50'
                : 'border-primary bg-surface hover:bg-primary hover:scale-105 cursor-pointer'
            }`}
          >
            <div className="text-xs text-text-secondary mb-1">1</div>
            <div
              className={`font-data font-bold transition-all ${
                hoveredOdd === 'home' && !isBettingDisabled
                  ? 'text-2xl text-primary-foreground'
                  : 'text-xl text-primary'
              }`}
            >
              {match.odds.home.toFixed(2)}
            </div>
            <div className="text-xs text-text-secondary mt-1">{match.homeTeam}</div>
          </button>

          <button
            onClick={() => !isBettingDisabled && onPlaceBet(match.id, 'away', match.odds.away)}
            onMouseEnter={() => setHoveredOdd('away')}
            onMouseLeave={() => setHoveredOdd(null)}
            disabled={isBettingDisabled}
            className={`p-4 rounded-sm border-2 transition-all ${
              isBettingDisabled
                ? 'border-border bg-muted cursor-not-allowed opacity-50'
                : 'border-primary bg-surface hover:bg-primary hover:scale-105 cursor-pointer'
            }`}
          >
            <div className="text-xs text-text-secondary mb-1">2</div>
            <div
              className={`font-data font-bold transition-all ${
                hoveredOdd === 'away' && !isBettingDisabled
                  ? 'text-2xl text-primary-foreground'
                  : 'text-xl text-primary'
              }`}
            >
              {match.odds.away.toFixed(2)}
            </div>
            <div className="text-xs text-text-secondary mt-1">{match.awayTeam}</div>
          </button>
        </div>

        {/* Additional Bet Types */}
        {match.betTypes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-text-secondary">
                <Icon name="PlusCircleIcon" size={16} />
                <span>Meer weddenschappen</span>
              </div>
              <button
                onClick={() => setShowMore(!showMore)}
                className="px-3 py-1 border border-border rounded-sm hover:bg-muted transition-micro"
              >
                {showMore ? 'Verberg' : 'Toon'}
              </button>
            </div>
            {showMore && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                {match.extraOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => onPlaceBet(match.id, 'extra', opt.odds, opt.id)}
                    className="p-3 rounded-sm border-2 border-primary bg-surface hover:bg-primary hover:scale-105 transition-all"
                  >
                    <div className="text-xs text-text-secondary mb-1">{opt.label}</div>
                    <div className="font-data font-bold text-xl text-primary">
                      {opt.odds.toFixed(2)}
                    </div>
                  </button>
                ))}
                {match.extraOptions.length === 0 && (
                  <div className="text-sm text-text-secondary">Geen extra weddenschappen</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchCard;
