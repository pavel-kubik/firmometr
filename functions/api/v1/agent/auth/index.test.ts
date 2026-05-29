import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { onRequestPost, onRequestOptions } from './index';

const env = {
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_SERVICE_KEY: 'service-key',
  BREVO_API_KEY: 'brevo-key',
  ORDER_FROM_NAME: 'Firmometr',
  ORDER_FROM_EMAIL: 'noreply@firmometr.cz',
};

function makeRequest(body: unknown, contentType = 'application/json'): Request {
  return new Request('https://example.com/api/v1/agent/auth', {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('POST /api/v1/agent/auth', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('returns 415 for non-JSON content type', async () => {
    const res = await onRequestPost({
      request: makeRequest('plain', 'text/plain'),
      env,
    });
    expect(res.status).toBe(415);
  });

  it('returns 400 for invalid JSON', async () => {
    const res = await onRequestPost({
      request: makeRequest('{not json'),
      env,
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 when requested_credential_type is unsupported', async () => {
    const res = await onRequestPost({
      request: makeRequest({ type: 'anonymous', requested_credential_type: 'oauth_token' }),
      env,
    });
    expect(res.status).toBe(400);
    expect((await res.json() as { error: string }).error).toBe('unsupported_credential_type');
  });

  it('returns 400 for unknown registration type', async () => {
    const res = await onRequestPost({
      request: makeRequest({ type: 'mystery', requested_credential_type: 'api_key' }),
      env,
    });
    expect(res.status).toBe(400);
  });

  it('issues an api_key for anonymous registration', async () => {
    const res = await onRequestPost({
      request: makeRequest({ type: 'anonymous', requested_credential_type: 'api_key' }),
      env,
    });
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.registration_type).toBe('anonymous');
    expect(body.credential).toMatch(/^sk_/);
    expect(body.registration_id).toMatch(/^reg_/);
    expect(body.claim_token).toMatch(/^clm_/);
    expect(body.scopes).toEqual(['api.read']);
    expect(body.post_claim_scopes).toEqual(['api.read', 'watchlist.read', 'watchlist.write']);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const credUrl = (fetchMock.mock.calls[0] as [string, RequestInit])[0];
    expect(credUrl).toContain('/rest/v1/agent_credentials');
    const claimUrl = (fetchMock.mock.calls[1] as [string, RequestInit])[0];
    expect(claimUrl).toContain('/rest/v1/agent_claims');
  });

  it('sends OTP email and withholds credential on identity_assertion registration', async () => {
    const res = await onRequestPost({
      request: makeRequest({
        type: 'identity_assertion',
        assertion_type: 'verified_email',
        assertion: 'agent@example.com',
        requested_credential_type: 'api_key',
      }),
      env,
    });
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.registration_type).toBe('identity_assertion');
    expect(body.credential).toBeUndefined();
    expect(body.claim_token).toMatch(/^clm_/);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    const emailCall = fetchMock.mock.calls[2] as [string, RequestInit];
    expect(emailCall[0]).toBe('https://api.brevo.com/v3/smtp/email');
    const payload = JSON.parse(emailCall[1].body as string);
    expect(payload.to).toEqual([{ email: 'agent@example.com' }]);
    expect(payload.subject).toMatch(/Firmometr: ověřovací kód \d{6}/);
  });

  it('rejects identity_assertion with malformed email', async () => {
    const res = await onRequestPost({
      request: makeRequest({
        type: 'identity_assertion',
        assertion_type: 'verified_email',
        assertion: 'not-an-email',
        requested_credential_type: 'api_key',
      }),
      env,
    });
    expect(res.status).toBe(400);
    expect((await res.json() as { error: string }).error).toBe('invalid_email');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('OPTIONS returns CORS preflight 204', () => {
    const res = onRequestOptions();
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('POST');
  });
});
