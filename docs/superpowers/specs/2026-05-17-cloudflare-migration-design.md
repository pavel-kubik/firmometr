# Cloudflare Pages Migration Design

**Date:** 2026-05-17  
**Status:** Approved

## Overview

Migrate the firmometr app from Netlify (hosting + serverless functions) to Cloudflare Pages (hosting + Pages Functions). Trigger: Netlify account credit usage exceeded. Deployment strategy: Cloudflare Git integration — Cloudflare builds and deploys directly from GitHub on every push to `main`, replacing the current GitHub Actions workflow.

## Project Structure

### Before
```
netlify/functions/_cap.mts         shared rate-limit helper
netlify/functions/cap-reset.mts    /api/v1/cap-reset
netlify/functions/search-ico.mts   /api/v1/search/ico/:ico
netlify/functions/search-name.mts  /api/v1/search
netlify.toml
.github/workflows/deploy.yml
```

### After
```
functions/
  _shared/_cap.ts                  shared rate-limit helper
  api/v1/
    cap-reset.ts                   /api/v1/cap-reset
    search.ts                      /api/v1/search
    search/ico/[ico].ts            /api/v1/search/ico/:ico (dynamic route)
public/_redirects                  SPA fallback: /* /index.html 200
```

## Function Code Changes

All business logic (ARES, ISIR, DPH, ČÚZK, OR Portal fetching, XML parsing, rate limiting) is **unchanged** — it already uses standard Web APIs compatible with Cloudflare Workers.

Three mechanical changes per function:

1. Remove `import type { Config, Context } from "@netlify/functions"` and `export const config`
2. Change export signature from Netlify to Cloudflare Pages format
3. Update `_cap` import path (varies by depth):
   - `search.ts`, `cap-reset.ts`: `./_cap.mjs` → `../../_shared/_cap`
   - `search/ico/[ico].ts`: `./_cap.mjs` → `../../../../_shared/_cap`

### Export format change

```ts
// BEFORE (Netlify)
export default async (req: Request) => { ... };
export const config: Config = { path: "/api/v1/search" };

// AFTER (Cloudflare Pages)
export const onRequest: PagesFunction = async ({ request }) => { ... };
```

### Dynamic route params (search-ico only)

```ts
// BEFORE
export default async (req: Request, context: Context) => {
  const ico = context.params['ico'];
  ...
};

// AFTER
export const onRequest: PagesFunction<{}, "ico"> = async ({ request, params }) => {
  const ico = params.ico;
  ...
};
```

## SPA Routing

Add `public/_redirects` with content:
```
/* /index.html 200
```

Angular 18 copies everything from `public/` to `dist/firmometr-ui/browser` during build, so Cloudflare Pages picks this up automatically. This replaces the `[[redirects]]` block in `netlify.toml`.

## CI/CD

`.github/workflows/deploy.yml` is deleted. Cloudflare Pages handles build and deploy automatically via Git integration.

**Cloudflare dashboard settings (configured once):**

| Setting | Value |
|---|---|
| Framework preset | None |
| Build command | `npm ci && npm run build` |
| Build output directory | `dist/firmometr-ui/browser` |
| Node.js version | 20 |

## package.json Changes

- **Remove** `@netlify/functions` from devDependencies
- **Add** `@cloudflare/workers-types` to devDependencies
- **Update** script: `"test:functions": "vitest run netlify"` → `"vitest run functions"`

## tsconfig.json Changes

Add `@cloudflare/workers-types` to `compilerOptions.types` so `PagesFunction` is available globally.

## Deletions

- `netlify/` directory (entire)
- `netlify.toml`
- `.github/workflows/deploy.yml`

## Out of Scope

- Custom domain configuration (can be done in Cloudflare dashboard post-migration)
- Environment variables / secrets (currently none in use)
- Changing the Angular app code
