# Firmometr

Czech business verification tool that aggregates data from public registries, deployed as a fully serverless stack on Cloudflare Pages.

- **ARES** — company details, legal form, registered address, status
- **ISIR** — insolvency proceedings (Insolvenční rejstřík)
- **ČÚZK** — address enrichment via RUIAN
- **DPH** — VAT payer reliability check

## Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 18 + Angular Material |
| Backend | Cloudflare Pages Functions (Node.js-compatible) |
| Persistence | Supabase (watch list, auth) |

## Running locally

### Prerequisites

- Node.js 26
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) — `npm install -g wrangler`

### Start

```bash
# Install dependencies
npm install

# Terminal 1 — Angular dev server on port 4201
npm start

# Terminal 2 — Wrangler Pages dev (proxies Angular, routes /api/* to functions)
npm run dev:cf
```

Open [http://localhost:8788](http://localhost:8788).

`dev:cf` runs `wrangler pages dev --proxy 4201`, which proxies the Angular dev server and routes all `/api/*` requests to the `functions/` directory automatically.

### Supabase setup

Supabase is used only on the frontend (auth + watch list). The anon key is safe to commit.

Update `src/environments/environment.ts` and `src/environments/environment.production.ts` with your project credentials:

```ts
export const environment = {
  supabaseUrl: 'https://<ref>.supabase.co',
  supabaseAnonKey: '<anon-key>',
};
```

Find these values in Supabase → Project Settings → API.

In Supabase → Authentication → URL Configuration, add Redirect URLs:
- `http://localhost:8788` (local dev)
- your production domain

## Deploying to Cloudflare Pages

Connect this repo in the [Cloudflare Pages dashboard](https://dash.cloudflare.com/). Build settings:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Build output directory | `dist/firmometr-ui/browser` |
| Functions directory | `functions/` (auto-detected) |

Set environment variables in the Cloudflare dashboard under Pages → Settings → Environment variables.

## Architecture

```
Browser
  ├── GET /api/v1/search/ico/:ico  →  functions/api/v1/search/ico/[ico].ts
  │     ├── ARES REST   (company details)
  │     ├── ISIR SOAP   (insolvency records)
  │     └── ČÚZK REST   (address enrichment)
  └── GET /api/v1/search?q=        →  functions/api/v1/search/index.ts
        └── ARES REST   (name search)

Watch list → Supabase (requires login)
```

## Test cases

| Feature | Firma | IČO | Expected |
|---|---|---|---|
| ISIR active debtor | — | — | — |
| DPH — nespolehlivý plátce | — | — | — |
| DPH — není plátce DPH | Butterfly Flowers s.r.o. | 07102127 | Není plátce DPH |
| OR — statutáři | — | — | — |

## External API references

| API | Docs | Swagger |
|---|---|---|
| ARES | https://ares.gov.cz/stranky/vyvojar-info | https://ares.gov.cz/swagger-ui/ |
| ISIR WS2 | https://isir.justice.cz/isir/help/Popis_WS_2_v1_13.pdf | |
| ČÚZK RUIAN | https://ags.cuzk.gov.cz/arcgis/rest/services/RUIAN | |
| VAT | https://adisspr.mfcr.cz/pmd/dokumentace/webove-sluzby-spolehlivost-platcu | |

## External tools

### Cloudflare

https://dash.cloudflare.com — Cloudflare account

#### Cloudflare Pages logs — see if Brevo returned an error:

Cloudflare Dashboard → Pages → firmometr → your deployment → Functions → View logs

#### Manual test wrangler functions locally

```bash
npx wrangler dev --test-scheduled --var DRY_RUN:1
```

and in second command line

```bash
curl "http://localhost:8787/__scheduled?cron=0+*+*+*+*"
```

### Supabase

https://supabase.com — GitHub account

Run migration

```cmd
supabase init
supabase login
supabase link --project-ref lentsvnmpqmrscgfscnc
supabase db push
```

### Brevo

https://brevo.com

#### Brevo email logs — see if the email was received and what happened to it:

Brevo → Transactional → Email → Log

## Testing the monitor worker locally

The monitor worker runs hourly on Cloudflare, checks watchlist entries for changes, and emails affected users. Two env vars control dev-safe testing:

| Var | Effect |
|---|---|
| `TEST_EMAIL` | Redirects all outgoing emails to this address instead of real users |
| `DRY_RUN` | Skips DB state updates and email sends entirely — only logs what would happen |

### Dry run (no emails, no state changes)

```bash
cd workers/monitor
npx wrangler dev --var DRY_RUN:true
```

Then trigger the cron via the Wrangler dev UI at `http://localhost:8787/__scheduled`.

### Redirect emails to yourself

```bash
cd workers/monitor
npx wrangler dev --var TEST_EMAIL:you@example.com
```

All emails go to `you@example.com`. State is updated normally (use against a dev Supabase project to avoid touching production).

### Both together

```bash
npx wrangler dev --var DRY_RUN:true --var TEST_EMAIL:you@example.com
```

### LLMS.txt

Added for LLM to serve the webpages

https://firmometr.cz/llms-logs?secret=g25sgyd1ugwuagdadjcwi
