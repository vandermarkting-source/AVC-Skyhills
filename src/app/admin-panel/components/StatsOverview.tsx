import Icon from '@/components/ui/AppIcon';

interface Stat {
  label: string;
  value: string | number;
  icon: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

interface StatsOverviewProps {
  stats: Stat[];
}

const StatsOverview = ({ stats }: StatsOverviewProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-card border border-border rounded-md p-4 hover:shadow-card transition-micro"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-primary/10 rounded-sm flex items-center justify-center">
              <Icon name={stat.icon as any} size={20} className="text-primary" />
            </div>
            {stat.trend && (
              <div
                className={`flex items-center gap-1 text-xs font-medium ${
                  stat.trend.isPositive ? 'text-success' : 'text-error'
                }`}
              >
                <Icon name={stat.trend.isPositive ? 'ArrowUpIcon' : 'ArrowDownIcon'} size={14} />
                <span>{stat.trend.value}</span>
              </div>
            )}
          </div>
          <p className="text-2xl font-bold text-text-primary mb-1">{stat.value}</p>
          <p className="text-sm text-text-secondary">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;
