import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendEmail } from './_email';

const env = {
  BREVO_API_KEY: 'k',
  ORDER_FROM_NAME: 'Firmometr',
  ORDER_FROM_EMAIL: 'noreply@firmometr.cz',
};

describe('sendEmail', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('POSTs to Brevo with the configured sender and given recipient', async () => {
    await sendEmail({
      env,
      to: { email: 'rcpt@example.com' },
      subject: 's',
      htmlContent: '<p>x</p>',
    });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.brevo.com/v3/smtp/email');
    const headers = init.headers as Record<string, string>;
    expect(headers['api-key']).toBe('k');
    const payload = JSON.parse(init.body as string);
    expect(payload.sender).toEqual({ name: 'Firmometr', email: 'noreply@firmometr.cz' });
    expect(payload.to).toEqual([{ email: 'rcpt@example.com' }]);
    expect(payload.subject).toBe('s');
    expect(payload.htmlContent).toBe('<p>x</p>');
  });

  it('passes replyTo and textContent when provided', async () => {
    await sendEmail({
      env,
      to: { email: 'a@b.cz' },
      subject: 's',
      htmlContent: '<p>x</p>',
      textContent: 'x',
      replyTo: { name: 'Jan', email: 'jan@x.cz' },
    });
    const payload = JSON.parse((fetchMock.mock.calls[0] as [string, RequestInit])[1].body as string);
    expect(payload.replyTo).toEqual({ name: 'Jan', email: 'jan@x.cz' });
    expect(payload.textContent).toBe('x');
  });

  it('accepts an array of recipients', async () => {
    await sendEmail({
      env,
      to: [{ email: 'a@b.cz' }, { email: 'c@d.cz' }],
      subject: 's',
      htmlContent: '<p>x</p>',
    });
    const payload = JSON.parse((fetchMock.mock.calls[0] as [string, RequestInit])[1].body as string);
    expect(payload.to).toEqual([{ email: 'a@b.cz' }, { email: 'c@d.cz' }]);
  });
});
