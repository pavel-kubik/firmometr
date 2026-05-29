import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authenticateBearer, extractBearerToken, hasScope, ensureSupabaseUser } from './_auth';

const env = {
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_SERVICE_KEY: 'service-key',
};

function makeRequest(authHeader?: string): Request {
  const headers: Record<string, string> = {};
  if (authHeader) headers['Authorization'] = authHeader;
  return new Request('https://example.com/x', { headers });
}

describe('extractBearerToken', () => {
  it('returns null when header missing', () => {
    expect(extractBearerToken(makeRequest())).toBe(null);
  });
  it('returns null when not bearer', () => {
    expect(extractBearerToken(makeRequest('Basic xyz'))).toBe(null);
  });
  it('extracts the token after Bearer', () => {
    expect(extractBearerToken(makeRequest('Bearer sk_abc'))).toBe('sk_abc');
  });
  it('is case-insensitive on the scheme', () => {
    expect(extractBearerToken(makeRequest('bearer sk_abc'))).toBe('sk_abc');
  });
});

describe('hasScope', () => {
  it('returns false for null principal', () => {
    expect(hasScope(null, 'api.read')).toBe(false);
  });
  it('returns true when scope present', () => {
    expect(hasScope({ registration_id: 'r', user_id: null, scopes: ['api.read'] }, 'api.read')).toBe(true);
  });
  it('returns false when scope absent', () => {
    expect(hasScope({ registration_id: 'r', user_id: null, scopes: ['api.read'] }, 'watchlist.read')).toBe(false);
  });
});

describe('authenticateBearer', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('returns null without bearer token', async () => {
    expect(await authenticateBearer(makeRequest(), env)).toBe(null);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns null for non-sk_ token', async () => {
    expect(await authenticateBearer(makeRequest('Bearer abc'), env)).toBe(null);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns principal when DB has matching unrevoked row', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify([{
      registration_id: 'reg_x', user_id: 'u1', scopes: ['api.read'], revoked_at: null,
    }]), { status: 200 }));
    const p = await authenticateBearer(makeRequest('Bearer sk_test'), env);
    expect(p).toEqual({ registration_id: 'reg_x', user_id: 'u1', scopes: ['api.read'] });
  });

  it('returns null when credential is revoked', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify([{
      registration_id: 'reg_x', user_id: null, scopes: ['api.read'], revoked_at: '2025-01-01T00:00:00Z',
    }]), { status: 200 }));
    expect(await authenticateBearer(makeRequest('Bearer sk_test'), env)).toBe(null);
  });

  it('returns null when no rows match', async () => {
    fetchMock.mockResolvedValueOnce(new Response('[]', { status: 200 }));
    expect(await authenticateBearer(makeRequest('Bearer sk_test'), env)).toBe(null);
  });
});

describe('ensureSupabaseUser', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('returns id from successful create', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ id: 'u1' }), { status: 200 }));
    expect(await ensureSupabaseUser(env, 'a@b.cz')).toBe('u1');
  });

  it('falls back to lookup when create returns 422', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response('{"msg":"exists"}', { status: 422 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        users: [{ id: 'u_existing', email: 'a@b.cz' }],
      }), { status: 200 }));
    expect(await ensureSupabaseUser(env, 'a@b.cz')).toBe('u_existing');
  });

  it('returns null when lookup yields no match', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response('{}', { status: 500 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ users: [] }), { status: 200 }));
    expect(await ensureSupabaseUser(env, 'a@b.cz')).toBe(null);
  });
});
