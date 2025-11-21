'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface PasswordChangeProps {
  onPasswordChange: (data: { currentPassword: string; newPassword: string }) => void;
}

const PasswordChange = ({ onPasswordChange }: PasswordChangeProps) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Nieuwe wachtwoorden komen niet overeen');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Wachtwoord moet minimaal 8 tekens bevatten');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onPasswordChange({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setIsSubmitting(false);
      setSuccess(true);
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }, 1000);
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <h2 className="text-xl font-bold text-text-primary mb-6">Wachtwoord wijzigen</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Huidig wachtwoord
          </label>
          <div className="relative">
            <input
              type={showPasswords.current ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              className="w-full px-4 py-2 pr-12 border border-border rounded-sm bg-input text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent transition-micro"
              required
            />
            <button
              type="button"
              onClick={() =>
                setShowPasswords({ ...showPasswords, current: !showPasswords.current })
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-micro"
            >
              <Icon name={showPasswords.current ? 'EyeSlashIcon' : 'EyeIcon'} size={20} />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Nieuw wachtwoord
          </label>
          <div className="relative">
            <input
              type={showPasswords.new ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="w-full px-4 py-2 pr-12 border border-border rounded-sm bg-input text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent transition-micro"
              required
            />
            <button
              type="button"
              onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-micro"
            >
              <Icon name={showPasswords.new ? 'EyeSlashIcon' : 'EyeIcon'} size={20} />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Bevestig nieuw wachtwoord
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-2 pr-12 border border-border rounded-sm bg-input text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent transition-micro"
              required
            />
            <button
              type="button"
              onClick={() =>
                setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-micro"
            >
              <Icon name={showPasswords.confirm ? 'EyeSlashIcon' : 'EyeIcon'} size={20} />
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-error/10 border border-error rounded-sm">
            <Icon name="ExclamationCircleIcon" size={20} className="text-error" />
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-success/10 border border-success rounded-sm">
            <Icon name="CheckCircleIcon" size={20} className="text-success" />
            <p className="text-sm text-success">Wachtwoord succesvol gewijzigd</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-secondary transition-micro disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin">
                <Icon name="ArrowPathIcon" size={16} />
              </div>
              <span className="font-medium">Wijzigen...</span>
            </>
          ) : (
            <>
              <Icon name="LockClosedIcon" size={16} />
              <span className="font-medium">Wachtwoord wijzigen</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default PasswordChange;
