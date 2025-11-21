'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  points: number;
  totalBets: number;
  winRate: number;
}

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onAdjustPoints: (userId: string, amount: number) => void;
  onResetAllPoints: () => void;
}

const UserManagementModal = ({
  isOpen,
  onClose,
  users,
  onAdjustPoints,
  onResetAllPoints,
}: UserManagementModalProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null;
  }

  if (!isOpen) return null;

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdjustPoints = () => {
    if (selectedUser && adjustAmount) {
      onAdjustPoints(selectedUser.id, parseInt(adjustAmount));
      setSelectedUser(null);
      setAdjustAmount('');
    }
  };

  const handleResetAll = () => {
    onResetAllPoints();
    setShowResetConfirm(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-modal p-4">
      <div className="bg-surface rounded-md w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-surface border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-primary">Gebruikersbeheer</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-sm transition-micro">
            <Icon name="XMarkIcon" size={24} className="text-text-secondary" />
          </button>
        </div>

        <div className="p-4 border-b border-border space-y-3">
          <div className="relative">
            <Icon
              name="MagnifyingGlassIcon"
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Zoek gebruiker op naam of email..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-warning text-warning-foreground rounded-sm hover:opacity-90 transition-micro font-medium"
          >
            <Icon name="ArrowPathIcon" size={20} />
            <span>Reset alle punten naar 1.000</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-card border border-border rounded-md p-4 hover:shadow-card transition-micro"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {user.avatar ? (
                      <AppImage
                        src={user.avatar}
                        alt={`Profile photo of ${user.name}`}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Icon name="UserIcon" size={24} className="text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary truncate">{user.name}</h3>
                    <p className="text-sm text-text-secondary truncate">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-data font-semibold text-primary">
                      {user.points.toLocaleString('nl-NL')}
                    </p>
                    <p className="text-xs text-text-secondary">punten</p>
                  </div>
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded-sm hover:bg-secondary transition-micro text-sm font-medium"
                  >
                    Aanpassen
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-border">
                  <div>
                    <p className="text-xs text-text-secondary mb-0.5">Totaal weddenschappen</p>
                    <p className="text-sm font-medium text-text-primary">{user.totalBets}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary mb-0.5">Winstpercentage</p>
                    <p className="text-sm font-medium text-text-primary">{user.winRate}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-modal p-4">
            <div className="bg-surface rounded-md w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Punten aanpassen voor {selectedUser.name}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Huidige punten
                  </label>
                  <p className="font-data text-2xl font-bold text-primary">
                    {selectedUser.points.toLocaleString('nl-NL')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Aanpassing (+ of -)
                  </label>
                  <input
                    type="number"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    placeholder="Bijv. +500 of -200"
                    className="w-full px-3 py-2 border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary font-data"
                  />
                  <p className="text-xs text-text-secondary mt-1">
                    Gebruik + voor toevoegen, - voor aftrekken
                  </p>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setAdjustAmount('');
                    }}
                    className="flex-1 px-4 py-2 border border-border rounded-sm hover:bg-muted transition-micro"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={handleAdjustPoints}
                    disabled={!adjustAmount}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-secondary transition-micro font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Bevestigen
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-modal p-4">
            <div className="bg-surface rounded-md w-full max-w-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
                  <Icon name="ExclamationTriangleIcon" size={24} className="text-warning" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary">Bevestig reset</h3>
              </div>
              <p className="text-text-secondary mb-6">
                Weet je zeker dat je alle gebruikerspunten wilt resetten naar 1.000? Deze actie kan
                niet ongedaan worden gemaakt.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-sm hover:bg-muted transition-micro"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleResetAll}
                  className="flex-1 px-4 py-2 bg-warning text-warning-foreground rounded-sm hover:opacity-90 transition-micro font-medium"
                >
                  Reset alle punten
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagementModal;
