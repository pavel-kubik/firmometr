// Účetní závěrky (financial-statement) availability for a company: which years a
// statement was filed in the Sbírka listin, with a link to each document.
//
// There is no free machine-readable source of the actual figures (revenue/profit)
// for Czech companies — those live only inside the filed PDFs — so this endpoint
// deliberately returns availability + links, not parsed numbers. It reuses the
// cached Sbírka listin listing (shared with the company-detail endpoint), so it's
// cheap and adds no new external calls on a warm cache.

import { checkCap, withCap } from '../../../_shared/_cap';
import { fetchOrSubjektId, fetchSbirkaListin, listinaYear } from '../../../_shared/_or';
import { isAuthenticated } from '../../../_shared/_auth';

interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

interface Env {
  REGISTRY_CACHE: KVNamespace;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

export interface StatementYear {
  /** Period year parsed from the document label, or null when unknown. */
  year: number | null;
  /** Link to the document (its detail page / PDF on or.justice.cz). */
  url: string | null;
}

export interface StatementsResponse {
  ico: string;
  /** Distinct účetní-závěrka years, most recent first. Empty when `locked`. */
  statements: StatementYear[];
  /** Total účetní-závěrka documents found (before de-duplicating by year). Always present (the tease). */
  total: number;
  /** True when the caller isn't a registered user: only `total` is exposed, not the years/links. */
  locked: boolean;
}

/** Document types in the Sbírka listin that represent a financial statement. */
function isFinancialStatement(typListiny: string): boolean {
  return /účetní\s+závěrka|výkaz\s+zisku/i.test(typListiny);
}

const EMPTY = (ico: string, locked: boolean): StatementsResponse => ({ ico, statements: [], total: 0, locked });

export const onRequest = async ({
  request,
  params,
  env,
}: {
  request: Request;
  params: Record<string, string>;
  env: Env;
}) => {
  const ico = params['ico'];
  if (!ico || !/^\d{1,8}$/.test(ico)) {
    return Response.json({ error: 'Invalid IČO' }, { status: 400 });
  }

  const cap = checkCap(request);
  if (cap.blocked) return withCap({ error: 'limit_reached' }, cap, 429);

  // Registered-user feature: anonymous callers get only the count (the tease), not the
  // years/links. See feature-flags.ts on the frontend.
  const authed = await isAuthenticated(request, env);

  const maxCacheAgeParam = new URL(request.url).searchParams.get('max_cache_age');
  const maxCacheAgeSecs = maxCacheAgeParam !== null ? parseInt(maxCacheAgeParam, 10) : undefined;
  const orOpts = { kv: env.REGISTRY_CACHE, maxCacheAgeSecs };

  const subjektId = await fetchOrSubjektId(ico, orOpts);
  if (!subjektId) return withCap(EMPTY(ico, !authed), cap);

  // Pull a wide slice so the full filing history is available.
  const { listiny } = await fetchSbirkaListin(subjektId, orOpts, 200);
  const zaverky = listiny.filter((l) => isFinancialStatement(l.typListiny));

  // The listing is reverse-chronological, so the first row per year is the newest.
  // Years/links are withheld from anonymous users; only the count is returned.
  const seen = new Set<number>();
  const statements: StatementYear[] = [];
  if (authed) {
    for (const l of zaverky) {
      const year = listinaYear(l.typListiny);
      if (year == null) continue; // year-based timeline; skip undatable rows
      if (seen.has(year)) continue;
      seen.add(year);
      statements.push({ year, url: l.url });
    }
    statements.sort((a, b) => (b.year ?? -1) - (a.year ?? -1));
  }

  return withCap({ ico, statements, total: zaverky.length, locked: !authed } satisfies StatementsResponse, cap);
};
