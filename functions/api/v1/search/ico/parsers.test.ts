import { describe, it, expect } from 'vitest';
import {
  isActive, assessClearance, stavKodFrom, stavNazevFrom,
  parseIsirResponse, parseDphResponse,
  type IsirRecord,
} from './parsers';

// ─── isActive ────────────────────────────────────────────────────────────────

describe('isActive', () => {
  it('returns false when datumPmUkonceniUpadku is set (proceedings ended)', () => {
    const r: IsirRecord = { ic: '1', druhStavKonkursu: 'ÚPADEK', datumPmUkonceniUpadku: '2023-01-01' };
    expect(isActive(r)).toBe(false);
  });

  it('returns false for PRAVOMOCNA status', () => {
    expect(isActive({ ic: '1', druhStavKonkursu: 'PRAVOMOCNA' })).toBe(false);
  });

  it('returns false for MYLNÝ ZÁP. status', () => {
    expect(isActive({ ic: '1', druhStavKonkursu: 'MYLNÝ ZÁP.' })).toBe(false);
  });

  it('returns false for ODSKRTNUTA status', () => {
    expect(isActive({ ic: '1', druhStavKonkursu: 'ODSKRTNUTA' })).toBe(false);
  });

  it('returns true for ÚPADEK status without end date', () => {
    expect(isActive({ ic: '1', druhStavKonkursu: 'ÚPADEK' })).toBe(true);
  });

  it('returns true for KONKURS status', () => {
    expect(isActive({ ic: '1', druhStavKonkursu: 'KONKURS' })).toBe(true);
  });

  it('returns true for ODDLUŽENÍ status', () => {
    expect(isActive({ ic: '1', druhStavKonkursu: 'ODDLUŽENÍ' })).toBe(true);
  });

  it('returns true for NEVYRIZENA status', () => {
    expect(isActive({ ic: '1', druhStavKonkursu: 'NEVYRIZENA' })).toBe(true);
  });

  it('returns true for unknown/undefined status (optimistic — treat as active)', () => {
    expect(isActive({ ic: '1' })).toBe(true);
  });
});

// ─── assessClearance ─────────────────────────────────────────────────────────

describe('assessClearance', () => {
  it('returns CLEAR when no records', () => {
    expect(assessClearance([]).clarity).toBe('CLEAR');
  });

  it('returns CLEAR when all records are INVALID_STATI (MYLNÝ ZÁP.)', () => {
    const result = assessClearance([{ ic: '1', druhStavKonkursu: 'MYLNÝ ZÁP.' }]);
    expect(result.clarity).toBe('CLEAR');
  });

  it('returns ACTIVE_DEBTOR when there is an active direct debtor record', () => {
    const r: IsirRecord = { ic: '1', druhStavKonkursu: 'ÚPADEK', dalsiDluznikVRizeni: 'N' };
    expect(assessClearance([r]).clarity).toBe('ACTIVE_DEBTOR');
  });

  it('returns ACTIVE_DEBTOR when dalsiDluznikVRizeni is absent (defaults to direct)', () => {
    const r: IsirRecord = { ic: '1', druhStavKonkursu: 'ÚPADEK' };
    expect(assessClearance([r]).clarity).toBe('ACTIVE_DEBTOR');
  });

  it('returns ACTIVE_CO_DEBTOR when all active records are co-debtor (T)', () => {
    const r: IsirRecord = { ic: '1', druhStavKonkursu: 'ÚPADEK', dalsiDluznikVRizeni: 'T' };
    expect(assessClearance([r]).clarity).toBe('ACTIVE_CO_DEBTOR');
  });

  it('returns ACTIVE_DEBTOR when mix of direct and co-debtor active records', () => {
    const records: IsirRecord[] = [
      { ic: '1', druhStavKonkursu: 'ÚPADEK', dalsiDluznikVRizeni: 'T' },
      { ic: '1', druhStavKonkursu: 'KONKURS', dalsiDluznikVRizeni: 'N' },
    ];
    expect(assessClearance(records).clarity).toBe('ACTIVE_DEBTOR');
  });

  it('returns PAST_DEBTOR when only past direct debtor records', () => {
    const r: IsirRecord = { ic: '1', druhStavKonkursu: 'PRAVOMOCNA', dalsiDluznikVRizeni: 'N' };
    expect(assessClearance([r]).clarity).toBe('PAST_DEBTOR');
  });

  it('returns CLEAR when past records are all co-debtor', () => {
    const r: IsirRecord = { ic: '1', druhStavKonkursu: 'PRAVOMOCNA', dalsiDluznikVRizeni: 'T' };
    expect(assessClearance([r]).clarity).toBe('CLEAR');
  });

  it('activeSet contains only active records', () => {
    const active: IsirRecord = { ic: '1', druhStavKonkursu: 'ÚPADEK' };
    const past: IsirRecord = { ic: '2', druhStavKonkursu: 'PRAVOMOCNA' };
    const { activeSet } = assessClearance([active, past]);
    expect(activeSet.has(active)).toBe(true);
    expect(activeSet.has(past)).toBe(false);
  });
});

// ─── stavKodFrom ─────────────────────────────────────────────────────────────

describe('stavKodFrom', () => {
  it('returns null for null input', () => {
    expect(stavKodFrom(null)).toBeNull();
  });

  it('returns null when stavZdrojeRos is NEEXISTUJICI', () => {
    expect(stavKodFrom({ seznamRegistraci: { stavZdrojeRos: 'NEEXISTUJICI' } })).toBeNull();
  });

  it('returns null when no registry field is present', () => {
    expect(stavKodFrom({ seznamRegistraci: {} })).toBeNull();
  });

  it('returns stavZdrojeRos value when present and not NEEXISTUJICI', () => {
    expect(stavKodFrom({ seznamRegistraci: { stavZdrojeRos: 'AKTIVNI' } })).toBe('AKTIVNI');
  });

  it('falls back to stavZdrojeVr when stavZdrojeRos is absent', () => {
    expect(stavKodFrom({ seznamRegistraci: { stavZdrojeVr: 'ZANIKLY' } })).toBe('ZANIKLY');
  });

  it('falls back to stavZdrojeRes when others are absent', () => {
    expect(stavKodFrom({ seznamRegistraci: { stavZdrojeRes: 'AKTIVNI' } })).toBe('AKTIVNI');
  });
});

// ─── stavNazevFrom ───────────────────────────────────────────────────────────

describe('stavNazevFrom', () => {
  it('returns null for null input', () => {
    expect(stavNazevFrom(null)).toBeNull();
  });

  it('returns Aktivní for AKTIVNI', () => {
    expect(stavNazevFrom('AKTIVNI')).toBe('Aktivní');
  });

  it('returns Zaniklý for ZANIKLY', () => {
    expect(stavNazevFrom('ZANIKLY')).toBe('Zaniklý');
  });

  it('returns Zaniklý for ZANIKLÝ (with diacritic)', () => {
    expect(stavNazevFrom('ZANIKLÝ')).toBe('Zaniklý');
  });

  it('returns the code itself for unknown status', () => {
    expect(stavNazevFrom('NEZNAMY')).toBe('NEZNAMY');
  });
});

// ─── parseIsirResponse ───────────────────────────────────────────────────────

const WS2_XML = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body>
    <ns2:getIsirWsCuzkDataResponse xmlns:ns2="http://isirws.cca.cz/types/">
      <stav><ns2:kodChyby>WS2</ns2:kodChyby></stav>
    </ns2:getIsirWsCuzkDataResponse>
  </soapenv:Body>
</soapenv:Envelope>`;

const ONE_ACTIVE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body>
    <ns2:getIsirWsCuzkDataResponse xmlns:ns2="http://isirws.cca.cz/types/">
      <stav><ns2:kodChyby>WS0</ns2:kodChyby></stav>
      <data>
        <ic>12345678</ic>
        <cisloSenatu>1</cisloSenatu>
        <druhVec>INS</druhVec>
        <bcVec>100</bcVec>
        <rocnik>2023</rocnik>
        <druhStavKonkursu>ÚPADEK</druhStavKonkursu>
        <dalsiDluznikVRizeni>N</dalsiDluznikVRizeni>
        <urlDetailRizeni>https://isir.justice.cz/isir/ueu/rizeni.do?id=123</urlDetailRizeni>
      </data>
    </ns2:getIsirWsCuzkDataResponse>
  </soapenv:Body>
</soapenv:Envelope>`;

describe('parseIsirResponse', () => {
  it('returns empty array for WS2 error code', () => {
    expect(parseIsirResponse(WS2_XML)).toEqual([]);
  });

  it('parses a single active record correctly', () => {
    const records = parseIsirResponse(ONE_ACTIVE_XML);
    expect(records).toHaveLength(1);
    expect(records[0].ic).toBe('12345678');
    expect(records[0].druhStavKonkursu).toBe('ÚPADEK');
    expect(records[0].dalsiDluznikVRizeni).toBe('N');
    expect(records[0].urlDetailRizeni).toContain('isir.justice.cz');
  });
});

// ─── parseDphResponse ────────────────────────────────────────────────────────

const DPH_ANO_XML = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body>
    <ns1:StatusNespolehlivyPlatceResponse xmlns:ns1="http://adis.mfcr.cz/rozhraniCRPDPH/">
      <status statusCode="0"/>
      <statusPlatceDPH nespolehlivyPlatce="ANO" datumZverejneniNespolehlivosti="2022-06-01">
        <zverejneneUcty>
          <ucet>
            <standardniUcet predcisli="000" cislo="1234567890" kodBanky="0800"/>
          </ucet>
        </zverejneneUcty>
      </statusPlatceDPH>
    </ns1:StatusNespolehlivyPlatceResponse>
  </soapenv:Body>
</soapenv:Envelope>`;

const DPH_NE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body>
    <ns1:StatusNespolehlivyPlatceResponse xmlns:ns1="http://adis.mfcr.cz/rozhraniCRPDPH/">
      <status statusCode="0"/>
      <statusPlatceDPH nespolehlivyPlatce="NE"/>
    </ns1:StatusNespolehlivyPlatceResponse>
  </soapenv:Body>
</soapenv:Envelope>`;

const DPH_NENALEZEN_XML = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body>
    <ns1:StatusNespolehlivyPlatceResponse xmlns:ns1="http://adis.mfcr.cz/rozhraniCRPDPH/">
      <status statusCode="0"/>
      <statusPlatceDPH nespolehlivyPlatce="NENALEZEN"/>
    </ns1:StatusNespolehlivyPlatceResponse>
  </soapenv:Body>
</soapenv:Envelope>`;

const DPH_FAULT_XML = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body>
    <ns1:StatusNespolehlivyPlatceResponse xmlns:ns1="http://adis.mfcr.cz/rozhraniCRPDPH/">
      <status statusCode="1" statusText="Service unavailable"/>
    </ns1:StatusNespolehlivyPlatceResponse>
  </soapenv:Body>
</soapenv:Envelope>`;

const DPH_NO_PLATCE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body>
    <ns1:StatusNespolehlivyPlatceResponse xmlns:ns1="http://adis.mfcr.cz/rozhraniCRPDPH/">
      <status statusCode="0"/>
    </ns1:StatusNespolehlivyPlatceResponse>
  </soapenv:Body>
</soapenv:Envelope>`;

describe('parseDphResponse', () => {
  it('returns nespolehlivy=true and date for ANO response', () => {
    const result = parseDphResponse(DPH_ANO_XML);
    expect(result.isPlatce).toBe(true);
    expect(result.nespolehlivy).toBe(true);
    expect(result.datumNespolehlivosti).toBe('2022-06-01');
    expect(result.nedostupne).toBe(false);
  });

  it('parses bank account number from standardniUcet', () => {
    const result = parseDphResponse(DPH_ANO_XML);
    expect(result.ucty).toHaveLength(1);
    expect(result.ucty[0]).toMatch(/1234567890\/0800/);
  });

  it('returns nespolehlivy=false for NE response', () => {
    const result = parseDphResponse(DPH_NE_XML);
    expect(result.isPlatce).toBe(true);
    expect(result.nespolehlivy).toBe(false);
    expect(result.nedostupne).toBe(false);
  });

  it('returns isPlatce=false for NENALEZEN', () => {
    const result = parseDphResponse(DPH_NENALEZEN_XML);
    expect(result.isPlatce).toBe(false);
    expect(result.nespolehlivy).toBeNull();
    expect(result.nedostupne).toBe(false);
  });

  it('returns nedostupne=true for SOAP fault (statusCode != 0)', () => {
    const result = parseDphResponse(DPH_FAULT_XML);
    expect(result.nedostupne).toBe(true);
    expect(result.isPlatce).toBe(false);
  });

  it('returns isPlatce=false when no statusPlatceDPH element', () => {
    const result = parseDphResponse(DPH_NO_PLATCE_XML);
    expect(result.isPlatce).toBe(false);
    expect(result.nespolehlivy).toBeNull();
    expect(result.nedostupne).toBe(false);
  });
});
