import { XMLParser } from "fast-xml-parser";

export interface IsirRecord {
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

export interface DphResult {
  isPlatce: boolean;
  nespolehlivy: boolean | null;
  datumNespolehlivosti: string | null;
  ucty: string[];
  nedostupne: boolean;
}

export const DPH_NOT_PLATCE: DphResult = { isPlatce: false, nespolehlivy: null, datumNespolehlivosti: null, ucty: [], nedostupne: false };
export const DPH_UNAVAILABLE: DphResult = { isPlatce: false, nespolehlivy: null, datumNespolehlivosti: null, ucty: [], nedostupne: true };

export const ACTIVE_STATI = new Set([
  "NEVYRIZENA", "OBZIVLA", "VYRIZENA", "KONKURS", "ZRUŠENO VS",
  "K-PO ZRUŠ.", "ÚPADEK", "REORGANIZ", "ODDLUŽENÍ", "MORATORIUM", "NEVYR-POST",
]);

export const INVALID_STATI = new Set(["MYLNÝ ZÁP.", "ODSKRTNUTA"]);

export function isActive(r: IsirRecord): boolean {
  if (r.datumPmUkonceniUpadku) return false;
  const s = r.druhStavKonkursu;
  if (s === "MYLNÝ ZÁP." || s === "PRAVOMOCNA" || s === "ODSKRTNUTA") return false;
  if (s && ACTIVE_STATI.has(s)) return true;
  return true;
}

export function assessClearance(records: IsirRecord[]): {
  clarity: "ACTIVE_DEBTOR" | "ACTIVE_CO_DEBTOR" | "PAST_DEBTOR" | "CLEAR";
  activeSet: Set<IsirRecord>;
} {
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

export function stavKodFrom(data: unknown): string | null {
  const reg = (data as any)?.seznamRegistraci;
  const raw = reg?.stavZdrojeRos ?? reg?.stavZdrojeVr ?? reg?.stavZdrojeRes ?? null;
  return raw === "NEEXISTUJICI" ? null : (raw ?? null);
}

export function stavNazevFrom(kod: string | null): string | null {
  if (!kod) return null;
  if (kod === "AKTIVNI") return "Aktivní";
  if (kod === "ZANIKLY" || kod === "ZANIKLÝ") return "Zaniklý";
  return kod;
}

export function findNode(obj: unknown, key: string): unknown {
  if (!obj || typeof obj !== "object") return undefined;
  for (const k of Object.keys(obj as object)) {
    if (k === key || k.endsWith(`:${key}`)) return (obj as any)[k];
    const found = findNode((obj as any)[k], key);
    if (found !== undefined) return found;
  }
  return undefined;
}

export function collectNodes(obj: unknown, key: string): unknown[] {
  if (!obj || typeof obj !== "object") return [];
  for (const k of Object.keys(obj as object)) {
    if (k === key || k.endsWith(`:${key}`)) {
      const val = (obj as any)[k];
      return Array.isArray(val) ? val : [val];
    }
  }
  for (const k of Object.keys(obj as object)) {
    const found = collectNodes((obj as any)[k], key);
    if (found.length > 0) return found;
  }
  return [];
}

export function str(v: unknown): string | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const s = String(v).trim();
  return s === "" ? undefined : s;
}

export function parseIsirResponse(xml: string): IsirRecord[] {
  const parser = new XMLParser({ ignoreAttributes: false, textNodeName: "_text" });
  const doc = parser.parse(xml);

  const body = findNode(doc, "Body") ?? doc;
  const responseEl = findNode(body, "getIsirWsCuzkDataResponse") ?? findNode(body, "return") ?? body;

  const stavEl = findNode(responseEl, "stav");
  const kodChyby = (stavEl as any)?.kodChyby ?? (stavEl as any)?.["ns2:kodChyby"] ?? "";
  if (String(kodChyby).trim() === "WS2") return [];

  const dataNodes = collectNodes(responseEl, "data");
  return (dataNodes as any[]).map((d: any) => ({
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

export function parseDphResponse(xml: string): DphResult {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", textNodeName: "_text" });
  const doc = parser.parse(xml);

  const statusEl = findNode(doc, "status");
  if (statusEl && String((statusEl as any)["@_statusCode"] ?? "0") !== "0") return DPH_UNAVAILABLE;

  const platceEl = findNode(doc, "statusPlatceDPH");
  if (!platceEl) return DPH_NOT_PLATCE;

  const nespolehlivyAttr = (platceEl as any)["@_nespolehlivyPlatce"];
  if (nespolehlivyAttr === "NENALEZEN") return DPH_NOT_PLATCE;

  const nespolehlivy = nespolehlivyAttr === "ANO";
  const datumNespolehlivosti = str((platceEl as any)["@_datumZverejneniNespolehlivosti"]) ?? null;

  const uctyEl = findNode(platceEl, "zverejneneUcty");
  const ucetNodes = uctyEl ? collectNodes(uctyEl, "ucet") : [];
  const ucty = (ucetNodes as any[]).flatMap((ucet: any) => {
    const std = findNode(ucet, "standardniUcet");
    if (std) {
      const predcisli = str((std as any)["@_predcisli"]);
      const cislo = str((std as any)["@_cislo"]) ?? "";
      const banka = str((std as any)["@_kodBanky"]) ?? "";
      return [`${predcisli ? predcisli + "-" : ""}${cislo}/${banka}`];
    }
    const nonStd = findNode(ucet, "nestandardniUcet");
    if (nonStd) return [str((nonStd as any)["@_cislo"]) ?? ""];
    return [];
  }).filter(Boolean);

  return { isPlatce: true, nespolehlivy, datumNespolehlivosti, ucty, nedostupne: false };
}
