import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;
  if (!url || (!serviceRole && !anon)) {
    return NextResponse.json({ error: 'Supabase server configuratie ontbreekt' }, { status: 500 });
  }
  const key = serviceRole ?? (anon as string);
  const admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await admin.rpc('get_recent_bets', { limit_count: 30 });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items = (data ?? []).map((b: any) => {
    const isMatch = !!b.match_home && !!b.match_away;
    const title = isMatch ? `${b.match_home ?? ''} vs ${b.match_away ?? ''}` : (b.fun_title ?? 'Fun Bet');
    return {
      id: b.id,
      userId: b.user_id,
      userName: b.user_full_name ?? 'Onbekend',
      option: b.option_text ?? '',
      stake: b.stake,
      potentialWin: b.potential_payout,
      status: b.status,
      title,
      placedAt: b.placed_at,
    };
  });

  // Dag-totaal (UTC daggrenzen)
  const { data: totalResp } = await admin.rpc('get_total_stake_today', { tz: 'Europe/Amsterdam' });
  const totalToday = Number(totalResp ?? 0);

  return NextResponse.json({ items, totalToday }, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
