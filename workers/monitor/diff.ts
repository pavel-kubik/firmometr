import { createClient } from '@supabase/supabase-js';
import { fetchIcoStatus } from './registry';
import type { Env } from './index';

interface WatchlistRow {
  id: string;
  ico: string;
  display_name: string;
  user_id: string;
  notify_email: string;
  isir_clarity: string | null;
  dph_nespolehlivy: boolean | null;
  ares_stav_kod: string | null;
}

export async function runDiff(env: Env): Promise<void> {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });

  const { data: rows, error } = await supabase
    .from('watchlist')
    .select('id, ico, display_name, user_id, notify_email, isir_clarity, dph_nespolehlivy, ares_stav_kod')
    .not('notify_email', 'is', null);

  if (error) { console.error('[diff] Failed to load watchlist:', error.message); return; }
  if (!rows?.length) return;

  const results = await Promise.allSettled(
    (rows as WatchlistRow[]).map(row => diffRow(row, supabase, env))
  );

  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`[diff] Failed for row ${(rows as WatchlistRow[])[i].id}:`, r.reason);
    }
  });
}

async function diffRow(
  row: WatchlistRow,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  env: Env,
): Promise<void> {
  const { isirClarity, dphNespolehlivy, aresStavKod } = await fetchIcoStatus(row.ico, env);

  const changed =
    isirClarity !== row.isir_clarity ||
    dphNespolehlivy !== row.dph_nespolehlivy ||
    aresStavKod !== row.ares_stav_kod;

  const updateData: Record<string, unknown> = {
    last_checked_at: new Date().toISOString(),
  };

  if (changed) {
    updateData['isir_clarity'] = isirClarity;
    updateData['dph_nespolehlivy'] = dphNespolehlivy;
    updateData['ares_stav_kod'] = aresStavKod;
    updateData['pending_notification'] = true;
    console.log(`[diff] Change detected for ico=${row.ico}`);
  }

  await supabase.from('watchlist').update(updateData).eq('id', row.id);
}
