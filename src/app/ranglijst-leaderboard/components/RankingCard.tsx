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

interface RankingCardProps {
  member: Member;
  isExpanded: boolean;
  onToggle: () => void;
}

const RankingCard = ({ member, isExpanded, onToggle }: RankingCardProps) => {
  const getTrophyColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-amber-700';
    return 'text-text-secondary';
  };

  const getRankChangeIcon = () => {
    if (member.rankChange === 'up') return 'ArrowUpIcon';
    if (member.rankChange === 'down') return 'ArrowDownIcon';
    return 'MinusIcon';
  };

  const getRankChangeColor = () => {
    if (member.rankChange === 'up') return 'text-success';
    if (member.rankChange === 'down') return 'text-error';
    return 'text-text-secondary';
  };

  return (
    <div
      className={`bg-card border border-border rounded-md transition-all ${
        member.rank <= 3 ? 'ring-2 ring-primary/20' : ''
      } ${isExpanded ? 'shadow-elevated' : 'shadow-card hover:shadow-modal'}`}
    >
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-4 text-left transition-micro hover:bg-muted/50"
      >
        {/* Rank & Trophy */}
        <div className="flex-shrink-0 w-12 flex flex-col items-center gap-1">
          {member.rank <= 3 ? (
            <Icon
              name="TrophyIcon"
              size={28}
              className={getTrophyColor(member.rank)}
              variant="solid"
            />
          ) : (
            <span className="text-2xl font-bold text-text-primary">{member.rank}</span>
          )}
          {member.rankChangeValue > 0 && (
            <div className={`flex items-center gap-0.5 ${getRankChangeColor()}`}>
              <Icon name={getRankChangeIcon() as any} size={12} />
              <span className="text-xs font-medium">{member.rankChangeValue}</span>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 w-14 h-14 rounded-full overflow-hidden bg-muted ring-2 ring-border">
          {member.avatar ? (
            <AppImage
              src={member.avatar}
              alt={member.avatarAlt}
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-lg font-bold text-text-secondary">
                {member.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Member Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-text-primary truncate">{member.name}</h3>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1">
              <Icon name="CurrencyDollarIcon" size={16} className="text-primary" />
              <span className="font-data font-medium text-text-primary">
                {member.points.toLocaleString('nl-NL')}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="ChartBarIcon" size={16} className="text-text-secondary" />
              <span className="text-sm text-text-secondary">{member.winRate}%</span>
            </div>
          </div>
        </div>

        {/* Expand Icon */}
        <Icon
          name="ChevronDownIcon"
          size={20}
          className={`flex-shrink-0 text-text-secondary transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border">
          {/* Statistics */}
          <div className="grid grid-cols-3 gap-3 pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{member.winRate}%</p>
              <p className="text-xs text-text-secondary mt-1">Win Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">{member.accuracy}%</p>
              <p className="text-xs text-text-secondary mt-1">Nauwkeurigheid</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-text-primary">{member.totalBets}</p>
              <p className="text-xs text-text-secondary mt-1">Totaal Bets</p>
            </div>
          </div>

          {/* Achievements */}
          {member.achievements.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                <Icon name="StarIcon" size={16} className="text-primary" variant="solid" />
                Prestaties
              </h4>
              <div className="flex flex-wrap gap-2">
                {member.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-sm"
                    title={achievement.description}
                  >
                    <span className="text-lg">{achievement.icon}</span>
                    <span className="text-xs font-medium text-text-primary">
                      {achievement.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Bets */}
          {member.recentBets.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                <Icon name="ClockIcon" size={16} className="text-text-secondary" />
                Recente Activiteit
              </h4>
              <div className="space-y-2">
                {member.recentBets.map((bet) => (
                  <div
                    key={bet.id}
                    className="flex items-center justify-between p-2 bg-muted rounded-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Icon
                        name={bet.result === 'win' ? 'CheckCircleIcon' : 'XCircleIcon'}
                        size={16}
                        className={bet.result === 'win' ? 'text-success' : 'text-error'}
                        variant="solid"
                      />
                      <span className="text-sm text-text-primary truncate">{bet.match}</span>
                    </div>
                    <span
                      className={`text-sm font-data font-medium ${
                        bet.result === 'win' ? 'text-success' : 'text-error'
                      }`}
                    >
                      {bet.result === 'win' ? '+' : '-'}
                      {Math.abs(bet.points)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RankingCard;
