'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, type Session, type AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase/client';
import { AuthContextType, AuthResponse, UserProfileData } from '../types/auth.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const enabled = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    (supabase as any).auth.getSession().then((res: { data: { session: Session | null } }) => {
      const session = res.data.session;
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = (supabase as any).auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          loadUserProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !user) return;
    const ch = (supabase as any)
      .channel(`user_profile_updates_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_profiles',
          filter: `id=eq.${user.id}`,
        },
        async () => {
          await loadUserProfile(user.id);
        }
      )
      .subscribe();

    return () => {
      try {
        (supabase as any).removeChannel(ch);
      } catch (e) {
        void e;
      }
    };
  }, [enabled, user]);

  const loadUserProfile = async (userId: string) => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await (supabase as any)
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          id: data.id,
          email: data.email,
          fullName: data.full_name,
          role: data.role,
          pointsBalance: data.points_balance,
          avatarUrl: data.avatar_url,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    await loadUserProfile(user.id);
  };

  const updateProfile = async (updates: { fullName?: string; avatarUrl?: string }) => {
    if (!enabled || !user) {
      return { error: new Error('Niet ingelogd of Supabase niet geconfigureerd') };
    }
    try {
      const payload: Partial<{
        full_name: string;
        avatar_url: string | null;
      }> = {};
      if (typeof updates.fullName === 'string') payload.full_name = updates.fullName;
      if (typeof updates.avatarUrl === 'string') payload.avatar_url = updates.avatarUrl;

      const { data, error } = await (supabase as any)
        .from('user_profiles')
        .update(payload as any)
        .eq('id', user.id)
        .select()
        .single();
      if (error) return { error };
      if (data) {
        setProfile({
          id: data.id,
          email: data.email,
          fullName: data.full_name,
          role: data.role,
          pointsBalance: data.points_balance,
          avatarUrl: data.avatar_url,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        });
      }
      return { error: null };
    } catch (e) {
      return { error: e as Error };
    }
  };

  const updateAvatar = async (file: File) => {
    if (!enabled || !user) {
      return { url: null, error: new Error('Niet ingelogd of Supabase niet geconfigureerd') };
    }
    try {
      const bucket = process.env.NEXT_PUBLIC_SUPABASE_AVATAR_BUCKET ?? 'avatars';
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt ?? 'jpg'}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await (supabase as any).storage
        .from(bucket)
        .upload(filePath, file, {
          upsert: true,
        });
      if (uploadError) {
        const toDataUrl = (f: File) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(new Error('Kan bestand niet lezen'));
            reader.readAsDataURL(f);
          });
        try {
          const dataUrl = await toDataUrl(file);
          await updateProfile({ avatarUrl: dataUrl });
          await refreshProfile();
          return { url: dataUrl, error: null };
        } catch (e) {
          return { url: null, error: uploadError };
        }
      }

      const { data: urlData } = (supabase as any).storage.from(bucket).getPublicUrl(filePath);
      const publicUrl = urlData?.publicUrl ?? null;
      if (publicUrl) {
        await updateProfile({ avatarUrl: publicUrl });
        await refreshProfile();
      }
      return { url: publicUrl, error: null };
    } catch (e) {
      return { url: null, error: e as Error };
    }
  };

  const updateEmail = async (newEmail: string) => {
    if (!enabled || !user) {
      return { error: new Error('Niet ingelogd of Supabase niet geconfigureerd') };
    }
    try {
      const { error: authError } = await (supabase as any).auth.updateUser({ email: newEmail });
      if (authError) return { error: authError };
      const { data, error } = await (supabase as any)
        .from('user_profiles')
        .update({ email: newEmail })
        .eq('id', user.id)
        .select()
        .single();
      if (error) return { error };
      if (data) {
        setProfile({
          id: data.id,
          email: data.email,
          fullName: data.full_name,
          role: data.role,
          pointsBalance: data.points_balance,
          avatarUrl: data.avatar_url,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        });
      }
      return { error: null };
    } catch (e) {
      return { error: e as Error };
    }
  };

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    if (!enabled) {
      return {
        data: { user: null, session: null },
        error: new Error('Supabase niet geconfigureerd'),
      };
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      return {
        data: { user: null, session: null },
        error: error as Error,
      };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<AuthResponse> => {
    if (!enabled) {
      return {
        data: { user: null, session: null },
        error: new Error('Supabase niet geconfigureerd'),
      };
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'user',
          },
        },
      });
      return { data, error };
    } catch (error) {
      return {
        data: { user: null, session: null },
        error: error as Error,
      };
    }
  };

  const signOut = async (): Promise<{ error: Error | null }> => {
    if (!enabled) {
      return { error: null };
    }
    const { error } = await (supabase as any).auth.signOut();
    return { error };
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    updateProfile,
    updateAvatar,
    updateEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
