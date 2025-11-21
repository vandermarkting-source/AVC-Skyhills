import { supabase } from '../lib/supabase/client';
import { FunBet, BetOption } from '../types/supabase.types';

interface FunBetWithOptions extends FunBet {
  bet_options: BetOption[];
}

interface FunBetsResponse {
  data: FunBetWithOptions[] | null;
  error: Error | null;
}

interface FunBetResponse {
  data: FunBetWithOptions | null;
  error: Error | null;
}

export const funBetService = {
  async getActiveFunBets(): Promise<FunBetsResponse> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('fun_bets')
      .select(
        `
        *,
        bet_options (*)
      `
      )
      .eq('is_settled', false)
      .gt('closing_time', now)
      .order('closing_time', { ascending: true });

    return { data, error };
  },

  async getFunBetById(funBetId: string): Promise<FunBetResponse> {
    const { data, error } = await supabase
      .from('fun_bets')
      .select(
        `
        *,
        bet_options (*)
      `
      )
      .eq('id', funBetId)
      .single();

    return { data, error };
  },

  async getSettledFunBets(limit: number = 10): Promise<FunBetsResponse> {
    const { data, error } = await supabase
      .from('fun_bets')
      .select(
        `
        *,
        bet_options (*)
      `
      )
      .eq('is_settled', true)
      .order('closing_time', { ascending: false })
      .limit(limit);

    return { data, error };
  },
};
