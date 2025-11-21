'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/common/Header';
import FunBetCard from './FunBetCard';
import CategoryFilter from './CategoryFilter';
import ActiveBetsPanel from './ActiveBetsPanel';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { funBetService } from '@/services/funBetService';
import { betService } from '@/services/betService';

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

interface Category {
  id: string;
  label: string;
  emoji: string;
  count: number;
}

interface ActiveBet {
  id: string;
  title: string;
  option: string;
  stake: number;
  potentialWin: number;
  emoji: string;
  status: 'pending' | 'won' | 'lost';
}

interface UserData {
  name: string;
  email: string;
  avatar?: string;
  points: number;
  role: 'user' | 'admin';
}

const FunBetsInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const { user, profile, refreshProfile } = useAuth();
  const userPoints = profile?.pointsBalance ?? 0;
  const [reservedPoints, setReservedPoints] = useState(0);
  const [isPlacing, setIsPlacing] = useState(false);
  const [activeBets, setActiveBets] = useState<ActiveBet[]>([]);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const mockUser: UserData = {
    name: 'Jan de Vries',
    email: 'jan.devries@avc69.nl',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    points: userPoints,
    role: 'user',
  };

  const [categories, setCategories] = useState<Category[]>([
    { id: 'all', label: 'Alle categorieën', emoji: '🎯', count: 0 },
  ]);

  const [funBets, setFunBets] = useState<FunBet[]>([]);

  useEffect(() => {
    const loadFunBets = async () => {
      const { data } = await funBetService.getActiveFunBets();
      const mapEmoji = (category: string) => {
        switch (category) {
          case 'attendance':
            return '👥';
          case 'social':
            return '🎉';
          case 'challenges':
            return '🏆';
          default:
            return '🎯';
        }
      };
      const now = new Date();
      const mapped: FunBet[] = (data ?? []).map((fb) => {
        const closing = new Date(fb.closing_time);
        const status: 'open' | 'closing-soon' | 'closed' = fb.is_settled
          ? 'closed'
          : now.getTime() >= closing.getTime()
            ? 'closed'
            : closing.getTime() - now.getTime() < 60 * 60 * 1000
              ? 'closing-soon'
              : 'open';
        return {
          id: fb.id,
          title: fb.title,
          category: fb.category,
          emoji: mapEmoji(fb.category),
          options: (fb.bet_options ?? []).map((o) => ({
            id: o.id,
            label: o.option_text,
            odds: o.odds,
          })),
          deadline: new Date(fb.closing_time).toLocaleString('nl-NL'),
          participants: 0,
          status,
          isPopular: false,
        };
      });
      setFunBets(mapped);
      const counts: Record<string, number> = {};
      for (const fb of mapped) counts[fb.category] = (counts[fb.category] ?? 0) + 1;
      const dynamicCats: Category[] = [
        { id: 'all', label: 'Alle categorieën', emoji: '🎯', count: mapped.length },
        ...Object.keys(counts).map((id) => ({
          id,
          label:
            id === 'attendance'
              ? 'Aanwezigheid'
              : id === 'tardiness'
                ? 'Te laat komen'
                : id === 'social'
                  ? 'Sociale evenementen'
                  : id === 'challenges'
                    ? 'Uitdagingen'
                    : id,
          emoji: mapEmoji(id),
          count: counts[id],
        })),
      ];
      setCategories(dynamicCats);
    };
    loadFunBets();
  }, []);

  useEffect(() => {
    const loadActive = async () => {
      if (!user) return;
      const { data } = await betService.getUserBets(user.id, 'pending');
      const mapped: ActiveBet[] = (data ?? []).map((b: any) => {
        const isMatch = !!b.bet_options?.match_id;
        const title = isMatch
          ? `${b.bet_options?.matches?.home_team ?? ''} vs ${b.bet_options?.matches?.away_team ?? ''}`
          : (b.bet_options?.fun_bets?.title ?? 'Fun Bet');
        const option = b.bet_options?.option_text ?? '';
        const emoji = isMatch ? '🏐' : '🎯';
        return {
          id: b.id,
          title,
          option,
          stake: b.stake,
          potentialWin: b.potential_payout,
          emoji,
          status: 'pending',
        };
      });
      setActiveBets(mapped);
    };
    loadActive();
  }, [user]);

  useEffect(() => {
    const loadReserved = async () => {
      if (!user) return;
      const sum = await betService.getReservedStakeSum(user.id);
      setReservedPoints(sum.total);
    };
    loadReserved();
  }, [user]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePlaceBet = async (betId: string, optionId: string, stake: number) => {
    if (!user) {
      showNotification('error', 'Log in om te wedden');
      return;
    }
    const available = Math.max(userPoints - reservedPoints, 0);
    if (stake > available) {
      showNotification('error', 'Onvoldoende punten beschikbaar');
      return;
    }
    if (isPlacing) return;
    setIsPlacing(true);

    const bet = funBets.find((b) => b.id === betId);
    const option = bet?.options.find((o) => o.id === optionId);
    if (!bet || !option) return;

    const potentialWin = Math.round(stake * option.odds);
    const { error } = await betService.placeBet({
      user_id: user.id,
      bet_option_id: option.id,
      stake,
      potential_payout: potentialWin,
      status: 'pending',
    } as any);
    if (error) {
      showNotification('error', 'Plaatsen mislukt');
      setIsPlacing(false);
      return;
    }

    setActiveBets([
      ...activeBets,
      {
        id: `${betId}-${Date.now()}`,
        title: bet.title,
        option: option.label,
        stake,
        potentialWin,
        emoji: bet.emoji,
        status: 'pending',
      },
    ]);
    await refreshProfile();
    const sum = await betService.getReservedStakeSum(user.id);
    setReservedPoints(sum.total);
    showNotification('success', `Weddenschap geplaatst! ${stake} punten ingezet.`);
    setIsPlacing(false);
  };

  const filteredBets =
    activeCategory === 'all' ? funBets : funBets.filter((bet) => bet.category === activeCategory);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-[60px] bg-surface border-b border-border" />
        <div className="pt-[60px]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/3" />
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 h-64 bg-muted rounded" />
                <div className="lg:col-span-3 space-y-4">
                  <div className="h-48 bg-muted rounded" />
                  <div className="h-48 bg-muted rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-[60px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-primary rounded-md flex items-center justify-center">
                <Icon name="SparklesIcon" size={24} className="text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-text-primary">Fun Bets</h1>
                <p className="text-text-secondary">Voorspel clubevenementen en win punten!</p>
              </div>
            </div>
          </div>

          {/* Notification */}
          {notification && (
            <div
              className={`mb-6 p-4 rounded-md border ${
                notification.type === 'success'
                  ? 'bg-success/10 border-success text-success'
                  : 'bg-error/10 border-error text-error'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon
                  name={notification.type === 'success' ? 'CheckCircleIcon' : 'XCircleIcon'}
                  size={20}
                />
                <span className="font-medium">{notification.message}</span>
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <CategoryFilter
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
              <ActiveBetsPanel bets={activeBets} />
            </div>

            {/* Fun Bets Grid */}
            <div className="lg:col-span-3">
              {filteredBets.length === 0 ? (
                <div className="bg-card border border-border rounded-md shadow-card p-12 text-center">
                  <Icon name="InboxIcon" size={64} className="text-text-secondary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    Geen weddenschappen gevonden
                  </h3>
                  <p className="text-text-secondary">Probeer een andere categorie te selecteren</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {filteredBets.map((bet) => (
                    <FunBetCard
                      key={bet.id}
                      bet={bet}
                      userPoints={Math.max(userPoints - reservedPoints, 0)}
                      onPlaceBet={handlePlaceBet}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FunBetsInteractive;
