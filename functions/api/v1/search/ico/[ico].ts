import { checkCap, withCap } from '../../../../_shared/_cap';
import { getCached, setCached, type RegistrySource } from '../../../../_shared/_cache';
import { logApiCall } from '../../../../_shared/_analytics';
import { fetchOrSubjektId, fetchSbirkaListin } from '../../../../_shared/_or';
import { isAuthenticated } from '../../../../_shared/_auth';
import {
  type IsirRecord, type DphResult,
  DPH_UNAVAILABLE,
  assessClearance, stavKodFrom, stavNazevFrom,
  findNode, collectNodes, str,
  parseIsirResponse, parseDphResponse,
} from './parsers';

interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

interface Env {
  REGISTRY_CACHE: KVNamespace;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  SUPABASE_ANON_KEY: string;
}

interface RequestCtx {
  env: Env;
  ico: string;
  sourceIp: string | null;
  userAgent: string | null;
  userId: string | null;
  waitUntil: (p: Promise<unknown>) => void;
  maxCacheAgeSecs: number | undefined;
  deployEnv: string;
}

function log(ctx: RequestCtx, registry: RegistrySource, url: string, cacheHit: boolean, durationMs?: number, error?: string) {
  if (error) console.error(`[${registry}] ico=${ctx.ico} url=${url} error=${error}`);
  ctx.waitUntil(logApiCall(ctx.env.SUPABASE_URL, ctx.env.SUPABASE_SERVICE_KEY, {
    registry,
    url,
    ico: ctx.ico,
    source_ip: ctx.sourceIp ?? undefined,
    user_agent: ctx.userAgent ?? undefined,
    user_id: ctx.userId ?? undefined,
    cache_hit: cacheHit,
    duration_ms: durationMs,
    error,
    env: ctx.deployEnv,
  }));
}

const ARES_BASE = "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest";
const ARES_VR_BASE = "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest";
const ISIR_CUZK = "https://isir.justice.cz:8443/isir_cuzk_ws/IsirWsCuzkService";
const CUZK_BASE = "https://ags.cuzk.gov.cz/arcgis/rest/services/RUIAN/Vyhledavac_adres_sluzby/MapServer/exts/VyhledavacAdresRestSoe/FindAddress";
const CUZK_NS = "http://isirws.cca.cz/types/";
const DPH_SOAP = "https://adisrws.mfcr.cz/dpr/axis2/services/rozhraniCRPDPH.rozhraniCRPDPHSOAP";
const DPH_NS = "http://adis.mfcr.cz/rozhraniCRPDPH/";

async function fetchAres(ico: string, ctx: RequestCtx): Promise<any | null> {
  const url = `${ARES_BASE}/ekonomicke-subjekty/${ico}`;
  const cached = await getCached<any>(ctx.env.REGISTRY_CACHE, 'ares', ico, ctx.maxCacheAgeSecs);
  if (cached) { log(ctx, 'ares', url, true); return cached.data; }
  const start = Date.now();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    const duration_ms = Date.now() - start;
    if (res.status === 404) { log(ctx, 'ares', url, false, duration_ms); return null; }
    if (!res.ok) { log(ctx, 'ares', url, false, duration_ms, `HTTP ${res.status}`); return null; }
    const data = await res.json();
    await setCached(ctx.env.REGISTRY_CACHE, 'ares', ico, data);
    log(ctx, 'ares', url, false, duration_ms);
    return data;
  } catch (e) {
    log(ctx, 'ares', url, false, Date.now() - start, String(e));
    return null;
  }
}

async function fetchIsir(ico: string, ctx: RequestCtx): Promise<IsirRecord[]> {
  const cached = await getCached<IsirRecord[]>(ctx.env.REGISTRY_CACHE, 'isir', ico, ctx.maxCacheAgeSecs);
  if (cached) { log(ctx, 'isir', ISIR_CUZK, true); return cached.data; }
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:ns1="${CUZK_NS}">
  <soapenv:Header/>
  <soapenv:Body>
    <ns1:getIsirWsCuzkDataRequest>
      <ic>${ico}</ic>
    </ns1:getIsirWsCuzkDataRequest>
  </soapenv:Body>
</soapenv:Envelope>`;
  const start = Date.now();
  try {
    const res = await fetch(ISIR_CUZK, {
      method: "POST",
      headers: { "Content-Type": "text/xml; charset=UTF-8", SOAPAction: '""' },
      body,
      signal: AbortSignal.timeout(30_000),
    });
    const xml = await res.text();
    const records = parseIsirResponse(xml);
    await setCached(ctx.env.REGISTRY_CACHE, 'isir', ico, records);
    log(ctx, 'isir', ISIR_CUZK, false, Date.now() - start);
    return records;
  } catch (e) {
    log(ctx, 'isir', ISIR_CUZK, false, Date.now() - start, String(e));
    return [];
  }
}

async function fetchDph(dic: string, ctx: RequestCtx): Promise<DphResult> {
  const cached = await getCached<DphResult>(ctx.env.REGISTRY_CACHE, 'dph', dic, ctx.maxCacheAgeSecs);
  if (cached) { log(ctx, 'dph', DPH_SOAP, true); return cached.data; }
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:ns1="${DPH_NS}">
  <soapenv:Header/>
  <soapenv:Body>
    <ns1:StatusNespolehlivyPlatceRequest>
      <ns1:dic>${dic}</ns1:dic>
    </ns1:StatusNespolehlivyPlatceRequest>
  </soapenv:Body>
</soapenv:Envelope>`;
  const start = Date.now();
  try {
    const res = await fetch(DPH_SOAP, {
      method: "POST",
      headers: { "Content-Type": "text/xml; charset=UTF-8", SOAPAction: '"getStatusNespolehlivyPlatce"' },
      body,
      signal: AbortSignal.timeout(15_000),
    });
    const xml = await res.text();
    const result = parseDphResponse(xml);
    await setCached(ctx.env.REGISTRY_CACHE, 'dph', dic, result);
    log(ctx, 'dph', DPH_SOAP, false, Date.now() - start);
    return result;
  } catch (e) {
    log(ctx, 'dph', DPH_SOAP, false, Date.now() - start, String(e));
    return DPH_UNAVAILABLE;
  }
}

interface OrStatutar {
  jmeno: string | null;
  funkce: string | null;
  datumNarozeni: string | null;
  adresaText: string | null;
  datumVzniku: string | null;
  datumZaniku: string | null;
}


async function fetchOrVr(ico: string, ctx: RequestCtx): Promise<{ spisovatel: string | null; statutari: OrStatutar[] }> {
  const url = `${ARES_VR_BASE}/ekonomicke-subjekty-vr/${ico}`;
  const cached = await getCached<{ spisovatel: string | null; statutari: OrStatutar[] }>(ctx.env.REGISTRY_CACHE, 'or_vr', ico, ctx.maxCacheAgeSecs);
  if (cached) { log(ctx, 'or_vr', url, true); return cached.data; }
  const start = Date.now();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) {
      log(ctx, 'or_vr', url, false, Date.now() - start, `HTTP ${res.status}`);
      return { spisovatel: null, statutari: [] };
    }
    const data = await res.json();

    const zaznamy: any[] = data?.zaznamy ?? [];
    const primary = zaznamy.find((z: any) => z.primarniZaznam) ?? zaznamy[0];
    if (!primary) { log(ctx, 'or_vr', url, false, Date.now() - start); return { spisovatel: null, statutari: [] }; }

    const szArr: any[] = Array.isArray(primary.spisovaZnacka) ? primary.spisovaZnacka : [];
    const sz = szArr[0];
    const spisovatel = sz ? `${sz.oddil} ${sz.vlozka}` : null;

    const organy: any[] = primary.statutarniOrgany ?? [];
    const allMembers: any[] = organy.flatMap((o: any) => o.clenoveOrganu ?? []);

    function memberToStatutar(m: any): OrStatutar {
      const fo = m.fyzickaOsoba;
      const po = m.pravnickaOsoba;
      const funkce = str(m.clenstvi?.funkce?.nazev ?? m.nazevAngazma) ?? null;
      const datumVzniku = str(m.clenstvi?.funkce?.vznikFunkce ?? m.datumZapisu) ?? null;
      const datumZaniku = str(m.clenstvi?.funkce?.zanikFunkce ?? m.datumVyskrtnuti) ?? null;
      if (fo) {
        const parts = [fo.titulPredJmenem, fo.jmeno, fo.prijmeni, fo.titulZaJmenem]
          .filter((v) => v != null && String(v).trim() !== "")
          .map((v) => String(v).trim());
        return {
          jmeno: parts.length ? parts.join(" ") : null,
          funkce,
          datumNarozeni: str(fo.datumNarozeni) ?? null,
          adresaText: str(fo.adresa?.textovaAdresa) ?? null,
          datumVzniku,
          datumZaniku,
        };
      }
      if (po) {
        return { jmeno: str(po.obchodniJmeno) ?? null, funkce, datumNarozeni: null, adresaText: null, datumVzniku, datumZaniku };
      }
      return { jmeno: null, funkce, datumNarozeni: null, adresaText: null, datumVzniku, datumZaniku };
    }

    const statutari: OrStatutar[] = allMembers.map(memberToStatutar);
    const result = { spisovatel, statutari };
    await setCached(ctx.env.REGISTRY_CACHE, 'or_vr', ico, result);
    log(ctx, 'or_vr', url, false, Date.now() - start);
    return result;
  } catch (e) {
    log(ctx, 'or_vr', url, false, Date.now() - start, String(e));
    return { spisovatel: null, statutari: [] };
  }
}

async function fetchCuzk(addressText: string, ico: string, ctx: RequestCtx): Promise<string | null> {
  const url = `${CUZK_BASE}?SearchText=${encodeURIComponent(addressText)}&f=json`;
  const cached = await getCached<string | null>(ctx.env.REGISTRY_CACHE, 'cuzk', ico, ctx.maxCacheAgeSecs);
  if (cached) { log(ctx, 'cuzk', url, true); return cached.data; }
  const start = Date.now();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) {
      log(ctx, 'cuzk', url, false, Date.now() - start, `HTTP ${res.status}`);
      return null;
    }
    const data = await res.json();
    const address = data?.candidates?.[0]?.address ?? null;
    await setCached(ctx.env.REGISTRY_CACHE, 'cuzk', ico, address);
    log(ctx, 'cuzk', url, false, Date.now() - start);
    return address;
  } catch (e) {
    log(ctx, 'cuzk', url, false, Date.now() - start, String(e));
    return null;
  }
}

export const onRequest = async ({
  request,
  params,
  env,
  waitUntil,
}: {
  request: Request;
  params: Record<string, string>;
  env: Env;
  waitUntil: (p: Promise<unknown>) => void;
}) => {
  const ico = params['ico'];
  if (!ico || !/^\d{1,8}$/.test(ico)) {
    return Response.json({ error: "Invalid IČO" }, { status: 400 });
  }

  const cap = checkCap(request);
  if (cap.blocked) return withCap({ error: 'limit_reached' }, cap, 429);

  const authHeader = request.headers.get('authorization') ?? '';
  const userId = authHeader.startsWith('Bearer ') ? parseUserIdFromJwt(authHeader.slice(7)) : null;

  const maxCacheAgeParam = new URL(request.url).searchParams.get('max_cache_age');
  const maxCacheAgeSecs = maxCacheAgeParam !== null ? parseInt(maxCacheAgeParam, 10) : undefined;

  const hostname = new URL(request.url).hostname;
  const deployEnv = hostname === 'localhost' || hostname === '127.0.0.1' ? 'local' : 'prod';

  const ctx: RequestCtx = {
    env,
    ico,
    sourceIp: request.headers.get('CF-Connecting-IP'),
    userAgent: request.headers.get('User-Agent'),
    userId,
    waitUntil,
    maxCacheAgeSecs,
    deployEnv,
  };

  const orOpts = {
    kv: ctx.env.REGISTRY_CACHE,
    maxCacheAgeSecs: ctx.maxCacheAgeSecs,
    log: (source: 'or_subjekt_id' | 'sbirka_listin', url: string, cacheHit: boolean, durationMs?: number, error?: string) =>
      log(ctx, source, url, cacheHit, durationMs, error),
  };

  const [aresData, isirRecords, orVr, orSubjektId] = await Promise.all([
    fetchAres(ico, ctx), fetchIsir(ico, ctx), fetchOrVr(ico, ctx), fetchOrSubjektId(ico, orOpts),
  ]);

  const dic = aresData?.dic ?? ("CZ" + ico.padStart(8, "0"));
  const sidloText: string | null = aresData?.sidlo?.textovaAdresa ?? null;
  const [dphResult, cuzkAddress, sbirkaListinResult] = await Promise.all([
    fetchDph(dic, ctx),
    sidloText ? fetchCuzk(sidloText, ico, ctx) : Promise.resolve(null),
    orSubjektId ? fetchSbirkaListin(orSubjektId, orOpts) : Promise.resolve({ listiny: [], celkem: 0 }),
  ]);

  const { clarity, activeSet } = assessClearance(isirRecords);
  const stavKod = stavKodFrom(aresData);

  const proceedings = isirRecords.map(r => {
    const parts = [r.cisloSenatu, r.druhVec, [r.bcVec, r.rocnik].filter(Boolean).join("/")]
      .filter(Boolean);
    return {
      senZnacka: parts.length > 0 ? parts.join(" ") : null,
      stavKonkursu: r.druhStavKonkursu ?? null,
      datumZahajeni: r.datumPmZahajeniUpadku ?? null,
      urlDetail: r.urlDetailRizeni ?? null,
      jeDalsiDluznik: r.dalsiDluznikVRizeni === "T",
      isActive: activeSet.has(r),
    };
  });

  const hasOrData = orVr.statutari.length > 0 || orVr.spisovatel || sbirkaListinResult.celkem > 0;

  // Sbírka listin is a registered-user feature: withhold the document rows from anonymous
  // callers but keep the count (the tease). See feature-flags.ts / statements endpoint.
  const authed = await isAuthenticated(request, env);

  return withCap({
    ico,
    dic: aresData?.dic ?? null,
    obchodniFirma: aresData?.obchodniJmeno ?? null,
    pravniForma: aresData?.pravniForma ?? null,
    sidloText,
    sidloEnriched: cuzkAddress,
    datumVzniku: aresData?.datumVzniku ?? null,
    stavKod,
    stavNazev: stavNazevFrom(stavKod),
    isir: { clarity, proceedings },
    dph: dphResult,
    or: hasOrData ? {
      spisovatel: orVr.spisovatel,
      statutari: orVr.statutari,
      sbirkaListin: authed ? sbirkaListinResult.listiny : [],
      sbirkaListinCelkem: sbirkaListinResult.celkem,
      orUrl: orSubjektId
        ? `https://or.justice.cz/ias/ui/rejstrik-firma.vysledky?subjektId=${orSubjektId}&typ=PLATNY`
        : null,
    } : null,
    isWatched: false,
  }, cap);
};

function parseUserIdFromJwt(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded?.sub ?? null;
  } catch {
    return null;
  }
}
