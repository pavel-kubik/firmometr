export interface ApiCallLog {
  registry: string;
  url: string;
  ico?: string;
  source_ip?: string;
  user_agent?: string;
  user_id?: string;
  cache_hit: boolean;
  duration_ms?: number;
  error?: string;
}

export function logApiCall(
  supabaseUrl: string,
  supabaseServiceKey: string,
  log: ApiCallLog,
): Promise<void> {
  // Returns a promise so callers can pass it to waitUntil() — required in
  // Cloudflare Workers to keep background fetches alive after response is sent.
  return fetch(`${supabaseUrl}/rest/v1/api_calls`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(log),
  }).then(async (res) => {
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error(`[analytics] Supabase insert failed ${res.status}: ${body}`);
    }
  }).catch((e) => {
    console.error(`[analytics] Supabase insert error: ${e}`);
  });
}
