'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Bet {
  id: string;
  market: string;
  selection: string;
  stake: number;
  odds: number;
  potentialReturn: number;
  status: 'pending' | 'won' | 'lost' | 'void';
  placedAt: string;
  settledAt?: string;
  category: 'match' | 'fun';
}

interface BettingHistoryProps {
  bets: Bet[];
}

const BettingHistory = ({ bets }: BettingHistoryProps) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'won' | 'lost'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'match' | 'fun'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'stake' | 'odds'>('date');

  let filteredBets = bets;

  if (filter !== 'all') {
    filteredBets = filteredBets.filter((bet) => bet.status === filter);
  }

  if (categoryFilter !== 'all') {
    filteredBets = filteredBets.filter((bet) => bet.category === categoryFilter);
  }

  const sortedBets = [...filteredBets].sort((a, b) => {
    switch (sortBy) {
      case 'stake':
        return b.stake - a.stake;
      case 'odds':
        return b.odds - a.odds;
      default:
        return new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime();
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Lopend', color: 'bg-warning text-warning-foreground' };
      case 'won':
        return { label: 'Gewonnen', color: 'bg-success text-success-foreground' };
      case 'lost':
        return { label: 'Verloren', color: 'bg-error text-error-foreground' };
      case 'void':
        return { label: 'Nietig', color: 'bg-muted text-text-secondary' };
      default:
        return { label: status, color: 'bg-muted text-text-secondary' };
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <h2 className="text-xl font-bold text-text-primary mb-6">Wedgeschiedenis</h2>

      {/* Filters */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-text-secondary self-center">Status:</span>
          {(['all', 'pending', 'won', 'lost'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-3 py-1.5 rounded-sm text-sm font-medium transition-micro ${
                filter === filterType
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-text-secondary hover:bg-border'
              }`}
            >
              {filterType === 'all'
                ? 'Alle'
                : filterType === 'pending'
                  ? 'Lopend'
                  : filterType === 'won'
                    ? 'Gewonnen'
                    : 'Verloren'}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-text-secondary self-center">Categorie:</span>
          {(['all', 'match', 'fun'] as const).map((catFilter) => (
            <button
              key={catFilter}
              onClick={() => setCategoryFilter(catFilter)}
              className={`px-3 py-1.5 rounded-sm text-sm font-medium transition-micro ${
                categoryFilter === catFilter
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-text-secondary hover:bg-border'
              }`}
            >
              {catFilter === 'all' ? 'Alle' : catFilter === 'match' ? 'Wedstrijden' : 'Fun Bets'}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-text-secondary self-center">Sorteren:</span>
          {(['date', 'stake', 'odds'] as const).map((sort) => (
            <button
              key={sort}
              onClick={() => setSortBy(sort)}
              className={`px-3 py-1.5 rounded-sm text-sm font-medium transition-micro ${
                sortBy === sort
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-text-secondary hover:bg-border'
              }`}
            >
              {sort === 'date' ? 'Datum' : sort === 'stake' ? 'Inzet' : 'Odds'}
            </button>
          ))}
        </div>
      </div>

      {/* Bets List */}
      <div className="space-y-3">
        {sortedBets.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="InboxIcon" size={48} className="text-text-secondary mx-auto mb-3" />
            <p className="text-text-secondary">Geen weddenschappen gevonden</p>
          </div>
        ) : (
          sortedBets.map((bet) => {
            const statusBadge = getStatusBadge(bet.status);
            return (
              <div
                key={bet.id}
                className="border border-border rounded-lg p-4 hover:shadow-card transition-micro"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadge.color}`}
                      >
                        {statusBadge.label}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-muted text-text-secondary">
                        {bet.category === 'match' ? 'Wedstrijd' : 'Fun Bet'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-text-primary">{bet.market}</h3>
                    <p className="text-sm text-text-secondary">{bet.selection}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-text-secondary mb-1">Odds</p>
                    <p className="font-data font-bold text-primary text-lg">
                      {bet.odds.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-border">
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Inzet</p>
                    <p className="font-data font-medium text-text-primary">{bet.stake} punten</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Potentiële winst</p>
                    <p className="font-data font-medium text-success">
                      {bet.potentialReturn} punten
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Geplaatst</p>
                    <p className="text-sm text-text-primary">{bet.placedAt}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Afgehandeld</p>
                    <p className="text-sm text-text-primary">{bet.settledAt || '-'}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BettingHistory;
