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
): void {
  // fire-and-forget — never awaited, never blocks the response
  fetch(`${supabaseUrl}/rest/v1/api_calls`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(log),
  }).catch(() => { /* intentionally swallowed */ });
}
