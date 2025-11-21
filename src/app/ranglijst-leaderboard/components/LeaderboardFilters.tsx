'use client';

import Icon from '@/components/ui/AppIcon';

interface LeaderboardFiltersProps {
  activeFilter: 'all-time' | 'monthly' | 'weekly';
  onFilterChange: (filter: 'all-time' | 'monthly' | 'weekly') => void;
}

const LeaderboardFilters = ({ activeFilter, onFilterChange }: LeaderboardFiltersProps) => {
  const filters = [
    { id: 'all-time' as const, label: 'Alle Tijd', icon: 'TrophyIcon' },
    { id: 'monthly' as const, label: 'Deze Maand', icon: 'CalendarIcon' },
    { id: 'weekly' as const, label: 'Deze Week', icon: 'ClockIcon' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-sm transition-micro ${
            activeFilter === filter.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-text-primary hover:bg-border hover:scale-micro'
          }`}
        >
          <Icon name={filter.icon as any} size={18} />
          <span className="font-medium text-sm">{filter.label}</span>
        </button>
      ))}
    </div>
  );
};

export default LeaderboardFilters;
