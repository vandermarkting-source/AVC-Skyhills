'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { betService } from '@/services/betService';
import { supabase } from '@/lib/supabase/client';

interface ListBet {
  id: string;
  title: string;
  option: string;
  stake: number;
  potentialWin: number;
  status: 'pending' | 'won' | 'lost' | 'cancelled';
  emoji: string;
  userName?: string;
}

export default function MijnInzettenBetsPage() {
  const { user } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);
  const [myBets, setMyBets] = useState<ListBet[]>([]);
  const [recentBets, setRecentBets] = useState<ListBet[]>([]);
  const [totalToday, setTotalToday] = useState<number>(0);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data: mine } = await betService.getUserBets(user.id, 'pending');
      const myMapped: ListBet[] = (mine ?? []).map((b: any) => {
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
          status: b.status,
          emoji,
        };
      });
      setMyBets(myMapped);
    };
    load();
  }, [user]);

  useEffect(() => {
    const refreshRecent = async () => {
      const resp = await fetch('/api/recent-bets', { cache: 'no-store' });
      const json = await resp.json();
      const recMapped: ListBet[] = (json?.items ?? []).map((b: any) => ({
        id: b.id,
        title: b.title,
        option: b.option,
        stake: b.stake,
        potentialWin: b.potentialWin,
        status: b.status,
        emoji: b.title?.includes('vs') ? '🏐' : '🎯',
        userName: b.userName,
      }));
      setRecentBets(recMapped);
      setTotalToday(Number(json?.totalToday ?? 0));
    };

    const ch = (supabase as any)
      .channel('recent_bets_live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bets' },
        async (payload: any) => {
          await refreshRecent();
          if (user && payload?.new?.user_id === user.id) {
            const { data: mine } = await betService.getUserBets(user.id, 'pending');
            const myMapped: ListBet[] = (mine ?? []).map((b: any) => {
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
                status: b.status,
                emoji,
              };
            });
            setMyBets(myMapped);
          }
        }
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'bets' }, async () => {
        await refreshRecent();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bets' }, async () => {
        await refreshRecent();
      })
      .subscribe();
    return () => {
      try {
        (supabase as any).removeChannel(ch);
      } catch (e) {
        void e;
      }
    };
    const timer = setInterval(refreshRecent, 60000);
    refreshRecent();
    return () => {
      try {
        (supabase as any).removeChannel(ch);
      } catch (e) {
        void e;
      }
      clearInterval(timer);
    };
  }, []);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="h-[60px]" />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-24 bg-muted rounded" />
              <div className="h-24 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-[60px] px-5 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Icon name="TicketIcon" size={28} className="text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary">Inzetten</h1>
            </div>
            <div className="bg-card border border-border rounded-md p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Totale inzet vandaag</span>
                <span className="font-data font-semibold text-primary">{totalToday} pts</span>
              </div>
            </div>
          </div>

          {/* Mijn inzetten */}
          <div className="bg-card border border-border rounded-md p-4 mb-8">
            {myBets.length === 0 ? (
              <div className="text-text-secondary">Je hebt nog geen openstaande inzetten.</div>
            ) : (
              <div className="space-y-3">
                {myBets.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between p-3 border border-border rounded-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl" role="img" aria-label="bet">
                        {b.emoji}
                      </span>
                      <div>
                        <div className="font-semibold text-text-primary">{b.title}</div>
                        <div className="text-sm text-text-secondary">Jouw keuze: {b.option}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-text-secondary">Inzet</div>
                      <div className="font-data font-semibold text-text-primary">
                        {b.stake} punten
                      </div>
                      <div className="text-sm text-text-secondary">Mogelijke winst</div>
                      <div className="font-data font-semibold text-success">
                        {b.potentialWin} punten
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recente inzetten (alle spelers) */}
          <div className="mb-6 flex items-center gap-2">
            <Icon name="ClockIcon" size={20} className="text-text-secondary" />
            <h2 className="text-xl font-semibold text-text-primary">Recente inzetten</h2>
          </div>
          <div className="space-y-2">
            {recentBets.length === 0 ? (
              <div className="bg-card border border-border rounded-md p-4 text-text-secondary">
                Nog geen recente inzetten.
              </div>
            ) : (
              recentBets.map((b) => (
                <div
                  key={b.id}
                  className="bg-card border border-border rounded-sm p-2 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl" role="img" aria-label="bet">
                      {b.emoji}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-text-primary">{b.title}</div>
                      <div className="text-xs text-text-secondary">Door {b.userName}</div>
                      <div className="text-xs text-text-secondary">Optie: {b.option}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-text-secondary">Inzet</div>
                    <div className="font-data font-semibold text-text-primary text-sm">
                      {b.stake} pts
                    </div>
                    <div className="text-[11px] text-text-secondary">Mogelijke winst</div>
                    <div className="font-data font-semibold text-success text-sm">
                      {b.potentialWin} pts
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
