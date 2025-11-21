'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { betService } from '@/services/betService';
import { transactionService } from '@/services/transactionService';
import ProfileHeader from './ProfileHeader';
import ProfileStats from './ProfileStats';
import ProfileForm from './ProfileForm';
import PasswordChange from './PasswordChange';
import TransactionHistory from './TransactionHistory';
import BettingHistory from './BettingHistory';
import Icon from '@/components/ui/AppIcon';

interface User {
  name: string;
  email: string;
  avatar?: string;
  points: number;
  memberSince: string;
}

interface Stats {
  totalBets: number;
  winRate: number;
  biggestWin: number;
  favoriteBetType: string;
  totalWinnings: number;
  totalLosses: number;
}

interface Transaction {
  id: string;
  type: 'bet' | 'win' | 'loss' | 'admin';
  description: string;
  amount: number;
  balance: number;
  timestamp: string;
  details?: string;
}

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

interface AccountInteractiveProps {
  initialUser?: User;
  initialStats?: Stats;
  initialTransactions?: Transaction[];
  initialBets?: Bet[];
}

const AccountInteractive = ({
  initialUser,
  initialStats,
  initialTransactions,
  initialBets,
}: AccountInteractiveProps) => {
  const {
    user: authUser,
    profile,
    updateProfile,
    updateAvatar,
    updateEmail,
    refreshProfile,
  } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);
  const [user, setUser] = useState<User>(
    initialUser ?? {
      name: profile?.fullName ?? 'Gebruiker',
      email: profile?.email ?? '',
      avatar: profile?.avatarUrl ?? undefined,
      points: profile?.pointsBalance ?? 0,
      memberSince: profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString('nl-NL')
        : '',
    }
  );
  const [stats, setStats] = useState<Stats>(
    initialStats ?? {
      totalBets: 0,
      winRate: 0,
      biggestWin: 0,
      favoriteBetType: 'Wedstrijden',
      totalWinnings: 0,
      totalLosses: 0,
    }
  );
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions ?? []);
  const [bets, setBets] = useState<Bet[]>(initialBets ?? []);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'profile' | 'security' | 'transactions' | 'bets'
  >('overview');

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (profile) {
      setUser({
        name: profile.fullName,
        email: profile.email,
        avatar: profile.avatarUrl ?? undefined,
        points: profile.pointsBalance,
        memberSince: new Date(profile.createdAt).toLocaleDateString('nl-NL'),
      });
    }
  }, [profile]);

  useEffect(() => {
    const loadData = async () => {
      if (!authUser) return;
      const userId = authUser.id;

      const statsRes = await userService.getUserStats(userId);
      setStats((prev) => ({
        totalBets: statsRes.totalBets,
        winRate: parseFloat(statsRes.winRate.replace('%', '')),
        biggestWin: 0,
        favoriteBetType: 'Wedstrijden',
        totalWinnings: statsRes.totalWinnings,
        totalLosses: 0,
      }));

      const txRes = await transactionService.getUserTransactions(userId, 50);
      const mappedTx = (txRes.data ?? []).map((t) => ({
        id: t.id,
        type:
          t.transaction_type === 'bet_placed'
            ? 'bet'
            : t.transaction_type.toLowerCase().includes('win')
              ? 'win'
              : t.transaction_type.toLowerCase().includes('loss')
                ? 'loss'
                : 'admin',
        description: t.description,
        amount: t.amount,
        balance: profile?.pointsBalance ?? 0,
        timestamp: new Date(t.created_at).toLocaleString('nl-NL'),
        details: t.bet_id ? `Bet ${t.bet_id}` : undefined,
      }));
      setTransactions(mappedTx);

      const betsRes = await betService.getUserBets(userId);
      const mappedBets = (betsRes.data ?? []).map((b: any) => {
        const opt = b.bet_options;
        const isMatch = opt?.match_id != null;
        const market = isMatch
          ? `${opt?.matches?.home_team ?? ''} vs ${opt?.matches?.away_team ?? ''}`
          : (opt?.fun_bets?.title ?? 'Fun Bet');
        const selection = opt?.option_text ?? '';
        const odds = opt?.odds ?? 1;
        const status = b.status === 'cancelled' ? 'void' : b.status;
        const category: 'match' | 'fun' = isMatch ? 'match' : 'fun';
        return {
          id: b.id,
          market,
          selection,
          stake: b.stake,
          odds,
          potentialReturn: b.potential_payout,
          status,
          placedAt: new Date(b.placed_at).toLocaleString('nl-NL'),
          settledAt: b.settled_at ? new Date(b.settled_at).toLocaleString('nl-NL') : undefined,
          category,
        } as Bet;
      });
      setBets(mappedBets);
    };

    loadData();
  }, [authUser, profile]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background pt-[60px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-muted rounded-lg" />
            <div className="h-96 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  const handleAvatarChange = async (file: File) => {
    const { url, error } = await updateAvatar(file);
    if (url) {
      setUser({ ...user, avatar: url });
      await refreshProfile();
    } else if (error) {
      alert('Upload mislukt. Probeer een ander bestand of later opnieuw.');
    }
  };

  const handleProfileSave = async (data: { name: string; email: string }) => {
    await updateProfile({ fullName: data.name });
    if (data.email && data.email !== user.email) {
      await updateEmail(data.email);
    }
    await refreshProfile();
    setUser({ ...user, ...data });
  };

  const handlePasswordChange = (data: { currentPassword: string; newPassword: string }) => {
    console.log('Password change requested:', data);
  };

  const tabs = [
    { id: 'overview', label: 'Overzicht', icon: 'HomeIcon' },
    { id: 'profile', label: 'Profiel', icon: 'UserIcon' },
    { id: 'security', label: 'Beveiliging', icon: 'LockClosedIcon' },
    { id: 'transactions', label: 'Transacties', icon: 'BanknotesIcon' },
    { id: 'bets', label: 'Weddenschappen', icon: 'TrophyIcon' },
  ];

  return (
    <div className="min-h-screen bg-background pt-[60px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfileHeader user={user} onAvatarChange={handleAvatarChange} />

        {/* Tabs Navigation */}
        <div className="mt-8 border-b border-border overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-micro ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon name={tab.icon as any} size={20} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <ProfileStats stats={stats} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TransactionHistory transactions={transactions.slice(0, 5)} />
                <BettingHistory bets={bets.slice(0, 5)} />
              </div>
            </div>
          )}

          {activeTab === 'profile' && <ProfileForm user={user} onSave={handleProfileSave} />}

          {activeTab === 'security' && <PasswordChange onPasswordChange={handlePasswordChange} />}

          {activeTab === 'transactions' && <TransactionHistory transactions={transactions} />}

          {activeTab === 'bets' && <BettingHistory bets={bets} />}
        </div>
      </div>
    </div>
  );
};

export default AccountInteractive;
