# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Branches & Deployment

- `main` — protected; deploys to [firmometr.cz](https://firmometr.cz)
- `develop` — all new development goes here; previewed at [dev.firmometr.cz](https://dev.firmometr.cz)

## Commands

```bash
# Development
npm start              # Angular dev server on port 4201
npm run dev:cf         # Wrangler Pages dev on port 8889 (routes /api/* to functions)

# Build
npm run build          # Production build to dist/firmometr-ui/browser

# Testing
npm test               # Karma/Jasmine Angular component tests (watch mode)
npm run test:angular   # Angular tests (single run)
npm run test:unit      # Vitest unit tests (functions + workers, 80% coverage threshold)
npm run test:functions # Vitest for functions/ only
npm run test:workers   # Vitest for workers/monitor/ only
npm run test:e2e       # Playwright E2E tests (requires running server)
npm run test:all       # unit + E2E
```

Single Vitest test: `npx vitest run functions/api/v1/search/ico/[ico].test.ts`

## Architecture

**Firmometr** is a Czech business registry search and monitoring tool. The stack:

- **Frontend**: Angular 18 + Angular Material, built to `dist/firmometr-ui/browser`
- **API backend**: Cloudflare Pages Functions (`functions/api/v1/`) — serverless handlers deployed alongside the Angular app
- **Monitor worker**: Cloudflare Worker (`workers/monitor/`) — hourly cron job that checks watched companies and emails changes
- **Auth + watchlist**: Supabase (frontend SDK + service role on backend)

### Data flow

```
Angular SPA  →  /api/v1/search/ico/:ico  →  ARES / ISIR / ČÚZK external APIs
             →  /api/v1/search?q=        →  ARES name search
             →  Supabase                 →  auth, watchlist CRUD

Cloudflare Worker (cron, hourly):
  Supabase watchlist  →  ARES/ISIR fetch  →  diff  →  Brevo email
```

### Backend internals (`functions/`)

- `_shared/_cache.ts` — KV-backed response cache for registry API calls
- `_shared/_cap.ts` — rate limiter
- `_shared/_analytics.ts` — anonymous usage tracking
- `_middleware.ts` — request routing and CORS
- Each API route (`functions/api/v1/`) is a self-contained Cloudflare Pages Function

### Monitor worker (`workers/monitor/`)

`registry.ts` fetches company state, `diff.ts` detects changes, `notify.ts` + `email-template.ts` generate and send email alerts.

### Environment

- Secrets for local dev: `.dev.vars` (Supabase service key, Brevo API key)
- `scripts/set-env.js` runs at `prebuild` to inject build timestamp and branch name into Angular environments
- Cloudflare KV namespaces and D1 bindings declared in `wrangler.toml`

### Testing layout

- Angular components: `src/**/*.spec.ts` (Karma/Jasmine)
- Functions/workers logic: `**/*.test.ts` (Vitest)
- E2E: `e2e/*.spec.ts` (Playwright, Chromium only)
