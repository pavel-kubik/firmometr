import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { onRequestPost } from './index';

const env = {
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_SERVICE_KEY: 'service-key',
  BREVO_API_KEY: 'brevo-key',
  ORDER_FROM_NAME: 'Firmometr',
  ORDER_FROM_EMAIL: 'noreply@firmometr.cz',
};

function makeRequest(body: unknown): Request {
  return new Request('https://example.com/api/v1/agent/auth/claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function claimRow(overrides: Record<string, unknown> = {}) {
  return new Response(JSON.stringify([{
    claim_token: 'clm_x',
    registration_id: 'reg_x',
    expires_at: new Date(Date.now() + 60_000).toISOString(),
    completed_at: null,
    ...overrides,
  }]), { status: 200 });
}

function credentialRow(registration_type = 'anonymous') {
  return new Response(JSON.stringify([{ registration_type }]), { status: 200 });
}

describe('POST /api/v1/agent/auth/claim', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('returns 400 when claim_token or email missing', async () => {
    const res = await onRequestPost({
      request: makeRequest({ claim_token: 'clm_x' }),
      env,
    });
    expect(res.status).toBe(400);
  });

  it('returns 404 when claim_token is unknown', async () => {
    fetchMock.mockResolvedValueOnce(new Response('[]', { status: 200 }));
    const res = await onRequestPost({
      request: makeRequest({ claim_token: 'clm_x', email: 'a@b.cz' }),
      env,
    });
    expect(res.status).toBe(404);
  });

  it('returns 409 when claim already completed', async () => {
    fetchMock.mockResolvedValueOnce(claimRow({ completed_at: new Date().toISOString() }));
    const res = await onRequestPost({
      request: makeRequest({ claim_token: 'clm_x', email: 'a@b.cz' }),
      env,
    });
    expect(res.status).toBe(409);
  });

  it('rejects identity_assertion claims (they have no /claim trigger step)', async () => {
    fetchMock
      .mockResolvedValueOnce(claimRow())
      .mockResolvedValueOnce(credentialRow('identity_assertion'));
    const res = await onRequestPost({
      request: makeRequest({ claim_token: 'clm_x', email: 'a@b.cz' }),
      env,
    });
    expect(res.status).toBe(400);
    expect((await res.json() as { error: string }).error).toBe('not_anonymous_claim');
  });

  it('updates the claim, sends OTP email and returns ok', async () => {
    fetchMock
      .mockResolvedValueOnce(claimRow())
      .mockResolvedValueOnce(credentialRow('anonymous'))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }));
    const res = await onRequestPost({
      request: makeRequest({ claim_token: 'clm_x', email: 'agent@example.com' }),
      env,
    });
    expect(res.status).toBe(200);
    expect(((await res.json()) as { ok: boolean }).ok).toBe(true);

    const updateCall = fetchMock.mock.calls[2] as [string, RequestInit];
    expect(updateCall[0]).toContain('/rest/v1/agent_claims');
    expect(updateCall[1].method).toBe('PATCH');
    const patch = JSON.parse(updateCall[1].body as string);
    expect(patch.pending_email).toBe('agent@example.com');
    expect(patch.otp_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(patch.attempts).toBe(0);

    const emailCall = fetchMock.mock.calls[3] as [string, RequestInit];
    expect(emailCall[0]).toBe('https://api.brevo.com/v3/smtp/email');
    const payload = JSON.parse(emailCall[1].body as string);
    expect(payload.to).toEqual([{ email: 'agent@example.com' }]);
  });

  it('rejects malformed email', async () => {
    const res = await onRequestPost({
      request: makeRequest({ claim_token: 'clm_x', email: 'no-at-sign' }),
      env,
    });
    expect(res.status).toBe(400);
  });
});
