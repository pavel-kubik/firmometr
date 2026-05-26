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

const sendEmailMock = vi.fn().mockResolvedValue(undefined);

const env = {
  SUPABASE_URL: 'http://localhost',
  SUPABASE_SERVICE_KEY: 'test-key',
  FROM_ADDRESS: 'noreply@test.com',
  API_URL: 'http://localhost',
  MAX_CACHE_AGE_SECS: '86400',
  SEND_EMAIL: { send: sendEmailMock },
};

const baseRow = {
  id: 'row-1', ico: '12345678', display_name: 'Test s.r.o.',
  user_id: 'user-1', user_email: 'user@test.com',
  isir_clarity: 'CLEAR', dph_nespolehlivy: false, ares_stav_kod: 'AKTIVNI',
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
    const mockClient = makeSupabaseMock([baseRow]);
    vi.mocked(createClient).mockReturnValueOnce(mockClient as never);
    vi.mocked(registry.fetchIcoStatus).mockResolvedValue({
      isirClarity: 'ACTIVE_DEBTOR', dphNespolehlivy: false, aresStavKod: 'AKTIVNI',
    });

    await runDiff(env);

    const updatedData = (mockClient._updateMock.mock.calls as unknown[][])[0]?.[0] as Record<string, unknown>;
    expect(updatedData['isir_clarity']).toBe('ACTIVE_DEBTOR');
    expect(updatedData).not.toHaveProperty('pending_notification');
  });

  it('updates status fields when dph_nespolehlivy changes false→true', async () => {
    const mockClient = makeSupabaseMock([baseRow]);
    vi.mocked(createClient).mockReturnValueOnce(mockClient as never);
    vi.mocked(registry.fetchIcoStatus).mockResolvedValue({
      isirClarity: 'CLEAR', dphNespolehlivy: true, aresStavKod: 'AKTIVNI',
    });

    await runDiff(env);

    const updatedData = (mockClient._updateMock.mock.calls as unknown[][])[0]?.[0] as Record<string, unknown>;
    expect(updatedData['dph_nespolehlivy']).toBe(true);
    expect(sendEmailMock).toHaveBeenCalledOnce();
  });

  it('updates status fields when ares_stav_kod changes', async () => {
    const mockClient = makeSupabaseMock([baseRow]);
    vi.mocked(createClient).mockReturnValueOnce(mockClient as never);
    vi.mocked(registry.fetchIcoStatus).mockResolvedValue({
      isirClarity: 'CLEAR', dphNespolehlivy: false, aresStavKod: 'ZANIKLY',
    });

    await runDiff(env);

    const updatedData = (mockClient._updateMock.mock.calls as unknown[][])[0]?.[0] as Record<string, unknown>;
    expect(updatedData['ares_stav_kod']).toBe('ZANIKLY');
    expect(sendEmailMock).toHaveBeenCalledOnce();
  });

  it('does not update status fields or send email when nothing changed', async () => {
    const mockClient = makeSupabaseMock([baseRow]);
    vi.mocked(createClient).mockReturnValueOnce(mockClient as never);
    vi.mocked(registry.fetchIcoStatus).mockResolvedValue({
      isirClarity: 'CLEAR', dphNespolehlivy: false, aresStavKod: 'AKTIVNI',
    });

    await runDiff(env);

    const updatedData = (mockClient._updateMock.mock.calls as unknown[][])[0]?.[0] as Record<string, unknown>;
    expect(updatedData).not.toHaveProperty('isir_clarity');
    expect(updatedData).not.toHaveProperty('dph_nespolehlivy');
    expect(updatedData).not.toHaveProperty('ares_stav_kod');
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it('always updates last_checked_at even when nothing changed', async () => {
    const mockClient = makeSupabaseMock([baseRow]);
    vi.mocked(createClient).mockReturnValueOnce(mockClient as never);
    vi.mocked(registry.fetchIcoStatus).mockResolvedValue({
      isirClarity: 'CLEAR', dphNespolehlivy: false, aresStavKod: 'AKTIVNI',
    });

    await runDiff(env);

    const updatedData = (mockClient._updateMock.mock.calls as unknown[][])[0]?.[0] as Record<string, unknown>;
    expect(updatedData['last_checked_at']).toBeDefined();
  });

  it('with DRY_RUN: does not send email and does not write to DB', async () => {
    const dryEnv = { ...env, DRY_RUN: 'true' };
    const mockClient = makeSupabaseMock([baseRow]);
    vi.mocked(createClient).mockReturnValueOnce(mockClient as never);
    vi.mocked(registry.fetchIcoStatus).mockResolvedValue({
      isirClarity: 'ACTIVE_DEBTOR', dphNespolehlivy: false, aresStavKod: 'AKTIVNI',
    });

    await runDiff(dryEnv as never);

    expect(sendEmailMock).not.toHaveBeenCalled();
    expect(mockClient._updateMock).not.toHaveBeenCalled();
  });

  it('with TEST_EMAIL: sends email to override address instead of user email', async () => {
    const testEnv = { ...env, TEST_EMAIL: 'dev@example.com' };
    const mockClient = makeSupabaseMock([baseRow]);
    vi.mocked(createClient).mockReturnValueOnce(mockClient as never);
    vi.mocked(registry.fetchIcoStatus).mockResolvedValue({
      isirClarity: 'ACTIVE_DEBTOR', dphNespolehlivy: false, aresStavKod: 'AKTIVNI',
    });

    await runDiff(testEnv as never);

    expect(sendEmailMock).toHaveBeenCalledOnce();
    const callArgs = sendEmailMock.mock.calls[0][0] as Record<string, string>;
    expect(callArgs.to).toBe('dev@example.com');
  });

  it('processes remaining rows when one fetchIcoStatus call throws', async () => {
    const row2 = { ...baseRow, id: 'row-2', ico: '99887766' };
    const mockClient = makeSupabaseMock([baseRow, row2]);
    vi.mocked(createClient).mockReturnValueOnce(mockClient as never);
    vi.mocked(registry.fetchIcoStatus)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ isirClarity: 'CLEAR', dphNespolehlivy: false, aresStavKod: 'AKTIVNI' });

    await runDiff(env);

    expect(registry.fetchIcoStatus).toHaveBeenCalledTimes(2);
    expect(mockClient._updateMock).toHaveBeenCalledTimes(1);
  });

  it('only changed rows get email + DB update when multiple rows present', async () => {
    const changedRow = { ...baseRow, id: 'row-1', ico: '12345678' };
    const stableRow = { ...baseRow, id: 'row-2', ico: '99887766' };
    const mockClient = makeSupabaseMock([changedRow, stableRow]);
    vi.mocked(createClient).mockReturnValueOnce(mockClient as never);
    vi.mocked(registry.fetchIcoStatus)
      .mockResolvedValueOnce({ isirClarity: 'ACTIVE_DEBTOR', dphNespolehlivy: false, aresStavKod: 'AKTIVNI' })
      .mockResolvedValueOnce({ isirClarity: 'CLEAR', dphNespolehlivy: false, aresStavKod: 'AKTIVNI' });

    await runDiff(env);

    expect(sendEmailMock).toHaveBeenCalledTimes(1);
    expect(mockClient._updateMock).toHaveBeenCalledTimes(2);

    // Rows complete concurrently; don't assert order, just that one update has
    // status fields (changed row) and one doesn't (stable row).
    const allUpdates = (mockClient._updateMock.mock.calls as unknown[][]).map(
      c => c[0] as Record<string, unknown>
    );
    expect(allUpdates.some(u => 'isir_clarity' in u)).toBe(true);
    expect(allUpdates.some(u => !('isir_clarity' in u))).toBe(true);
  });
});
