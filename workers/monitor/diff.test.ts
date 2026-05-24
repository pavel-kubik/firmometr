import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./registry', () => ({
  fetchIcoStatus: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

import { createClient } from '@supabase/supabase-js';
import { runDiff } from './diff';
import * as registry from './registry';

function makeSupabaseMock(rows: unknown[]) {
  const eqMock = vi.fn().mockResolvedValue({ error: null });
  const updateMock = vi.fn(() => ({ eq: eqMock }));
  return {
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: rows, error: null }),
      update: updateMock,
    })),
    _updateMock: updateMock,
    _eqMock: eqMock,
  };
}

const env = {
  SUPABASE_URL: 'http://localhost',
  SUPABASE_SERVICE_KEY: 'test-key',
  FROM_ADDRESS: 'noreply@test.com',
  API_URL: 'http://localhost',
  MAX_CACHE_AGE_SECS: '86400',
  SEND_EMAIL: { send: vi.fn().mockResolvedValue(undefined) },
};

describe('runDiff', () => {
  beforeEach(() => vi.clearAllMocks());

  it('does nothing when watchlist is empty', async () => {
    const mockClient = makeSupabaseMock([]);
    vi.mocked(createClient).mockReturnValueOnce(mockClient as never);
    await runDiff(env);
    expect(registry.fetchIcoStatus).not.toHaveBeenCalled();
  });

  it('updates status fields when isir_clarity changes', async () => {
    const row = {
      id: 'row-1', ico: '12345678', display_name: 'Test s.r.o.',
      user_id: 'user-1', user_email: 'user@test.com',
      isir_clarity: 'CLEAR', dph_nespolehlivy: false, ares_stav_kod: 'AKTIVNI',
    };
    const mockClient = makeSupabaseMock([row]);
    vi.mocked(createClient).mockReturnValueOnce(mockClient as never);
    vi.mocked(registry.fetchIcoStatus).mockResolvedValue({
      isirClarity: 'ACTIVE_DEBTOR',
      dphNespolehlivy: false,
      aresStavKod: 'AKTIVNI',
    });

    await runDiff(env);

    const updatedData = (mockClient._updateMock.mock.calls as unknown[][])[0]?.[0] as Record<string, unknown>;
    expect(updatedData['isir_clarity']).toBe('ACTIVE_DEBTOR');
    expect(updatedData['pending_notification']).toBeUndefined();
  });

  it('does not update status fields when nothing changed', async () => {
    const row = {
      id: 'row-2', ico: '99887766', display_name: 'Stable s.r.o.',
      user_id: 'user-2', user_email: 'user@test.com',
      isir_clarity: 'CLEAR', dph_nespolehlivy: false, ares_stav_kod: 'AKTIVNI',
    };
    const mockClient = makeSupabaseMock([row]);
    vi.mocked(createClient).mockReturnValueOnce(mockClient as never);
    vi.mocked(registry.fetchIcoStatus).mockResolvedValue({
      isirClarity: 'CLEAR',
      dphNespolehlivy: false,
      aresStavKod: 'AKTIVNI',
    });

    await runDiff(env);

    const updatedData = (mockClient._updateMock.mock.calls as unknown[][])[0]?.[0] as Record<string, unknown>;
    expect(updatedData['isir_clarity']).toBeUndefined();
    expect(updatedData['pending_notification']).toBeUndefined();
  });
});
