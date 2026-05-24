import { createClient } from '@supabase/supabase-js';
import { fetchIcoStatus } from './registry';
import { buildEmail } from './email-template';
import type { Env } from './index';

interface WatchlistRow {
  id: string;
  ico: string;
  display_name: string;
  user_id: string;
  user_email: string;
  isir_clarity: string | null;
  dph_nespolehlivy: boolean | null;
  ares_stav_kod: string | null;
}

export async function runDiff(env: Env): Promise<void> {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });

  const { data: rows, error } = await supabase
    .from('watchlist_with_email')
    .select('id, ico, display_name, user_id, user_email, isir_clarity, dph_nespolehlivy, ares_stav_kod');

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
    isirClarity     !== row.isir_clarity ||
    dphNespolehlivy !== row.dph_nespolehlivy ||
    aresStavKod     !== row.ares_stav_kod;

  const updateData: Record<string, unknown> = {
    last_checked_at: new Date().toISOString(),
  };

  if (changed) {
    updateData['isir_clarity']     = isirClarity;
    updateData['dph_nespolehlivy'] = dphNespolehlivy;
    updateData['ares_stav_kod']    = aresStavKod;

    const { subject, html, text } = buildEmail({
      ico: row.ico,
      displayName: row.display_name,
      isirClarity,
      dphNespolehlivy,
      aresStavKod,
    });
    const recipient = env.TEST_EMAIL ?? row.user_email;

    if (env.DRY_RUN) {
      console.log(`[diff][dry-run] Would email ${recipient}: ${subject}`);
    } else {
      console.log(`[diff] Change detected for ico=${row.ico} user=${row.user_email}`);
      await env.SEND_EMAIL.send({ from: env.FROM_ADDRESS, to: recipient, subject, html, text });
    }
  }

  if (!env.DRY_RUN) {
    await supabase.from('watchlist').update(updateData).eq('id', row.id);
  }
}
