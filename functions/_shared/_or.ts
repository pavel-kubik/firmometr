// Shared scraping helpers for the public register (obchodní rejstřík / Sbírka listin)
// on or.justice.cz. Used by both the company-detail endpoint and the financials endpoint.

import { getCached, setCached } from './_cache';

export interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

export interface OrListina {
  typListiny: string;
  /** Accounting/period year parsed from the label (e.g. "2021"), when present. */
  datumVzniku: string | null;
  datumZalozeni: string | null;
  /** Absolute or.justice.cz link to the document (direct PDF or its detail page). */
  url: string | null;
}

export const OR_PORTAL = 'https://or.justice.cz/ias/ui';
const OR_HEADERS = { Accept: 'text/html,*/*', 'User-Agent': 'firmometr.cz/1.0' };

/** Optional logging hook so callers can keep their analytics behaviour. */
export type OrLogger = (
  source: 'or_subjekt_id' | 'sbirka_listin',
  url: string,
  cacheHit: boolean,
  durationMs?: number,
  error?: string,
) => void;

interface OrFetchOpts {
  kv: KVNamespace;
  maxCacheAgeSecs?: number;
  log?: OrLogger;
}

/** Resolve the or.justice.cz subjektId for an IČO. */
export async function fetchOrSubjektId(ico: string, opts: OrFetchOpts): Promise<string | null> {
  const url = `${OR_PORTAL}/rejstrik-$firma?ico=${ico}`;
  const cached = await getCached<string | null>(opts.kv, 'or_subjekt_id', ico, opts.maxCacheAgeSecs);
  if (cached) { opts.log?.('or_subjekt_id', url, true); return cached.data; }
  const start = Date.now();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000), headers: OR_HEADERS });
    if (!res.ok) {
      opts.log?.('or_subjekt_id', url, false, Date.now() - start, `HTTP ${res.status}`);
      return null;
    }
    const html = await res.text();
    const subjektId = html.match(/subjektId=(\d+)/)?.[1] ?? null;
    await setCached(opts.kv, 'or_subjekt_id', ico, subjektId);
    opts.log?.('or_subjekt_id', url, false, Date.now() - start);
    return subjektId;
  } catch (e) {
    opts.log?.('or_subjekt_id', url, false, Date.now() - start, String(e));
    return null;
  }
}

// Base used to resolve relative document links found in the listing.
const SL_LISTING_BASE = `${OR_PORTAL}/vypis-sl-firma`;

const STRIP_TAGS = (s: string) => s.replace(/<[^>]+>/g, '').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/\s+/g, ' ').trim();
const DOC_LINK = /href="([^"]*(?:content\/download\?id=[a-f0-9]+|vypis-sl-detail\?dokument=\d+)[^"]*)"/i;
const CZ_DATE = /^\d{1,2}\.\s?\d{1,2}\.\s?\d{4}$/;

/**
 * Parse the Sbírka listin listing HTML into document rows. Exported for unit testing.
 *
 * Parsing is **row-scoped** (`<tr>` by `<tr>`) — a page-wide regex misaligns because
 * non-document links (e.g. "viz obchodní rejstřík") sit between rows. Within each row we
 * take the document link (two shapes: `content/download?id=<hex>` or
 * `vypis-sl-detail?dokument=<num>`), the longest cell as the type label
 * (e.g. "Účetní závěrka [2021] - Rozvaha, …"), and the cell holding a d.m.yyyy filing date.
 */
export function parseSbirkaListinHtml(html: string): { listiny: OrListina[]; celkem: number } {
  const listiny: OrListina[] = [];
  const rows = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) ?? [];
  for (const row of rows) {
    const href = row.match(DOC_LINK)?.[1];
    if (!href) continue; // skip non-document rows (header, address, …)
    const tds = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => STRIP_TAGS(m[1]));
    const label = tds.reduce((a, b) => (b.length > a.length ? b : a), '');
    if (!label) continue;
    const datumVzniku = tds.find((t) => CZ_DATE.test(t)) ?? null;
    let url: string | null = null;
    try { url = new URL(href.replace(/&amp;/g, '&'), SL_LISTING_BASE).toString(); } catch { /* keep null */ }
    listiny.push({ typListiny: label, datumVzniku, datumZalozeni: null, url });
  }
  return { listiny, celkem: listiny.length };
}

/** Extract the period year from a document label such as "účetní závěrka [2021] - …". */
export function listinaYear(typListiny: string): number | null {
  const m = typListiny.match(/\[(\d{4})\]/) ?? typListiny.match(/\b(?:19|20)\d{2}\b/);
  const y = m ? parseInt(m[1] ?? m[0], 10) : NaN;
  return Number.isFinite(y) && y >= 1900 && y <= 2100 ? y : null;
}

/**
 * Fetch + cache the Sbírka listin listing for a subjektId.
 * @param limit max rows to keep (default 10 to match the detail card; pass a higher number
 *              when more history is needed, e.g. for financial-statement parsing).
 */
export async function fetchSbirkaListin(
  subjektId: string,
  opts: OrFetchOpts,
  limit = 10,
): Promise<{ listiny: OrListina[]; celkem: number }> {
  const url = `${OR_PORTAL}/vypis-sl-firma?subjektId=${subjektId}`;
  const cached = await getCached<{ listiny: OrListina[]; celkem: number }>(opts.kv, 'or_listiny', subjektId, opts.maxCacheAgeSecs);
  if (cached) {
    opts.log?.('sbirka_listin', url, true);
    return { listiny: cached.data.listiny.slice(0, limit), celkem: cached.data.celkem };
  }
  const start = Date.now();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000), headers: OR_HEADERS });
    if (!res.ok) {
      opts.log?.('sbirka_listin', url, false, Date.now() - start, `HTTP ${res.status}`);
      return { listiny: [], celkem: 0 };
    }
    const html = await res.text();
    const parsed = parseSbirkaListinHtml(html);
    // Cache the full parsed listing so callers needing more history don't re-scrape.
    await setCached(opts.kv, 'or_listiny', subjektId, parsed);
    opts.log?.('sbirka_listin', url, false, Date.now() - start);
    return { listiny: parsed.listiny.slice(0, limit), celkem: parsed.celkem };
  } catch (e) {
    opts.log?.('sbirka_listin', url, false, Date.now() - start, String(e));
    return { listiny: [], celkem: 0 };
  }
}
