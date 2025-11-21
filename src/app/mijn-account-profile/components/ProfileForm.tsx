'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ProfileFormProps {
  user: {
    name: string;
    email: string;
  };
  onSave: (data: { name: string; email: string }) => void;
}

const ProfileForm = ({ user, onSave }: ProfileFormProps) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      onSave(formData);
      setIsSaving(false);
      setIsEditing(false);
    }, 1000);
  };

  const handleCancel = () => {
    setFormData({ name: user.name, email: user.email });
    setIsEditing(false);
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-text-primary">Profielinformatie</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-secondary transition-micro"
          >
            <Icon name="PencilIcon" size={16} />
            <span className="font-medium">Bewerken</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Naam</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={!isEditing}
            className="w-full px-4 py-2 border border-border rounded-sm bg-input text-text-primary disabled:bg-muted disabled:text-text-secondary focus:ring-2 focus:ring-primary focus:border-transparent transition-micro"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">E-mailadres</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={!isEditing}
            className="w-full px-4 py-2 border border-border rounded-sm bg-input text-text-primary disabled:bg-muted disabled:text-text-secondary focus:ring-2 focus:ring-primary focus:border-transparent transition-micro"
            required
          />
        </div>

        {isEditing && (
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-success text-success-foreground rounded-sm hover:opacity-90 transition-micro disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin">
                    <Icon name="ArrowPathIcon" size={16} />
                  </div>
                  <span className="font-medium">Opslaan...</span>
                </>
              ) : (
                <>
                  <Icon name="CheckIcon" size={16} />
                  <span className="font-medium">Opslaan</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-muted text-text-primary rounded-sm hover:bg-border transition-micro disabled:opacity-50"
            >
              <Icon name="XMarkIcon" size={16} />
              <span className="font-medium">Annuleren</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileForm;
