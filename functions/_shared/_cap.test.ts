import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { checkCap, resetCap, withCap, FREE_CAP, WINDOW_MINUTES } from './_cap';

const WINDOW_MS = WINDOW_MINUTES * 60_000;

function makeRequest(cookie?: string, authorization?: string): Request {
  const headers: Record<string, string> = {};
  if (cookie) headers['Cookie'] = cookie;
  if (authorization) headers['Authorization'] = authorization;
  return new Request('https://example.com/api/v1/search/ico/12345678', { headers });
}

function cookieWith(count: number, expiresOffsetMs: number): string {
  return `srch_cnt=${count}|${Date.now() + expiresOffsetMs}`;
}

describe('checkCap', () => {
  it('returns not-blocked and count=1 when no cookie present', () => {
    const result = checkCap(makeRequest());
    expect(result.blocked).toBe(false);
    expect(result.cookieValue).toMatch(/^1\|/);
  });

  it('increments count from existing valid cookie', () => {
    const result = checkCap(makeRequest(cookieWith(5, WINDOW_MS)));
    expect(result.blocked).toBe(false);
    expect(result.cookieValue).toMatch(/^6\|/);
  });

  it('returns not-blocked at count=19 and sets count=20', () => {
    const result = checkCap(makeRequest(cookieWith(19, WINDOW_MS)));
    expect(result.blocked).toBe(false);
    expect(result.cookieValue).toMatch(/^20\|/);
  });

  it('blocks at count=20 within window', () => {
    const result = checkCap(makeRequest(cookieWith(20, WINDOW_MS)));
    expect(result.blocked).toBe(true);
  });

  it('blocks at count above FREE_CAP', () => {
    const result = checkCap(makeRequest(cookieWith(FREE_CAP + 5, WINDOW_MS)));
    expect(result.blocked).toBe(true);
  });

  it('resets count to 1 when window has expired', () => {
    const result = checkCap(makeRequest(cookieWith(FREE_CAP, -1)));
    expect(result.blocked).toBe(false);
    expect(result.cookieValue).toMatch(/^1\|/);
  });

  it('returns not-blocked with empty cookieValue when Authorization header present', () => {
    const result = checkCap(makeRequest(cookieWith(FREE_CAP, WINDOW_MS), 'Bearer sometoken'));
    expect(result.blocked).toBe(false);
    expect(result.cookieValue).toBe('');
  });

  it('bypasses cap for any non-empty Authorization value', () => {
    const result = checkCap(makeRequest(cookieWith(FREE_CAP, WINDOW_MS), 'Basic dXNlcjpwYXNz'));
    expect(result.blocked).toBe(false);
  });

  it('handles malformed cookie gracefully (starts at 1)', () => {
    const result = checkCap(makeRequest('srch_cnt=notanumber|alsonotanumber'));
    expect(result.blocked).toBe(false);
    expect(result.cookieValue).toMatch(/^1\|/);
  });

  it('handles cookie with count only (no pipe separator)', () => {
    const result = checkCap(makeRequest('srch_cnt=5'));
    expect(result.blocked).toBe(false);
    expect(result.cookieValue).toMatch(/^1\|/);
  });
});

describe('resetCap', () => {
  it('returns current count and blocked=false when count < FREE_CAP', () => {
    const result = resetCap(makeRequest(cookieWith(10, WINDOW_MS)));
    expect(result.blocked).toBe(false);
    expect(result.cookieValue).toMatch(/^10\|/);
  });

  it('returns blocked=true when count >= FREE_CAP within window', () => {
    const result = resetCap(makeRequest(cookieWith(FREE_CAP, WINDOW_MS)));
    expect(result.blocked).toBe(true);
  });

  it('returns blocked=false when window expired even at FREE_CAP count', () => {
    const result = resetCap(makeRequest(cookieWith(FREE_CAP, -1)));
    expect(result.blocked).toBe(false);
  });
});

describe('withCap', () => {
  it('returns JSON body with given status', () => {
    const cap = checkCap(makeRequest());
    const res = withCap({ ok: true }, cap, 200);
    expect(res.status).toBe(200);
  });

  it('sets Set-Cookie header when cookieValue is non-empty', () => {
    const cap = checkCap(makeRequest());
    const res = withCap({}, cap);
    expect(res.headers.get('Set-Cookie')).toContain('srch_cnt=');
  });

  it('does not set Set-Cookie header when cookieValue is empty (authenticated)', () => {
    const cap = checkCap(makeRequest(undefined, 'Bearer token'));
    const res = withCap({}, cap);
    expect(res.headers.get('Set-Cookie')).toBeNull();
  });

  it('sets Retry-After header when status=429', () => {
    const cap = checkCap(makeRequest(cookieWith(FREE_CAP, WINDOW_MS)));
    const res = withCap({ error: 'limit_reached' }, cap, 429);
    const retryAfter = res.headers.get('Retry-After');
    expect(retryAfter).not.toBeNull();
    expect(Number(retryAfter)).toBeGreaterThan(0);
    expect(Number(retryAfter)).toBeLessThanOrEqual(WINDOW_MINUTES * 60);
  });

  it('does not set Retry-After header for non-429 responses', () => {
    const cap = checkCap(makeRequest());
    const res = withCap({}, cap, 200);
    expect(res.headers.get('Retry-After')).toBeNull();
  });
});
