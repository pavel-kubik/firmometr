import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { onRequestPost } from './complete';
import { sha256Hex } from '../../../../../_shared/_tokens';

const env = {
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_SERVICE_KEY: 'service-key',
};

function makeRequest(body: unknown): Request {
  return new Request('https://example.com/api/v1/agent/auth/claim/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function claimRow(otpHash: string, overrides: Record<string, unknown> = {}) {
  return new Response(JSON.stringify([{
    claim_token: 'clm_x',
    registration_id: 'reg_x',
    pending_email: 'agent@example.com',
    otp_hash: otpHash,
    attempts: 0,
    expires_at: new Date(Date.now() + 60_000).toISOString(),
    completed_at: null,
    ...overrides,
  }]), { status: 200 });
}

function credentialRow(registration_type = 'anonymous') {
  return new Response(JSON.stringify([{
    registration_id: 'reg_x',
    registration_type,
    credential_hash: null,
  }]), { status: 200 });
}

describe('POST /api/v1/agent/auth/claim/complete', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('returns 400 when missing fields', async () => {
    const res = await onRequestPost({
      request: makeRequest({ claim_token: 'clm_x' }),
      env,
    });
    expect(res.status).toBe(400);
  });

  it('returns 404 when claim unknown', async () => {
    fetchMock.mockResolvedValueOnce(new Response('[]', { status: 200 }));
    const res = await onRequestPost({
      request: makeRequest({ claim_token: 'clm_x', otp: '123456' }),
      env,
    });
    expect(res.status).toBe(404);
  });

  it('returns 410 when claim_token expired', async () => {
    const otpHash = await sha256Hex('123456');
    fetchMock.mockResolvedValueOnce(claimRow(otpHash, {
      expires_at: new Date(Date.now() - 1000).toISOString(),
    }));
    const res = await onRequestPost({
      request: makeRequest({ claim_token: 'clm_x', otp: '123456' }),
      env,
    });
    expect(res.status).toBe(410);
  });

  it('returns 429 after max attempts reached', async () => {
    const otpHash = await sha256Hex('123456');
    fetchMock.mockResolvedValueOnce(claimRow(otpHash, { attempts: 5 }));
    const res = await onRequestPost({
      request: makeRequest({ claim_token: 'clm_x', otp: '123456' }),
      env,
    });
    expect(res.status).toBe(429);
  });

  it('increments attempts and returns 400 on wrong OTP', async () => {
    const otpHash = await sha256Hex('123456');
    fetchMock
      .mockResolvedValueOnce(claimRow(otpHash))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const res = await onRequestPost({
      request: makeRequest({ claim_token: 'clm_x', otp: '999999' }),
      env,
    });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toBe('invalid_otp');
    const patchCall = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(patchCall[1].method).toBe('PATCH');
    expect(JSON.parse(patchCall[1].body as string).attempts).toBe(1);
  });

  it('anonymous claim upgrades scopes and does not return a new credential', async () => {
    const otpHash = await sha256Hex('123456');
    fetchMock
      .mockResolvedValueOnce(claimRow(otpHash))
      .mockResolvedValueOnce(credentialRow('anonymous'))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'u1' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const res = await onRequestPost({
      request: makeRequest({ claim_token: 'clm_x', otp: '123456' }),
      env,
    });
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.ok).toBe(true);
    expect(body.credential).toBeUndefined();
    expect(body.scopes).toEqual(['api.read', 'watchlist.read', 'watchlist.write']);

    const upgrade = fetchMock.mock.calls[3] as [string, RequestInit];
    expect(upgrade[0]).toContain('/rest/v1/agent_credentials');
    const patch = JSON.parse(upgrade[1].body as string);
    expect(patch.user_id).toBe('u1');
    expect(patch.scopes).toEqual(['api.read', 'watchlist.read', 'watchlist.write']);
    expect(patch.credential_hash).toBeUndefined();
  });

  it('identity_assertion claim mints credential and returns it', async () => {
    const otpHash = await sha256Hex('123456');
    fetchMock
      .mockResolvedValueOnce(claimRow(otpHash))
      .mockResolvedValueOnce(credentialRow('identity_assertion'))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'u1' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const res = await onRequestPost({
      request: makeRequest({ claim_token: 'clm_x', otp: '123456' }),
      env,
    });
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.credential).toMatch(/^sk_/);
    expect(body.scopes).toEqual(['api.read', 'watchlist.read', 'watchlist.write']);

    const upgrade = fetchMock.mock.calls[3] as [string, RequestInit];
    const patch = JSON.parse(upgrade[1].body as string);
    expect(patch.credential_hash).toMatch(/^[a-f0-9]{64}$/);
  });
});
