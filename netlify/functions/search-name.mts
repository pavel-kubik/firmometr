import type { Config } from "@netlify/functions";
import { checkCap, withCap } from './_cap.mjs';

const ARES_BASE = "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest";

function stavNazevFrom(kod: string | null | undefined): string | null {
  if (!kod) return null;
  if (kod === "NEEXISTUJICI") return null;
  if (kod === "AKTIVNI") return "Aktivní";
  if (kod === "ZANIKLY" || kod === "ZANIKLÝ") return "Zaniklý";
  return kod;
}

function stavKodFrom(data: any): string | null {
  const reg = data?.seznamRegistraci;
  const raw = reg?.stavZdrojeRos ?? reg?.stavZdrojeVr ?? reg?.stavZdrojeRes ?? null;
  return raw === "NEEXISTUJICI" ? null : (raw ?? null);
}

export default async (req: Request) => {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const start = parseInt(url.searchParams.get("start") ?? "0", 10) || 0;

  if (!q.trim()) {
    return Response.json({ total: 0, items: [] });
  }

  const cap = checkCap(req);
  if (cap.blocked) return withCap({ error: 'limit_reached' }, cap, 429);

  try {
    const res = await fetch(`${ARES_BASE}/ekonomicke-subjekty/vyhledat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ obchodniJmeno: q, start, pocet: 20, razeni: [] }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      return withCap({ total: 0, items: [] }, cap);
    }

    const data = await res.json();
    const items = (data.ekonomickeSubjekty ?? []).map((s: any) => {
      const kod = stavKodFrom(s);
      return {
        ico: s.ico,
        obchodniFirma: s.obchodniJmeno ?? null,
        sidloText: s.sidlo?.textovaAdresa ?? null,
        stavNazev: stavNazevFrom(kod),
      };
    });

    return withCap({ total: data.pocetCelkem ?? 0, items }, cap);
  } catch {
    return withCap({ total: 0, items: [] }, cap);
  }
};

export const config: Config = {
  path: "/api/v1/search",
};
