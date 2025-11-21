'use client';

import { useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface ProfileHeaderProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
    points: number;
    memberSince: string;
  };
  onAvatarChange: (file: File) => void;
}

const ProfileHeader = ({ user, onAvatarChange }: ProfileHeaderProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      onAvatarChange(file);
      setTimeout(() => setIsUploading(false), 1000);
    }
  };

  return (
    <div className="bg-gradient-to-br from-primary to-secondary p-8 rounded-lg shadow-card">
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Avatar Section */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-surface ring-4 ring-primary-foreground">
            {user.avatar ? (
              <AppImage
                src={user.avatar}
                alt={`Profile photo of ${user.name}`}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Icon name="UserIcon" size={48} className="text-text-secondary" />
              </div>
            )}
          </div>
          <label className="absolute bottom-0 right-0 w-10 h-10 bg-surface rounded-full flex items-center justify-center cursor-pointer shadow-md hover:scale-110 transition-micro">
            <Icon name="CameraIcon" size={20} className="text-primary" />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
          </label>
          {isUploading && (
            <div className="absolute inset-0 bg-background/80 rounded-full flex items-center justify-center">
              <div className="animate-spin">
                <Icon name="ArrowPathIcon" size={24} className="text-primary" />
              </div>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-primary-foreground mb-2">{user.name}</h1>
          <p className="text-primary-foreground/90 mb-4">{user.email}</p>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <div className="flex items-center gap-2 bg-primary-foreground/20 px-4 py-2 rounded-sm">
              <Icon name="CurrencyDollarIcon" size={20} className="text-primary-foreground" />
              <span className="font-data font-bold text-primary-foreground text-lg">
                {user.points}
              </span>
              <span className="text-primary-foreground/80 text-sm">punten</span>
            </div>
            <div className="flex items-center gap-2 bg-primary-foreground/20 px-4 py-2 rounded-sm">
              <Icon name="CalendarIcon" size={20} className="text-primary-foreground" />
              <span className="text-primary-foreground/80 text-sm">
                Lid sinds {user.memberSince}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
