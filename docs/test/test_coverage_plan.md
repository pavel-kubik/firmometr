Ready for review
Select text to add comments on the plan
Firmometr Test Strategy
Context
Firmometr is a Czech business monitoring SaaS. Users search companies by name/IČO, view risk dashboards (ISIR insolvency, DPH VAT payer status, ARES registration), and watch companies for status changes. The monitor worker runs hourly, fetches fresh status from Czech government APIs, and emails users on changes.

The current test coverage is thin: workers/monitor has decent unit tests; the Angular frontend has almost none; the highest-value backend function ([ico].ts, 570 lines, 5 external APIs) has zero tests; and _cap.ts (rate limiting, called on every search) has zero tests.

Goal: add a layered strategy covering all main user stories with local-first tooling.

Tech Stack Summary
Layer	Tool
Frontend	Angular 18.2 + Angular Material + Transloco
Backend	Cloudflare Pages Functions (TypeScript)
Worker	Cloudflare Worker (hourly cron)
DB / Auth	Supabase (PostgreSQL + GoTrue)
Cache	Cloudflare KV
Email (transactional)	Brevo API
Email (notifications)	Cloudflare Email Binding
External APIs	ARES (REST/JSON), ISIR (SOAP/XML), DPH (SOAP/XML), OR (HTML scrape), CUZK (REST/JSON)
Unit/integration tests	Vitest 3 (functions + workers), Karma+Jasmine (Angular)
E2E	Playwright 1.60 (Chromium)
Existing Tests (Baseline)
File	Tool	Coverage
functions/api/v1/contact.test.ts	Vitest	Contact form + Brevo stub
workers/monitor/diff.test.ts	Vitest	Change detection, DB update, email send
workers/monitor/registry.test.ts	Vitest	Registry response mapping
workers/monitor/email-template.test.ts	Vitest	HTML/text email generation
e2e/cap.spec.ts	Playwright	Rate-cap UI + countdown
src/app/app.component.spec.ts	Karma	App root (empty)
Test Architecture
Level 1 — Unit (Vitest for functions/workers; Karma for Angular)
Pure logic, all I/O mocked. Target: < 10 s total.

Level 2 — Integration (Vitest with vi.stubGlobal('fetch', …))
Handler-level tests: invoke exported handlers directly, stub all outbound fetches via URL dispatch pattern. KV mocked as in-memory Map.

Level 3 — E2E (Playwright against wrangler pages dev + ng serve)
Full browser flows. Angular calls /api/v1/** which are intercepted via page.route(). Auth tests use local Supabase CLI (supabase start, inbucket on port 54324 for email confirmation links).

Mocking Strategy
Czech Government APIs (ARES, ISIR, DPH, OR, CUZK)
Vitest: vi.stubGlobal('fetch', urlDispatch) — URL-keyed switch to return canned XML/JSON fixtures. Pattern already established in registry.test.ts. Fixture files go in functions/api/v1/search/ico/__fixtures__/.

vi.stubGlobal('fetch', async (url: string | Request) => {
  const u = typeof url === 'string' ? url : url.url;
  if (u.includes('ares.gov.cz'))     return aresFixture(u);
  if (u.includes('isir.justice.cz')) return isirFixture(u);
  if (u.includes('adisrws.mfcr.cz')) return dphFixture(u);
  if (u.includes('or.justice.cz'))   return orFixture(u);
  if (u.includes('ags.cuzk.gov.cz')) return cuzkFixture(u);
  throw new Error(`Unmocked fetch: ${u}`);
});
E2E: Intercept /api/v1/search/ico/:ico at the browser level with page.route() — no need to stub downstream government APIs for E2E.

Brevo Email API
Vitest unit/integration: Same vi.stubGlobal('fetch', …) pattern as contact.test.ts. Add if (u.includes('api.brevo.com')) return new Response('{"messageId":"…"}', {status:201}).

E2E with Mailpit (integration smoke): Run docker run -p 1025:1025 -p 8025:8025 axllent/mailpit. Add BREVO_API_BASE env var to order.ts and contact.ts (defaults to https://api.brevo.com). Override in test env to http://localhost:1025. This enables asserting actual email content via Mailpit REST API (http://localhost:8025/api/v1/messages).

Cloudflare Email Binding (monitor worker)
Already handled correctly in diff.test.ts: pass SEND_EMAIL: { send: vi.fn() } in env. No local equivalent exists; interface stub is sufficient.

Supabase
Vitest: Shared mock factory in test-utils/supabase-mock.ts (generalized from the ad-hoc mock in diff.test.ts). Returns chainable mock builder with _updateMock, _selectMock, etc.

E2E and Angular integration: supabase start (local CLI). Points to http://localhost:54321. Auth email confirmations via inbucket: GET http://localhost:54324/api/v1/mailbox/ to extract magic links in test setup.

Angular unit tests: Inject MockAuthService / MockWatchService via TestBed.overrideProvider() — never import real Supabase client.

Cloudflare KV
Vitest: in-memory Map mock:

function makeKv(): KVNamespace {
  const store = new Map<string, string>();
  return { get: async k => store.get(k) ?? null, put: async (k,v) => { store.set(k,v); } } as KVNamespace;
}
wrangler pages dev emulates KV for E2E tests.

User Story Coverage
US-1: Unauthenticated Search by Name
Integration (functions/api/v1/search.test.ts):

ARES returns 3 results → fields mapped correctly
ARES 404 → { total: 0, items: [] } status 200
Empty q → no ARES call, empty result
Rate-capped cookie → 429 + Retry-After
Bearer token → cap bypassed
E2E (e2e/search.spec.ts):

Search "Avast" → results table visible
Click row → navigate to /search/:ico
8-digit ICO entered → redirect to detail
Empty search → zero-state shown
US-2: Company Detail Risk Dashboard (most critical)
Unit — extract parsing helpers from [ico].ts into functions/api/v1/search/ico/parsers.ts first, then test:

assessClearance: ACTIVE_DEBTOR, ACTIVE_CO_DEBTOR, PAST_DEBTOR, CLEAR (15+ tests covering druhStavKonkursu values and dalsiDluznikVRizeni flag)
parseDphResponse: ANO/NE/NENALEZEN/SOAP fault
stavKodFrom: NEEXISTUJICI → null, AKTIVNI → "AKTIVNI"
Integration (functions/api/v1/search/ico/ico.integration.test.ts):

Clean ICO (fixture 00000001) → full aggregated JSON shape
Active debtor ICO (fixture 00000002) → isir.clarity = "ACTIVE_DEBTOR"
KV cache hit → external fetch NOT called
E2E (e2e/subject-detail.spec.ts):

Mocked clean company → "Bez insolvencí" green badge
Mocked ACTIVE_DEBTOR → red border, warning visible
Mocked NESPOLEHLIVY → DPH card with warning + date
US-3: Rate Cap
Unit (functions/_shared/_cap.test.ts) — _cap.ts currently has ZERO tests:

No cookie → not blocked, count=1 cookie set
count=19 → not blocked, count=20 set
count=20 → blocked
Expired cookie → count resets, not blocked
Authorization header → always not blocked
withCap status=429 → Retry-After header correct
E2E: Already well covered by cap.spec.ts. No additions needed.

US-4: Auth (Register / Login)
Angular unit (src/app/core/services/auth.service.spec.ts):

signOut → user$ emits null
currentUserTier defaults to 'free'
currentTierLimit: free=3, basic=50, enterprise=Infinity
Angular unit (src/app/core/guards/auth.guard.spec.ts):

No session → UrlTree to /register?returnUrl=…
Valid session → returns true
E2E (e2e/auth.spec.ts) — requires local Supabase:

Register → "check email" shown
Wrong password → error shown
Valid login → redirect to /dashboard
/objednat without auth → redirect to /register
US-5: Watchlist
Angular unit (src/app/core/services/watch.service.spec.ts):

watch() under limit → calls db.upsert(), emits entity
watch() at free limit (3) → throws WatchLimitError
Supabase watch_limit_exceeded → throws WatchLimitError
unwatch(), unwatchByIco() → correct delete queries
isWatchedByIco() → true/false per DB row
Angular unit (subject-detail.component.spec.ts):

toggleWatch() not logged in → navigate to /register
toggleWatch() logged in, unwatched → calls watchService.watch(), flips isWatched
WatchLimitError thrown → snackbar with limit key shown
E2E (e2e/watchlist.spec.ts): add/remove watch, dashboard card, free tier limit tooltip.

US-6: Order Submission
Unit (functions/api/v1/order.test.ts) — currently ZERO tests:

Unauthenticated → 401
Missing telefon → 400 missing_fields
ICO 7 digits → 400 invalid_ico
Valid request → Supabase insert called, Brevo called twice, returns 200
Supabase insert fails → 500 db_error, Brevo not called
First Brevo call fails → still returns 200 (non-fatal)
Annual enterprise pricing: 8 789 Kč in email content
DIČ empty → no DIČ row in email HTML
E2E (e2e/order.spec.ts): auth guard, form submission, success message.

US-7: Contact Form
Unit coverage already good in contact.test.ts. E2E (e2e/contact.spec.ts): fill + submit → success; missing email → validation error.

US-8: Monitor Worker
Unit (workers/monitor/diff.test.ts) — gaps to fill in existing tests:

DRY_RUN=true → SEND_EMAIL.send NOT called, supabase update NOT called
TEST_EMAIL set → email sent to override address
fetchIcoStatus throws → other rows still processed (Promise.allSettled)
Multi-row with mixed changes → only changed rows get email + DB update
dphNespolehlivy false→true → email sent
aresStavKod changes → update includes new value
Fixture ICO Scenarios
Directory: functions/api/v1/search/ico/__fixtures__/

ICO	Profile	Key assertions
00000001	Clean company	clarity=CLEAR, nespolehlivy=false
00000002	Active debtor + unreliable VAT	clarity=ACTIVE_DEBTOR, nespolehlivy=true
00000003	Past debtor, non-VAT payer	clarity=PAST_DEBTOR, isPlatce=false
00000004	Active co-debtor only	clarity=ACTIVE_CO_DEBTOR
00000005	Dissolved, DPH unavailable	stavKod=ZANIKLY, nedostupne=true
00000006	No ARES data	all ARES fields null
Fixture files per registry per ICO: ares-00000001.json, isir-00000002.xml, dph-00000002.xml, or-html-00000001.html.

Angular shared factory: src/app/testing/factories.ts with makeSubjectDetail(overrides).

Known Bugs to Fix During Test Implementation
email-template.ts:46 — hardcoded "ISIR (ACTIVE_DEBTOR)" as the label, regardless of actual isirClarity. The label column should use isirLabel(isirClarity). Add regression test that asserts label column changes per clarity value.

diff.test.ts — stale assertion on pending_notification field (removed in migration 20260524). Replace with expect(mockClient._updateMock).not.toHaveBeenCalled() when nothing changed.

order.ts — Brevo URL hardcoded as 'https://api.brevo.com/v3/smtp/email'. Extract to env.BREVO_API_BASE ?? 'https://api.brevo.com' to enable Mailpit override in local integration tests. Same for contact.ts.

Refactoring Prerequisite
Extract parsers from [ico].ts before writing unit tests for them. Move parseIsirResponse, parseDphResponse, assessClearance, isActive, stavKodFrom into functions/api/v1/search/ico/parsers.ts. The handler imports from there. This unblocks ~20 high-value unit tests.

Test Scripts (additions to package.json)
"test:unit": "vitest run",
"test:angular": "ng test --watch=false --browsers=ChromeHeadless",
"test:e2e": "playwright test",
"test:all": "npm run test:unit && npm run test:angular && npm run test:e2e",
"test:workers": "cd workers/monitor && vitest run"
Also add coverage config to vitest.config.ts:

coverage: { provider: 'v8', include: ['functions/**', 'workers/**'], thresholds: { lines: 80 } }
CI Pipeline (.github/workflows/ci.yml)
Stage 1 — Fast (< 90 s, every push)

vitest run (functions + workers units)
ng test --watch=false
Stage 2 — Integration (PRs to main)

supabase start
docker run mailpit
wrangler pages dev & + ng serve &
playwright test
supabase stop
Implementation Sequence
Week	Files to create	Notes
1	parsers.ts extraction, _cap.test.ts, _cache.test.ts, order.test.ts, parsers.test.ts	Pure logic, no infra needed
2	auth.service.spec.ts, watch.service.spec.ts, auth.guard.spec.ts, auth.interceptor.spec.ts, subject-detail.component.spec.ts	Karma, no real Supabase
3	Fixtures dir, ico.integration.test.ts, e2e/search.spec.ts, e2e/subject-detail.spec.ts	Needs wrangler dev
4	e2e/auth.spec.ts, e2e/watchlist.spec.ts, e2e/order.spec.ts, .github/workflows/ci.yml	Needs local Supabase CLI
Ongoing	Bug fixes (email-template, diff.test, order/contact BREVO_API_BASE), coverage config	
Coverage Priorities
Must have (blocking release):

parsers.ts ISIR/DPH parsing logic — core product differentiator, bugs go directly to user decisions
_cap.ts — pure, called on every search, currently zero tests
order.ts — billing-critical, dual Brevo call, zero tests
WatchService — billing enforcement path
High value:

[ico].ts integration (3 fixture scenarios)
_cache.ts — stale/version KV logic
E2E: search + detail + auth flows
Skip:

Landing, Pricing, Legal pages (no logic)
notify.ts (empty stub)
Visual regression (premature)
Performance benchmarks (premature)