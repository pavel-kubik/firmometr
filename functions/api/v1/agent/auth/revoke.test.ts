import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { onRequestPost } from './revoke';

const env = {
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_SERVICE_KEY: 'service-key',
};

function makeRequest({ authHeader, body }: { authHeader?: string; body?: unknown } = {}): Request {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authHeader) headers['Authorization'] = authHeader;
  return new Request('https://example.com/api/v1/agent/auth/revoke', {
    method: 'POST',
    headers,
    body: body === undefined ? '{}' : JSON.stringify(body),
  });
}

describe('POST /api/v1/agent/auth/revoke', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('returns 400 when no credential found in header or body', async () => {
    const res = await onRequestPost({ request: makeRequest(), env });
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('accepts credential from Authorization header', async () => {
    fetchMock.mockResolvedValueOnce(new Response(
      JSON.stringify([{ registration_id: 'reg_x' }]), { status: 200 },
    ));
    const res = await onRequestPost({
      request: makeRequest({ authHeader: 'Bearer sk_test' }),
      env,
    });
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body).toEqual({ ok: true, registration_id: 'reg_x' });
    const call = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(call[1].method).toBe('PATCH');
    expect(JSON.parse(call[1].body as string).revoked_at).toBeTruthy();
  });

  it('accepts credential from JSON body', async () => {
    fetchMock.mockResolvedValueOnce(new Response(
      JSON.stringify([{ registration_id: 'reg_x' }]), { status: 200 },
    ));
    const res = await onRequestPost({
      request: makeRequest({ body: { credential: 'sk_xyz' } }),
      env,
    });
    expect(res.status).toBe(200);
  });

  it('returns 404 when credential matches no rows', async () => {
    fetchMock.mockResolvedValueOnce(new Response('[]', { status: 200 }));
    const res = await onRequestPost({
      request: makeRequest({ authHeader: 'Bearer sk_unknown' }),
      env,
    });
    expect(res.status).toBe(404);
  });

  it('returns 500 on Supabase error', async () => {
    fetchMock.mockResolvedValueOnce(new Response('boom', { status: 500 }));
    const res = await onRequestPost({
      request: makeRequest({ authHeader: 'Bearer sk_test' }),
      env,
    });
    expect(res.status).toBe(500);
  });
});
