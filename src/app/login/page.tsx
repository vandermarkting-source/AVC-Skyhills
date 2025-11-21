'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn(email, password);
    setLoading(false);
    if (res.error) {
      setError(res.error.message || 'Inloggen mislukt');
      return;
    }
    router.push('/home-dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-md p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Icon name="TrophyIcon" size={24} className="text-primary" />
            <h1 className="text-2xl font-bold text-text-primary">AVC Skyhills</h1>
          </div>
          <span className="text-xs text-text-secondary">Betting Platform</span>
        </div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">Inloggen</h2>
        <p className="text-text-secondary mb-6">Voer je e-mailadres en wachtwoord in.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="jij@voorbeeld.nl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Wachtwoord</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 p-3 bg-error/10 border border-error rounded-sm">
              <Icon name="ExclamationCircleIcon" size={20} className="text-error" />
              <p className="text-sm text-error">{error}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-secondary transition-micro disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin">
                  <Icon name="ArrowPathIcon" size={16} />
                </div>
                <span>Bezig met inloggen...</span>
              </>
            ) : (
              <>
                <Icon name="ArrowRightCircleIcon" size={16} />
                <span>Inloggen</span>
              </>
            )}
          </button>
          <div className="mt-4 text-sm text-text-secondary text-center">
            <span>Nog geen account? </span>
            <a href="/register" className="text-primary hover:text-secondary font-medium">
              Registreren bij AVC Skyhills
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
