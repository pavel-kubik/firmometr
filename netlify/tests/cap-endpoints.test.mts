/**
 * Verifies that the cap is enforced on all search endpoints and that
 * authenticated requests bypass it.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import icoHandler from '../functions/search-ico.mts';
import nameHandler from '../functions/search-name.mts';
import { FREE_CAP, WINDOW_MINUTES } from '../functions/_cap.mts';

const WINDOW_MS = WINDOW_MINUTES * 60_000;

afterEach(() => vi.unstubAllGlobals());

function cookieVal(count: number, offsetMs = WINDOW_MS): string {
  return `srch_cnt=${count}|${Date.now() + offsetMs}`;
}

function overCapCookie(): string {
  return cookieVal(FREE_CAP);
}

// Minimal fetch stub — returns empty-ish valid responses so the handler
// can reach the cap check and not crash on missing data.
const EMPTY_FETCH = vi.fn(async (url: string | URL) => {
  const u = url.toString();
  if (u.includes('isir.justice.cz')) {
    return new Response(`<?xml version="1.0"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
      <soapenv:Body><ns2:getIsirWsCuzkDataResponse xmlns:ns2="http://isirws.cca.cz/types/">
        <stav><kodChyby>WS2</kodChyby></stav>
      </ns2:getIsirWsCuzkDataResponse></soapenv:Body></soapenv:Envelope>`, { status: 200 });
  }
  if (u.includes('rozhraniCRPDPH')) {
    return new Response(`<?xml version="1.0"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
      <soapenv:Body><StatusNespolehlivyPlatceResponse xmlns="http://adis.mfcr.cz/rozhraniCRPDPH/">
        <statusPlatceDPH dic="CZ12345678" nespolehlivyPlatce="NENALEZEN"/>
      </StatusNespolehlivyPlatceResponse></soapenv:Body></soapenv:Envelope>`, { status: 200 });
  }
  if (u.includes('ares.gov.cz')) {
    return new Response(JSON.stringify({ ico: '12345678', obchodniJmeno: 'Test s.r.o.', seznamRegistraci: { stavZdrojeVr: 'AKTIVNI' } }), { status: 200 });
  }
  return new Response('{}', { status: 200 });
});

// ---------------------------------------------------------------------------
// search-ico cap
// ---------------------------------------------------------------------------

describe('search-ico: rate cap', () => {
  it('returns 429 when cap exceeded', async () => {
    vi.stubGlobal('fetch', EMPTY_FETCH);
    const res = await icoHandler(
      new Request('http://x', { headers: { cookie: overCapCookie() } }),
      { params: { ico: '12345678' } } as any,
    );
    expect(res.status).toBe(429);
  });

  it('429 response includes Retry-After ≤ WINDOW_MINUTES*60', async () => {
    vi.stubGlobal('fetch', EMPTY_FETCH);
    const res = await icoHandler(
      new Request('http://x', { headers: { cookie: overCapCookie() } }),
      { params: { ico: '12345678' } } as any,
    );
    const retryAfter = parseInt(res.headers.get('retry-after') ?? '-1', 10);
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(WINDOW_MINUTES * 60);
  });

  it('429 sets corrected Set-Cookie Max-Age', async () => {
    vi.stubGlobal('fetch', EMPTY_FETCH);
    const stale = Date.now() + 86_400_000;
    const res = await icoHandler(
      new Request('http://x', { headers: { cookie: `srch_cnt=${FREE_CAP}|${stale}` } }),
      { params: { ico: '12345678' } } as any,
    );
    expect(res.status).toBe(429);
    expect(res.headers.get('set-cookie')).toContain(`Max-Age=${WINDOW_MINUTES * 60}`);
  });

  it('authenticated request bypasses cap', async () => {
    vi.stubGlobal('fetch', EMPTY_FETCH);
    const res = await icoHandler(
      new Request('http://x', { headers: { cookie: overCapCookie(), authorization: 'Bearer token' } }),
      { params: { ico: '12345678' } } as any,
    );
    expect(res.status).toBe(200);
  });

  it('successful request increments cookie count', async () => {
    vi.stubGlobal('fetch', EMPTY_FETCH);
    const res = await icoHandler(
      new Request('http://x', { headers: { cookie: cookieVal(1) } }),
      { params: { ico: '12345678' } } as any,
    );
    expect(res.status).toBe(200);
    expect(res.headers.get('set-cookie')).toContain('srch_cnt=2|');
  });
});

// ---------------------------------------------------------------------------
// search-name cap
// ---------------------------------------------------------------------------

describe('search-name: rate cap', () => {
  it('returns 429 when cap exceeded', async () => {
    vi.stubGlobal('fetch', EMPTY_FETCH);
    const res = await nameHandler(
      new Request('http://x?q=test&start=0', { headers: { cookie: overCapCookie() } }),
    );
    expect(res.status).toBe(429);
  });

  it('429 response includes Retry-After ≤ WINDOW_MINUTES*60', async () => {
    vi.stubGlobal('fetch', EMPTY_FETCH);
    const res = await nameHandler(
      new Request('http://x?q=test&start=0', { headers: { cookie: overCapCookie() } }),
    );
    const retryAfter = parseInt(res.headers.get('retry-after') ?? '-1', 10);
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(WINDOW_MINUTES * 60);
  });

  it('429 corrects stale 24h cookie', async () => {
    vi.stubGlobal('fetch', EMPTY_FETCH);
    const stale = Date.now() + 86_400_000;
    const res = await nameHandler(
      new Request('http://x?q=test&start=0', { headers: { cookie: `srch_cnt=${FREE_CAP}|${stale}` } }),
    );
    expect(res.status).toBe(429);
    expect(res.headers.get('set-cookie')).toContain(`Max-Age=${WINDOW_MINUTES * 60}`);
  });

  it('authenticated request bypasses cap', async () => {
    vi.stubGlobal('fetch', EMPTY_FETCH);
    const res = await nameHandler(
      new Request('http://x?q=test&start=0', { headers: { cookie: overCapCookie(), authorization: 'Bearer token' } }),
    );
    expect(res.status).toBe(200);
  });

  it('successful request increments cookie count', async () => {
    vi.stubGlobal('fetch', EMPTY_FETCH);
    const res = await nameHandler(
      new Request('http://x?q=test&start=0', { headers: { cookie: cookieVal(3) } }),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get('set-cookie')).toContain('srch_cnt=4|');
  });
});
