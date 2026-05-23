import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { onRequestPost } from './contact';

const env = {
  BREVO_API_KEY: 'test-key',
  ORDER_FROM_NAME: 'Firmometr',
  ORDER_FROM_EMAIL: 'noreply@firmometr.cz',
  ORDER_TO: 'info@firmometr.cz',
};

function makeRequest(body: Record<string, string>, contentType = 'application/json') {
  const encoded = contentType === 'application/json'
    ? JSON.stringify(body)
    : new URLSearchParams(body).toString();
  return new Request('https://example.com/api/v1/contact', {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body: encoded,
  });
}

describe('POST /api/v1/contact', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns 400 when email is missing', async () => {
    const res = await onRequestPost({ request: makeRequest({ name: 'Jan', message: 'Hello' }), env });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'missing_fields' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 400 when message is missing', async () => {
    const res = await onRequestPost({ request: makeRequest({ email: 'jan@test.com' }), env });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'missing_fields' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('calls Brevo and returns 200 on success', async () => {
    const res = await onRequestPost({ request: makeRequest({ name: 'Jan', email: 'jan@test.com', message: 'Hello' }), env });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.brevo.com/v3/smtp/email');
    const payload = JSON.parse(init.body as string);
    expect(payload.to).toEqual([{ email: env.ORDER_TO }]);
    expect(payload.replyTo).toEqual({ name: 'Jan', email: 'jan@test.com' });
    expect(payload.subject).toContain('Jan');
  });

  it('uses email as replyTo name when name is omitted', async () => {
    await onRequestPost({ request: makeRequest({ email: 'jan@test.com', message: 'Hello' }), env });
    const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(payload.replyTo).toEqual({ name: 'jan@test.com', email: 'jan@test.com' });
    expect(payload.htmlContent).toContain('—');
  });

  it('returns 500 when Brevo responds with an error', async () => {
    fetchMock.mockResolvedValue(new Response('Unauthorized', { status: 401 }));
    const res = await onRequestPost({ request: makeRequest({ email: 'jan@test.com', message: 'Hello' }), env });
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'send_failed' });
  });

  it('accepts form-encoded body', async () => {
    const res = await onRequestPost({
      request: makeRequest({ email: 'jan@test.com', message: 'Hello' }, 'application/x-www-form-urlencoded'),
      env,
    });
    expect(res.status).toBe(200);
  });
});
