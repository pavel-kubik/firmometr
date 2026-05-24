import type { Env } from './index';

export type IsirClarity = 'CLEAR' | 'PAST_DEBTOR' | 'ACTIVE_DEBTOR' | 'ACTIVE_CO_DEBTOR';

export interface IcoStatus {
  isirClarity: IsirClarity;
  dphNespolehlivy: boolean | null;
  aresStavKod: string | null;
}

export async function fetchIcoStatus(ico: string, env: Env): Promise<IcoStatus> {
  const url = `${env.API_URL}/api/v1/search/ico/${ico}?max_cache_age=${env.MAX_CACHE_AGE_SECS}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`API ${res.status} for ico=${ico}`);
  const data = await res.json() as Record<string, unknown>;
  const isir = data['isir'] as { clarity?: string } | undefined;
  const dph = data['dph'] as { nespolehlivy?: boolean | null } | undefined;
  return {
    isirClarity: (isir?.clarity ?? 'CLEAR') as IsirClarity,
    dphNespolehlivy: dph?.nespolehlivy ?? null,
    aresStavKod: (data['stavKod'] as string | null | undefined) ?? null,
  };
}
