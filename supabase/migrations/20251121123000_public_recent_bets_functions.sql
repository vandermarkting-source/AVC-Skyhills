CREATE OR REPLACE FUNCTION public.get_recent_bets(limit_count INTEGER DEFAULT 30)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  stake INTEGER,
  potential_payout NUMERIC,
  status public.bet_status,
  placed_at TIMESTAMPTZ,
  option_text TEXT,
  match_home TEXT,
  match_away TEXT,
  fun_title TEXT,
  user_full_name TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    b.id,
    b.user_id,
    b.stake,
    b.potential_payout,
    b.status,
    b.placed_at,
    bo.option_text,
    m.home_team AS match_home,
    m.away_team AS match_away,
    f.title AS fun_title,
    up.full_name AS user_full_name
  FROM public.bets b
  JOIN public.bet_options bo ON bo.id = b.bet_option_id
  LEFT JOIN public.matches m ON m.id = bo.match_id
  LEFT JOIN public.fun_bets f ON f.id = bo.fun_bet_id
  LEFT JOIN public.user_profiles up ON up.id = b.user_id
  ORDER BY b.placed_at DESC
  LIMIT limit_count;
$$;

CREATE OR REPLACE FUNCTION public.get_total_stake_today(tz TEXT DEFAULT 'Europe/Amsterdam')
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_ts TIMESTAMPTZ;
  end_ts TIMESTAMPTZ;
  total INTEGER;
BEGIN
  start_ts := timezone(tz, now());
  start_ts := date_trunc('day', start_ts);
  end_ts := start_ts + INTERVAL '1 day';
  SELECT COALESCE(SUM(stake), 0) INTO total
  FROM public.bets
  WHERE placed_at >= start_ts AND placed_at < end_ts;
  RETURN total;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_recent_bets(INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_total_stake_today(TEXT) TO anon, authenticated;