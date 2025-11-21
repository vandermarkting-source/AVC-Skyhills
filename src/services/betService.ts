import { supabase } from '../lib/supabase/client';
import { Bet, InsertBet } from '../types/supabase.types';
import { userService } from './userService';
import { transactionService } from './transactionService';

interface BetResponse {
  data: Bet | null;
  error: Error | null;
}

interface BetsResponse {
  data: Bet[] | null;
  error: Error | null;
}

export const betService = {
  async placeBet(bet: Omit<InsertBet, 'id' | 'placed_at'>): Promise<BetResponse> {
    const { count: dupCount } = await (supabase as any)
      .from('bets')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', bet.user_id)
      .eq('bet_option_id', bet.bet_option_id)
      .eq('status', 'pending');
    if ((dupCount ?? 0) > 0) {
      return { data: null, error: new Error('Je hebt deze weddenschap al geplaatst') };
    }

    const { data: profile } = await (supabase as any)
      .from('user_profiles')
      .select('points_balance')
      .eq('id', bet.user_id)
      .single();
    const balance = ((profile?.points_balance as number) ?? 0) as number;
    const { data: pending } = await (supabase as any)
      .from('bets')
      .select('stake')
      .eq('user_id', bet.user_id)
      .eq('status', 'pending');
    const reserved = (pending ?? []).reduce((s: number, b: any) => s + (b?.stake ?? 0), 0);
    const available = balance - reserved;
    if (bet.stake > available) {
      return { data: null, error: new Error('Onvoldoende punten beschikbaar voor inzet') };
    }

    const { data, error } = await (supabase as any)
      .from('bets')
      .insert(bet as any)
      .select()
      .single();

    if (!error && data) {
      await transactionService.addTransaction({
        user_id: bet.user_id,
        amount: 0,
        transaction_type: 'bet_placed',
        description: 'Weddenschap geplaatst (punten gereserveerd)',
        bet_id: data.id,
      });
    }

    return { data, error };
  },

  async getUserBets(
    userId: string,
    status?: 'pending' | 'won' | 'lost' | 'cancelled'
  ): Promise<BetsResponse> {
    let query = supabase
      .from('bets')
      .select(
        `
        *,
        bet_options!inner (
          *,
          matches (*),
          fun_bets (*)
        )
      `
      )
      .eq('user_id', userId)
      .order('placed_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    return { data, error };
  },

  async getBetById(betId: string): Promise<BetResponse> {
    const { data, error } = await supabase
      .from('bets')
      .select(
        `
        *,
        bet_options!inner (
          *,
          matches (*),
          fun_bets (*)
        )
      `
      )
      .eq('id', betId)
      .single();

    return { data, error };
  },

  async getActiveBets(): Promise<BetsResponse> {
    const { data, error } = await supabase
      .from('bets')
      .select(
        `
        *,
        bet_options!inner (
          *,
          matches (*),
          fun_bets (*)
        )
      `
      )
      .eq('status', 'pending')
      .order('placed_at', { ascending: false });
    return { data, error };
  },
  async getReservedStakeSum(userId: string): Promise<{ total: number }> {
    const { data } = await (supabase as any)
      .from('bets')
      .select('stake')
      .eq('user_id', userId)
      .eq('status', 'pending');
    const total = (data ?? []).reduce((s: number, b: any) => s + (b?.stake ?? 0), 0);
    return { total };
  },
  async getRecentBets(limit: number = 20): Promise<BetsResponse> {
    const { data, error } = await (supabase as any)
      .from('bets')
      .select(
        `
        *,
        bet_options!inner (
          *,
          matches (*),
          fun_bets (*)
        )
      `
      )
      .order('placed_at', { ascending: false })
      .limit(limit);
    return { data, error };
  },
};
