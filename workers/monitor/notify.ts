import { createClient } from '@supabase/supabase-js';
import { buildEmail } from './email-template';
import type { Env, EmailMessage } from './index';

interface PendingRow {
  id: string;
  ico: string;
  display_name: string;
  user_id: string;
  notify_email: string;
  isir_clarity: string | null;
  dph_nespolehlivy: boolean | null;
  ares_stav_kod: string | null;
}

export async function runNotify(env: Env): Promise<void> {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });

  const { data: rows, error } = await supabase
    .from('watchlist')
    .select('id, ico, display_name, user_id, notify_email, isir_clarity, dph_nespolehlivy, ares_stav_kod')
    .eq('pending_notification', true);

  if (error) { console.error('[notify] Failed to load pending rows:', error.message); return; }
  if (!rows?.length) return;

  for (const row of rows as PendingRow[]) {
    try {
      const { data: userData } = await supabase.auth.admin.getUserById(row.user_id);
      const toEmail = userData?.user?.email ?? row.notify_email;

      const { subject, html, text } = buildEmail({
        ico: row.ico,
        displayName: row.display_name,
        notifyEmail: toEmail,
        isirClarity: row.isir_clarity,
        dphNespolehlivy: row.dph_nespolehlivy,
        aresStavKod: row.ares_stav_kod,
      });

      const message: EmailMessage = {
        from: env.FROM_ADDRESS,
        to: toEmail,
        subject,
        html,
        text,
      };

      await env.SEND_EMAIL.send(message);
      await supabase.from('watchlist').update({ pending_notification: false }).eq('id', row.id);
      console.log(`[notify] Sent to ${toEmail} for ico=${row.ico}`);
    } catch (e) {
      console.error(`[notify] Failed for row ${row.id}:`, e);
    }
  }
}
