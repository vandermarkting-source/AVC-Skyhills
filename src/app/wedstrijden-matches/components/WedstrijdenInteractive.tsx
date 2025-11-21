'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/common/Header';
import MatchCard from './MatchCard';
import BetSlipModal from './BetSlipModal';
import FilterBar, { FilterState } from './FilterBar';
import SuccessModal from './SuccessModal';
import Icon from '@/components/ui/AppIcon';
import { matchService } from '@/services/matchService';
import { betService } from '@/services/betService';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';

interface Match {
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
  optionIds: {
    home?: string;
    away?: string;
  };
  extraOptions: Array<{ id: string; label: string; odds: number }>;
}

const WedstrijdenInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const { user, profile, refreshProfile } = useAuth();
  const userPoints = profile?.pointsBalance ?? 0;
  const [reservedPoints, setReservedPoints] = useState(0);
  const [isPlacing, setIsPlacing] = useState(false);
  const [selectedBet, setSelectedBet] = useState<{
    matchId: number;
    homeTeam: string;
    awayTeam: string;
    betType: string;
    odds: number;
    betOptionId?: string;
  } | null>(null);
  const [showBetSlip, setShowBetSlip] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [potentialWin, setPotentialWin] = useState(0);
  const [filters, setFilters] = useState<FilterState>({
    sortBy: 'date',
    competition: 'all',
    status: 'all',
  });
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handlePlaceBet = (matchId: number, betType: string, odds: number, betOptionId?: string) => {
    const match = matches.find((m) => m.id === matchId);
    if (!match) return;

    setSelectedBet({
      matchId,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      betType,
      odds,
      betOptionId:
        betOptionId ?? (betType === 'home' ? match.optionIds.home : match.optionIds.away),
    });
    setShowBetSlip(true);
  };

  const handleConfirmBet = async (stake: number) => {
    if (!selectedBet || !user) return;
    if (!selectedBet.betOptionId) return;
    if (isPlacing) return;
    setIsPlacing(true);
    const payout = stake * selectedBet.odds;
    const res = await betService.placeBet({
      user_id: user.id,
      bet_option_id: selectedBet.betOptionId,
      stake,
      potential_payout: payout,
      status: 'pending',
    } as any);
    if (res.error) {
      setSuccessMessage(res.error.message || 'Plaatsen mislukt');
      setShowBetSlip(false);
      setShowSuccess(true);
      setIsPlacing(false);
      return;
    }
    await refreshProfile();
    const sum = await betService.getReservedStakeSum(user.id);
    setReservedPoints(sum.total);
    setPotentialWin(payout);
    setSuccessMessage(`Je hebt ${stake.toFixed(2)} punten ingezet`);
    setShowBetSlip(false);
    setShowSuccess(true);
    setIsPlacing(false);
  };

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const getFilteredMatches = () => {
    let filtered = [...matches];

    // Filter by competition
    if (filters.competition !== 'all') {
      filtered = filtered.filter(
        (match) => match.competition.toLowerCase() === filters.competition
      );
    }

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter((match) => match.status === filters.status);
    }

    // Sort
    filtered.sort((a, b) => {
      if (filters.sortBy === 'date') {
        return a.date.localeCompare(b.date);
      } else if (filters.sortBy === 'competition') {
        return a.competition.localeCompare(b.competition);
      } else {
        return a.status.localeCompare(b.status);
      }
    });

    return filtered;
  };

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const loadMatches = async () => {
      const { data } = await matchService.getUpcomingMatches();
      const now = new Date();
      const mapped: Match[] = (data ?? []).map((m, idx) => {
        const closing = new Date(m.closing_time as any);
        const status: 'live' | 'new' | 'closing-soon' | 'closed' =
          (m.status as any) === 'live'
            ? 'live'
            : now.getTime() >= closing.getTime()
              ? 'closed'
              : closing.getTime() - now.getTime() < 15 * 60 * 1000
                ? 'closing-soon'
                : 'new';
        const opts = (m.bet_options ?? []).map((o) => ({
          id: o.id,
          text: String(o.option_text ?? '').toLowerCase(),
          raw: String(o.option_text ?? ''),
          odds: Number(o.odds ?? 1),
        }));
        const ht = String(m.home_team ?? '').toLowerCase();
        const at = String(m.away_team ?? '').toLowerCase();
        const homeOpt =
          opts.find(
            (o) =>
              o.text.includes('home') ||
              o.text.includes('thuis') ||
              o.text.includes('h1') ||
              o.text.includes('avc') ||
              (ht && o.text.includes(ht))
          ) ?? opts[0];
        const awayOpt =
          opts.find(
            (o) =>
              o.text.includes('away') ||
              o.text.includes('uit') ||
              o.text.includes('h2') ||
              o.text.includes('out') ||
              (at && o.text.includes(at))
          ) ?? opts[1];
        const baseIds = [homeOpt?.id, awayOpt?.id].filter(Boolean);
        const extraOptions = opts
          .filter((o) => !baseIds.includes(o.id))
          .map((o) => ({ id: o.id as any, label: o.raw as any, odds: o.odds as any }));
        return {
          id: idx + 1,
          homeTeam: (m.home_team as any) ?? 'Thuis',
          awayTeam: (m.away_team as any) ?? 'Uit',
          date: new Date(m.match_date as any).toLocaleDateString('nl-NL'),
          time: new Date(m.match_date as any).toLocaleTimeString('nl-NL', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          competition: 'Competitie',
          status,
          odds: {
            home: (homeOpt?.odds as any) ?? 1,
            away: (awayOpt?.odds as any) ?? 1,
          },
          betTypes: ['Set resultaat'],
          optionIds: {
            home: homeOpt?.id as any,
            away: awayOpt?.id as any,
          },
          extraOptions,
        };
      });
      setMatches(mapped);
    };
    loadMatches();
  }, []);

  useEffect(() => {
    const loadReserved = async () => {
      if (!user) return;
      const sum = await betService.getReservedStakeSum(user.id);
      setReservedPoints(sum.total);
    };
    loadReserved();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const ch = (supabase as any)
      .channel(`matches_bets_live_${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bets', filter: `user_id=eq.${user.id}` },
        async () => {
          const sum = await betService.getReservedStakeSum(user.id);
          setReservedPoints(sum.total);
        }
      )
      .subscribe();
    return () => {
      try {
        (supabase as any).removeChannel(ch);
      } catch (e) {
        void e;
      }
    };
  }, [user]);

  const filteredMatches = isHydrated ? getFilteredMatches() : [];
  const availablePoints = Math.max(userPoints - reservedPoints, 0);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-[60px] px-5 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-24 bg-muted rounded"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-96 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-[60px] px-5 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Icon name="TrophyIcon" size={32} className="text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary">Wedstrijden</h1>
            </div>
            <p className="text-text-secondary">
              Plaats je weddenschappen op aankomende volleybalwedstrijden
            </p>
          </div>

          {/* Filter Bar */}
          <FilterBar onFilterChange={handleFilterChange} />

          {/* Matches Grid */}
          {filteredMatches.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredMatches.map((match) => (
                <MatchCard key={match.id} match={match} onPlaceBet={handlePlaceBet} />
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-md p-12 text-center">
              <Icon
                name="MagnifyingGlassIcon"
                size={48}
                className="text-text-secondary mx-auto mb-4"
              />

              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Geen wedstrijden gevonden
              </h3>
              <p className="text-text-secondary">
                Probeer je filters aan te passen om meer resultaten te zien
              </p>
            </div>
          )}

          {/* Info Banner */}
          <div className="mt-8 bg-accent/10 border border-accent/20 rounded-md p-6">
            <div className="flex items-start gap-4">
              <Icon name="InformationCircleIcon" size={24} className="text-accent flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-text-primary mb-2">Weddenschap informatie</h3>
                <ul className="space-y-1 text-sm text-text-secondary">
                  <li>• Minimale inzet: 10 punten</li>
                  <li>• Weddenschappen sluiten 15 minuten voor aanvang</li>
                  <li>• Odds kunnen wijzigen tot sluitingstijd</li>
                  <li>• Uitbetalingen worden binnen 24 uur verwerkt</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <BetSlipModal
        isOpen={showBetSlip}
        onClose={() => setShowBetSlip(false)}
        bet={selectedBet}
        userPoints={availablePoints}
        onConfirmBet={handleConfirmBet}
      />

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={successMessage}
        potentialWin={potentialWin}
      />
    </div>
  );
};

export default WedstrijdenInteractive;
