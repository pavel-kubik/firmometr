# External API Integration Notes

Critical findings about each upstream API used by `search-ico.mts`.

---

## ARES REST

**Endpoint:** `GET https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/{ico}`

- Returns a flat object; company status is buried under `seznamRegistraci.stavZdrojeVr`
  (fallbacks: `stavZdrojeRos`, `stavZdrojeRes`) — **not** a top-level `stav` field.
- `pravniForma` is a numeric code string (e.g. `"112"` = s.r.o.), not a human label.
- `sidlo.textovaAdresa` is the raw address string, fed into ČÚZK for enrichment.
- Returns HTTP 404 for unknown IČO → treat as `null`.

---

## ARES VR (Veřejný rejstřík)

**Endpoint:** `GET https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty-vr/{ico}`

- `zaznamy[].spisovaZnacka` is an **array of objects** `[{soud, oddil, vlozka}]`, not a plain
  string. Construct the file reference as `"${oddil} ${vlozka}"` (e.g. `"C 294429"`).
- Statutory officers are **nested two levels deep**:
  `statutarniOrgany[organ].clenoveOrganu[member]` — NOT a flat member array.
- The member's role is at `clenstvi.funkce.nazev`; appointment date at
  `clenstvi.funkce.vznikFunkce`. There is **no top-level `funkce[]`** array on the member.
- The API only returns current (active) members; no `datumVymazu` filtering needed.

---

## ISIR SOAP

**Endpoint:** `POST https://isir.justice.cz:8443/isir_cuzk_ws/IsirWsCuzkService`

- `kodChyby = "WS2"` → subject not found, return empty array → clarity `CLEAR`.
- `datumPmUkonceniUpadku` set → proceeding is closed (inactive).
- `druhStavKonkursu = "PRAVOMOCNA"` | `"MYLNÝ ZÁP."` | `"ODSKRTNUTA"` → inactive even
  without an end date.
- `dalsiDluznikVRizeni = "T"` → co-debtor (SNM/společné jmění manželů), not primary debtor;
  maps to `ACTIVE_CO_DEBTOR` rather than `ACTIVE_DEBTOR`.

---

## DPH SOAP (Nespolehlivý plátce)

**Endpoint:** `POST https://adisrws.mfcr.cz/dpr/axis2/services/rozhraniCRPDPH.rozhraniCRPDPHSOAP`

- The `statusPlatceDPH` element is **always present**, even for non-payers.
  Do not treat its presence alone as `isPlatce: true`.
- `nespolehlivyPlatce` attribute values:
  - `"ANO"` — unreliable VAT payer
  - `"NE"` — reliable VAT payer
  - `"NENALEZEN"` — DIC not found; entity is **not a VAT payer at all**
- **Check `NENALEZEN` first** before reading other attributes.
- Standard accounts: formatted as `${predcisli ? predcisli+"-" : ""}${cislo}/${kodBanky}`.
- Non-standard accounts (`nestandardniUcet`): the `@_cislo` attribute holds a full IBAN string,
  no `kodBanky` involved.

**Confirmed test cases (live API, 2026-05-14):**

| IČO | DIC | nespolehlivyPlatce | notes |
|-----|-----|--------------------|-------|
| 07102127 | CZ07102127 | `NENALEZEN` | Butterfly Flowers s.r.o. — not a VAT payer |
| 04677285 | CZ04677285 | `ANO` | J&L Industries s.r.o. — unreliable, published 2026-05-12 |
| 45795908 | CZ45795908 | `NE` | České aerolinie a.s. — reliable payer |

---

## ČÚZK RUIAN

**Endpoint:** `GET https://ags.cuzk.gov.cz/arcgis/rest/services/RUIAN/…/FindAddress?SearchText={addr}&f=json`

- Returns `{candidates: [{address: "…", …}]}`. Use `candidates[0].address`.
- Empty `candidates` array is normal for rural or non-standard addresses; treat as `null`.

---

## OR Portal — HTML scraping

No public JSON API exists. Both calls scrape HTML pages.

### Subject ID lookup

**URL:** `https://or.justice.cz/ias/ui/rejstrik-$firma?ico={ico}`

- `$firma` is a **literal part of the URL path**, not a shell variable.
- Extract `subjektId` via regex `/subjektId=(\d+)/` on first match in the HTML.

### Sbírka listin (document list)

**URL:** `https://or.justice.cz/ias/ui/vypis-sl-firma?subjektId={id}`

- HTML table; extract `<td>` text per row. Column order:
  `[číslo listiny, typListiny, datumVzniku, datumDoslo, datumZalozeni, stranky]`
- `typListiny` cells may contain `\r\n` and indented sub-notes — collapse whitespace
  with `/\s+/g → " "` before storing.
- Total document count: match `z \d+ záznamů` or `Celkem: \d+` in the page.
- PDFs download directly (no auth) via `https://or.justice.cz/ias/content/download?id={hash}`.
