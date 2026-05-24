import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchIcoStatus } from './registry';

const env = {
  SUPABASE_URL: 'http://localhost',
  SUPABASE_SERVICE_KEY: 'test-key',
  FROM_ADDRESS: 'noreply@test.com',
  API_URL: 'https://firmometr.cz',
  MAX_CACHE_AGE_SECS: '86400',
  SEND_EMAIL: { send: vi.fn() },
};

afterEach(() => vi.restoreAllMocks());

describe('fetchIcoStatus', () => {
  it('maps API response to IcoStatus', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        isir: { clarity: 'ACTIVE_DEBTOR' },
        dph: { nespolehlivy: true },
        stavKod: 'AKTIVNI',
      }),
    } as Response);

    const result = await fetchIcoStatus('12345678', env);

    expect(result).toEqual({
      isirClarity: 'ACTIVE_DEBTOR',
      dphNespolehlivy: true,
      aresStavKod: 'AKTIVNI',
    });
    expect(fetch).toHaveBeenCalledWith(
      'https://firmometr.cz/api/v1/search/ico/12345678?max_cache_age=86400',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('throws on non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    await expect(fetchIcoStatus('12345678', env)).rejects.toThrow('API 500');
  });

  it('defaults to CLEAR and null when fields are missing', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response);

    const result = await fetchIcoStatus('12345678', env);

    expect(result).toEqual({
      isirClarity: 'CLEAR',
      dphNespolehlivy: null,
      aresStavKod: null,
    });
  });
});
