import { randomToken, sha256Hex } from '../../../../../_shared/_tokens';
import { ensureSupabaseUser } from '../../../../../_shared/_auth';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
}

const MAX_ATTEMPTS = 5;
const POST_CLAIM_SCOPES = ['api.read', 'watchlist.read', 'watchlist.write'];

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

interface ClaimRow {
  claim_token: string;
  registration_id: string;
  pending_email: string;
  otp_hash: string;
  attempts: number;
  expires_at: string;
  completed_at: string | null;
}

interface CredentialRow {
  registration_id: string;
  registration_type: 'anonymous' | 'identity_assertion';
  credential_hash: string | null;
}

async function fetchClaim(env: Env, claim_token: string): Promise<ClaimRow | null> {
  const url = `${env.SUPABASE_URL}/rest/v1/agent_claims`
    + `?select=claim_token,registration_id,pending_email,otp_hash,attempts,expires_at,completed_at`
    + `&claim_token=eq.${encodeURIComponent(claim_token)}`
    + `&limit=1`;
  const res = await fetch(url, {
    headers: {
      apikey: env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    },
  });
  if (!res.ok) return null;
  const rows = await res.json() as ClaimRow[];
  return rows[0] ?? null;
}

async function fetchCredential(env: Env, registration_id: string): Promise<CredentialRow | null> {
  const url = `${env.SUPABASE_URL}/rest/v1/agent_credentials`
    + `?select=registration_id,registration_type,credential_hash`
    + `&registration_id=eq.${encodeURIComponent(registration_id)}`
    + `&limit=1`;
  const res = await fetch(url, {
    headers: {
      apikey: env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    },
  });
  if (!res.ok) return null;
  const rows = await res.json() as CredentialRow[];
  return rows[0] ?? null;
}

async function incrementAttempts(env: Env, claim_token: string, attempts: number): Promise<void> {
  await fetch(
    `${env.SUPABASE_URL}/rest/v1/agent_claims?claim_token=eq.${encodeURIComponent(claim_token)}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ attempts }),
    },
  );
}

async function markClaimCompleted(env: Env, claim_token: string): Promise<boolean> {
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/agent_claims?claim_token=eq.${encodeURIComponent(claim_token)}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ completed_at: new Date().toISOString() }),
    },
  );
  return res.ok;
}

async function upgradeCredential(env: Env, registration_id: string, patch: {
  user_id: string;
  scopes: string[];
  claimed_at: string;
  credential_hash?: string;
}): Promise<boolean> {
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/agent_credentials?registration_id=eq.${encodeURIComponent(registration_id)}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(patch),
    },
  );
  if (!res.ok) console.error('[agent_auth] credential upgrade failed', res.status, await res.text());
  return res.ok;
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
  const ct = request.headers.get('content-type') ?? '';
  if (!ct.includes('application/json')) {
    return jsonResponse({ error: 'unsupported_media_type' }, 415);
  }

  let body: { claim_token?: string; otp?: string };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'invalid_json' }, 400);
  }

  const { claim_token, otp } = body;
  if (!claim_token || !otp) {
    return jsonResponse({ error: 'missing_fields' }, 400);
  }

  const claim = await fetchClaim(env, claim_token);
  if (!claim) return jsonResponse({ error: 'invalid_claim_token' }, 404);
  if (claim.completed_at) return jsonResponse({ error: 'already_claimed' }, 409);
  if (new Date(claim.expires_at).getTime() < Date.now()) {
    return jsonResponse({ error: 'claim_token_expired' }, 410);
  }
  if (claim.attempts >= MAX_ATTEMPTS) {
    return jsonResponse({ error: 'too_many_attempts' }, 429);
  }
  if (!claim.otp_hash) {
    return jsonResponse({ error: 'claim_not_initiated' }, 400);
  }

  const submittedHash = await sha256Hex(otp);
  if (submittedHash !== claim.otp_hash) {
    await incrementAttempts(env, claim_token, claim.attempts + 1);
    return jsonResponse({ error: 'invalid_otp' }, 400);
  }

  const credential = await fetchCredential(env, claim.registration_id);
  if (!credential) return jsonResponse({ error: 'credential_missing' }, 500);

  const userId = await ensureSupabaseUser(env, claim.pending_email);
  if (!userId) return jsonResponse({ error: 'user_provision_failed' }, 500);

  const claimedAt = new Date().toISOString();

  if (credential.registration_type === 'identity_assertion') {
    const newCredential = randomToken('sk');
    const credential_hash = await sha256Hex(newCredential);
    const ok = await upgradeCredential(env, claim.registration_id, {
      user_id: userId,
      scopes: POST_CLAIM_SCOPES,
      claimed_at: claimedAt,
      credential_hash,
    });
    if (!ok) return jsonResponse({ error: 'db_error' }, 500);
    await markClaimCompleted(env, claim_token);
    return jsonResponse({
      ok: true,
      registration_id: claim.registration_id,
      credential_type: 'api_key',
      credential: newCredential,
      credential_expires: null,
      scopes: POST_CLAIM_SCOPES,
    });
  }

  const ok = await upgradeCredential(env, claim.registration_id, {
    user_id: userId,
    scopes: POST_CLAIM_SCOPES,
    claimed_at: claimedAt,
  });
  if (!ok) return jsonResponse({ error: 'db_error' }, 500);
  await markClaimCompleted(env, claim_token);

  return jsonResponse({
    ok: true,
    registration_id: claim.registration_id,
    scopes: POST_CLAIM_SCOPES,
  });
};
