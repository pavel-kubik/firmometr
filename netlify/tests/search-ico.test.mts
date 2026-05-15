import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import handler from '../functions/search-ico.mts';

// ---------------------------------------------------------------------------
// Fixtures — inline XML / JSON strings captured from live APIs (2026-05-14)
// ---------------------------------------------------------------------------

const ISIR_WS2 = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Header/>
  <soapenv:Body>
    <ns2:getIsirWsCuzkDataResponse xmlns:ns2="http://isirws.cca.cz/types/">
      <stav><kodChyby>WS2</kodChyby></stav>
    </ns2:getIsirWsCuzkDataResponse>
  </soapenv:Body>
</soapenv:Envelope>`;

// 07102127 — Butterfly Flowers s.r.o. — not a VAT payer (NENALEZEN)
const DPH_NENALEZEN = `<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"><soapenv:Header/><soapenv:Body><StatusNespolehlivyPlatceResponse xmlns="http://adis.mfcr.cz/rozhraniCRPDPH/"><status odpovedGenerovana="2026-05-14" statusCode="0" statusText="OK"/><statusPlatceDPH dic="CZ07102127" nespolehlivyPlatce="NENALEZEN"/></StatusNespolehlivyPlatceResponse></soapenv:Body></soapenv:Envelope>`;

// 04677285 — J&L Industries s.r.o. — nespolehlivý plátce DPH (ANO)
const DPH_ANO = `<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"><soapenv:Header/><soapenv:Body><StatusNespolehlivyPlatceResponse xmlns="http://adis.mfcr.cz/rozhraniCRPDPH/"><status odpovedGenerovana="2026-05-14" statusCode="0" statusText="OK"/><statusPlatceDPH dic="CZ04677285" nespolehlivyPlatce="ANO" datumZverejneniNespolehlivosti="2026-05-12" cisloFu="461"><zverejneneUcty><ucet datumZverejneni="2021-04-30"><standardniUcet cislo="7770165663" kodBanky="5500"/></ucet><ucet datumZverejneni="2021-05-05"><standardniUcet cislo="5791061389" kodBanky="0800"/></ucet><ucet datumZverejneni="2021-08-08"><standardniUcet cislo="777016562" kodBanky="0300"/></ucet></zverejneneUcty></statusPlatceDPH></StatusNespolehlivyPlatceResponse></soapenv:Body></soapenv:Envelope>`;

// 45795908 — České aerolinie a.s. — reliable payer (NE), mixed standard + IBAN accounts
const DPH_NE = `<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"><soapenv:Header/><soapenv:Body><StatusNespolehlivyPlatceResponse xmlns="http://adis.mfcr.cz/rozhraniCRPDPH/"><status odpovedGenerovana="2026-05-14" statusCode="0" statusText="OK"/><statusPlatceDPH dic="CZ45795908" nespolehlivyPlatce="NE" cisloFu="13"><zverejneneUcty><ucet datumZverejneni="2013-04-01"><standardniUcet cislo="2003630103" kodBanky="2600"/></ucet><ucet datumZverejneni="2015-08-27"><nestandardniUcet cislo="CZ7126000000002003630218"/></ucet><ucet datumZverejneni="2018-05-31"><nestandardniUcet cislo="CZ2326000000002003630306"/></ucet><ucet datumZverejneni="2018-05-31"><nestandardniUcet cislo="CZ5026000000002003630402"/></ucet></zverejneneUcty></statusPlatceDPH></StatusNespolehlivyPlatceResponse></soapenv:Body></soapenv:Envelope>`;

// 71379487 — Pavel Kubík (OSVČ) — DIČ is rodné číslo CZ8101120016, not CZ71379487; reliable payer
const DPH_NE_OSOBNI = `<?xml version="1.0" encoding="utf-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"><soapenv:Header/><soapenv:Body><StatusNespolehlivyPlatceResponse xmlns="http://adis.mfcr.cz/rozhraniCRPDPH/"><status odpovedGenerovana="2026-05-14" statusCode="0" statusText="OK"/><statusPlatceDPH dic="CZ8101120016" nespolehlivyPlatce="NE" cisloFu="452"><zverejneneUcty><ucet datumZverejneni="2024-09-20"><standardniUcet predcisli="115" cislo="8359310247" kodBanky="0100"/></ucet></zverejneneUcty></statusPlatceDPH></StatusNespolehlivyPlatceResponse></soapenv:Body></soapenv:Envelope>`;

// DPH service scheduled maintenance — statusCode="2", no statusPlatceDPH element
const DPH_MAINTENANCE = `<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"><soapenv:Header/><soapenv:Body><StatusNespolehlivyPlatceResponse xmlns="http://adis.mfcr.cz/rozhraniCRPDPH/"><status odpovedGenerovana="2026-05-16" statusCode="2" statusText="Technologická odstávka služby (23:59:59 - 00:10:00)."/></StatusNespolehlivyPlatceResponse></soapenv:Body></soapenv:Envelope>`;

const ARES_07102127 = JSON.stringify({
  ico: '07102127',
  obchodniJmeno: 'Butterfly Flowers s.r.o.',
  pravniForma: '112',
  sidlo: { textovaAdresa: 'Srbínská 867/4, Strašnice, 10000 Praha 10' },
  datumVzniku: '2018-05-04',
  seznamRegistraci: { stavZdrojeVr: 'AKTIVNI' },
});

const ARES_04677285 = JSON.stringify({
  ico: '04677285',
  obchodniJmeno: 'J&L Industries s.r.o.',
  pravniForma: '112',
  sidlo: { textovaAdresa: 'Testovací 1, 10000 Praha 10' },
  datumVzniku: '2014-06-01',
  seznamRegistraci: { stavZdrojeVr: 'AKTIVNI' },
});

const ARES_45795908 = JSON.stringify({
  ico: '45795908',
  obchodniJmeno: 'České aerolinie a.s.',
  pravniForma: '121',
  sidlo: { textovaAdresa: 'Jana Kašpara 1069/1, 16008 Praha 6' },
  datumVzniku: '1992-01-01',
  seznamRegistraci: { stavZdrojeVr: 'AKTIVNI' },
});

// 71379487 — Pavel Kubík (OSVČ) — dic field differs from "CZ"+IČO
const ARES_71379487 = JSON.stringify({
  ico: '71379487',
  dic: 'CZ8101120016',
  obchodniJmeno: 'Pavel Kubík',
  pravniForma: '101',
  sidlo: { textovaAdresa: 'K Parku 239, 25101 Nupaky' },
  datumVzniku: '2004-04-14',
  seznamRegistraci: { stavZdrojeVr: 'NEEXISTUJICI' },
});

// ARES VR — contains one jednatel for OR tests
const ARES_VR_07102127 = JSON.stringify({
  zaznamy: [{
    primarniZaznam: true,
    spisovaZnacka: [{ soud: 'MSPH', oddil: 'C', vlozka: 294429 }],
    statutarniOrgany: [{
      nazevOrganu: 'Statutární orgán',
      typOrganu: 'STATUTARNI_ORGAN',
      clenoveOrganu: [{
        datumZapisu: '2018-05-04',
        typAngazma: 'STATUTARNI_ORGAN_CLEN',
        clenstvi: { funkce: { vznikFunkce: '2018-05-04', nazev: 'jednatel' } },
        nazevAngazma: 'Člen statutárního orgánu',
        fyzickaOsoba: {
          jmeno: 'PAVEL',
          prijmeni: 'KUBÍK',
          datumNarozeni: '1981-01-12',
          adresa: { textovaAdresa: 'Srbínská 867/4, Strašnice, 10000 Praha 10' },
        },
      }],
    }],
  }],
});

const ARES_VR_EMPTY = JSON.stringify({ zaznamy: [] });

// OR HTML — subjektId lookup
const OR_SEARCH_HTML = `<html><body><a href="./rejstrik-firma.vysledky?subjektId=1013092&amp;typ=PLATNY">detail</a></body></html>`;

// OR HTML — document list (1 row)
const OR_DOCS_HTML = `<html><body><table><tbody>
<tr><td><a href="#">1</a></td><td>účetní závěrka [2024]</td><td>12.5.2025</td><td>15.6.2025</td><td>21.5.2025</td><td>4</td></tr>
</tbody></table></body></html>`;

const CUZK_EMPTY = JSON.stringify({ candidates: [] });

// ---------------------------------------------------------------------------
// Mock factory
// ---------------------------------------------------------------------------

function makeFetch(ico: string, opts: {
  ares?: string;
  aresVr?: string;
  isir?: string;
  dph?: string;
  orSearch?: string | null;
  orDocs?: string;
} = {}) {
  const {
    ares = '{}',
    aresVr = ARES_VR_EMPTY,
    isir = ISIR_WS2,
    dph = DPH_NENALEZEN,
    orSearch = null,
    orDocs = OR_DOCS_HTML,
  } = opts;

  return vi.fn(async (url: string | URL) => {
    const u = url.toString();
    if (u.includes(`ekonomicke-subjekty-vr/${ico}`)) return new Response(aresVr, { status: 200 });
    if (u.includes(`ekonomicke-subjekty/${ico}`))    return new Response(ares,   { status: 200 });
    if (u.includes('isir.justice.cz'))               return new Response(isir,   { status: 200 });
    if (u.includes('rozhraniCRPDPH'))                return new Response(dph,    { status: 200 });
    if (u.includes('or.justice.cz') && u.includes('rejstrik')) {
      return orSearch === null
        ? new Response('', { status: 404 })
        : new Response(orSearch, { status: 200 });
    }
    if (u.includes('or.justice.cz') && u.includes('vypis-sl')) return new Response(orDocs, { status: 200 });
    if (u.includes('cuzk.gov.cz')) return new Response(CUZK_EMPTY, { status: 200 });
    return new Response('', { status: 404 });
  });
}

function ctx(ico: string) {
  return { params: { ico } } as any;
}

afterEach(() => vi.unstubAllGlobals());

// ---------------------------------------------------------------------------
// ARES integration
// ---------------------------------------------------------------------------

describe('ARES integration', () => {
  it('maps company name, legal form, address, date and status', async () => {
    vi.stubGlobal('fetch', makeFetch('07102127', { ares: ARES_07102127 }));
    const body = await handler(new Request('http://x'), ctx('07102127')).then(r => r.json());

    expect(body.ico).toBe('07102127');
    expect(body.obchodniFirma).toBe('Butterfly Flowers s.r.o.');
    expect(body.pravniForma).toBe('112');
    expect(body.sidloText).toBe('Srbínská 867/4, Strašnice, 10000 Praha 10');
    expect(body.datumVzniku).toBe('2018-05-04');
    expect(body.stavKod).toBe('AKTIVNI');
    expect(body.stavNazev).toBe('Aktivní');
  });
});

// ---------------------------------------------------------------------------
// ISIR integration
// ---------------------------------------------------------------------------

describe('ISIR integration', () => {
  it('WS2 kodChyby → CLEAR with no proceedings', async () => {
    vi.stubGlobal('fetch', makeFetch('07102127', { ares: ARES_07102127, isir: ISIR_WS2 }));
    const body = await handler(new Request('http://x'), ctx('07102127')).then(r => r.json());

    expect(body.isir.clarity).toBe('CLEAR');
    expect(body.isir.proceedings).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// DPH integration
// ---------------------------------------------------------------------------

describe('DPH integration', () => {
  it('07102127 Butterfly Flowers — NENALEZEN → not a VAT payer', async () => {
    vi.stubGlobal('fetch', makeFetch('07102127', { ares: ARES_07102127, dph: DPH_NENALEZEN }));
    const body = await handler(new Request('http://x'), ctx('07102127')).then(r => r.json());

    expect(body.dph.isPlatce).toBe(false);
    expect(body.dph.nespolehlivy).toBeNull();
    expect(body.dph.datumNespolehlivosti).toBeNull();
    expect(body.dph.ucty).toEqual([]);
  });

  it('04677285 J&L Industries — ANO → nespolehlivý plátce with accounts', async () => {
    vi.stubGlobal('fetch', makeFetch('04677285', { ares: ARES_04677285, dph: DPH_ANO }));
    const body = await handler(new Request('http://x'), ctx('04677285')).then(r => r.json());

    expect(body.dph.isPlatce).toBe(true);
    expect(body.dph.nespolehlivy).toBe(true);
    expect(body.dph.datumNespolehlivosti).toBe('2026-05-12');
    expect(body.dph.ucty).toEqual(['7770165663/5500', '5791061389/0800', '777016562/0300']);
  });

  it('45795908 České aerolinie — NE → reliable payer with mixed accounts', async () => {
    vi.stubGlobal('fetch', makeFetch('45795908', { ares: ARES_45795908, dph: DPH_NE }));
    const body = await handler(new Request('http://x'), ctx('45795908')).then(r => r.json());

    expect(body.dph.isPlatce).toBe(true);
    expect(body.dph.nespolehlivy).toBe(false);
    expect(body.dph.datumNespolehlivosti).toBeNull();
    expect(body.dph.ucty).toContain('2003630103/2600');
    expect(body.dph.ucty).toContain('CZ7126000000002003630218');
    expect(body.dph.ucty).toContain('CZ2326000000002003630306');
    expect(body.dph.ucty).toContain('CZ5026000000002003630402');
  });

  it('71379487 Pavel Kubík (OSVČ) — dic from ARES used instead of CZ+IČO', async () => {
    vi.stubGlobal('fetch', makeFetch('71379487', { ares: ARES_71379487, dph: DPH_NE_OSOBNI }));
    const body = await handler(new Request('http://x'), ctx('71379487')).then(r => r.json());

    expect(body.dph.isPlatce).toBe(true);
    expect(body.dph.nespolehlivy).toBe(false);
    expect(body.dph.ucty).toEqual(['115-8359310247/0100']);
    expect(body.dph.nedostupne).toBe(false);
  });

  it('DPH statusCode 2 (maintenance window) → nedostupne: true, not shown as non-payer', async () => {
    vi.stubGlobal('fetch', makeFetch('07102127', { ares: ARES_07102127, dph: DPH_MAINTENANCE }));
    const body = await handler(new Request('http://x'), ctx('07102127')).then(r => r.json());

    expect(body.dph.nedostupne).toBe(true);
    expect(body.dph.isPlatce).toBe(false);
    expect(body.dph.nespolehlivy).toBeNull();
  });

  it('71379487 during DPH maintenance → nedostupne: true, not "not a payer"', async () => {
    vi.stubGlobal('fetch', makeFetch('71379487', { ares: ARES_71379487, dph: DPH_MAINTENANCE }));
    const body = await handler(new Request('http://x'), ctx('71379487')).then(r => r.json());

    expect(body.dph.nedostupne).toBe(true);
    expect(body.dph.isPlatce).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// OR integration
// ---------------------------------------------------------------------------

describe('OR integration', () => {
  it('ARES VR with clenoveOrganu → extracts jednatel name, funkce, datumVzniku', async () => {
    vi.stubGlobal('fetch', makeFetch('07102127', {
      ares: ARES_07102127,
      aresVr: ARES_VR_07102127,
      orSearch: OR_SEARCH_HTML,
    }));
    const body = await handler(new Request('http://x'), ctx('07102127')).then(r => r.json());

    expect(body.or).not.toBeNull();
    expect(body.or.spisovatel).toBe('C 294429');
    expect(body.or.statutari).toHaveLength(1);
    expect(body.or.statutari[0].jmeno).toBe('PAVEL KUBÍK');
    expect(body.or.statutari[0].funkce).toBe('jednatel');
    expect(body.or.statutari[0].datumVzniku).toBe('2018-05-04');
    expect(body.or.statutari[0].datumNarozeni).toBe('1981-01-12');
  });

  it('OR HTML search → populates sbirkaListin', async () => {
    vi.stubGlobal('fetch', makeFetch('07102127', {
      ares: ARES_07102127,
      aresVr: ARES_VR_07102127,
      orSearch: OR_SEARCH_HTML,
      orDocs: OR_DOCS_HTML,
    }));
    const body = await handler(new Request('http://x'), ctx('07102127')).then(r => r.json());

    expect(body.or.sbirkaListin).toHaveLength(1);
    expect(body.or.sbirkaListin[0].typListiny).toBe('účetní závěrka [2024]');
    expect(body.or.sbirkaListin[0].datumVzniku).toBe('12.5.2025');
    expect(body.or.sbirkaListin[0].datumZalozeni).toBe('21.5.2025');
    expect(body.or.orUrl).toContain('subjektId=1013092');
  });

  it('no ARES VR data and no OR subjektId → or: null', async () => {
    vi.stubGlobal('fetch', makeFetch('07102127', {
      ares: ARES_07102127,
      aresVr: ARES_VR_EMPTY,
      orSearch: null,
    }));
    const body = await handler(new Request('http://x'), ctx('07102127')).then(r => r.json());

    expect(body.or).toBeNull();
  });
});
