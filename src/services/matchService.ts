import { supabase } from '../lib/supabase/client';
import { Match, BetOption } from '../types/supabase.types';

interface MatchWithOptions extends Match {
  bet_options: BetOption[];
}

interface MatchesResponse {
  data: MatchWithOptions[] | null;
  error: Error | null;
}

interface MatchResponse {
  data: MatchWithOptions | null;
  error: Error | null;
}

export const matchService = {
  async getUpcomingMatches(): Promise<MatchesResponse> {
    const { data, error } = await supabase
      .from('matches')
      .select(
        `
        *,
        bet_options (*)
      `
      )
      .in('status', ['upcoming', 'live'])
      .order('match_date', { ascending: true });

    return { data, error };
  },

  async getMatchById(matchId: string): Promise<MatchResponse> {
    const { data, error } = await supabase
      .from('matches')
      .select(
        `
        *,
        bet_options (*)
      `
      )
      .eq('id', matchId)
      .single();

    return { data, error };
  },

  async getRecentResults(limit: number = 10): Promise<MatchesResponse> {
    const { data, error } = await supabase
      .from('matches')
      .select(
        `
        *,
        bet_options (*)
      `
      )
      .eq('status', 'finished')
      .order('match_date', { ascending: false })
      .limit(limit);

    return { data, error };
  },
};
