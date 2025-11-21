'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import Header from '@/components/common/Header';
import { funBetService } from '@/services/funBetService';
import { matchService } from '@/services/matchService';
import { transactionService } from '@/services/transactionService';
import { supabase } from '@/lib/supabase/client';
import StatsOverview from './StatsOverview';
import MarketCard from './MarketCard';
import CreateMarketModal, { MarketFormData } from './CreateMarketModal';
import UserManagementModal from './UserManagementModal';
import SettlementModal from './SettlementModal';

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

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  points: number;
  totalBets: number;
  winRate: number;
}

interface SettlementOption {
  id: string;
  label: string;
  odds: number;
  totalBets: number;
  totalStake: number;
}

const AdminPanelInteractive = () => {
  const { profile, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<'markets' | 'users' | 'archive'>('markets');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed' | 'settled'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'match' | 'fun'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [editingMarket, setEditingMarket] = useState<MarketFormData | null>(null);
  const [settlingMarket, setSettlingMarket] = useState<{
    title: string;
    options: SettlementOption[];
  } | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [markets, setMarkets] = useState<Market[]>([]);

  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!loading && profile && profile.role !== 'admin') {
      router.push('/home-dashboard');
    }
  }, [loading, profile, router]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const loadMarkets = async () => {
    const now = new Date();
    const funRes = await funBetService.getActiveFunBets();
    const funMarkets: Market[] = await Promise.all(
      (funRes.data ?? []).map(async (fb) => {
        const optionIds = (fb.bet_options ?? []).map((o) => o.id);
        let totalBets = 0;
        let totalStake = 0;
        let participants = 0;
        if (optionIds.length) {
          const { data: bets, count } = await (supabase as any)
            .from('bets')
            .select('user_id, stake', { count: 'exact' })
            .in('bet_option_id', optionIds);
          totalBets = count ?? 0;
          totalStake = (bets ?? []).reduce((s: number, b: any) => s + (b?.stake ?? 0), 0);
          const userIds = new Set((bets ?? []).map((b: any) => b?.user_id));
          participants = userIds.size;
        }
        const status = fb.is_settled
          ? 'settled'
          : new Date(fb.closing_time).getTime() - now.getTime() < 60 * 60 * 1000
            ? 'closed'
            : 'open';
        return {
          id: fb.id,
          title: fb.title,
          category: 'fun',
          status,
          deadline: new Date(fb.closing_time).toLocaleString('nl-NL'),
          totalBets,
          totalStake,
          participants,
        } as Market;
      })
    );
    const matchRes = await matchService.getUpcomingMatches();
    const matchMarkets: Market[] = await Promise.all(
      (matchRes.data ?? []).map(async (m) => {
        const optionIds = (m.bet_options ?? []).map((o) => o.id);
        let totalBets = 0;
        let totalStake = 0;
        let participants = 0;
        if (optionIds.length) {
          const { data: bets, count } = await (supabase as any)
            .from('bets')
            .select('user_id, stake', { count: 'exact' })
            .in('bet_option_id', optionIds);
          totalBets = count ?? 0;
          totalStake = (bets ?? []).reduce((s: number, b: any) => s + (b?.stake ?? 0), 0);
          const userIds = new Set((bets ?? []).map((b: any) => b?.user_id));
          participants = userIds.size;
        }
        return {
          id: m.id,
          title: `${m.home_team} vs ${m.away_team}`,
          category: 'match',
          status: (m.status as any) === 'finished' ? 'settled' : 'open',
          deadline: new Date(m.closing_time as any).toLocaleString('nl-NL'),
          totalBets,
          totalStake,
          participants,
        } as Market;
      })
    );
    setMarkets([...funMarkets, ...matchMarkets]);
  };

  useEffect(() => {
    loadMarkets();
  }, []);

  const loadUsers = async () => {
    const { data: profiles } = await (supabase as any)
      .from('user_profiles')
      .select('*')
      .order('full_name', { ascending: true });
    const result: User[] = [];
    for (const p of profiles ?? []) {
      const { count: totalCount } = await (supabase as any)
        .from('bets')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', p.id);
      const { count: wonCount } = await (supabase as any)
        .from('bets')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', p.id)
        .eq('status', 'won');
      const total = totalCount ?? 0;
      const won = wonCount ?? 0;
      const winRate = total > 0 ? Math.round((won / total) * 100) : 0;
      result.push({
        id: p.id,
        name: p.full_name,
        email: p.email,
        avatar: p.avatar_url ?? undefined,
        points: p.points_balance,
        totalBets: totalCount ?? 0,
        winRate,
      });
    }
    setUsers(result);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-[60px]" />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-muted rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && profile && profile.role !== 'admin') {
    return null;
  }

  const stats = [
    {
      label: 'Actieve markten',
      value: markets.filter((m) => m.status === 'open').length,
      icon: 'ChartBarIcon',
      trend: { value: '+3', isPositive: true },
    },
    {
      label: 'Totale inzet vandaag',
      value: `${markets.reduce((sum, m) => sum + m.totalStake, 0).toLocaleString('nl-NL')} punten`,
      icon: 'CurrencyDollarIcon',
      trend: { value: '+12%', isPositive: true },
    },
    {
      label: 'Actieve gebruikers',
      value: users.length,
      icon: 'UserGroupIcon',
    },
    {
      label: 'Af te rekenen',
      value: markets.filter((m) => m.status === 'closed').length,
      icon: 'ClockIcon',
    },
  ];

  const filteredMarkets = markets.filter((market) => {
    const matchesStatus = filterStatus === 'all' || market.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || market.category === filterCategory;
    const matchesSearch = market.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const handleCreateMarket = async (data: MarketFormData) => {
    if (data.category === 'fun') {
      const { data: funData, error } = await supabase
        .from('fun_bets')
        .insert({
          title: data.title,
          description: data.description,
          category: 'general',
          closing_time: new Date(data.deadline).toISOString(),
          is_settled: false,
        } as any)
        .select('id')
        .single();
      const funId = (funData as any)?.id;
      if (!error && funId) {
        for (const opt of data.options) {
          await supabase.from('bet_options').insert({
            fun_bet_id: funId,
            option_text: opt.label,
            odds: parseFloat(opt.odds),
            is_winner: false,
          } as any);
        }
      }
    } else {
      let home = (data.homeTeam ?? '').trim();
      let away = (data.awayTeam ?? '').trim();
      if (!home || !away) {
        const parts = data.title.split(' vs ');
        if (parts.length === 2) {
          home = parts[0].trim();
          away = parts[1].trim();
        }
      }
      if (home && away) {
        const { data: matchRow } = await supabase
          .from('matches')
          .select('id')
          .eq('home_team', home)
          .eq('away_team', away)
          .single();
        let matchId = (matchRow as any)?.id as string | null;
        if (!matchId) {
          const { data: inserted } = await supabase
            .from('matches')
            .insert({
              home_team: home,
              away_team: away,
              match_date: new Date(data.deadline).toISOString(),
              closing_time: new Date(data.deadline).toISOString(),
              status: 'upcoming',
            } as any)
            .select('id')
            .single();
          matchId = (inserted as any)?.id ?? null;
        }
        if (matchId) {
          for (const opt of data.options) {
            await supabase.from('bet_options').insert({
              match_id: matchId,
              option_text: opt.label,
              odds: parseFloat(opt.odds),
              is_winner: false,
            } as any);
          }
        }
      }
    }
    setSuccessMessage('Markt succesvol aangemaakt');
    await loadMarkets();
  };

  const handleResetMarkets = async () => {
    await supabase.from('bet_options').delete().neq('id', '');
    await supabase.from('fun_bets').delete().neq('id', '');
    await supabase.from('matches').delete().neq('id', '');
    await loadMarkets();
    setSuccessMessage('Alle weddenschappen verwijderd');
  };

  const handleEditMarket = (id: string) => {
    const market = markets.find((m) => m.id === id);
    if (market) {
      setEditingMarket({
        id: market.id,
        title: market.title,
        category: market.category,
        description: '',
        deadline: '',
        options: [],
      });
      setShowCreateModal(true);
    }
  };

  const handleCloseMarket = (id: string) => {
    setMarkets(markets.map((m) => (m.id === id ? { ...m, status: 'closed' as const } : m)));
    setSuccessMessage('Markt gesloten');
  };

  const handleSettleMarket = async (id: string) => {
    const market = markets.find((m) => m.id === id);
    if (!market) return;
    const isFun = market.category === 'fun';
    const { data: options } = await (supabase as any)
      .from('bet_options')
      .select('id, option_text, odds')
      .eq(isFun ? 'fun_bet_id' : 'match_id', id);
    const settlementOptions: SettlementOption[] = [];
    for (const opt of options ?? []) {
      const { data: bets, count } = await (supabase as any)
        .from('bets')
        .select('stake', { count: 'exact' })
        .eq('bet_option_id', opt.id)
        .eq('status', 'pending');
      const totalStake = (bets ?? []).reduce((s: number, b: any) => s + (b?.stake ?? 0), 0);
      settlementOptions.push({
        id: opt.id,
        label: opt.option_text,
        odds: opt.odds,
        totalBets: count ?? 0,
        totalStake,
      });
    }
    setSettlingMarket({ title: market.title, options: settlementOptions });
    setShowSettlementModal(true);
  };

  const handleConfirmSettle = async (winningOptionId: string) => {
    if (!settlingMarket) return;
    const market = markets.find((m) => m.title === settlingMarket.title);
    if (!market) return;

    const isFun = market.category === 'fun';
    const { data: optionRows } = await (supabase as any)
      .from('bet_options')
      .select('id, odds')
      .eq(isFun ? 'fun_bet_id' : 'match_id', market.id);
    const optionIds = (optionRows ?? []).map((o: any) => o.id);
    const winning = (optionRows ?? []).find((o: any) => o.id === winningOptionId);
    const winningOdds = winning?.odds ?? 1;

    await (supabase as any)
      .from('bet_options')
      .update({ is_winner: false })
      .eq(isFun ? 'fun_bet_id' : 'match_id', market.id);
    await (supabase as any)
      .from('bet_options')
      .update({ is_winner: true })
      .eq('id', winningOptionId);

    const { data: bets } = await (supabase as any)
      .from('bets')
      .select('*')
      .in('bet_option_id', optionIds)
      .eq('status', 'pending');

    for (const b of bets ?? []) {
      if (b.bet_option_id === winningOptionId) {
        const payout = Math.round((b.stake as number) * winningOdds);
        await (supabase as any)
          .from('bets')
          .update({ status: 'won', actual_payout: payout, settled_at: new Date().toISOString() })
          .eq('id', b.id);
        let rpcError: Error | null = null;
        try {
          const { error } = await (supabase as any).rpc('update_user_balance', {
            p_user_id: b.user_id,
            p_amount: payout,
          });
          rpcError = error ?? null;
        } catch (e) {
          rpcError = e as Error;
        }
        if (rpcError) {
          const { data: curr } = await (supabase as any)
            .from('user_profiles')
            .select('points_balance')
            .eq('id', b.user_id)
            .single();
          const newBalance = ((curr?.points_balance as number) ?? 0) + payout;
          await (supabase as any)
            .from('user_profiles')
            .update({ points_balance: newBalance })
            .eq('id', b.user_id);
        }
        await transactionService.addTransaction({
          user_id: b.user_id,
          amount: payout,
          transaction_type: 'win_payout',
          description: 'Uitbetaling winst',
          bet_id: b.id,
        });
      } else {
        await (supabase as any)
          .from('bets')
          .update({ status: 'lost', actual_payout: 0, settled_at: new Date().toISOString() })
          .eq('id', b.id);
        await transactionService.addTransaction({
          user_id: b.user_id,
          amount: 0,
          transaction_type: 'loss_settle',
          description: 'Afrekening verlies',
          bet_id: b.id,
        });
      }
    }

    if (isFun) {
      await (supabase as any).from('fun_bets').update({ is_settled: true }).eq('id', market.id);
    } else {
      await (supabase as any).from('matches').update({ status: 'finished' }).eq('id', market.id);
    }

    await loadMarkets();
    await refreshProfile();
    setSuccessMessage('Markt afgerekend en punten uitbetaald');
  };

  const handleDeleteMarket = async (id: string) => {
    const market = markets.find((m) => m.id === id);
    if (!market) return;
    if (market.category === 'fun') {
      await supabase.from('fun_bets').delete().eq('id', id);
      await supabase.from('bet_options').delete().eq('fun_bet_id', id);
    } else {
      await supabase.from('bet_options').delete().eq('match_id', id);
      await supabase.from('matches').delete().eq('id', id);
    }
    await loadMarkets();
    setSuccessMessage('Markt verwijderd');
  };

  const handleResetBets = async () => {
    await supabase.from('bets').delete().neq('id', '');
    await supabase.from('transactions').delete().neq('id', '');
    setSuccessMessage('Alle gebruikersweddenschappen verwijderd');
  };

  const handleResetAccounts = async () => {
    await (supabase as any).from('user_profiles').update({ points_balance: 1000 }).neq('id', '');
    await loadUsers();
    await refreshProfile();
    setSuccessMessage('Alle accounts teruggezet naar 1000 punten');
  };

  // removed duplicate definition

  const handleAdjustPoints = async (userId: string, amount: number) => {
    let rpcError: Error | null = null;
    try {
      const { error } = await (supabase as any).rpc('update_user_balance', {
        p_user_id: userId,
        p_amount: amount,
      });
      rpcError = error ?? null;
    } catch (e) {
      rpcError = e as Error;
    }

    if (rpcError) {
      const { data: current, error: selError } = await (supabase as any)
        .from('user_profiles')
        .select('points_balance')
        .eq('id', userId)
        .single();
      if (selError) {
        setSuccessMessage('Fout bij ophalen punten');
        return;
      }
      const newBalance = ((current?.points_balance as number) ?? 0) + amount;
      const { error: updError } = await (supabase as any)
        .from('user_profiles')
        .update({ points_balance: newBalance })
        .eq('id', userId);
      if (updError) {
        setSuccessMessage('Fout bij aanpassen punten');
        return;
      }
    }

    await transactionService.addTransaction({
      user_id: userId,
      amount: amount,
      transaction_type: 'admin_adjustment',
      description: amount >= 0 ? `Admin: +${amount} punten` : `Admin: ${amount} punten`,
    });

    await loadUsers();
    await refreshProfile();
    setSuccessMessage('Punten aangepast voor gebruiker');
  };

  const handleResetAllPoints = async () => {
    await (supabase as any).from('user_profiles').update({ points_balance: 1000 }).neq('id', '');
    await loadUsers();
    await refreshProfile();
    setSuccessMessage('Alle gebruikerspunten gereset naar 1.000');
  };

  const handlePurgeUsers = async () => {
    const { data: profiles } = await (supabase as any)
      .from('user_profiles')
      .select('id, full_name, email, role');
    const keepIds = new Set<string>();
    for (const p of profiles ?? []) {
      const name = String(p.full_name ?? '').toLowerCase();
      const email = String(p.email ?? '').toLowerCase();
      const isAdmin = String(p.role ?? '') === 'admin';
      const isThom = name === 'thom' || email.includes('thom');
      const isAvcAdmin = name.includes('avc') && name.includes('admin');
      if (isAdmin || isThom || isAvcAdmin) {
        keepIds.add(p.id as string);
      }
    }
    const deleteIds = (profiles ?? [])
      .map((p: any) => p.id as string)
      .filter((id: string) => !keepIds.has(id));
    if (deleteIds.length === 0) {
      setSuccessMessage('Geen gebruikers om te verwijderen');
      return;
    }
    await (supabase as any).from('bets').delete().in('user_id', deleteIds);
    await (supabase as any).from('transactions').delete().in('user_id', deleteIds);
    await (supabase as any).from('user_profiles').delete().in('id', deleteIds);
    await loadUsers();
    await refreshProfile();
    setSuccessMessage('Gebruikers opgeschoond');
  };

  const currentUser = {
    name: 'Admin Gebruiker',
    email: 'admin@avc69.nl',
    points: 0,
    role: 'admin' as const,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-[60px]" />

      {successMessage && (
        <div className="fixed top-20 right-4 bg-success text-success-foreground px-4 py-3 rounded-md shadow-modal z-notification flex items-center gap-2 animate-pulse-subtle">
          <Icon name="CheckCircleIcon" size={20} />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-warning/10 rounded-md flex items-center justify-center">
              <Icon name="Cog6ToothIcon" size={24} className="text-warning" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Admin Panel</h1>
              <p className="text-text-secondary">
                Beheer markten, gebruikers en platform instellingen
              </p>
            </div>
          </div>
        </div>

        <StatsOverview stats={stats} />

        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('markets')}
              className={`px-4 py-2 rounded-sm font-medium transition-micro ${
                activeTab === 'markets'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-text-primary hover:bg-muted'
              }`}
            >
              Markten
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-sm font-medium transition-micro ${
                activeTab === 'users'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-text-primary hover:bg-muted'
              }`}
            >
              Gebruikers
            </button>
            <button
              onClick={() => setActiveTab('archive')}
              className={`px-4 py-2 rounded-sm font-medium transition-micro ${
                activeTab === 'archive'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-text-primary hover:bg-muted'
              }`}
            >
              Archief
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowUserModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-sm hover:bg-muted transition-micro"
            >
              <Icon name="UserGroupIcon" size={20} />
              <span className="hidden sm:inline">Gebruikersbeheer</span>
            </button>
            <button
              onClick={() => {
                setEditingMarket(null);
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-secondary transition-micro font-medium"
            >
              <Icon name="PlusIcon" size={20} />
              <span>Nieuwe markt</span>
            </button>
          </div>
        </div>

        {activeTab === 'markets' && (
          <>
            <div className="bg-card border border-border rounded-md p-4 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Icon
                    name="MagnifyingGlassIcon"
                    size={20}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                  />

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Zoek markten..."
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={handleResetMarkets}
                    className="px-3 py-2 bg-error text-error-foreground rounded-sm hover:bg-error/80 transition-micro"
                  >
                    Reset weddenschappen
                  </button>
                  <button
                    onClick={handleResetBets}
                    className="px-3 py-2 bg-warning text-warning-foreground rounded-sm hover:bg-warning/80 transition-micro"
                  >
                    Reset bets
                  </button>
                  <button
                    onClick={handleResetAccounts}
                    className="px-3 py-2 bg-muted text-text-primary rounded-sm hover:bg-muted/80 transition-micro border border-border"
                  >
                    Reset accounts
                  </button>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-3 py-2 border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">Alle statussen</option>
                    <option value="open">Open</option>
                    <option value="closed">Gesloten</option>
                    <option value="settled">Afgerekend</option>
                  </select>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value as any)}
                    className="px-3 py-2 border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">Alle categorieën</option>
                    <option value="match">Wedstrijden</option>
                    <option value="fun">Fun Bets</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredMarkets.map((market) => (
                <MarketCard
                  key={market.id}
                  market={market}
                  onEdit={handleEditMarket}
                  onClose={handleCloseMarket}
                  onSettle={handleSettleMarket}
                  onDelete={handleDeleteMarket}
                />
              ))}
            </div>

            {filteredMarkets.length === 0 && (
              <div className="text-center py-12">
                <Icon name="InboxIcon" size={48} className="text-text-secondary mx-auto mb-3" />
                <p className="text-text-secondary">Geen markten gevonden</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'users' && (
          <div className="bg-card border border-border rounded-md p-6">
            <div className="text-center py-8">
              <Icon name="UserGroupIcon" size={48} className="text-primary mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">Gebruikersbeheer</h3>
              <p className="text-text-secondary mb-4">
                Beheer gebruikerspunten en bekijk statistieken
              </p>
              <button
                onClick={() => setShowUserModal(true)}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-secondary transition-micro font-medium"
              >
                Open gebruikersbeheer
              </button>
              <div className="mt-4 flex items-center justify-center">
                <button
                  onClick={handlePurgeUsers}
                  className="px-6 py-2 bg-error text-error-foreground rounded-sm hover:bg-error/80 transition-micro font-medium"
                >
                  Verwijder alle behalve Thom en AVC admin
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'archive' && (
          <div className="bg-card border border-border rounded-md p-6">
            <div className="text-center py-8">
              <Icon name="ArchiveBoxIcon" size={48} className="text-text-secondary mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">Archief</h3>
              <p className="text-text-secondary">Bekijk afgeronde markten en historische data</p>
            </div>
          </div>
        )}
      </div>

      <CreateMarketModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingMarket(null);
        }}
        onSubmit={handleCreateMarket}
        editData={editingMarket}
      />

      <UserManagementModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        users={users}
        onAdjustPoints={handleAdjustPoints}
        onResetAllPoints={handleResetAllPoints}
      />

      {settlingMarket && (
        <SettlementModal
          isOpen={showSettlementModal}
          onClose={() => {
            setShowSettlementModal(false);
            setSettlingMarket(null);
          }}
          marketTitle={settlingMarket.title}
          options={settlingMarket.options}
          onSettle={handleConfirmSettle}
        />
      )}
    </div>
  );
};

export default AdminPanelInteractive;
