const ARES_BASE = 'https://ares.gov.cz/ekonomicke-subjekty-v-be/rest';

export interface SearchItem {
  ico: string;
  obchodniFirma: string | null;
  sidloText: string | null;
  stavNazev: string | null;
}

export interface SearchResult {
  total: number;
  items: SearchItem[];
}

function stavNazevFrom(kod: string | null | undefined): string | null {
  if (!kod) return null;
  if (kod === 'NEEXISTUJICI') return null;
  if (kod === 'AKTIVNI') return 'Aktivní';
  if (kod === 'ZANIKLY' || kod === 'ZANIKLÝ') return 'Zaniklý';
  return kod;
}

function stavKodFrom(data: { seznamRegistraci?: Record<string, string | undefined> }): string | null {
  const reg = data?.seznamRegistraci;
  const raw = reg?.stavZdrojeRos ?? reg?.stavZdrojeVr ?? reg?.stavZdrojeRes ?? null;
  return raw === 'NEEXISTUJICI' ? null : (raw ?? null);
}

export async function searchCompaniesByName(
  q: string,
  start = 0,
): Promise<SearchResult> {
  if (!q.trim()) return { total: 0, items: [] };
  try {
    const res = await fetch(`${ARES_BASE}/ekonomicke-subjekty/vyhledat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ obchodniJmeno: q, start, pocet: 20, razeni: [] }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return { total: 0, items: [] };
    const data = await res.json() as {
      ekonomickeSubjekty?: Array<Record<string, unknown>>;
      pocetCelkem?: number;
    };
    const items: SearchItem[] = (data.ekonomickeSubjekty ?? []).map((s) => {
      const sub = s as { ico?: string; obchodniJmeno?: string; sidlo?: { textovaAdresa?: string }; seznamRegistraci?: Record<string, string> };
      const kod = stavKodFrom(sub);
      return {
        ico: sub.ico ?? '',
        obchodniFirma: sub.obchodniJmeno ?? null,
        sidloText: sub.sidlo?.textovaAdresa ?? null,
        stavNazev: stavNazevFrom(kod),
      };
    });
    return { total: data.pocetCelkem ?? 0, items };
  } catch {
    return { total: 0, items: [] };
  }
}
