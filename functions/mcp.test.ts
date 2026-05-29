import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { onRequestPost, onRequestOptions } from './mcp';

const env = {
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_ANON_KEY: 'anon-key',
  SUPABASE_SERVICE_KEY: 'service-key',
  REGISTRY_CACHE: {
    get: vi.fn().mockResolvedValue(null),
    put: vi.fn().mockResolvedValue(undefined),
  },
};

function rpcRequest(payload: unknown, authHeader?: string): Request {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authHeader) headers['Authorization'] = authHeader;
  return new Request('https://example.com/mcp', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
}

describe('POST /mcp', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('OPTIONS returns 204 with CORS headers', () => {
    const res = onRequestOptions();
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('POST');
  });

  it('returns -32700 on malformed JSON', async () => {
    const req = new Request('https://example.com/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{not json',
    });
    const res = await onRequestPost({ request: req, env, waitUntil: () => {} });
    expect(res.status).toBe(400);
    const body = await res.json() as { error: { code: number } };
    expect(body.error.code).toBe(-32700);
  });

  it('returns -32600 for missing method', async () => {
    const res = await onRequestPost({
      request: rpcRequest({ jsonrpc: '2.0', id: 1 }),
      env,
      waitUntil: () => {},
    });
    const body = await res.json() as { error: { code: number } };
    expect(body.error.code).toBe(-32600);
  });

  it('initialize returns protocolVersion and serverInfo', async () => {
    const res = await onRequestPost({
      request: rpcRequest({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} }),
      env,
      waitUntil: () => {},
    });
    const body = await res.json() as { result: { protocolVersion: string; serverInfo: { name: string } } };
    expect(body.result.protocolVersion).toBe('2025-06-18');
    expect(body.result.serverInfo.name).toBe('firmometr');
  });

  it('tools/list returns both registered tools', async () => {
    const res = await onRequestPost({
      request: rpcRequest({ jsonrpc: '2.0', id: 2, method: 'tools/list' }),
      env,
      waitUntil: () => {},
    });
    const body = await res.json() as { result: { tools: Array<{ name: string }> } };
    const names = body.result.tools.map((t) => t.name);
    expect(names).toEqual(['searchCompanies', 'getCompanyByIco']);
  });

  it('unknown method returns -32601', async () => {
    const res = await onRequestPost({
      request: rpcRequest({ jsonrpc: '2.0', id: 3, method: 'foo/bar' }),
      env,
      waitUntil: () => {},
    });
    const body = await res.json() as { error: { code: number } };
    expect(body.error.code).toBe(-32601);
  });

  it('tools/call searchCompanies dispatches to ARES', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
      ekonomickeSubjekty: [{ ico: '12345678', obchodniJmeno: 'Acme', sidlo: { textovaAdresa: 'Praha' } }],
      pocetCelkem: 1,
    }), { status: 200 }));

    const res = await onRequestPost({
      request: rpcRequest({
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: { name: 'searchCompanies', arguments: { query: 'acme' } },
      }),
      env,
      waitUntil: () => {},
    });
    const body = await res.json() as { result: { content: Array<{ text: string }> } };
    const text = JSON.parse(body.result.content[0].text);
    expect(text.total).toBe(1);
    expect(text.items[0].ico).toBe('12345678');
  });

  it('tools/call getCompanyByIco returns an error block for invalid ICO', async () => {
    const res = await onRequestPost({
      request: rpcRequest({
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/call',
        params: { name: 'getCompanyByIco', arguments: { ico: 'abc' } },
      }),
      env,
      waitUntil: () => {},
    });
    const body = await res.json() as { result: { content: Array<{ text: string }>; isError?: boolean } };
    expect(body.result.isError).toBe(true);
    const text = JSON.parse(body.result.content[0].text);
    expect(text.error).toBe('Invalid IČO');
  });

  it('tools/call with unknown tool name returns -32602', async () => {
    const res = await onRequestPost({
      request: rpcRequest({
        jsonrpc: '2.0',
        id: 6,
        method: 'tools/call',
        params: { name: 'mystery' },
      }),
      env,
      waitUntil: () => {},
    });
    const body = await res.json() as { error: { code: number } };
    expect(body.error.code).toBe(-32602);
  });

  it('notifications/initialized returns 204', async () => {
    const res = await onRequestPost({
      request: rpcRequest({ jsonrpc: '2.0', method: 'notifications/initialized' }),
      env,
      waitUntil: () => {},
    });
    expect(res.status).toBe(204);
  });
});
