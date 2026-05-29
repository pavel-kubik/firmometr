import { sha256Hex } from '../../../../_shared/_tokens';
import { extractBearerToken } from '../../../../_shared/_auth';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export const onRequestOptions = () => new Response(null, {
  status: 204,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  },
});

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  let credential: string | null = extractBearerToken(request);

  const ct = request.headers.get('content-type') ?? '';
  if (!credential && ct.includes('application/json')) {
    try {
      const body = await request.json() as { credential?: string };
      credential = body.credential ?? null;
    } catch {
      return jsonResponse({ error: 'invalid_json' }, 400);
    }
  }

  if (!credential || !credential.startsWith('sk_')) {
    return jsonResponse({ error: 'missing_credential' }, 400);
  }

  const credential_hash = await sha256Hex(credential);
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/agent_credentials?credential_hash=eq.${encodeURIComponent(credential_hash)}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ revoked_at: new Date().toISOString() }),
    },
  );

  if (!res.ok) {
    console.error('[agent_auth] revoke failed', res.status, await res.text());
    return jsonResponse({ error: 'db_error' }, 500);
  }
  const rows = await res.json() as Array<{ registration_id: string }>;
  if (rows.length === 0) {
    return jsonResponse({ error: 'unknown_credential' }, 404);
  }
  return jsonResponse({ ok: true, registration_id: rows[0].registration_id });
};
