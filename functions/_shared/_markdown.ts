// ── Markdown generators for content negotiation (Accept: text/markdown) ─────

export function homepageMarkdown(lang: 'cs' | 'en'): string {
  if (lang === 'en') return HOMEPAGE_EN;
  return HOMEPAGE_CS;
}

export function companyMarkdown(d: any): string {
  const lines: string[] = [];
  const name = d.obchodniFirma ?? `IČO ${d.ico}`;

  lines.push(`# ${name}`);
  lines.push('');

  // ── Basic registration data ───────────────────────────────────────────────
  lines.push('## Základní údaje');
  lines.push(`- **IČO:** ${d.ico}`);
  if (d.dic) lines.push(`- **DIČ:** ${d.dic}`);
  if (d.pravniForma) lines.push(`- **Právní forma:** ${d.pravniForma}`);
  const address = d.sidloEnriched ?? d.sidloText;
  if (address) lines.push(`- **Sídlo:** ${address}`);
  if (d.datumVzniku) lines.push(`- **Datum vzniku:** ${formatDate(d.datumVzniku)}`);
  if (d.stavNazev) lines.push(`- **Stav:** ${d.stavNazev}`);
  lines.push('');

  // ── Insolvency (ISIR) ─────────────────────────────────────────────────────
  lines.push('## Insolvence (ISIR)');
  const clarityLabel: Record<string, string> = {
    clear: 'Bez záznamu',
    past_debtor: 'Historické řízení',
    active_proceedings: 'Aktivní insolvenční řízení',
  };
  const clarity = d.isir?.clarity ?? 'unknown';
  lines.push(`**Stav:** ${clarityLabel[clarity] ?? clarity}`);

  const proceedings: any[] = d.isir?.proceedings ?? [];
  if (proceedings.length > 0) {
    lines.push('');
    for (const p of proceedings) {
      const active = p.isActive ? 'aktivní' : 'ukončené';
      lines.push(`- **${p.senZnacka ?? '?'}** — ${p.stavKonkursu ?? ''} (${active})`);
      if (p.datumZahajeni) lines.push(`  Zahájeno: ${p.datumZahajeni}`);
      if (p.urlDetail) lines.push(`  Detail: ${p.urlDetail}`);
    }
  }
  lines.push('');

  // ── VAT reliability (DPH) ─────────────────────────────────────────────────
  lines.push('## Spolehlivost plátce DPH');
  const dphLabel: Record<string, string> = {
    reliable: 'Spolehlivý plátce',
    unreliable: 'NESPOLEHLIVÝ PLÁTCE',
    not_registered: 'Není plátce DPH',
    unavailable: 'Nedostupné',
  };
  const dphStatus = d.dph?.status ?? 'unavailable';
  lines.push(`**Stav:** ${dphLabel[dphStatus] ?? dphStatus}`);
  lines.push('');

  // ── Commercial register (OR) ──────────────────────────────────────────────
  if (d.or) {
    lines.push('## Obchodní rejstřík');
    if (d.or.spisovatel) lines.push(`Spisová značka: ${d.or.spisovatel}`);
    if (d.or.orUrl) lines.push(`[Záznam v OR](${d.or.orUrl})`);

    const currentOfficers = (d.or.statutari ?? []).filter((s: any) => !s.datumZaniku);
    if (currentOfficers.length > 0) {
      lines.push('');
      lines.push('### Statutární orgány');
      for (const s of currentOfficers) {
        lines.push(`- **${s.jmeno ?? '?'}**${s.funkce ? ` — ${s.funkce}` : ''}`);
        if (s.datumVzniku) lines.push(`  Ve funkci od: ${formatDate(s.datumVzniku)}`);
      }
    }

    if (d.or.sbirkaListinCelkem > 0) {
      lines.push('');
      lines.push(`### Sbírka listin (celkem ${d.or.sbirkaListinCelkem})`);
      for (const l of (d.or.sbirkaListin ?? []).slice(0, 5)) {
        const date = l.datumVzniku ? ` (${l.datumVzniku})` : '';
        lines.push(`- ${l.typListiny}${date}`);
      }
    }

    lines.push('');
  }

  lines.push('---');
  lines.push(`Zdroj: [Firmometr](https://firmometr.cz/search/${d.ico})`);

  return lines.join('\n');
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('cs-CZ');
  } catch {
    return iso;
  }
}

// ── Static homepage content ───────────────────────────────────────────────────

const HOMEPAGE_CS = `# Firmometr

Český nástroj pro okamžitou kontrolu firem z veřejných rejstříků.

## Co umí

- **Insolvenční rejstřík (ISIR):** stav řízení, čísla jednací, datuma zahájení
- **Spolehlivost plátce DPH:** databáze Ministerstva financí v reálném čase
- **ARES + Obchodní rejstřík:** IČO, DIČ, sídlo, právní forma, datum vzniku, statutáři, sbírka listin
- **Hlídač firem:** sledujte změny stavu a dostávejte e-mailová upozornění

## API

Veřejné endpointy nevyžadují autentizaci (limit 20 dotazů / 5 minut).

\`\`\`
# Vyhledání firmy podle názvu
GET https://firmometr.cz/api/v1/search?q=Skanska

# Detail firmy podle IČO
GET https://firmometr.cz/api/v1/search/ico/27082440
\`\`\`

Úplná dokumentace: https://firmometr.cz/openapi.json
Autentizace (pro neomezený přístup): https://firmometr.cz/auth.md

## Ceny

| Plán | Cena | Obsah |
|---|---|---|
| Free | zdarma | 5 vyhledávání / session, semafor ISIR + DPH |
| Solo | 349 Kč/měsíc | 50 sledovaných firem, e-mailová upozornění |
| Enterprise | individuálně | neomezený přístup |

## Klíčové stránky

- https://firmometr.cz — hlavní stránka a vyhledávání
- https://firmometr.cz/ceny — přehled plánů
- https://firmometr.cz/search/{ico} — profil firmy (veřejný)
- https://firmometr.cz/llms.txt — strojově čitelné shrnutí
- https://firmometr.cz/openapi.json — OpenAPI specifikace
`;

const HOMEPAGE_EN = `# Firmometr

Instant Czech company intelligence from public registries.

## What it does

- **Insolvency register (ISIR):** proceeding status, case numbers, start dates
- **VAT reliability:** Ministry of Finance database in real time
- **ARES + Commercial register:** IČO, VAT ID, address, legal form, founding date, directors, deeds
- **Company watchlist:** monitor status changes and receive email alerts

## API

Public endpoints require no authentication (rate limit: 20 requests / 5 minutes).

\`\`\`
# Search companies by name
GET https://firmometr.cz/api/v1/search?q=Skanska

# Get company details by IČO (business ID)
GET https://firmometr.cz/api/v1/search/ico/27082440
\`\`\`

Full API docs: https://firmometr.cz/openapi.json
Authentication (for unlimited access): https://firmometr.cz/auth.md

## Pricing

| Plan | Price | Includes |
|---|---|---|
| Free | free | 5 searches / session, ISIR + DPH traffic light |
| Solo | 349 CZK/month | 50 watched companies, email alerts |
| Enterprise | custom | unlimited access |

## Key pages

- https://firmometr.cz — homepage and live search
- https://firmometr.cz/ceny — pricing
- https://firmometr.cz/search/{ico} — company profile (public)
- https://firmometr.cz/llms.txt — machine-readable summary
- https://firmometr.cz/openapi.json — OpenAPI specification
`;
