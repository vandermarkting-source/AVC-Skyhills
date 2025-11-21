import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database.types';

let cachedClient: SupabaseClient<Database> | null = null;

function createStubClient(): SupabaseClient<Database> {
  return new Proxy({} as SupabaseClient<Database>, {
    get() {
      throw new Error(
        'Supabase niet geconfigureerd: ontbrekende NEXT_PUBLIC_SUPABASE_URL/ANON_KEY'
      );
    },
  }) as SupabaseClient<Database>;
}

export const supabase: SupabaseClient<Database> = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (cachedClient) return cachedClient;
  if (!url || !key) {
    cachedClient = createStubClient();
    return cachedClient;
  }
  cachedClient = createClient<Database>(url, key);
  return cachedClient;
})();
