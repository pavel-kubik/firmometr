import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isAuthenticated } from './_auth';

const env = { SUPABASE_URL: 'https://x.supabase.co', SUPABASE_ANON_KEY: 'anon' };
const req = (auth?: string) =>
  new Request('https://firmometr.cz/api/v1/statements/123', auth ? { headers: { authorization: auth } } : undefined);

beforeEach(() => { vi.restoreAllMocks(); });
afterEach(() => { vi.restoreAllMocks(); });

describe('isAuthenticated', () => {
  it('rejects requests with no Authorization header (no network call)', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    expect(await isAuthenticated(req(), env)).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('rejects a non-Bearer header', async () => {
    expect(await isAuthenticated(req('Basic abc'), env)).toBe(false);
  });

  it('accepts a token Supabase recognises (200)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
    expect(await isAuthenticated(req('Bearer good.jwt.token'), env)).toBe(true);
  });

  it('rejects a token Supabase refuses (401)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 401 }));
    expect(await isAuthenticated(req('Bearer bad.jwt.token'), env)).toBe(false);
  });

  it('rejects when the verification call throws', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network'));
    expect(await isAuthenticated(req('Bearer x.y.z'), env)).toBe(false);
  });
});
