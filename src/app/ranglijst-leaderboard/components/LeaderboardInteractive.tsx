'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import LeaderboardFilters from './LeaderboardFilters';
import LeaderboardTable from './LeaderboardTable';
import RankingCard from './RankingCard';
import UserRankCard from './UserRankCard';
import Icon from '@/components/ui/AppIcon';

interface Achievement {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface RecentBet {
  id: string;
  match: string;
  result: 'win' | 'loss';
  points: number;
}

interface Member {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  avatarAlt: string;
  points: number;
  winRate: number;
  accuracy: number;
  totalBets: number;
  achievements: Achievement[];
  recentBets: RecentBet[];
  rankChange: 'up' | 'down' | 'same';
  rankChangeValue: number;
}

const LeaderboardInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all-time' | 'monthly' | 'weekly'>('all-time');
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const { profile } = useAuth();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    const loadLeaderboard = async () => {
      const { data: profiles } = await (supabase as any)
        .from('user_profiles')
        .select('*')
        .neq('role', 'admin')
        .order('points_balance', { ascending: false })
        .limit(20);
      const built: Member[] = [];
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
        const won = wonCount ?? 0;
        const total = totalCount ?? 0;
        const winRate = total > 0 ? Math.round((won / total) * 100) : 0;
        built.push({
          id: p.id,
          rank: 0,
          name: p.full_name,
          avatar: p.avatar_url ?? 'https://placehold.co/80x80?text=👤',
          avatarAlt: 'Gebruiker avatar',
          points: p.points_balance,
          winRate,
          accuracy: winRate,
          totalBets: totalCount ?? 0,
          achievements: [],
          recentBets: [],
          rankChange: 'same',
          rankChangeValue: 0,
        });
      }
      built.sort((a, b) => b.points - a.points);
      built.forEach((m, i) => (m.rank = i + 1));
      setMembers(built);
    };
    loadLeaderboard();
  }, []);

  const currentUser = members.find((m) => m.id === profile?.id);

  const handleMemberClick = (memberId: string) => {
    setExpandedMemberId(expandedMemberId === memberId ? null : memberId);
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background pt-[60px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-48" />
            <div className="h-32 bg-muted rounded" />
            <div className="h-96 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-[60px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">Ranglijst</h1>
              <p className="text-text-secondary">Top 20 spelers van AVC &apos;69</p>
            </div>
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
              className="md:hidden p-2 bg-muted rounded-sm hover:bg-border transition-micro"
            >
              <Icon name={viewMode === 'table' ? 'Squares2X2Icon' : 'TableCellsIcon'} size={24} />
            </button>
          </div>

          {/* Filters */}
          <LeaderboardFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </div>

        {/* Current User Card */}
        {currentUser && (
          <div className="mb-8">
            <UserRankCard
              rank={currentUser.rank}
              name={currentUser.name}
              avatar={currentUser.avatar}
              avatarAlt={currentUser.avatarAlt}
              points={currentUser.points}
              winRate={currentUser.winRate}
              rankChange={currentUser.rankChange}
              rankChangeValue={currentUser.rankChangeValue}
            />
          </div>
        )}

        {/* Leaderboard */}
        <div className="mb-8">
          {viewMode === 'table' ? (
            <div className="hidden md:block">
              <LeaderboardTable members={members} onMemberClick={handleMemberClick} />
            </div>
          ) : null}

          {/* Mobile Cards View */}
          <div className={`space-y-3 ${viewMode === 'table' ? 'md:hidden' : ''}`}>
            {members.map((member) => (
              <RankingCard
                key={member.id}
                member={member}
                isExpanded={expandedMemberId === member.id}
                onToggle={() => handleMemberClick(member.id)}
              />
            ))}
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-accent/10 border border-accent/20 rounded-md p-4">
          <div className="flex items-start gap-3">
            <Icon
              name="InformationCircleIcon"
              size={20}
              className="text-accent flex-shrink-0 mt-0.5"
            />
            <div>
              <p className="text-sm text-text-primary">
                <strong>Rankings worden elke 5 minuten bijgewerkt.</strong> Punten worden toegekend
                op basis van gewonnen bets en nauwkeurigheid van voorspellingen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardInteractive;
