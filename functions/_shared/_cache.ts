interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

export type RegistrySource =
  | 'ares'
  | 'isir'
  | 'dph'
  | 'or_vr'
  | 'or_subjekt_id'
  | 'sbirka_listin'
  | 'cuzk';

export interface CacheEntry<T> {
  data: T;
  source: RegistrySource;
  key: string;          // actual lookup key used (ico, dic, subjektId, etc.)
  cachedAt: string;     // ISO timestamp
  expiresAt: string | null; // ISO timestamp, null when TTL = 0 (no expiry)
  ttlSeconds: number;
  cacheVersion: number;
}

const CACHE_VERSION = 1;

// TTL values in seconds — fill in when ready to enforce expiry.
// Set a value to 0 to keep it as "no expiry" (stored indefinitely).
export const TTL: Record<RegistrySource, number> = {
  ares:          0,  // TODO: e.g. 86_400 (24h)
  isir:          0,  // TODO: e.g.  3_600 (1h)
  dph:           0,  // TODO: e.g. 21_600 (6h)
  or_vr:         0,  // TODO: e.g. 86_400 (24h)
  or_subjekt_id: 0,  // TODO: e.g. 604_800 (7d)
  sbirka_listin: 0,  // TODO: e.g. 86_400 (24h)
  cuzk:          0,  // TODO: e.g. 604_800 (7d)
};

export async function getCached<T>(
  kv: KVNamespace,
  source: RegistrySource,
  key: string,
  maxAgeSecs?: number,
): Promise<CacheEntry<T> | null> {
  const raw = await kv.get(`${source}:${key}`);
  if (!raw) return null;
  const entry: CacheEntry<T> = JSON.parse(raw);
  if (entry.cacheVersion !== CACHE_VERSION) return null;
  if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) return null;
  if (maxAgeSecs !== undefined) {
    const ageMs = Date.now() - new Date(entry.cachedAt).getTime();
    if (ageMs > maxAgeSecs * 1000) return null;
  }
  return entry;
}

export async function setCached<T>(
  kv: KVNamespace,
  source: RegistrySource,
  key: string,
  data: T,
): Promise<void> {
  const ttl = TTL[source];
  const now = new Date();
  const entry: CacheEntry<T> = {
    data,
    source,
    key,
    cachedAt: now.toISOString(),
    expiresAt: ttl > 0 ? new Date(now.getTime() + ttl * 1000).toISOString() : null,
    ttlSeconds: ttl,
    cacheVersion: CACHE_VERSION,
  };
  const putOptions = ttl > 0 ? { expirationTtl: ttl } : {};
  await kv.put(`${source}:${key}`, JSON.stringify(entry), putOptions);
}
