import { randomToken, sha256Hex, generateOtp } from '../../../../_shared/_tokens';
import { sendEmail } from '../../../../_shared/_email';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  BREVO_API_KEY: string;
  ORDER_FROM_NAME: string;
  ORDER_FROM_EMAIL: string;
}

const CLAIM_TTL_SECS = 30 * 60;
const ANON_SCOPES = ['api.read'];
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

async function insertCredential(env: Env, row: {
  registration_id: string;
  credential_hash: string | null;
  registration_type: 'anonymous' | 'identity_assertion';
  assertion_email: string | null;
  scopes: string[];
}): Promise<boolean> {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/agent_credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(row),
  });
  if (!res.ok) console.error('[agent_auth] credential insert failed', res.status, await res.text());
  return res.ok;
}

async function insertClaim(env: Env, row: {
  claim_token: string;
  registration_id: string;
  pending_email: string;
  otp_hash: string;
  expires_at: string;
}): Promise<boolean> {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/agent_claims`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(row),
  });
  if (!res.ok) console.error('[agent_auth] claim insert failed', res.status, await res.text());
  return res.ok;
}

async function sendOtpEmail(env: Env, to: string, otp: string): Promise<void> {
  const html = `<!DOCTYPE html><html lang="cs"><body style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#222">
  <h2 style="color:#059669">Firmometr — ověřovací kód</h2>
  <p>Někdo žádá o přístup k Firmometru pomocí vašeho e-mailu. Pokud to jste vy, zadejte následující kód do svého AI agenta:</p>
  <p style="font-size:28px;letter-spacing:6px;font-weight:700;text-align:center;background:#f3f4f6;padding:16px;border-radius:8px">${otp}</p>
  <p style="color:#6b7280;font-size:14px">Kód vyprší za 30 minut. Pokud jste o přístup nepožádali, tento e-mail můžete ignorovat.</p>
</body></html>`;
  const res = await sendEmail({
    env,
    to: { email: to },
    subject: `Firmometr: ověřovací kód ${otp}`,
    htmlContent: html,
    textContent: `Váš ověřovací kód pro Firmometr: ${otp}\nKód vyprší za 30 minut.`,
  });
  if (!res.ok) console.error('[agent_auth] OTP email failed', res.status, await res.text());
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

  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'invalid_json' }, 400);
  }

  const { type, requested_credential_type, assertion_type, assertion } = body;
  if (requested_credential_type !== 'api_key') {
    return jsonResponse({ error: 'unsupported_credential_type' }, 400);
  }

  const registration_id = randomToken('reg');
  const claim_token = randomToken('clm');
  const expiresAt = new Date(Date.now() + CLAIM_TTL_SECS * 1000).toISOString();

  if (type === 'anonymous') {
    const credential = randomToken('sk');
    const credential_hash = await sha256Hex(credential);

    const credOk = await insertCredential(env, {
      registration_id,
      credential_hash,
      registration_type: 'anonymous',
      assertion_email: null,
      scopes: ANON_SCOPES,
    });
    if (!credOk) return jsonResponse({ error: 'db_error' }, 500);

    const claimOk = await insertClaim(env, {
      claim_token,
      registration_id,
      pending_email: '',
      otp_hash: '',
      expires_at: expiresAt,
    });
    if (!claimOk) return jsonResponse({ error: 'db_error' }, 500);

    return jsonResponse({
      registration_id,
      registration_type: 'anonymous',
      credential_type: 'api_key',
      credential,
      credential_expires: null,
      scopes: ANON_SCOPES,
      claim_url: `${new URL(request.url).origin}/api/v1/agent/auth/claim`,
      claim_token,
      claim_token_expires: expiresAt,
      post_claim_scopes: POST_CLAIM_SCOPES,
    });
  }

  if (type === 'identity_assertion') {
    if (assertion_type !== 'verified_email' || !assertion || typeof assertion !== 'string') {
      return jsonResponse({ error: 'invalid_assertion' }, 400);
    }
    const email = assertion.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ error: 'invalid_email' }, 400);
    }

    const credOk = await insertCredential(env, {
      registration_id,
      credential_hash: null,
      registration_type: 'identity_assertion',
      assertion_email: email,
      scopes: [],
    });
    if (!credOk) return jsonResponse({ error: 'db_error' }, 500);

    const otp = generateOtp();
    const otp_hash = await sha256Hex(otp);
    const claimOk = await insertClaim(env, {
      claim_token,
      registration_id,
      pending_email: email,
      otp_hash,
      expires_at: expiresAt,
    });
    if (!claimOk) return jsonResponse({ error: 'db_error' }, 500);

    await sendOtpEmail(env, email, otp);

    return jsonResponse({
      registration_id,
      registration_type: 'identity_assertion',
      credential_type: 'api_key',
      claim_url: `${new URL(request.url).origin}/api/v1/agent/auth/claim/complete`,
      claim_token,
      claim_token_expires: expiresAt,
      post_claim_scopes: POST_CLAIM_SCOPES,
    });
  }

  return jsonResponse({ error: 'invalid_type' }, 400);
};
