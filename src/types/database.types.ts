export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'admin' | 'user';
          points_balance: number;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: 'admin' | 'user';
          points_balance?: number;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: 'admin' | 'user';
          points_balance?: number;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      matches: {
        Row: {
          id: string;
          home_team: string;
          away_team: string;
          match_date: string;
          status: 'upcoming' | 'live' | 'finished' | 'cancelled';
          home_score: number | null;
          away_score: number | null;
          closing_time: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          home_team: string;
          away_team: string;
          match_date: string;
          status?: 'upcoming' | 'live' | 'finished' | 'cancelled';
          home_score?: number | null;
          away_score?: number | null;
          closing_time: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          home_team?: string;
          away_team?: string;
          match_date?: string;
          status?: 'upcoming' | 'live' | 'finished' | 'cancelled';
          home_score?: number | null;
          away_score?: number | null;
          closing_time?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      fun_bets: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: string;
          closing_time: string;
          result_text: string | null;
          is_settled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          category: string;
          closing_time: string;
          result_text?: string | null;
          is_settled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          category?: string;
          closing_time?: string;
          result_text?: string | null;
          is_settled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      bet_options: {
        Row: {
          id: string;
          match_id: string | null;
          fun_bet_id: string | null;
          option_text: string;
          odds: number;
          is_winner: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id?: string | null;
          fun_bet_id?: string | null;
          option_text: string;
          odds: number;
          is_winner?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string | null;
          fun_bet_id?: string | null;
          option_text?: string;
          odds?: number;
          is_winner?: boolean;
          created_at?: string;
        };
      };
      bets: {
        Row: {
          id: string;
          user_id: string;
          bet_option_id: string;
          stake: number;
          potential_payout: number;
          status: 'pending' | 'won' | 'lost' | 'cancelled';
          actual_payout: number | null;
          placed_at: string;
          settled_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          bet_option_id: string;
          stake: number;
          potential_payout: number;
          status?: 'pending' | 'won' | 'lost' | 'cancelled';
          actual_payout?: number | null;
          placed_at?: string;
          settled_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          bet_option_id?: string;
          stake?: number;
          potential_payout?: number;
          status?: 'pending' | 'won' | 'lost' | 'cancelled';
          actual_payout?: number | null;
          placed_at?: string;
          settled_at?: string | null;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          transaction_type: string;
          description: string;
          bet_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          transaction_type: string;
          description: string;
          bet_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          transaction_type?: string;
          description?: string;
          bet_id?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      update_user_balance: {
        Args: { p_user_id: string; p_amount: number };
        Returns: void;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
