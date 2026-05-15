import { describe, it, expect, beforeEach } from 'vitest';
import { checkCap, resetCap, withCap, FREE_CAP, WINDOW_MINUTES } from '../functions/_cap.mts';

const WINDOW_MS = WINDOW_MINUTES * 60_000;

function req(cookie = ''): Request {
  return new Request('http://x', { headers: cookie ? { cookie } : {} });
}

function cookie(count: number, expiresOffset: number): string {
  return `srch_cnt=${count}|${Date.now() + expiresOffset}`;
}

// ---------------------------------------------------------------------------
// checkCap
// ---------------------------------------------------------------------------

describe('checkCap', () => {
  it('no cookie → not blocked, sets count to 1', () => {
    const cap = checkCap(req());
    expect(cap.blocked).toBe(false);
    expect(cap.cookieValue.split('|')[0]).toBe('1');
  });

  it('authenticated request → never blocked, no cookie set', () => {
    const r = new Request('http://x', { headers: { authorization: 'Bearer token' } });
    const cap = checkCap(r);
    expect(cap.blocked).toBe(false);
    expect(cap.cookieValue).toBe('');
  });

  it('increments count within window', () => {
    const cap = checkCap(req(cookie(5, WINDOW_MS)));
    expect(cap.blocked).toBe(false);
    expect(cap.cookieValue.split('|')[0]).toBe('6');
  });

  it(`blocks at FREE_CAP (${FREE_CAP})`, () => {
    const cap = checkCap(req(cookie(FREE_CAP, WINDOW_MS)));
    expect(cap.blocked).toBe(true);
    expect(cap.cookieValue.split('|')[0]).toBe(String(FREE_CAP));
  });

  it('expired window → resets count to 1', () => {
    const cap = checkCap(req(cookie(FREE_CAP, -1000)));
    expect(cap.blocked).toBe(false);
    expect(cap.cookieValue.split('|')[0]).toBe('1');
  });

  it('stale 24h cookie → clamps expiry to at most WINDOW_MS ahead', () => {
    const staleFuture = Date.now() + 86_400_000;
    const cap = checkCap(req(`srch_cnt=1|${staleFuture}`));
    const newExpires = parseInt(cap.cookieValue.split('|')[1], 10);
    expect(newExpires).toBeLessThanOrEqual(Date.now() + WINDOW_MS + 100);
  });

  it('preserves window expiry when within WINDOW_MS', () => {
    const soon = Date.now() + 120_000;
    const cap = checkCap(req(`srch_cnt=1|${soon}`));
    const newExpires = parseInt(cap.cookieValue.split('|')[1], 10);
    expect(newExpires).toBeCloseTo(soon, -2);
  });
});

// ---------------------------------------------------------------------------
// resetCap
// ---------------------------------------------------------------------------

describe('resetCap', () => {
  it('does not increment count', () => {
    const before = checkCap(req(cookie(5, WINDOW_MS)));
    const reset = resetCap(req(cookie(5, WINDOW_MS)));
    expect(reset.cookieValue.split('|')[0]).toBe('5');
    expect(before.cookieValue.split('|')[0]).toBe('6');
  });

  it('stale 24h cookie → clamps expiry', () => {
    const stale = Date.now() + 86_400_000;
    const cap = resetCap(req(`srch_cnt=${FREE_CAP}|${stale}`));
    const newExpires = parseInt(cap.cookieValue.split('|')[1], 10);
    expect(newExpires).toBeLessThanOrEqual(Date.now() + WINDOW_MS + 100);
  });

  it(`count >= FREE_CAP → blocked`, () => {
    const cap = resetCap(req(cookie(FREE_CAP, WINDOW_MS)));
    expect(cap.blocked).toBe(true);
  });

  it('count < FREE_CAP → not blocked', () => {
    const cap = resetCap(req(cookie(FREE_CAP - 1, WINDOW_MS)));
    expect(cap.blocked).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// withCap
// ---------------------------------------------------------------------------

describe('withCap', () => {
  it('200 response → no Retry-After header', () => {
    const cap = checkCap(req(cookie(1, WINDOW_MS)));
    const res = withCap({}, cap, 200);
    expect(res.headers.get('retry-after')).toBeNull();
  });

  it('429 response → Retry-After header is present and ≤ WINDOW_MINUTES*60', async () => {
    const cap = checkCap(req(cookie(FREE_CAP, WINDOW_MS)));
    const res = withCap({}, cap, 429);
    const retryAfter = parseInt(res.headers.get('retry-after') ?? '-1', 10);
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(WINDOW_MINUTES * 60);
  });

  it('sets Set-Cookie with correct Max-Age', () => {
    const cap = checkCap(req());
    const res = withCap({}, cap, 200);
    const setCookie = res.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain(`Max-Age=${WINDOW_MINUTES * 60}`);
    expect(setCookie).toContain('srch_cnt=');
  });

  it('authenticated request → no Set-Cookie', () => {
    const r = new Request('http://x', { headers: { authorization: 'Bearer token' } });
    const cap = checkCap(r);
    const res = withCap({}, cap, 200);
    expect(res.headers.get('set-cookie')).toBeNull();
  });
});
