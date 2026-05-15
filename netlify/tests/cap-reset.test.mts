import { describe, it, expect } from 'vitest';
import handler from '../functions/cap-reset.mts';
import { FREE_CAP, WINDOW_MINUTES } from '../functions/_cap.mts';

const WINDOW_MS = WINDOW_MINUTES * 60_000;

function req(cookie = ''): Request {
  return new Request('http://x', { headers: cookie ? { cookie } : {} });
}

function cookieVal(count: number, expiresOffset: number): string {
  return `srch_cnt=${count}|${Date.now() + expiresOffset}`;
}

describe('cap-reset endpoint', () => {
  it('always returns 200', async () => {
    const res = await handler(req(cookieVal(FREE_CAP, WINDOW_MS)));
    expect(res.status).toBe(200);
  });

  it('blocked user → blocked:true in body', async () => {
    const body = await handler(req(cookieVal(FREE_CAP, WINDOW_MS))).then(r => r.json());
    expect(body.blocked).toBe(true);
  });

  it('unblocked user → blocked:false in body', async () => {
    const body = await handler(req(cookieVal(1, WINDOW_MS))).then(r => r.json());
    expect(body.blocked).toBe(false);
  });

  it('retryAfter is ≤ WINDOW_MINUTES*60', async () => {
    const body = await handler(req(cookieVal(FREE_CAP, WINDOW_MS))).then(r => r.json());
    expect(body.retryAfter).toBeGreaterThan(0);
    expect(body.retryAfter).toBeLessThanOrEqual(WINDOW_MINUTES * 60);
  });

  it('stale 24h cookie → retryAfter clamped to ≤ WINDOW_MINUTES*60', async () => {
    const stale = Date.now() + 86_400_000;
    const body = await handler(req(`srch_cnt=${FREE_CAP}|${stale}`)).then(r => r.json());
    expect(body.retryAfter).toBeLessThanOrEqual(WINDOW_MINUTES * 60);
  });

  it('stale 24h cookie → Set-Cookie Max-Age is correct', async () => {
    const stale = Date.now() + 86_400_000;
    const res = await handler(req(`srch_cnt=${FREE_CAP}|${stale}`));
    const setCookie = res.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain(`Max-Age=${WINDOW_MINUTES * 60}`);
  });

  it('does not increment count', async () => {
    const r = req(cookieVal(5, WINDOW_MS));
    const body = await handler(r).then(r => r.json());
    // count is not returned in body, but cookie should still say 5
    const setCookie = (await handler(r)).headers.get('set-cookie') ?? '';
    expect(setCookie).toContain('srch_cnt=5|');
  });
});
