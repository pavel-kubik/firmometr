# Lustrare — Netlify edition

Czech business verification tool that aggregates data from public registries, deployed as a fully serverless stack on Netlify. No database, no server to maintain.

- **ARES** — company details, legal form, registered address, status
- **ISIR** — insolvency proceedings (Insolvenční rejstřík)
- **ČÚZK** — address enrichment via RUIAN

## Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 18 + Angular Material |
| Backend | Netlify Functions (Node.js 18+) |
| Persistence | Browser localStorage (watch list only) |

## Running locally

### Prerequisites

- Node.js 20+
- [Netlify CLI](https://docs.netlify.com/cli/get-started/) — `npm install -g netlify-cli`

### Start

```bash
# Install dependencies
npm install
cd frontend && npm install && cd ..

# Start Netlify Dev (functions + Angular on port 8888)
netlify dev
```

Open [http://localhost:8888](http://localhost:8888).

Netlify Dev runs Angular on port 4200 internally and proxies everything through 8888, routing `/api/*` to the functions automatically.

## Deploying to Netlify

Connect this repo in the Netlify dashboard. The `netlify.toml` handles everything — no additional configuration needed.

Build settings (already in `netlify.toml`):

| Setting | Value |
|---|---|
| Build command | `cd frontend && npm ci && npm run build` |
| Publish directory | `frontend/dist/lustrare-ui/browser` |
| Functions directory | `netlify/functions` |

## Features

- **Search by IČO** — instant company detail: ARES data, ISIR insolvency status, ČÚZK-enriched address
- **Search by name** — paginated full-text search via ARES
- **Watch list** — save companies to a local dashboard; stored in localStorage, persists across sessions in the same browser

## Architecture

Every search request is a direct chain: browser → Netlify Function → external API. There is no database and no background sync.

```
Browser
  ├── GET /api/v1/search/ico/:ico  →  search-ico function
  │     ├── ARES REST   (company details)
  │     ├── ISIR SOAP   (insolvency records)
  │     └── ČÚZK REST   (address enrichment)
  └── GET /api/v1/search?q=        →  search-name function
        └── ARES REST   (name search)

Watch list → localStorage (no backend)
```

## Test cases

| Feature | Firma | IČO | Expected |
|---|---|---|---|
| ISIR active debtor | — | — | — |
| DPH — nespolehlivý plátce | — | — | — |
| DPH — není plátce DPH | Butterfly Flowers s.r.o. | 07102127 | Není plátce DPH |
| OR — statutáři | — | — | — |

## External API references

| API | Docs |
|---|---|
| ARES | https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/swagger-ui |
| ISIR WS2 | https://isir.justice.cz/isir/help/Popis_WS_2_v1_13.pdf |
| ČÚZK RUIAN | https://ags.cuzk.gov.cz/arcgis/rest/services/RUIAN |
| VAT | https://adisspr.mfcr.cz/pmd/dokumentace/webove-sluzby-spolehlivost-platcu |
