import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { Database } from './database.types';

export type SupabaseClient = ReturnType<typeof createBrowserClient<Database>>;
export type SupabaseServerClient = ReturnType<typeof createServerClient<Database>>;

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// Specific table types
export type UserProfile = Tables<'user_profiles'>;
export type Match = Tables<'matches'>;
export type FunBet = Tables<'fun_bets'>;
export type BetOption = Tables<'bet_options'>;
export type Bet = Tables<'bets'>;
export type Transaction = Tables<'transactions'>;

export type InsertUserProfile = InsertTables<'user_profiles'>;
export type InsertMatch = InsertTables<'matches'>;
export type InsertFunBet = InsertTables<'fun_bets'>;
export type InsertBetOption = InsertTables<'bet_options'>;
export type InsertBet = InsertTables<'bets'>;
export type InsertTransaction = InsertTables<'transactions'>;

export type UpdateUserProfile = UpdateTables<'user_profiles'>;
export type UpdateMatch = UpdateTables<'matches'>;
export type UpdateFunBet = UpdateTables<'fun_bets'>;
export type UpdateBetOption = UpdateTables<'bet_options'>;
export type UpdateBet = UpdateTables<'bets'>;
export type UpdateTransaction = UpdateTables<'transactions'>;
