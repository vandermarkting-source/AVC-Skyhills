import { User, Session } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  profile: UserProfileData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string, fullName: string) => Promise<AuthResponse>;
  signOut: () => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: { fullName?: string; avatarUrl?: string }) => Promise<{
    error: Error | null;
  }>;
  updateAvatar: (file: File) => Promise<{ url: string | null; error: Error | null }>;
}

export interface AuthResponse {
  data: { user: User | null; session: Session | null };
  error: Error | null;
}

export interface UserProfileData {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'user';
  pointsBalance: number;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
