'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Category {
  id: string;
  label: string;
  emoji: string;
  count: number;
}

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const CategoryFilter = ({ categories, activeCategory, onCategoryChange }: CategoryFilterProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-card border border-border rounded-md shadow-card p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-3 md:cursor-default"
      >
        <div className="flex items-center gap-2">
          <Icon name="FunnelIcon" size={20} className="text-primary" />
          <h3 className="font-semibold text-text-primary">Categorieën</h3>
        </div>
        <Icon
          name="ChevronDownIcon"
          size={20}
          className={`md:hidden text-text-secondary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      <div className={`space-y-2 ${isExpanded ? 'block' : 'hidden md:block'}`}>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`w-full flex items-center justify-between p-3 rounded-sm transition-micro ${
              activeCategory === category.id
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-text-primary'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl" role="img" aria-label={category.label}>
                {category.emoji}
              </span>
              <span className="font-medium">{category.label}</span>
            </div>
            <span
              className={`font-data text-sm ${
                activeCategory === category.id ? 'text-primary-foreground' : 'text-text-secondary'
              }`}
            >
              {category.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
