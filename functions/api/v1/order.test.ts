import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { onRequestPost } from './order';

const env = {
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_ANON_KEY: 'anon-key',
  SUPABASE_SERVICE_KEY: 'service-key',
  BREVO_API_KEY: 'brevo-key',
  ORDER_FROM_NAME: 'Firmometr',
  ORDER_FROM_EMAIL: 'noreply@firmometr.cz',
  ORDER_TO: 'info@firmometr.cz',
};

const validBody = {
  plan: 'basic',
  billing: 'monthly',
  jmeno: 'Jan Novák',
  ico: '12345678',
  dic: 'CZ12345678',
  adresa: 'Wenceslas Square 1, Prague',
  email: 'jan@test.com',
  telefon: '+420 123 456 789',
};

function makeRequest(body: Record<string, string>, authHeader?: string): Request {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authHeader) headers['Authorization'] = authHeader;
  return new Request('https://example.com/api/v1/order', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

function makeSupabaseUserResponse(userId = 'user-123') {
  return new Response(JSON.stringify({ id: userId }), { status: 200 });
}

describe('POST /api/v1/order', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns 401 when no Authorization header', async () => {
    const res = await onRequestPost({ request: makeRequest(validBody), env });
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'unauthorized' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 401 when Supabase auth returns non-ok', async () => {
    fetchMock.mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }));
    const res = await onRequestPost({ request: makeRequest(validBody, 'Bearer bad-token'), env });
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'unauthorized' });
  });

  it('returns 400 when required field telefon is missing', async () => {
    fetchMock.mockResolvedValueOnce(makeSupabaseUserResponse());
    const { telefon: _, ...bodyWithoutTelefon } = validBody;
    const res = await onRequestPost({ request: makeRequest(bodyWithoutTelefon, 'Bearer token'), env });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'missing_fields' });
  });

  it('returns 400 when plan is missing', async () => {
    fetchMock.mockResolvedValueOnce(makeSupabaseUserResponse());
    const { plan: _, ...body } = validBody;
    const res = await onRequestPost({ request: makeRequest(body, 'Bearer token'), env });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'missing_fields' });
  });

  it('returns 400 when ICO has wrong length (7 digits)', async () => {
    fetchMock.mockResolvedValueOnce(makeSupabaseUserResponse());
    const res = await onRequestPost({ request: makeRequest({ ...validBody, ico: '1234567' }, 'Bearer token'), env });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'invalid_ico' });
  });

  it('returns 400 when ICO contains non-digits', async () => {
    fetchMock.mockResolvedValueOnce(makeSupabaseUserResponse());
    const res = await onRequestPost({ request: makeRequest({ ...validBody, ico: '1234567X' }, 'Bearer token'), env });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'invalid_ico' });
  });

  it('accepts order without ICO (optional field)', async () => {
    fetchMock
      .mockResolvedValueOnce(makeSupabaseUserResponse())
      .mockResolvedValueOnce(new Response('', { status: 201 }))
      .mockResolvedValueOnce(new Response('{"messageId":"1"}', { status: 201 }))
      .mockResolvedValueOnce(new Response('{"messageId":"2"}', { status: 201 }));
    const { ico: _, ...bodyWithoutIco } = validBody;
    const res = await onRequestPost({ request: makeRequest(bodyWithoutIco, 'Bearer token'), env });
    expect(res.status).toBe(200);
  });

  it('returns 500 when Supabase insert fails', async () => {
    fetchMock
      .mockResolvedValueOnce(makeSupabaseUserResponse())
      .mockResolvedValueOnce(new Response('{"error":"db error"}', { status: 400 }));
    const res = await onRequestPost({ request: makeRequest(validBody, 'Bearer token'), env });
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'db_error' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('calls Brevo twice (operator + customer) on success and returns 200', async () => {
    fetchMock
      .mockResolvedValueOnce(makeSupabaseUserResponse())
      .mockResolvedValueOnce(new Response('', { status: 201 }))
      .mockResolvedValueOnce(new Response('{"messageId":"1"}', { status: 201 }))
      .mockResolvedValueOnce(new Response('{"messageId":"2"}', { status: 201 }));

    const res = await onRequestPost({ request: makeRequest(validBody, 'Bearer token'), env });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(4);

    const brevoCall1 = fetchMock.mock.calls[2] as [string, RequestInit];
    const brevoCall2 = fetchMock.mock.calls[3] as [string, RequestInit];
    expect(brevoCall1[0]).toContain('brevo.com');
    expect(brevoCall2[0]).toContain('brevo.com');

    const payload1 = JSON.parse(brevoCall1[1].body as string);
    const payload2 = JSON.parse(brevoCall2[1].body as string);
    expect(payload1.to).toEqual([{ email: env.ORDER_TO }]);
    expect(payload2.to).toEqual([{ email: validBody.email }]);
  });

  it('still returns 200 even when first Brevo call fails (non-fatal)', async () => {
    fetchMock
      .mockResolvedValueOnce(makeSupabaseUserResponse())
      .mockResolvedValueOnce(new Response('', { status: 201 }))
      .mockResolvedValueOnce(new Response('Internal Server Error', { status: 500 }))
      .mockResolvedValueOnce(new Response('{"messageId":"2"}', { status: 201 }));

    const res = await onRequestPost({ request: makeRequest(validBody, 'Bearer token'), env });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it('annual enterprise pricing: email contains 8 789 Kč total', async () => {
    fetchMock
      .mockResolvedValueOnce(makeSupabaseUserResponse())
      .mockResolvedValueOnce(new Response('', { status: 201 }))
      .mockResolvedValueOnce(new Response('{"messageId":"1"}', { status: 201 }))
      .mockResolvedValueOnce(new Response('{"messageId":"2"}', { status: 201 }));

    await onRequestPost({ request: makeRequest({ ...validBody, plan: 'enterprise', billing: 'annual' }, 'Bearer token'), env });

    const brevoPayload = JSON.parse((fetchMock.mock.calls[2] as [string, RequestInit])[1].body as string);
    expect(brevoPayload.htmlContent).toContain('8 789');
  });

  it('annual basic pricing: email contains 3 289 Kč total', async () => {
    fetchMock
      .mockResolvedValueOnce(makeSupabaseUserResponse())
      .mockResolvedValueOnce(new Response('', { status: 201 }))
      .mockResolvedValueOnce(new Response('{"messageId":"1"}', { status: 201 }))
      .mockResolvedValueOnce(new Response('{"messageId":"2"}', { status: 201 }));

    await onRequestPost({ request: makeRequest({ ...validBody, plan: 'basic', billing: 'annual' }, 'Bearer token'), env });

    const brevoPayload = JSON.parse((fetchMock.mock.calls[2] as [string, RequestInit])[1].body as string);
    expect(brevoPayload.htmlContent).toContain('3 289');
  });

  it('omits DIČ row from email when dic is empty', async () => {
    fetchMock
      .mockResolvedValueOnce(makeSupabaseUserResponse())
      .mockResolvedValueOnce(new Response('', { status: 201 }))
      .mockResolvedValueOnce(new Response('{"messageId":"1"}', { status: 201 }))
      .mockResolvedValueOnce(new Response('{"messageId":"2"}', { status: 201 }));

    const { dic: _, ...bodyWithoutDic } = validBody;
    await onRequestPost({ request: makeRequest(bodyWithoutDic, 'Bearer token'), env });

    const brevoPayload = JSON.parse((fetchMock.mock.calls[2] as [string, RequestInit])[1].body as string);
    expect(brevoPayload.htmlContent).not.toContain('DIČ');
  });
});
