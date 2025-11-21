'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

interface RequireAuthProps {
  children: React.ReactNode;
}
export default function RequireAuth({ children }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    if (!supabaseConfigured) return;
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router, supabaseConfigured]);

  if (loading) return null;
  if (!supabaseConfigured && !user) return <>{children}</>;
  if (!user) return null;
  return <>{children}</>;
}
