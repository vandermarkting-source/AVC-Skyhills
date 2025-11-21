'use client';

import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

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

interface LeaderboardTableProps {
  members: Member[];
  onMemberClick: (memberId: string) => void;
}

const LeaderboardTable = ({ members, onMemberClick }: LeaderboardTableProps) => {
  const getTrophyColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-amber-700';
    return 'text-text-secondary';
  };

  const getRankChangeIcon = (change: 'up' | 'down' | 'same') => {
    if (change === 'up') return 'ArrowUpIcon';
    if (change === 'down') return 'ArrowDownIcon';
    return 'MinusIcon';
  };

  const getRankChangeColor = (change: 'up' | 'down' | 'same') => {
    if (change === 'up') return 'text-success';
    if (change === 'down') return 'text-error';
    return 'text-text-secondary';
  };

  return (
    <div className="bg-card border border-border rounded-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Rang
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Speler
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Punten
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider hidden md:table-cell">
                Win Rate
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider hidden lg:table-cell">
                Nauwkeurigheid
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider hidden lg:table-cell">
                Totaal Bets
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map((member) => (
              <tr
                key={member.id}
                onClick={() => onMemberClick(member.id)}
                className={`transition-micro hover:bg-muted cursor-pointer ${
                  member.rank <= 3 ? 'bg-primary/5' : ''
                }`}
              >
                {/* Rank */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    {member.rank <= 3 ? (
                      <Icon
                        name="TrophyIcon"
                        size={24}
                        className={getTrophyColor(member.rank)}
                        variant="solid"
                      />
                    ) : (
                      <span className="text-lg font-bold text-text-primary w-6 text-center">
                        {member.rank}
                      </span>
                    )}
                    {member.rankChangeValue > 0 && (
                      <div className={`flex items-center ${getRankChangeColor(member.rankChange)}`}>
                        <Icon name={getRankChangeIcon(member.rankChange) as any} size={12} />
                        <span className="text-xs font-medium ml-0.5">{member.rankChangeValue}</span>
                      </div>
                    )}
                  </div>
                </td>

                {/* Player */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-muted ring-2 ring-border">
                      {member.avatar ? (
                        <AppImage
                          src={member.avatar}
                          alt={member.avatarAlt}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-sm font-bold text-text-secondary">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-text-primary truncate">{member.name}</p>
                      {member.achievements.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          {member.achievements.slice(0, 3).map((achievement) => (
                            <span
                              key={achievement.id}
                              className="text-sm"
                              title={achievement.description}
                            >
                              {achievement.icon}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Points */}
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Icon name="CurrencyDollarIcon" size={16} className="text-primary" />
                    <span className="font-data font-bold text-text-primary">
                      {member.points.toLocaleString('nl-NL')}
                    </span>
                  </div>
                </td>

                {/* Win Rate */}
                <td className="px-4 py-4 text-right hidden md:table-cell">
                  <span className="font-data font-medium text-text-primary">{member.winRate}%</span>
                </td>

                {/* Accuracy */}
                <td className="px-4 py-4 text-right hidden lg:table-cell">
                  <span className="font-data font-medium text-accent">{member.accuracy}%</span>
                </td>

                {/* Total Bets */}
                <td className="px-4 py-4 text-right hidden lg:table-cell">
                  <span className="font-data font-medium text-text-secondary">
                    {member.totalBets}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardTable;
