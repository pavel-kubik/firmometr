import { describe, it, expect } from 'vitest';
import { getCached, setCached, type RegistrySource } from './_cache';

interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

function makeKv(): KVNamespace & { store: Map<string, string>; putOptions: Map<string, object> } {
  const store = new Map<string, string>();
  const putOptions = new Map<string, object>();
  return {
    store,
    putOptions,
    get: async (key: string) => store.get(key) ?? null,
    put: async (key: string, value: string, options?: object) => {
      store.set(key, value);
      if (options) putOptions.set(key, options);
    },
  };
}

describe('getCached', () => {
  it('returns null when key does not exist in KV', async () => {
    const kv = makeKv();
    const result = await getCached(kv, 'ares', '12345678');
    expect(result).toBeNull();
  });

  it('returns the cached entry when fresh', async () => {
    const kv = makeKv();
    const data = { ico: '12345678', name: 'Test s.r.o.' };
    await setCached(kv, 'ares', '12345678', data);

    const result = await getCached(kv, 'ares', '12345678');
    expect(result).not.toBeNull();
    expect(result!.data).toEqual(data);
    expect(result!.source).toBe('ares');
    expect(result!.key).toBe('12345678');
  });

  it('returns null when cacheVersion is outdated', async () => {
    const kv = makeKv();
    const staleEntry = {
      data: { foo: 'bar' },
      source: 'ares',
      key: '12345678',
      cachedAt: new Date().toISOString(),
      expiresAt: null,
      ttlSeconds: 0,
      cacheVersion: 0,
    };
    kv.store.set('ares:12345678', JSON.stringify(staleEntry));

    const result = await getCached(kv, 'ares', '12345678');
    expect(result).toBeNull();
  });

  it('returns null when expiresAt is in the past', async () => {
    const kv = makeKv();
    const expiredEntry = {
      data: { foo: 'bar' },
      source: 'ares',
      key: '12345678',
      cachedAt: new Date(Date.now() - 10_000).toISOString(),
      expiresAt: new Date(Date.now() - 1_000).toISOString(),
      ttlSeconds: 3600,
      cacheVersion: 1,
    };
    kv.store.set('ares:12345678', JSON.stringify(expiredEntry));

    const result = await getCached(kv, 'ares', '12345678');
    expect(result).toBeNull();
  });

  it('returns null when entry is older than maxAgeSecs', async () => {
    const kv = makeKv();
    const oldEntry = {
      data: { foo: 'bar' },
      source: 'ares',
      key: '12345678',
      cachedAt: new Date(Date.now() - 3_700_000).toISOString(),
      expiresAt: null,
      ttlSeconds: 0,
      cacheVersion: 1,
    };
    kv.store.set('ares:12345678', JSON.stringify(oldEntry));

    const result = await getCached(kv, 'ares', '12345678', 3600);
    expect(result).toBeNull();
  });

  it('returns entry when maxAgeSecs is undefined (no age limit)', async () => {
    const kv = makeKv();
    const oldEntry = {
      data: { foo: 'bar' },
      source: 'ares',
      key: '12345678',
      cachedAt: new Date(Date.now() - 999_999_000).toISOString(),
      expiresAt: null,
      ttlSeconds: 0,
      cacheVersion: 1,
    };
    kv.store.set('ares:12345678', JSON.stringify(oldEntry));

    const result = await getCached(kv, 'ares', '12345678');
    expect(result).not.toBeNull();
  });

  it('returns entry when age is within maxAgeSecs', async () => {
    const kv = makeKv();
    await setCached(kv, 'ares', '12345678', { ok: true });

    const result = await getCached(kv, 'ares', '12345678', 86400);
    expect(result).not.toBeNull();
  });
});

describe('setCached', () => {
  it('stores entry under the correct key pattern', async () => {
    const kv = makeKv();
    await setCached(kv, 'isir', '87654321', []);

    const raw = kv.store.get('isir:87654321');
    expect(raw).not.toBeUndefined();
    const entry = JSON.parse(raw!);
    expect(entry.source).toBe('isir');
    expect(entry.key).toBe('87654321');
    expect(entry.data).toEqual([]);
  });

  it('sets expiresAt to null when TTL is 0', async () => {
    const kv = makeKv();
    await setCached(kv, 'ares', '12345678', { ok: true });

    const entry = JSON.parse(kv.store.get('ares:12345678')!);
    expect(entry.expiresAt).toBeNull();
    expect(entry.ttlSeconds).toBe(0);
  });

  it('includes cachedAt as a valid ISO timestamp', async () => {
    const kv = makeKv();
    await setCached(kv, 'dph', 'CZ12345678', { isPlatce: false });

    const entry = JSON.parse(kv.store.get('dph:CZ12345678')!);
    expect(() => new Date(entry.cachedAt)).not.toThrow();
    expect(new Date(entry.cachedAt).getTime()).toBeGreaterThan(0);
  });

  it('stores complex data structures faithfully', async () => {
    const kv = makeKv();
    const data = { records: [{ ic: '123', druhStavKonkursu: 'ÚPADEK' }] };
    await setCached(kv, 'isir', '12345678', data);

    const result = await getCached(kv, 'isir', '12345678');
    expect(result!.data).toEqual(data);
  });
});
