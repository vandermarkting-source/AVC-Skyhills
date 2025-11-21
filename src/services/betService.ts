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
    const { data, error } = await supabase.from('bets').insert(bet).select().single();

    if (!error && data) {
      await userService.adjustPointsBalance(bet.user_id, -bet.stake);
      await transactionService.addTransaction({
        user_id: bet.user_id,
        amount: -bet.stake,
        transaction_type: 'bet_placed',
        description: 'Weddenschap geplaatst',
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
};
