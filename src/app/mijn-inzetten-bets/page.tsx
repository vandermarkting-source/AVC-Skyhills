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

      const { data: recent } = await betService.getRecentBets(20);
      const userIds = Array.from(new Set((recent ?? []).map((b: any) => b.user_id).filter(Boolean)));
      let nameMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: users } = await (supabase as any)
          .from('user_profiles')
          .select('id, full_name')
          .in('id', userIds);
        for (const u of users ?? []) {
          nameMap[u.id as string] = (u.full_name as string) ?? '';
        }
      }
      const recMapped: ListBet[] = (recent ?? []).map((b: any) => {
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
          userName: nameMap[b.user_id as string] ?? 'Onbekend',
        };
      });
      setRecentBets(recMapped);
    };
    load();
  }, [user]);

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
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Icon name="TicketIcon" size={28} className="text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary">Mijn inzetten</h1>
            </div>
            <p className="text-text-secondary">Overzicht van jouw lopende inzetten</p>
          </div>

          {/* Mijn inzetten */}
          <div className="bg-card border border-border rounded-md p-4 mb-8">
            {myBets.length === 0 ? (
              <div className="text-text-secondary">Je hebt nog geen openstaande inzetten.</div>
            ) : (
              <div className="space-y-3">
                {myBets.map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-3 border border-border rounded-sm">
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
                      <div className="font-data font-semibold text-text-primary">{b.stake} punten</div>
                      <div className="text-sm text-text-secondary">Mogelijke winst</div>
                      <div className="font-data font-semibold text-success">{b.potentialWin} punten</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recente inzetten */}
          <div className="mb-6 flex items-center gap-2">
            <Icon name="ClockIcon" size={20} className="text-text-secondary" />
            <h2 className="text-xl font-semibold text-text-primary">Recente inzetten</h2>
          </div>
          <div className="space-y-3">
            {recentBets.length === 0 ? (
              <div className="bg-card border border-border rounded-md p-4 text-text-secondary">Nog geen recente inzetten.</div>
            ) : (
              recentBets.map((b) => (
                <div key={b.id} className="bg-card border border-border rounded-md p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" role="img" aria-label="bet">
                      {b.emoji}
                    </span>
                    <div>
                      <div className="font-medium text-text-primary">{b.title}</div>
                      <div className="text-xs text-text-secondary">Door {b.userName}</div>
                      <div className="text-sm text-text-secondary">Optie: {b.option}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-text-secondary">Inzet</div>
                    <div className="font-data font-semibold text-text-primary">{b.stake} punten</div>
                    <div className="text-xs text-text-secondary">Mogelijke winst</div>
                    <div className="font-data font-semibold text-success">{b.potentialWin} punten</div>
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