import type { Config, Context } from "@netlify/functions";
import { XMLParser } from "fast-xml-parser";

const ARES_BASE = "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest";
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
  return true; // unknown/null → conservative
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

async function fetchAres(ico: string): Promise<any | null> {
  try {
    const res = await fetch(`${ARES_BASE}/ekonomicke-subjekty/${ico}`, {
      signal: AbortSignal.timeout(15_000),
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchIsir(ico: string): Promise<IsirRecord[]> {
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

  try {
    const res = await fetch(ISIR_CUZK, {
      method: "POST",
      headers: { "Content-Type": "text/xml; charset=UTF-8", SOAPAction: '""' },
      body,
      signal: AbortSignal.timeout(30_000),
    });
    const xml = await res.text();
    return parseIsirResponse(xml);
  } catch {
    return [];
  }
}

function parseIsirResponse(xml: string): IsirRecord[] {
  const parser = new XMLParser({ ignoreAttributes: false, textNodeName: "_text" });
  const doc = parser.parse(xml);

  // Navigate into SOAP body — structure varies, walk to find stav/data
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
}

const DPH_NOT_PLATCE: DphResult = { isPlatce: false, nespolehlivy: null, datumNespolehlivosti: null, ucty: [] };

async function fetchDph(dic: string): Promise<DphResult> {
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

  try {
    const res = await fetch(DPH_SOAP, {
      method: "POST",
      headers: { "Content-Type": "text/xml; charset=UTF-8", SOAPAction: '"getStatusNespolehlivyPlatce"' },
      body,
      signal: AbortSignal.timeout(15_000),
    });
    const xml = await res.text();
    return parseDphResponse(xml);
  } catch {
    return DPH_NOT_PLATCE;
  }
}

function parseDphResponse(xml: string): DphResult {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", textNodeName: "_text" });
  const doc = parser.parse(xml);

  const platceEl = findNode(doc, "statusPlatceDPH");
  if (!platceEl) return DPH_NOT_PLATCE;

  const nespolehlivy = platceEl["@_nespolehlivyPlatce"] === "ANO";
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

  return { isPlatce: true, nespolehlivy, datumNespolehlivosti, ucty };
}

async function fetchCuzk(addressText: string): Promise<string | null> {
  try {
    const url = `${CUZK_BASE}?SearchText=${encodeURIComponent(addressText)}&f=json`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.candidates?.[0]?.address ?? null;
  } catch {
    return null;
  }
}

// XML tree helpers
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

export default async (req: Request, context: Context) => {
  const ico = context.params['ico'];
  if (!ico || !/^\d{1,8}$/.test(ico)) {
    return Response.json({ error: "Invalid IČO" }, { status: 400 });
  }

  const dic = "CZ" + ico.padStart(8, "0");
  const [aresData, isirRecords, dphResult] = await Promise.all([fetchAres(ico), fetchIsir(ico), fetchDph(dic)]);

  const sidloText: string | null = aresData?.sidlo?.textovaAdresa ?? null;
  const cuzkAddress = sidloText ? await fetchCuzk(sidloText) : null;

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

  return Response.json({
    ico,
    obchodniFirma: aresData?.obchodniJmeno ?? null,
    pravniForma: aresData?.pravniForma ?? null,
    sidloText,
    sidloEnriched: cuzkAddress,
    datumVzniku: aresData?.datumVzniku ?? null,
    stavKod,
    stavNazev: stavNazevFrom(stavKod),
    isir: { clarity, proceedings },
    dph: dphResult,
    isWatched: false,
  });
};

export const config: Config = {
  path: "/api/v1/search/ico/:ico",
};
