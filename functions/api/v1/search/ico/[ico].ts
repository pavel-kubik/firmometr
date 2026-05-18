import { XMLParser } from "fast-xml-parser";
import { checkCap, withCap } from '../../../../_shared/_cap';
import { getCached, setCached, type RegistrySource } from '../../../../_shared/_cache';
import { logApiCall } from '../../../../_shared/_analytics';

interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

interface Env {
  REGISTRY_CACHE: KVNamespace;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
}

interface RequestCtx {
  env: Env;
  ico: string;
  sourceIp: string | null;
  userAgent: string | null;
  userId: string | null;
}

function log(ctx: RequestCtx, registry: RegistrySource, url: string, cacheHit: boolean, durationMs?: number, error?: string) {
  logApiCall(ctx.env.SUPABASE_URL, ctx.env.SUPABASE_SERVICE_KEY, {
    registry,
    url,
    ico: ctx.ico,
    source_ip: ctx.sourceIp ?? undefined,
    user_agent: ctx.userAgent ?? undefined,
    user_id: ctx.userId ?? undefined,
    cache_hit: cacheHit,
    duration_ms: durationMs,
    error,
  });
}

const ARES_BASE = "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest";
const ARES_VR_BASE = "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest";
const OR_PORTAL = "https://or.justice.cz/ias/ui";
const ISIR_CUZK = "https://isir.justice.cz:8443/isir_cuzk_ws/IsirWsCuzkService";
const CUZK_BASE = "https://ags.cuzk.gov.cz/arcgis/rest/services/RUIAN/Vyhledavac_adres_sluzby/MapServer/exts/VyhledavacAdresRestSoe/FindAddress";
const CUZK_NS = "http://isirws.cca.cz/types/";
const DPH_SOAP = "https://adisrws.mfcr.cz/dpr/axis2/services/rozhraniCRPDPH.rozhraniCRPDPHSOAP";
const DPH_NS = "http://adis.mfcr.cz/rozhraniCRPDPH/";

const ACTIVE_STATI = new Set([
  "NEVYRIZENA", "OBZIVLA", "VYRIZENA", "KONKURS", "ZRUŠENO VS",
  "K-PO ZRUŠ.", "ÚPADEK", "REORGANIZ", "ODDLUŽENÍ", "MORATORIUM", "NEVYR-POST",
]);

const INVALID_STATI = new Set(["MYLNÝ ZÁP.", "ODSKRTNUTA"]);

interface IsirRecord {
  ic: string;
  cisloSenatu?: string;
  druhVec?: string;
  bcVec?: string;
  rocnik?: string;
  druhStavKonkursu?: string;
  urlDetailRizeni?: string;
  dalsiDluznikVRizeni?: string;
  datumPmZahajeniUpadku?: string;
  datumPmUkonceniUpadku?: string;
}

function isActive(r: IsirRecord): boolean {
  if (r.datumPmUkonceniUpadku) return false;
  const s = r.druhStavKonkursu;
  if (s === "MYLNÝ ZÁP." || s === "PRAVOMOCNA" || s === "ODSKRTNUTA") return false;
  if (s && ACTIVE_STATI.has(s)) return true;
  return true;
}

function assessClearance(records: IsirRecord[]) {
  const active = records.filter(isActive);
  if (active.length > 0) {
    const hasDirect = active.some(r => r.dalsiDluznikVRizeni !== "T");
    return { clarity: hasDirect ? "ACTIVE_DEBTOR" : "ACTIVE_CO_DEBTOR", activeSet: new Set(active) };
  }
  const pastDirect = records.filter(
    r => !isActive(r) && r.dalsiDluznikVRizeni !== "T" && !INVALID_STATI.has(r.druhStavKonkursu ?? "")
  );
  return { clarity: pastDirect.length > 0 ? "PAST_DEBTOR" : "CLEAR", activeSet: new Set<IsirRecord>() };
}

function stavKodFrom(data: any): string | null {
  const reg = data?.seznamRegistraci;
  const raw = reg?.stavZdrojeRos ?? reg?.stavZdrojeVr ?? reg?.stavZdrojeRes ?? null;
  return raw === "NEEXISTUJICI" ? null : (raw ?? null);
}

function stavNazevFrom(kod: string | null): string | null {
  if (!kod) return null;
  if (kod === "AKTIVNI") return "Aktivní";
  if (kod === "ZANIKLY" || kod === "ZANIKLÝ") return "Zaniklý";
  return kod;
}

async function fetchAres(ico: string, ctx: RequestCtx): Promise<any | null> {
  const url = `${ARES_BASE}/ekonomicke-subjekty/${ico}`;
  const cached = await getCached<any>(ctx.env.REGISTRY_CACHE, 'ares', ico);
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
  const cached = await getCached<IsirRecord[]>(ctx.env.REGISTRY_CACHE, 'isir', ico);
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

function parseIsirResponse(xml: string): IsirRecord[] {
  const parser = new XMLParser({ ignoreAttributes: false, textNodeName: "_text" });
  const doc = parser.parse(xml);

  const body = findNode(doc, "Body") ?? doc;
  const responseEl = findNode(body, "getIsirWsCuzkDataResponse") ?? findNode(body, "return") ?? body;

  const stavEl = findNode(responseEl, "stav");
  const kodChyby = stavEl?.kodChyby ?? stavEl?.["ns2:kodChyby"] ?? "";
  if (String(kodChyby).trim() === "WS2") return [];

  const dataNodes = collectNodes(responseEl, "data");
  return dataNodes.map((d: any) => ({
    ic: str(d.ic) ?? "",
    cisloSenatu: str(d.cisloSenatu),
    druhVec: str(d.druhVec),
    bcVec: str(d.bcVec),
    rocnik: str(d.rocnik),
    druhStavKonkursu: str(d.druhStavKonkursu),
    urlDetailRizeni: str(d.urlDetailRizeni),
    dalsiDluznikVRizeni: str(d.dalsiDluznikVRizeni),
    datumPmZahajeniUpadku: str(d.datumPmZahajeniUpadku),
    datumPmUkonceniUpadku: str(d.datumPmUkonceniUpadku),
  }));
}

interface DphResult {
  isPlatce: boolean;
  nespolehlivy: boolean | null;
  datumNespolehlivosti: string | null;
  ucty: string[];
  nedostupne: boolean;
}

const DPH_NOT_PLATCE: DphResult = { isPlatce: false, nespolehlivy: null, datumNespolehlivosti: null, ucty: [], nedostupne: false };
const DPH_UNAVAILABLE: DphResult = { isPlatce: false, nespolehlivy: null, datumNespolehlivosti: null, ucty: [], nedostupne: true };

async function fetchDph(dic: string, ctx: RequestCtx): Promise<DphResult> {
  const cached = await getCached<DphResult>(ctx.env.REGISTRY_CACHE, 'dph', dic);
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

function parseDphResponse(xml: string): DphResult {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", textNodeName: "_text" });
  const doc = parser.parse(xml);

  const statusEl = findNode(doc, "status");
  if (statusEl && String(statusEl["@_statusCode"] ?? "0") !== "0") return DPH_UNAVAILABLE;

  const platceEl = findNode(doc, "statusPlatceDPH");
  if (!platceEl) return DPH_NOT_PLATCE;

  const nespolehlivyAttr = platceEl["@_nespolehlivyPlatce"];
  if (nespolehlivyAttr === "NENALEZEN") return DPH_NOT_PLATCE;

  const nespolehlivy = nespolehlivyAttr === "ANO";
  const datumNespolehlivosti = str(platceEl["@_datumZverejneniNespolehlivosti"]) ?? null;

  const uctyEl = findNode(platceEl, "zverejneneUcty");
  const ucetNodes = uctyEl ? collectNodes(uctyEl, "ucet") : [];
  const ucty = ucetNodes.flatMap((ucet: any) => {
    const std = findNode(ucet, "standardniUcet");
    if (std) {
      const predcisli = str(std["@_predcisli"]);
      const cislo = str(std["@_cislo"]) ?? "";
      const banka = str(std["@_kodBanky"]) ?? "";
      return [`${predcisli ? predcisli + "-" : ""}${cislo}/${banka}`];
    }
    const nonStd = findNode(ucet, "nestandardniUcet");
    if (nonStd) return [str(nonStd["@_cislo"]) ?? ""];
    return [];
  }).filter(Boolean);

  return { isPlatce: true, nespolehlivy, datumNespolehlivosti, ucty, nedostupne: false };
}

interface OrStatutar {
  jmeno: string | null;
  funkce: string | null;
  datumNarozeni: string | null;
  adresaText: string | null;
  datumVzniku: string | null;
  datumZaniku: string | null;
}

interface OrListina {
  typListiny: string;
  datumVzniku: string | null;
  datumZalozeni: string | null;
}

async function fetchOrVr(ico: string, ctx: RequestCtx): Promise<{ spisovatel: string | null; statutari: OrStatutar[] }> {
  const url = `${ARES_VR_BASE}/ekonomicke-subjekty-vr/${ico}`;
  const cached = await getCached<{ spisovatel: string | null; statutari: OrStatutar[] }>(ctx.env.REGISTRY_CACHE, 'or_vr', ico);
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

async function fetchOrSubjektId(ico: string, ctx: RequestCtx): Promise<string | null> {
  const url = `${OR_PORTAL}/rejstrik-$firma?ico=${ico}`;
  const cached = await getCached<string | null>(ctx.env.REGISTRY_CACHE, 'or_subjekt_id', ico);
  if (cached) { log(ctx, 'or_subjekt_id', url, true); return cached.data; }
  const start = Date.now();
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10_000),
      headers: { "Accept": "text/html,*/*", "User-Agent": "Proklepni.cz/1.0" },
    });
    if (!res.ok) {
      log(ctx, 'or_subjekt_id', url, false, Date.now() - start, `HTTP ${res.status}`);
      return null;
    }
    const html = await res.text();
    const m = html.match(/subjektId=(\d+)/);
    const subjektId = m?.[1] ?? null;
    await setCached(ctx.env.REGISTRY_CACHE, 'or_subjekt_id', ico, subjektId);
    log(ctx, 'or_subjekt_id', url, false, Date.now() - start);
    return subjektId;
  } catch (e) {
    log(ctx, 'or_subjekt_id', url, false, Date.now() - start, String(e));
    return null;
  }
}

async function fetchSbirkaListin(subjektId: string, ctx: RequestCtx): Promise<{ listiny: OrListina[]; celkem: number }> {
  const url = `${OR_PORTAL}/vypis-sl-firma?subjektId=${subjektId}`;
  const cached = await getCached<{ listiny: OrListina[]; celkem: number }>(ctx.env.REGISTRY_CACHE, 'sbirka_listin', subjektId);
  if (cached) { log(ctx, 'sbirka_listin', url, true); return cached.data; }
  const start = Date.now();
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10_000),
      headers: { "Accept": "text/html,*/*", "User-Agent": "Proklepni.cz/1.0" },
    });
    if (!res.ok) {
      log(ctx, 'sbirka_listin', url, false, Date.now() - start, `HTTP ${res.status}`);
      return { listiny: [], celkem: 0 };
    }
    const html = await res.text();

    const countMatch = html.match(/z\s+(\d+)\s+(?:záznam[ůu]|listiny)/i)
      ?? html.match(/[Cc]elkem[:\s]+(\d+)/);
    let celkem = countMatch ? parseInt(countMatch[1], 10) : 0;

    const listiny: OrListina[] = [];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
    let rowMatch: RegExpExecArray | null;
    while ((rowMatch = rowRegex.exec(html)) !== null) {
      const rowHtml = rowMatch[1];
      const tdContents: string[] = [];
      const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;
      let tdMatch: RegExpExecArray | null;
      while ((tdMatch = tdRegex.exec(rowHtml)) !== null) {
        tdContents.push(tdMatch[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim());
      }
      if (tdContents.length >= 3 && tdContents[1]) {
        listiny.push({
          typListiny: tdContents[1],
          datumVzniku: tdContents[2] || null,
          datumZalozeni: tdContents[4] || null,
        });
      }
    }

    if (!celkem) celkem = listiny.length;
    const result = { listiny: listiny.slice(0, 10), celkem };
    await setCached(ctx.env.REGISTRY_CACHE, 'sbirka_listin', subjektId, result);
    log(ctx, 'sbirka_listin', url, false, Date.now() - start);
    return result;
  } catch (e) {
    log(ctx, 'sbirka_listin', url, false, Date.now() - start, String(e));
    return { listiny: [], celkem: 0 };
  }
}

async function fetchCuzk(addressText: string, ico: string, ctx: RequestCtx): Promise<string | null> {
  const url = `${CUZK_BASE}?SearchText=${encodeURIComponent(addressText)}&f=json`;
  const cached = await getCached<string | null>(ctx.env.REGISTRY_CACHE, 'cuzk', ico);
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

function findNode(obj: any, key: string): any {
  if (!obj || typeof obj !== "object") return undefined;
  for (const k of Object.keys(obj)) {
    if (k === key || k.endsWith(`:${key}`)) return obj[k];
    const found = findNode(obj[k], key);
    if (found !== undefined) return found;
  }
  return undefined;
}

function collectNodes(obj: any, key: string): any[] {
  if (!obj || typeof obj !== "object") return [];
  for (const k of Object.keys(obj)) {
    if (k === key || k.endsWith(`:${key}`)) {
      const val = obj[k];
      return Array.isArray(val) ? val : [val];
    }
  }
  for (const k of Object.keys(obj)) {
    const found = collectNodes(obj[k], key);
    if (found.length > 0) return found;
  }
  return [];
}

function str(v: any): string | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const s = String(v).trim();
  return s === "" ? undefined : s;
}

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
    return Response.json({ error: "Invalid IČO" }, { status: 400 });
  }

  const cap = checkCap(request);
  if (cap.blocked) return withCap({ error: 'limit_reached' }, cap, 429);

  const authHeader = request.headers.get('authorization') ?? '';
  const userId = authHeader.startsWith('Bearer ') ? parseUserIdFromJwt(authHeader.slice(7)) : null;

  const ctx: RequestCtx = {
    env,
    ico,
    sourceIp: request.headers.get('CF-Connecting-IP'),
    userAgent: request.headers.get('User-Agent'),
    userId,
  };

  const [aresData, isirRecords, orVr, orSubjektId] = await Promise.all([
    fetchAres(ico, ctx), fetchIsir(ico, ctx), fetchOrVr(ico, ctx), fetchOrSubjektId(ico, ctx),
  ]);

  const dic = aresData?.dic ?? ("CZ" + ico.padStart(8, "0"));
  const sidloText: string | null = aresData?.sidlo?.textovaAdresa ?? null;
  const [dphResult, cuzkAddress, sbirkaListinResult] = await Promise.all([
    fetchDph(dic, ctx),
    sidloText ? fetchCuzk(sidloText, ico, ctx) : Promise.resolve(null),
    orSubjektId ? fetchSbirkaListin(orSubjektId, ctx) : Promise.resolve({ listiny: [], celkem: 0 }),
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
      sbirkaListin: sbirkaListinResult.listiny,
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
