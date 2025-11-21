import Icon from '@/components/ui/AppIcon';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
  color: 'primary' | 'success' | 'accent';
}

const StatCard = ({ icon, label, value, trend, color }: StatCardProps) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    accent: 'bg-accent/10 text-accent',
  };

  return (
    <div className="bg-card border border-border rounded-lg p-5 hover:shadow-md transition-micro">
      <div className="flex items-start justify-between mb-4">
        <div className={`${colorClasses[color]} rounded-lg p-3`}>
          <Icon name={icon as any} size={24} />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold ${
              trend.direction === 'up' ? 'text-success' : 'text-error'
            }`}
          >
            <Icon
              name={trend.direction === 'up' ? 'ArrowTrendingUpIcon' : 'ArrowTrendingDownIcon'}
              size={16}
            />
            <span>{trend.value}</span>
          </div>
        )}
      </div>

      <div>
        <p className="text-sm text-text-secondary mb-1">{label}</p>
        <p className="text-2xl font-bold font-data text-text-primary">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
