import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSendEmail = vi.fn().mockResolvedValue(undefined);

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

import { createClient } from '@supabase/supabase-js';
import { runNotify } from './notify';

function makeNotifySupabaseMock(rows: unknown[], userEmail = 'user@test.com') {
  const eqUpdateMock = vi.fn().mockResolvedValue({ error: null });
  const updateFn = vi.fn(() => ({ eq: eqUpdateMock }));
  return {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ data: rows, error: null }),
      })),
      update: updateFn,
    })),
    auth: {
      admin: {
        getUserById: vi.fn().mockResolvedValue({ data: { user: { email: userEmail } }, error: null }),
      },
    },
    _updateFn: updateFn,
    _eqUpdateMock: eqUpdateMock,
  };
}

const env = {
  SUPABASE_URL: 'http://localhost',
  SUPABASE_SERVICE_KEY: 'test-key',
  FROM_ADDRESS: 'noreply@test.com',
  API_URL: 'http://localhost',
  MAX_CACHE_AGE_SECS: '86400',
  SEND_EMAIL: { send: mockSendEmail },
};

describe('runNotify', () => {
  beforeEach(() => vi.clearAllMocks());

  it('does nothing when no pending rows', async () => {
    const mockClient = makeNotifySupabaseMock([]);
    vi.mocked(createClient).mockReturnValueOnce(mockClient as never);
    await runNotify(env);
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('sends email and clears pending_notification for each row', async () => {
    const row = {
      id: 'row-1', ico: '12345678', display_name: 'Test s.r.o.',
      user_id: 'user-1', notify_email: 'user@test.com',
      isir_clarity: 'ACTIVE_DEBTOR', dph_nespolehlivy: false, ares_stav_kod: 'AKTIVNI',
    };
    const mockClient = makeNotifySupabaseMock([row], 'user@test.com');
    vi.mocked(createClient).mockReturnValueOnce(mockClient as never);

    await runNotify(env);

    expect(mockSendEmail).toHaveBeenCalledOnce();
    const sentArg = (mockSendEmail.mock.calls as unknown[][])[0]?.[0] as Record<string, unknown>;
    expect(sentArg?.['to']).toBe('user@test.com');
    expect(sentArg?.['from']).toBe('noreply@test.com');
    expect(sentArg?.['subject']).toContain('Test s.r.o.');

    const updatedData = (mockClient._updateFn.mock.calls as unknown[][])[0]?.[0] as Record<string, unknown>;
    expect(updatedData?.['pending_notification']).toBe(false);
  });

  it('leaves pending_notification=true if send fails', async () => {
    const row = {
      id: 'row-2', ico: '99887766', display_name: 'Error s.r.o.',
      user_id: 'user-2', notify_email: 'fail@test.com',
      isir_clarity: 'CLEAR', dph_nespolehlivy: true, ares_stav_kod: 'AKTIVNI',
    };
    const mockClient = makeNotifySupabaseMock([row], 'fail@test.com');
    vi.mocked(createClient).mockReturnValueOnce(mockClient as never);
    mockSendEmail.mockRejectedValueOnce(new Error('send failed'));

    await runNotify(env);

    expect(mockClient._updateFn).not.toHaveBeenCalled();
  });
});
