// Backend auth gate for registered-user features. Verifies the caller's Supabase
// access token for real (not just decoding it) by asking Supabase Auth who it is.

interface AuthEnv {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

/**
 * True when the request carries a valid (non-expired, Supabase-recognised) bearer
 * token — i.e. the caller is an authenticated/registered user.
 *
 * Cheap path: no `Bearer <token>` header → false immediately (covers anonymous,
 * the common case) without a network call.
 *
 * Extension point: this only proves "authenticated" (= REGISTERED). To gate a
 * feature at BASIC/ENTERPRISE, additionally load `profiles.user_tier` for the
 * returned user id (service-role query) and compare access ranks.
 */
export async function isAuthenticated(request: Request, env: AuthEnv): Promise<boolean> {
  const header = request.headers.get('authorization') ?? '';
  if (!header.startsWith('Bearer ')) return false;
  const token = header.slice(7).trim();
  if (!token) return false;

  try {
    const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
