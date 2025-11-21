'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { userService } from '../../../services/userService';
import { betService } from '../../../services/betService';
import { supabase } from '../../../lib/supabase/client';
import WelcomeBanner from './WelcomeBanner';
import QuickActionCard from './QuickActionCard';
import RecentResultCard from './RecentResultCard';
import UpcomingDeadlineCard from './UpcomingDeadlineCard';
import StatCard from './StatCard';
import Icon from '@/components/ui/AppIcon';

interface RecentResult {
  id: number;
  matchTitle: string;
  betType: string;
  stake: number;
  odds: number;
  result: 'won' | 'lost';
  payout: number;
  settledDate: string;
}

interface UpcomingDeadline {
  id: number;
  title: string;
  category: 'match' | 'fun';
  closingTime: string;
  timeRemaining: string;
  isLive: boolean;
}

interface QuickAction {
  id: number;
  title: string;
  description: string;
  icon: string;
  href: string;
  color: 'primary' | 'accent' | 'secondary';
}

interface UserStats {
  totalBets: number;
  winRate: string;
  totalWinnings: number;
  currentStreak: number;
}

const HomeDashboardInteractive = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Data states
  const [userStats, setUserStats] = useState({
    totalBets: 0,
    winRate: '0%',
    totalWinnings: 0,
    currentStreak: 0,
  });
  const [recentResults, setRecentResults] = useState<any[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([]);
  const [_supabaseOk, setSupabaseOk] = useState<boolean | null>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const check = async () => {
      try {
        const db = supabase as any;
        const { error } = await db.from('user_profiles').select('id').limit(1);
        setSupabaseOk(error ? false : true);
      } catch {
        setSupabaseOk(false);
      }
    };
    check();
  }, []);

  useEffect(() => {
    if (user && profile) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [user, profile]);

  const loadDashboardData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Load user stats
      const stats = await userService.getUserStats(user.id);
      setUserStats({
        totalBets: stats.totalBets,
        winRate: stats.winRate,
        totalWinnings: stats.totalWinnings,
        currentStreak: 0, // Calculate streak separately if needed
      });

      // Load recent bet results
      const { data: betsData } = await betService.getUserBets(user.id);
      const settledBets =
        betsData?.filter((bet) => bet?.status === 'won' || bet?.status === 'lost')?.slice(0, 3) ??
        [];

      setRecentResults(
        settledBets.map((bet) => ({
          id: bet.id,
          matchTitle: 'Match details', // Will be populated from bet_options relation
          betType: 'Bet type', // Will be populated from bet_options
          stake: bet.stake,
          odds: 0, // Will be populated from bet_options
          result: bet.status,
          payout: bet.actual_payout ?? 0,
          settledDate: new Date(bet?.settled_at ?? '').toLocaleDateString('nl-NL'),
        }))
      );

      // TODO: Load upcoming deadlines from matches/fun_bets
      // For now, keep empty array
      setUpcomingDeadlines([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      id: 1,
      title: 'Wedstrijden',
      description: 'Plaats weddenschappen op aankomende volleybalwedstrijden',
      icon: 'TrophyIcon',
      href: '/wedstrijden-matches',
      color: 'primary' as const,
    },
    {
      id: 2,
      title: 'Fun Bets',
      description: 'Voorspel clubevenementen en win extra punten',
      icon: 'SparklesIcon',
      href: '/fun-bets',
      color: 'accent' as const,
    },
    {
      id: 3,
      title: 'Ranglijst',
      description: 'Bekijk de top 20 spelers en jouw positie',
      icon: 'ChartBarIcon',
      href: '/ranglijst-leaderboard',
      color: 'secondary' as const,
    },
  ];

  if (!isHydrated || authLoading || loading) {
    return (
      <div className="min-h-screen bg-background pt-[60px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="bg-muted rounded-lg h-48 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-muted rounded-lg h-32"></div>
              <div className="bg-muted rounded-lg h-32"></div>
              <div className="bg-muted rounded-lg h-32"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pt-[60px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    );
  }

  const statusClass = _supabaseOk
    ? 'bg-success/10 border-success text-success'
    : 'bg-error/10 border-error text-error';

  return (
    <div className="min-h-screen bg-background pt-[60px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="mb-8">
          <WelcomeBanner
            userName={profile?.fullName ?? 'Gebruiker'}
            pointsBalance={profile?.pointsBalance ?? 0}
          />
        </div>

        {/* Verbinding banner verwijderd voor nette UI */}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Snelle Acties</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action) => (
              <QuickActionCard
                key={action.id}
                title={action.title}
                description={action.description}
                icon={action.icon}
                href={action.href}
                color={action.color}
              />
            ))}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Jouw Statistieken</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon="ChartBarIcon"
              label="Totaal Weddenschappen"
              value={userStats.totalBets}
              color="primary"
            />
            <StatCard
              icon="CheckCircleIcon"
              label="Winstpercentage"
              value={userStats.winRate}
              color="success"
            />
            <StatCard
              icon="CurrencyDollarIcon"
              label="Totale Winst"
              value={`+${userStats.totalWinnings}`}
              color="success"
            />
            <StatCard
              icon="FireIcon"
              label="Huidige Reeks"
              value={`${userStats.currentStreak} wins`}
              color="accent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Results */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-text-primary mb-4">Recente Resultaten</h2>
            {recentResults?.length === 0 ? (
              <div className="bg-card rounded-lg p-8 text-center">
                <p className="text-text-secondary">Nog geen afgeronde weddenschappen</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentResults?.map((result) => (
                  <RecentResultCard
                    key={result?.id}
                    matchTitle={result?.matchTitle}
                    betType={result?.betType}
                    stake={result?.stake}
                    odds={result?.odds}
                    result={result?.result}
                    payout={result?.payout}
                    settledDate={result?.settledDate}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Deadlines */}
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">Bijna Sluiten</h2>
            {upcomingDeadlines?.length === 0 ? (
              <div className="bg-card rounded-lg p-6 text-center">
                <p className="text-text-secondary">Geen aankomende deadlines</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingDeadlines?.map((deadline) => (
                  <UpcomingDeadlineCard
                    key={deadline?.id}
                    title={deadline?.title}
                    category={deadline?.category}
                    closingTime={deadline?.closingTime}
                    timeRemaining={deadline?.timeRemaining}
                    isLive={deadline?.isLive}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeDashboardInteractive;
