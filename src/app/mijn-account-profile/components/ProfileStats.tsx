import Icon from '@/components/ui/AppIcon';

interface ProfileStatsProps {
  stats: {
    totalBets: number;
    winRate: number;
    biggestWin: number;
    favoriteBetType: string;
    totalWinnings: number;
    totalLosses: number;
  };
}

const ProfileStats = ({ stats }: ProfileStatsProps) => {
  const statCards = [
    {
      label: 'Totaal Weddenschappen',
      value: stats.totalBets.toString(),
      icon: 'ChartBarIcon',
      color: 'text-primary',
    },
    {
      label: 'Winpercentage',
      value: `${stats.winRate}%`,
      icon: 'TrophyIcon',
      color: 'text-success',
    },
    {
      label: 'Grootste Winst',
      value: `${stats.biggestWin} punten`,
      icon: 'SparklesIcon',
      color: 'text-accent',
    },
    {
      label: 'Favoriete Type',
      value: stats.favoriteBetType,
      icon: 'HeartIcon',
      color: 'text-error',
    },
    {
      label: 'Totale Winsten',
      value: `${stats.totalWinnings} punten`,
      icon: 'ArrowTrendingUpIcon',
      color: 'text-success',
    },
    {
      label: 'Totale Verliezen',
      value: `${stats.totalLosses} punten`,
      icon: 'ArrowTrendingDownIcon',
      color: 'text-error',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="bg-surface border border-border rounded-lg p-6 hover:shadow-card transition-micro"
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className={`w-12 h-12 rounded-md bg-muted flex items-center justify-center ${stat.color}`}
            >
              <Icon name={stat.icon as any} size={24} />
            </div>
          </div>
          <p className="text-text-secondary text-sm mb-1">{stat.label}</p>
          <p className="text-text-primary text-2xl font-bold">{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default ProfileStats;
