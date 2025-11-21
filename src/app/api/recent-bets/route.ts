import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  if (!url || !serviceRole) {
    return NextResponse.json({ error: 'Supabase server configuratie ontbreekt' }, { status: 500 });
  }
  const admin = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await admin
    .from('bets')
    .select(
      `
      id, user_id, stake, potential_payout, status, placed_at,
      bet_options!inner (
        id, option_text,
        matches (id, home_team, away_team),
        fun_bets (id, title)
      ),
      user_profiles:user_id (id, full_name)
    `
    )
    .order('placed_at', { ascending: false })
    .limit(30);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items = (data ?? []).map((b: any) => {
    const isMatch = !!b.bet_options?.matches?.id;
    const title = isMatch
      ? `${b.bet_options?.matches?.home_team ?? ''} vs ${b.bet_options?.matches?.away_team ?? ''}`
      : (b.bet_options?.fun_bets?.title ?? 'Fun Bet');
    return {
      id: b.id,
      userId: b.user_id,
      userName: b.user_profiles?.full_name ?? 'Onbekend',
      option: b.bet_options?.option_text ?? '',
      stake: b.stake,
      potentialWin: b.potential_payout,
      status: b.status,
      title,
    };
  });

  return NextResponse.json({ items });
}