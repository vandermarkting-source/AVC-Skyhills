import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

async function main() {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error('Gebruik: node scripts/import_odds.mjs /absolute/pad/skyhills_odds.json');
    process.exit(1);
  }
  const absPath = path.resolve(fileArg);
  if (!fs.existsSync(absPath)) {
    console.error(`Bestand niet gevonden: ${absPath}`);
    process.exit(1);
  }

  let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    console.error('Ontbrekende env: SUPABASE_SERVICE_ROLE_KEY of NEXT_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
  }
  if (!url) {
    try {
      const payloadPart = key.split('.')[1];
      const b64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = Buffer.from(b64 + '=='.slice(0, (4 - (b64.length % 4)) % 4), 'base64').toString('utf8');
      const payload = JSON.parse(decoded);
      if (!payload?.ref) throw new Error('ref ontbreekt in key payload');
      url = `https://${payload.ref}.supabase.co`;
    } catch (e) {
      console.error('Kan URL niet afleiden uit key:', e?.message || e);
      process.exit(1);
    }
  }
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  const raw = fs.readFileSync(absPath, 'utf8');
  let json;
  try {
    json = JSON.parse(raw);
  } catch (e) {
    console.error('JSON parse fout:', e?.message || e);
    process.exit(1);
  }

  const items = Array.isArray(json) ? json : (json.matches || json.data || []);
  if (!Array.isArray(items) || items.length === 0) {
    console.error('Geen wedstrijden gevonden in JSON (verwacht array of { matches: [...] })');
    process.exit(1);
  }

  const normalizeTeam = (obj, side) => {
    return (
      obj?.[`${side}_team`] ??
      obj?.[side] ??
      obj?.[`${side}Team`] ??
      obj?.[`${side}_name`] ??
      obj?.[`${side}Name`] ??
      ''
    );
  };

  const normalizeDate = (obj) => {
    const v = obj.match_date || obj.date || obj.start_time || obj.kickoff || obj.startTime;
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d.toISOString();
  };

  const normalizeClosing = (obj, matchISO) => {
    const v = obj.closing_time || obj.closingTime || obj.close_time;
    if (v) {
      const d = new Date(v);
      return isNaN(d.getTime()) ? matchISO : d.toISOString();
    }
    // fallback: 1 uur voor match
    if (!matchISO) return null;
    const d = new Date(matchISO);
    d.setHours(d.getHours() - 1);
    return d.toISOString();
  };

  const toOddsArray = (obj) => {
    const out = [];

    const fromArray = (arr, prefix) => {
      for (const entry of arr) {
        const labelRaw = entry.option_text || entry.label || entry.name || entry.outcome || entry.id || '';
        const label = prefix ? `${prefix}: ${labelRaw}` : labelRaw;
        const val = Number(entry.odds ?? entry.price ?? entry.value ?? entry.decimal ?? NaN);
        if (label && !isNaN(val)) out.push({ option_text: label, odds: val });
      }
    };

    const fromObject = (o, prefix) => {
      for (const [k, v] of Object.entries(o)) {
        const val = Number(v);
        if (!isNaN(val)) out.push({ option_text: prefix ? `${prefix}: ${k}` : k, odds: val });
      }
    };

    const o = obj.odds || obj.market_odds || obj.prices || obj.selections;
    if (o) {
      if (Array.isArray(o)) fromArray(o);
      else fromObject(o);
    }

    const markets = obj.markets || [];
    if (Array.isArray(markets)) {
      for (const m of markets) {
        const mName = m.name || m.key || m.id || 'Markt';
        const sels = m.selections || m.outcomes || m.options || m.prices || [];
        if (Array.isArray(sels)) fromArray(sels, mName);
        else if (sels) fromObject(sels, mName);
      }
    }

    const bookmakers = obj.bookmakers || [];
    if (Array.isArray(bookmakers)) {
      for (const b of bookmakers) {
        const bMarkets = b.markets || [];
        for (const m of bMarkets) {
          const mName = m.name || m.key || m.id || 'Markt';
          const sels = m.selections || m.outcomes || m.options || m.prices || [];
          const prefix = b.title || b.name ? `${b.title || b.name} - ${mName}` : mName;
          if (Array.isArray(sels)) fromArray(sels, prefix);
          else if (sels) fromObject(sels, prefix);
        }
      }
    }

    const home = obj.homeOdds ?? obj.home_price ?? obj.home;
    const draw = obj.drawOdds ?? obj.draw_price ?? obj.draw;
    const away = obj.awayOdds ?? obj.away_price ?? obj.away;
    if (!isNaN(Number(home))) out.push({ option_text: 'Home wint (1)', odds: Number(home) });
    if (!isNaN(Number(draw))) out.push({ option_text: 'Gelijkspel (X)', odds: Number(draw) });
    if (!isNaN(Number(away))) out.push({ option_text: 'Away wint (2)', odds: Number(away) });

    const ow = obj.odds_winner || obj.match_winner || obj.winner_odds || obj.oddsWinner;
    if (ow) {
      if (Array.isArray(ow)) fromArray(ow, 'Matchwinnaar');
      else {
        const h = ow.home ?? ow.Home ?? ow.home_price;
        const d = ow.draw ?? ow.Draw ?? ow.draw_price;
        const aw = ow.away ?? ow.Away ?? ow.away_price;
        if (!isNaN(Number(h))) out.push({ option_text: 'Home wint (1)', odds: Number(h) });
        if (!isNaN(Number(d))) out.push({ option_text: 'Gelijkspel (X)', odds: Number(d) });
        if (!isNaN(Number(aw))) out.push({ option_text: 'Away wint (2)', odds: Number(aw) });
      }
    }

    const so = obj.set_odds || obj.sets_odds || obj.setOdds;
    if (so) {
      if (Array.isArray(so)) fromArray(so, 'Sets');
      else fromObject(so, 'Sets');
    }

    return out;
  };

  let inserted = 0;
  let updated = 0;
  let optionsCreated = 0;

  for (const item of items) {
    const home = normalizeTeam(item, 'home');
    const away = normalizeTeam(item, 'away');
    let matchISO = normalizeDate(item);
    const hStr = String(home || '').toLowerCase();
    const aStr = String(away || '').toLowerCase();
    const hasAvc = (s) => s.includes('avc') || s.includes("a.v.c");
    const isH1 = (hasAvc(hStr) && (hStr.includes('hs 1') || hStr.includes('h1') || hStr.includes("hs1"))) ||
                 (hasAvc(aStr) && (aStr.includes('hs 1') || aStr.includes('h1') || aStr.includes("hs1")));
    const isH3 = (hasAvc(hStr) && (hStr.includes('hs 3') || hStr.includes('h3') || hStr.includes("hs3"))) ||
                 (hasAvc(aStr) && (aStr.includes('hs 3') || aStr.includes('h3') || aStr.includes("hs3")));
    if (isH1) matchISO = '2025-11-22T20:00:00+01:00';
    if (isH3) matchISO = '2025-11-22T17:00:00+01:00';
    const closingISO = normalizeClosing(item, matchISO);
    if (!home || !away || !matchISO || !closingISO) {
      console.warn('Overgeslagen onvolledig item:', { home, away, matchISO, closingISO });
      continue;
    }
    const status = (item.status || 'upcoming');

    // Zoek bestaande match op dezelfde home/away/datum
    const { data: existing } = await db
      .from('matches')
      .select('id, home_team, away_team, match_date')
      .eq('home_team', home)
      .eq('away_team', away)
      .eq('match_date', matchISO)
      .limit(1);

    let matchId;
    if (existing && existing.length > 0) {
      matchId = existing[0].id;
      const { error: upErr } = await db
        .from('matches')
        .update({ status, closing_time: closingISO })
        .eq('id', matchId);
      if (!upErr) updated++;
    } else {
      const { data: created, error: insErr } = await db
        .from('matches')
        .insert({ home_team: home, away_team: away, match_date: matchISO, status, closing_time: closingISO })
        .select('id')
        .single();
      if (insErr) {
        console.error('Insert fout (matches):', insErr?.message || insErr);
        continue;
      }
      matchId = created?.id;
      inserted++;
    }

    const oddsArr = toOddsArray(item);
    if (!oddsArr || oddsArr.length === 0) {
      const m = item.markets ? (Array.isArray(item.markets) ? item.markets.length : 1) : 0;
      const b = item.bookmakers ? (Array.isArray(item.bookmakers) ? item.bookmakers.length : 1) : 0;
      console.warn('Geen odds gevonden voor item', {
        home,
        away,
        keys: Object.keys(item || {}),
        markets: m,
        bookmakers: b,
      });
    }
    let winnerHome = null;
    let winnerAway = null;
    const ow = item.odds_winner || item.match_winner || item.winner_odds || item.oddsWinner;
    const homeWinKey = Number(item.home_win ?? item.homeWin ?? item.homewin ?? NaN);
    const awayWinKey = Number(item.away_win ?? item.awayWin ?? item.awaywin ?? NaN);
    if (ow && typeof ow === 'object' && !Array.isArray(ow)) {
      const h = Number(
        ow.home_win ?? ow.homeWin ?? ow['home win'] ??
        ow.home ?? ow.Home ?? ow.thuis ?? ow.Thuis ??
        ow.home_price ?? ow.homeOdds ?? NaN
      );
      const a = Number(
        ow.away_win ?? ow.awayWin ?? ow['away win'] ??
        ow.away ?? ow.Away ?? ow.uit ?? ow.Uit ??
        ow.away_price ?? ow.awayOdds ?? NaN
      );
      if (!isNaN(h)) winnerHome = h;
      if (!isNaN(a)) winnerAway = a;
    }
    if (Array.isArray(ow)) {
      for (const entry of ow) {
        const labelRaw = entry.option_text || entry.label || entry.name || entry.outcome || entry.id || '';
        const lbl = String(labelRaw).toLowerCase();
        const val = Number(entry.odds ?? entry.price ?? entry.value ?? entry.decimal ?? NaN);
        const hl = String(home || '').toLowerCase();
        const al = String(away || '').toLowerCase();
        if (!isNaN(val)) {
          if (lbl.includes('home') || lbl.includes('thuis') || lbl.includes('1') || (hl && lbl.includes(hl))) {
            winnerHome = val;
          } else if (lbl.includes('away') || lbl.includes('uit') || lbl.includes('2') || (al && lbl.includes(al))) {
            winnerAway = val;
          }
        }
      }
    }
    if (winnerHome === null) {
      const ho = item.homeOdds ?? item.home_price ?? item.home;
      if (!isNaN(Number(ho))) winnerHome = Number(ho);
    }
    if (winnerAway === null) {
      const ao = item.awayOdds ?? item.away_price ?? item.away;
      if (!isNaN(Number(ao))) winnerAway = Number(ao);
    }

    if (winnerHome === null || winnerAway === null) {
      const hl = String(home || '').toLowerCase();
      const al = String(away || '').toLowerCase();
      for (const entry of oddsArr) {
        const lbl = String(entry.option_text || '').toLowerCase();
        if (winnerHome === null && (lbl.includes('matchwinnaar') || lbl.includes('match winner') || lbl.includes('home wint') || lbl.includes('thuis wint') || (hl && lbl.includes(hl)) || lbl.includes('home') || lbl.includes('thuis') || lbl.includes('1'))) {
          winnerHome = Number(entry.odds);
        }
        if (winnerAway === null && (lbl.includes('matchwinnaar') || lbl.includes('match winner') || lbl.includes('away wint') || lbl.includes('uit wint') || (al && lbl.includes(al)) || lbl.includes('away') || lbl.includes('uit') || lbl.includes('2'))) {
          winnerAway = Number(entry.odds);
        }
        if (winnerHome !== null && winnerAway !== null) break;
      }
    }

    if (winnerHome === null && !isNaN(homeWinKey)) winnerHome = homeWinKey;
    if (winnerAway === null && !isNaN(awayWinKey)) winnerAway = awayWinKey;

    if (winnerHome !== null) {
      const { data: existingHome } = await db
        .from('bet_options')
        .select('id')
        .eq('match_id', matchId)
        .eq('option_text', 'Home win')
        .limit(1);
      if (existingHome && existingHome.length > 0) {
        await db.from('bet_options').update({ odds: winnerHome }).eq('id', existingHome[0].id);
      } else {
        const { data: existingWinner } = await db
          .from('bet_options')
          .select('id')
          .eq('match_id', matchId)
          .eq('option_text', 'Home winner')
          .limit(1);
        if (existingWinner && existingWinner.length > 0) {
          await db
            .from('bet_options')
            .update({ option_text: 'Home win', odds: winnerHome })
            .eq('id', existingWinner[0].id);
        } else {
          const { error: optErr } = await db
            .from('bet_options')
            .insert({ match_id: matchId, option_text: 'Home win', odds: winnerHome });
          if (!optErr) optionsCreated++;
        }
      }
    }

    if (winnerAway !== null) {
      const { data: existingAway } = await db
        .from('bet_options')
        .select('id')
        .eq('match_id', matchId)
        .eq('option_text', 'Away win')
        .limit(1);
      if (existingAway && existingAway.length > 0) {
        await db.from('bet_options').update({ odds: winnerAway }).eq('id', existingAway[0].id);
      } else {
        const { data: existingWinnerA } = await db
          .from('bet_options')
          .select('id')
          .eq('match_id', matchId)
          .eq('option_text', 'Away winner')
          .limit(1);
        if (existingWinnerA && existingWinnerA.length > 0) {
          await db
            .from('bet_options')
            .update({ option_text: 'Away win', odds: winnerAway })
            .eq('id', existingWinnerA[0].id);
        } else {
          const { error: optErr } = await db
            .from('bet_options')
            .insert({ match_id: matchId, option_text: 'Away win', odds: winnerAway });
          if (!optErr) optionsCreated++;
        }
      }
    }

    for (const opt of oddsArr) {
      // Check of option al bestaat
      const { data: existsOpt } = await db
        .from('bet_options')
        .select('id')
        .eq('match_id', matchId)
        .eq('option_text', opt.option_text)
        .limit(1);
      if (existsOpt && existsOpt.length > 0) {
        await db.from('bet_options').update({ odds: opt.odds }).eq('id', existsOpt[0].id);
      } else {
        const { error: optErr } = await db
          .from('bet_options')
          .insert({ match_id: matchId, option_text: opt.option_text, odds: opt.odds });
        if (!optErr) optionsCreated++;
      }
    }
  }

  console.log('Import klaar:', { inserted, updated, optionsCreated });
}

main().catch((e) => {
  console.error('Onverwachte fout:', e?.message || e);
  process.exit(1);
});