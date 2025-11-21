import Icon from '@/components/ui/AppIcon';

interface UpcomingDeadlineCardProps {
  title: string;
  category: 'match' | 'fun';
  closingTime: string;
  timeRemaining: string;
  isLive: boolean;
}

const UpcomingDeadlineCard = ({
  title,
  category,
  closingTime,
  timeRemaining,
  isLive,
}: UpcomingDeadlineCardProps) => {
  const categoryConfig = {
    match: {
      icon: 'TrophyIcon' as const,
      bgColor: 'bg-primary/10',
      textColor: 'text-primary',
      label: 'Wedstrijd',
    },
    fun: {
      icon: 'SparklesIcon' as const,
      bgColor: 'bg-accent/10',
      textColor: 'text-accent',
      label: 'Fun Bet',
    },
  };

  const config = categoryConfig[category];

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-micro">
      <div className="flex items-start gap-3 mb-3">
        <div className={`${config.bgColor} rounded-lg p-2 flex-shrink-0`}>
          <Icon name={config.icon} size={20} className={config.textColor} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded ${config.bgColor} ${config.textColor}`}
            >
              {config.label}
            </span>
            {isLive && (
              <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-error/10 text-error">
                <span className="w-1.5 h-1.5 bg-error rounded-full animate-pulse-subtle"></span>
                Live
              </span>
            )}
          </div>
          <h4 className="font-semibold text-text-primary text-sm leading-tight">{title}</h4>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <Icon name="ClockIcon" size={16} className="text-text-secondary" />
          <span className="text-xs text-text-secondary">{closingTime}</span>
        </div>
        <span className="text-xs font-semibold px-2 py-1 rounded bg-warning/10 text-warning">
          {timeRemaining}
        </span>
      </div>
    </div>
  );
};

export default UpcomingDeadlineCard;
