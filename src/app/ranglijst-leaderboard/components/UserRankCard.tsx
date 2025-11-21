'use client';

import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface UserRankCardProps {
  rank: number;
  name: string;
  avatar?: string;
  avatarAlt?: string;
  points: number;
  winRate: number;
  rankChange: 'up' | 'down' | 'same';
  rankChangeValue: number;
}

const UserRankCard = ({
  rank,
  name,
  avatar,
  avatarAlt,
  points,
  winRate,
  rankChange,
  rankChangeValue,
}: UserRankCardProps) => {
  const getRankChangeIcon = () => {
    if (rankChange === 'up') return 'ArrowUpIcon';
    if (rankChange === 'down') return 'ArrowDownIcon';
    return 'MinusIcon';
  };

  const getRankChangeColor = () => {
    if (rankChange === 'up') return 'text-success bg-success/10';
    if (rankChange === 'down') return 'text-error bg-error/10';
    return 'text-text-secondary bg-muted';
  };

  return (
    <div className="bg-primary text-primary-foreground rounded-md p-4 shadow-card">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden bg-white/20 ring-2 ring-white/30">
          {avatar ? (
            <AppImage
              src={avatar}
              alt={avatarAlt ?? name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xl font-bold opacity-80">{name.charAt(0).toUpperCase()}</span>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg truncate">{name}</h3>
            {rankChangeValue > 0 && (
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-sm ${getRankChangeColor()}`}
              >
                <Icon name={getRankChangeIcon() as any} size={12} />
                <span className="text-xs font-bold">{rankChangeValue}</span>
              </div>
            )}
          </div>
          <p className="text-sm opacity-90">Jouw Positie</p>
        </div>

        {/* Rank Badge */}
        <div className="flex-shrink-0 w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold leading-none">#{rank}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/20">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Icon name="CurrencyDollarIcon" size={16} className="opacity-90" />
            <span className="text-xs opacity-75">Punten</span>
          </div>
          <p className="font-data font-bold text-lg">{points.toLocaleString('nl-NL')}</p>
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Icon name="ChartBarIcon" size={16} className="opacity-90" />
            <span className="text-xs opacity-75">Win Rate</span>
          </div>
          <p className="font-data font-bold text-lg">{winRate}%</p>
        </div>
      </div>
    </div>
  );
};

export default UserRankCard;
