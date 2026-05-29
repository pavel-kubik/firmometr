import { sha256Hex } from './_tokens';

export interface AuthEnv {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
}

export interface AgentPrincipal {
  registration_id: string;
  user_id: string | null;
  scopes: string[];
}

export function extractBearerToken(request: Request): string | null {
  const header = request.headers.get('authorization') ?? '';
  if (!header.toLowerCase().startsWith('bearer ')) return null;
  const token = header.slice(7).trim();
  return token || null;
}

export async function authenticateBearer(
  request: Request,
  env: AuthEnv,
): Promise<AgentPrincipal | null> {
  const token = extractBearerToken(request);
  if (!token || !token.startsWith('sk_')) return null;
  const credential_hash = await sha256Hex(token);
  const url = `${env.SUPABASE_URL}/rest/v1/agent_credentials`
    + `?select=registration_id,user_id,scopes,revoked_at`
    + `&credential_hash=eq.${encodeURIComponent(credential_hash)}`
    + `&limit=1`;
  const res = await fetch(url, {
    headers: {
      apikey: env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    },
  });
  if (!res.ok) return null;
  const rows = await res.json() as Array<{
    registration_id: string;
    user_id: string | null;
    scopes: string[];
    revoked_at: string | null;
  }>;
  const row = rows[0];
  if (!row || row.revoked_at) return null;
  return {
    registration_id: row.registration_id,
    user_id: row.user_id,
    scopes: row.scopes ?? [],
  };
}

export function hasScope(principal: AgentPrincipal | null, scope: string): boolean {
  return !!principal?.scopes?.includes(scope);
}

export async function ensureSupabaseUser(env: AuthEnv, email: string): Promise<string | null> {
  const createRes = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({ email, email_confirm: true }),
  });
  if (createRes.ok) {
    const user = await createRes.json() as { id?: string };
    if (user.id) return user.id;
  }
  const listRes = await fetch(
    `${env.SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
    {
      headers: {
        apikey: env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      },
    },
  );
  if (!listRes.ok) return null;
  const data = await listRes.json() as { users?: Array<{ id: string; email: string }> };
  const found = data.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  return found?.id ?? null;
}
