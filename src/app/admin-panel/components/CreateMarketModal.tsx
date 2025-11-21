'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface CreateMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MarketFormData) => void;
  editData?: MarketFormData | null;
}

export interface MarketFormData {
  id?: string;
  title: string;
  category: 'match' | 'fun';
  description: string;
  deadline: string;
  homeTeam?: string;
  awayTeam?: string;
  options: Array<{
    id: string;
    label: string;
    odds: string;
  }>;
}

const CreateMarketModal = ({ isOpen, onClose, onSubmit, editData }: CreateMarketModalProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [formData, setFormData] = useState<MarketFormData>({
    title: '',
    category: 'match',
    description: '',
    deadline: '',
    homeTeam: '',
    awayTeam: '',
    options: [
      { id: '1', label: 'Home', odds: '' },
      { id: '2', label: 'Away', odds: '' },
    ],
  });

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (editData) {
      setFormData(editData);
    } else {
      setFormData({
        title: '',
        category: 'match',
        description: '',
        deadline: '',
        homeTeam: '',
        awayTeam: '',
        options: [
          { id: '1', label: 'Home', odds: '' },
          { id: '2', label: 'Away', odds: '' },
        ],
      });
    }
  }, [editData, isOpen]);

  if (!isHydrated) {
    return null;
  }

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { id: Date.now().toString(), label: '', odds: '' }],
    });
  };

  const addSetResultTemplate = () => {
    const template = [
      { id: `sr-${Date.now()}-h-3-0`, label: 'Set resultaat 3-0 (Thuis)', odds: '2.80' },
      { id: `sr-${Date.now()}-h-3-1`, label: 'Set resultaat 3-1 (Thuis)', odds: '2.60' },
      { id: `sr-${Date.now()}-h-3-2`, label: 'Set resultaat 3-2 (Thuis)', odds: '3.40' },
      { id: `sr-${Date.now()}-a-0-3`, label: 'Set resultaat 0-3 (Uit)', odds: '3.20' },
      { id: `sr-${Date.now()}-a-1-3`, label: 'Set resultaat 1-3 (Uit)', odds: '2.90' },
      { id: `sr-${Date.now()}-a-2-3`, label: 'Set resultaat 2-3 (Uit)', odds: '3.60' },
    ];
    const existingLabels = new Set(formData.options.map((o) => o.label.trim().toLowerCase()));
    const toAdd = template.filter((t) => !existingLabels.has(t.label.trim().toLowerCase()));
    setFormData({ ...formData, options: [...formData.options, ...toAdd] });
  };

  const removeOption = (id: string) => {
    if (formData.options.length > 2) {
      setFormData({
        ...formData,
        options: formData.options.filter((opt) => opt.id !== id),
      });
    }
  };

  const updateOption = (id: string, field: 'label' | 'odds', value: string) => {
    setFormData({
      ...formData,
      options: formData.options.map((opt) => (opt.id === id ? { ...opt, [field]: value } : opt)),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-modal p-4">
      <div className="bg-surface rounded-md w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-surface border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-primary">
            {editData ? 'Markt bewerken' : 'Nieuwe markt aanmaken'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-sm transition-micro">
            <Icon name="XMarkIcon" size={24} className="text-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Titel *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Bijv. AVC '69 vs Volleybalclub Rotterdam"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Categorie *</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value="match"
                  checked={formData.category === 'match'}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as 'match' | 'fun' })
                  }
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm text-text-primary">Wedstrijd</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value="fun"
                  checked={formData.category === 'fun'}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as 'match' | 'fun' })
                  }
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm text-text-primary">Fun Bet</span>
              </label>
            </div>
          </div>

          {formData.category === 'match' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Thuisploeg *
                </label>
                <input
                  type="text"
                  required
                  value={formData.homeTeam ?? ''}
                  onChange={(e) => setFormData({ ...formData, homeTeam: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Bijv. AVC '69"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Uitploeg *
                </label>
                <input
                  type="text"
                  required
                  value={formData.awayTeam ?? ''}
                  onChange={(e) => setFormData({ ...formData, awayTeam: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Bijv. Volleybalclub Rotterdam"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Beschrijving</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Optionele beschrijving van de markt"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Deadline *</label>
            <input
              type="datetime-local"
              required
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-text-primary">Opties *</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={addOption}
                  className="flex items-center gap-1 text-sm text-primary hover:text-secondary transition-micro"
                >
                  <Icon name="PlusIcon" size={16} />
                  <span>Optie toevoegen</span>
                </button>
                <button
                  type="button"
                  onClick={addSetResultTemplate}
                  className="flex items-center gap-1 text-sm text-accent hover:text-secondary transition-micro"
                >
                  <Icon name="SparklesIcon" size={16} />
                  <span>Setresultaat sjabloon</span>
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {formData.options.map((option, index) => (
                <div key={option.id} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={option.label}
                    onChange={(e) => updateOption(option.id, 'label', e.target.value)}
                    className="flex-1 px-3 py-2 border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={`Optie ${index + 1}`}
                  />
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="1.01"
                    value={option.odds}
                    onChange={(e) => updateOption(option.id, 'odds', e.target.value)}
                    className="w-24 px-3 py-2 border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary font-data"
                    placeholder="1.50"
                  />
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(option.id)}
                      className="p-2 hover:bg-error/10 rounded-sm transition-micro"
                    >
                      <Icon name="TrashIcon" size={20} className="text-error" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-sm hover:bg-muted transition-micro"
            >
              Annuleren
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-secondary transition-micro font-medium"
            >
              {editData ? 'Opslaan' : 'Aanmaken'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMarketModal;
