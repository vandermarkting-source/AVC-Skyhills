'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  sortBy: 'date' | 'competition' | 'status';
  competition: string;
  status: string;
}

const FilterBar = ({ onFilterChange }: FilterBarProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    sortBy: 'date',
    competition: 'all',
    status: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      onFilterChange(filters);
    }
  }, [filters, isHydrated, onFilterChange]);

  const competitions = [
    { value: 'all', label: 'Alle competities' },
    { value: 'eredivisie', label: 'Eredivisie' },
    { value: 'eerste-divisie', label: 'Eerste Divisie' },
    { value: 'beker', label: 'Beker' },
    { value: 'vriendschappelijk', label: 'Vriendschappelijk' },
  ];

  const statuses = [
    { value: 'all', label: 'Alle statussen' },
    { value: 'live', label: 'Live' },
    { value: 'new', label: 'Nieuw' },
    { value: 'closing-soon', label: 'Bijna sluiten' },
  ];

  const sortOptions = [
    { value: 'date', label: 'Datum', icon: 'CalendarIcon' },
    { value: 'competition', label: 'Competitie', icon: 'TrophyIcon' },
    { value: 'status', label: 'Status', icon: 'FlagIcon' },
  ];

  if (!isHydrated) {
    return (
      <div className="bg-card border border-border rounded-md p-4 mb-6">
        <div className="animate-pulse flex gap-4">
          <div className="h-10 bg-muted rounded flex-1"></div>
          <div className="h-10 bg-muted rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-md p-4 mb-6">
      {/* Mobile Filter Toggle */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between py-2 px-4 bg-primary text-primary-foreground rounded-sm font-medium"
        >
          <span>Filters</span>
          <Icon name={showFilters ? 'ChevronUpIcon' : 'ChevronDownIcon'} size={20} />
        </button>
      </div>

      {/* Filter Controls */}
      <div className={`${showFilters ? 'block' : 'hidden'} md:block space-y-4 md:space-y-0`}>
        {/* Sort By */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
            <Icon name="AdjustmentsHorizontalIcon" size={20} />
            <span>Sorteren op:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilters({ ...filters, sortBy: option.value as any })}
                className={`flex items-center gap-2 px-4 py-2 rounded-sm font-medium text-sm transition-micro ${
                  filters.sortBy === option.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-text-primary hover:bg-muted/80'
                }`}
              >
                <Icon name={option.icon as any} size={16} />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Competition & Status Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
          {/* Competition */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Competitie</label>
            <select
              value={filters.competition}
              onChange={(e) => setFilters({ ...filters, competition: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-sm bg-surface text-text-primary focus:border-primary focus:outline-none transition-micro"
            >
              {competitions.map((comp) => (
                <option key={comp.value} value={comp.value}>
                  {comp.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-sm bg-surface text-text-primary focus:border-primary focus:outline-none transition-micro"
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset Filters */}
        {(filters.competition !== 'all' ||
          filters.status !== 'all' ||
          filters.sortBy !== 'date') && (
          <div className="pt-4 border-t border-border">
            <button
              onClick={() => setFilters({ sortBy: 'date', competition: 'all', status: 'all' })}
              className="flex items-center gap-2 text-sm text-primary hover:text-secondary transition-micro"
            >
              <Icon name="XMarkIcon" size={16} />
              <span>Filters wissen</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
