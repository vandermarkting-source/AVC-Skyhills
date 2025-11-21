import { supabase } from '../lib/supabase/client';
import { UserProfile, InsertUserProfile } from '../types/supabase.types';

interface UserProfileResponse {
  data: UserProfile | null;
  error: Error | null;
}

interface UserProfilesResponse {
  data: UserProfile[] | null;
  error: Error | null;
}

export const userService = {
  async createProfile(
    userId: string,
    email: string,
    fullName: string
  ): Promise<UserProfileResponse> {
    const payload: InsertUserProfile = {
      id: userId,
      email,
      full_name: fullName,
      role: 'user',
    };
    const { data, error } = await (supabase as any)
      .from('user_profiles')
      .insert(payload as any)
      .select()
      .single();
    return { data, error };
  },
  async getProfile(userId: string): Promise<UserProfileResponse> {
    const { data, error } = await (supabase as any)
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  async getLeaderboard(limit: number = 20): Promise<UserProfilesResponse> {
    const { data, error } = await (supabase as any)
      .from('user_profiles')
      .select('*')
      .order('points_balance', { ascending: false })
      .limit(limit);
    return { data, error };
  },

  async updateProfile(
    userId: string,
    updates: Partial<Omit<UserProfile, 'id' | 'email' | 'created_at' | 'updated_at'>>
  ): Promise<UserProfileResponse> {
    const { data, error } = await (supabase as any)
      .from('user_profiles')
      .update(updates as any)
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },

  async getUserStats(userId: string): Promise<{
    totalBets: number;
    wonBets: number;
    lostBets: number;
    pendingBets: number;
    winRate: string;
    totalWinnings: number;
  }> {
    const { data: bets } = await supabase
      .from('bets')
      .select('status, stake, actual_payout')
      .eq('user_id', userId);

    type BetRow = {
      status?: 'pending' | 'won' | 'lost' | 'cancelled' | null;
      stake?: number | null;
      actual_payout?: number | null;
    };
    const rows = (bets ?? []) as BetRow[];
    const totalBets = rows.length;
    const wonBets = rows.filter((b) => b?.status === 'won').length;
    const lostBets = rows.filter((b) => b?.status === 'lost').length;
    const pendingBets = rows.filter((b) => b?.status === 'pending').length;
    const winRate = totalBets > 0 ? ((wonBets / totalBets) * 100).toFixed(1) + '%' : '0%';
    const totalWinnings = rows
      .filter((b) => b?.status === 'won')
      .reduce((sum, b) => sum + (b?.actual_payout ?? 0) - (b?.stake ?? 0), 0);

    return {
      totalBets,
      wonBets,
      lostBets,
      pendingBets,
      winRate,
      totalWinnings: Math.round(totalWinnings),
    };
  },

  async adjustPointsBalance(userId: string, delta: number): Promise<{ error: Error | null }> {
    // Try RPC first
    const { error: rpcError } = await (supabase as any).rpc('update_user_balance', {
      p_user_id: userId,
      p_amount: delta,
    });
    if (!rpcError) return { error: null };
    // Fallback: read current and update
    const { data } = await (supabase as any)
      .from('user_profiles')
      .select('points_balance')
      .eq('id', userId)
      .single();
    const current = ((data as any)?.points_balance as number | undefined) ?? 0;
    const { error } = await (supabase as any)
      .from('user_profiles')
      .update({ points_balance: current + delta })
      .eq('id', userId);
    return { error: error as any };
  },
};
