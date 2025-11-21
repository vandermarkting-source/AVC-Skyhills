import { supabase } from '../lib/supabase/client';
import { Transaction } from '../types/supabase.types';

interface TransactionsResponse {
  data: Transaction[] | null;
  error: Error | null;
}

export const transactionService = {
  async getUserTransactions(userId: string, limit: number = 50): Promise<TransactionsResponse> {
    const { data, error } = await (supabase as any)
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data, error };
  },

  async getTransactionsByType(
    userId: string,
    transactionType: string
  ): Promise<TransactionsResponse> {
    const { data, error } = await (supabase as any)
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('transaction_type', transactionType)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async addTransaction(payload: {
    user_id: string;
    amount: number;
    transaction_type: string;
    description: string;
    bet_id?: string | null;
  }): Promise<TransactionsResponse> {
    const { data, error } = await (supabase as any)
      .from('transactions')
      .insert({ ...payload } as any)
      .select('*');
    return { data, error };
  },
};
