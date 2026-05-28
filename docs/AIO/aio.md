# Agent Readiness — firmometr.cz

Scanned 2026-05-28 via Cloudflare "Is Your Site Agent-Ready?"
**Score: 29/100 — Level 2 "Bot-Aware"**

The site has solid bot-access foundations (robots.txt, sitemap, AI bot rules, content signals) but exposes nothing useful to AI agents — no API catalog, no machine-readable auth, no MCP endpoint, no markdown negotiation.

---

## TODO

### Quick wins (static files, no logic changes)

- [x] **API Catalog** — serve `/.well-known/api-catalog` as `application/linkset+json` listing the `/api/v1` endpoints with `service-desc` (OpenAPI) and `service-doc` links (RFC 9727)
- [x] **OpenAPI spec** — publish `/openapi.json` describing the public search API (needed by API Catalog and MCP)
- [x] **Link header** — add `Link: </.well-known/api-catalog>; rel="api-catalog"` to homepage response headers (Cloudflare Pages `_headers` file)
- [x] **Auth.md** — serve `/auth.md` describing how agents can register/authenticate (WorkOS auth.md spec)
- [x] **OAuth Protected Resource** — serve `/.well-known/oauth-protected-resource` pointing to Supabase as the auth server (RFC 9728)

### Medium effort

- [x] **Markdown Negotiation** — in `_middleware.ts`, detect `Accept: text/markdown` and return a stripped markdown version of key pages (homepage, company detail); respond with `Content-Type: text/markdown`
- [ ] **MCP Server Card** — serve `/.well-known/mcp/server-card.json` describing server name, version, transport, and capabilities (SEP-1649); implement an actual MCP endpoint exposing company lookup and watchlist tools
- [ ] **Agent Skills index** — serve `/.well-known/agent-skills/index.json` listing skills (company search, ICO lookup, watchlist) per the Agent Skills Discovery RFC v0.2.0

### Lower priority / exploratory

- [ ] **DNS-AID records** — publish `_index._agents.firmometr.cz` SVCB/HTTPS DNS records for DNS-based agent discovery (requires Cloudflare DNS config)
- [x] **WebMCP** — call `navigator.modelContext.provideContext()` in the Angular app to expose company search as an in-browser tool for agents
- [ ] **OAuth/OIDC discovery** — if API access is ever gated, publish `/.well-known/openid-configuration` delegating to Supabase Auth issuer

---

## Implementation notes

- Static well-known files can be served from `public/.well-known/` — Cloudflare Pages serves `public/` as the static root alongside `dist/`.
- `_headers` file controls response headers for static routes.
- Markdown negotiation belongs in `functions/_middleware.ts` or a dedicated route.
- Supabase project URL is the OIDC issuer (`https://<project>.supabase.co/auth/v1`).
