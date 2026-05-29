import { sha256Hex, generateOtp } from '../../../../../_shared/_tokens';
import { sendEmail } from '../../../../../_shared/_email';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  BREVO_API_KEY: string;
  ORDER_FROM_NAME: string;
  ORDER_FROM_EMAIL: string;
}

const CLAIM_TTL_SECS = 30 * 60;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

async function fetchClaim(env: Env, claim_token: string) {
  const url = `${env.SUPABASE_URL}/rest/v1/agent_claims`
    + `?select=claim_token,registration_id,expires_at,completed_at`
    + `&claim_token=eq.${encodeURIComponent(claim_token)}`
    + `&limit=1`;
  const res = await fetch(url, {
    headers: {
      apikey: env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    },
  });
  if (!res.ok) return null;
  const rows = await res.json() as Array<{
    claim_token: string;
    registration_id: string;
    expires_at: string;
    completed_at: string | null;
  }>;
  return rows[0] ?? null;
}

async function fetchCredentialType(env: Env, registration_id: string): Promise<string | null> {
  const url = `${env.SUPABASE_URL}/rest/v1/agent_credentials`
    + `?select=registration_type`
    + `&registration_id=eq.${encodeURIComponent(registration_id)}`
    + `&limit=1`;
  const res = await fetch(url, {
    headers: {
      apikey: env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    },
  });
  if (!res.ok) return null;
  const rows = await res.json() as Array<{ registration_type: string }>;
  return rows[0]?.registration_type ?? null;
}

async function updateClaim(env: Env, claim_token: string, patch: {
  pending_email: string;
  otp_hash: string;
  expires_at: string;
  attempts: number;
}): Promise<boolean> {
  const url = `${env.SUPABASE_URL}/rest/v1/agent_claims`
    + `?claim_token=eq.${encodeURIComponent(claim_token)}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      apikey: env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(patch),
  });
  if (!res.ok) console.error('[agent_auth] claim update failed', res.status, await res.text());
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

  let body: { claim_token?: string; email?: string };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'invalid_json' }, 400);
  }

  const { claim_token, email } = body;
  if (!claim_token || !email) {
    return jsonResponse({ error: 'missing_fields' }, 400);
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return jsonResponse({ error: 'invalid_email' }, 400);
  }

  const claim = await fetchClaim(env, claim_token);
  if (!claim) return jsonResponse({ error: 'invalid_claim_token' }, 404);
  if (claim.completed_at) return jsonResponse({ error: 'already_claimed' }, 409);

  const registrationType = await fetchCredentialType(env, claim.registration_id);
  if (registrationType !== 'anonymous') {
    return jsonResponse({ error: 'not_anonymous_claim' }, 400);
  }

  const otp = generateOtp();
  const otp_hash = await sha256Hex(otp);
  const newExpiresAt = new Date(Date.now() + CLAIM_TTL_SECS * 1000).toISOString();

  const ok = await updateClaim(env, claim_token, {
    pending_email: normalizedEmail,
    otp_hash,
    expires_at: newExpiresAt,
    attempts: 0,
  });
  if (!ok) return jsonResponse({ error: 'db_error' }, 500);

  await sendOtpEmail(env, normalizedEmail, otp);

  return jsonResponse({
    ok: true,
    claim_token_expires: newExpiresAt,
  });
};
