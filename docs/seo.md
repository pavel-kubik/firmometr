# SEO & Measurement — Firmometr

This document describes how Firmometr is set up for search engines and how
analytics/event tracking is wired. The final section is a **resume point** for
the in-progress GA4 analytics work — read it before continuing that task.

---

## 1. SEO architecture

### Rendering: SSR + prerendering
Firmometr is an Angular 18 app with `@angular/ssr`. Marketing/content routes are
**prerendered** to static HTML at build time (great for crawlers); dynamic
company pages are **server-rendered on demand**.

- Server entry: [src/main.server.ts](../src/main.server.ts), [src/app/app.config.server.ts](../src/app/app.config.server.ts)
- Prerendered route list: [prerender-routes.txt](../prerender-routes.txt)

**Prerendered (static) routes** — both Czech and English variants:
`/`, `/ceny`, `/objednat`, `/kontakt`, `/gdpr`, `/obchodni-podminky`, `/blog`,
blog articles, and the use-case landing pages (`/pro-uctarny`, `/pro-pravniky`,
`/pro-hr`, `/monitoring-firem`, `/due-diligence`).

**Dynamic SSR route (programmatic SEO):** `/search/:ico`
([subject-detail.component.ts](../src/app/features/search/subject-detail/subject-detail.component.ts))
— every Czech company becomes its own indexable page with company-specific
title, meta description, and structured data. This is the main organic-growth
surface.

### robots.txt
[public/robots.txt](../public/robots.txt) — open to all crawlers (including
AI/LLM bots), and points to the sitemap:
```
User-agent: *
Allow: /
Sitemap: https://firmometr.cz/sitemap.xml
```

### sitemap.xml
[public/sitemap.xml](../public/sitemap.xml) — lists public URLs with
`<changefreq>` / `<priority>` and **hreflang alternates** (`cs` ⇄ `en`) per URL.
**Maintenance note:** the sitemap is hand-maintained. When you add a prerendered
route, add it here too (and to `prerender-routes.txt`).

### Internationalization (i18n) & hreflang
- Czech is the default at the root (`/...`); English lives under `/en/...`.
- Language is derived from the URL in [lang.service.ts](../src/app/core/services/lang.service.ts);
  `LangService.p()` builds lang-prefixed `routerLink` paths; translations via Transloco.
- hreflang alternates are declared in the sitemap. The static `<html lang>` in
  [src/index.html](../src/index.html) is `en` but the active language is set at runtime.

### Per-page metadata
Each public component sets its own SEO tags via Angular's `Title` / `Meta`
services — title, `description`, Open Graph (`og:*`), Twitter card, and a
`rel="canonical"` link (cs vs `/en` URL). Implemented in:
- [landing.component.ts](../src/app/public/landing/landing.component.ts)
- [pricing.component.ts](../src/app/public/pricing/pricing.component.ts)
- [contact.component.ts](../src/app/public/contact/contact.component.ts)
- [blog.component.ts](../src/app/public/blog/blog.component.ts) and [blog-article.component.ts](../src/app/public/blog/blog-article/blog-article.component.ts)
- [use-case-page.component.ts](../src/app/public/use-case-page/use-case-page.component.ts)
- [subject-detail.component.ts](../src/app/features/search/subject-detail/subject-detail.component.ts)

### Structured data (JSON-LD)
Company detail pages inject a `schema.org/Organization` block (`name`,
`identifier` = IČO, `address`, `vatID` = DIČ) into `<head>` as
`<script type="application/ld+json" id="ld-company">`. See `setMetaTags()` in
[subject-detail.component.ts](../src/app/features/search/subject-detail/subject-detail.component.ts).

### Measurement plumbing (also relevant to SEO/marketing)
- **Google Tag Manager** is loaded in [src/index.html](../src/index.html)
  (container `GTM-TVRVKQWF`) — **production hostname only** (see the hostname
  guard; note the temporary dev hack flagged in §3).
- **Consent Mode v2** defaults to `denied` before GTM loads; the cookie banner
  ([cookie-banner.component.ts](../src/app/public/cookie-banner/cookie-banner.component.ts),
  [cookie-consent.service.ts](../src/app/core/services/cookie-consent.service.ts))
  updates consent.
- **GA4** receives pageviews via GTM; **Search Console** is connected.

---

## 2. Analytics event tracking (implemented)

Custom events are pushed to the GTM `dataLayer` through a typed helper:
[src/app/core/analytics.ts](../src/app/core/analytics.ts).

- Generic `trackEvent(event, params)` — SSR-guarded (`typeof window`), pushes
  `{ event, ...params }` onto `window.dataLayer`.
- Named helpers exported as the `analytics` namespace object.
- Session search counter via `nextSearchCount()` / `currentSearchCount()`
  (sessionStorage-backed, key `fm_search_count`).

### Events wired so far

| Event | Fires from | Params |
|---|---|---|
| `search_performed` | name search ([search.component.ts](../src/app/features/search/search.component.ts)) + IČO lookup ([subject-detail.component.ts](../src/app/features/search/subject-detail/subject-detail.component.ts)), on success | `search_type` (`ico`\|`name`), `user_status` (`anonymous`\|`free`\|`paid`), `search_count` |
| `search_limit_hit` | 429 branch in both search components, **anonymous only** | `search_count` |
| `signup_started` | `RegisterComponent.ngOnInit` ([register.component.ts](../src/app/features/auth/register.component.ts)), `source` from `?source=` query param | `source` |
| `signup_completed` | `RegisterComponent.register()` success | `plan` (always `free` at signup) |
| `plan_viewed` | `OrderComponent.ngOnInit` ([order.component.ts](../src/app/public/order/order.component.ts)) | `plan` |
| `checkout_started` | `OrderComponent.submit()`, on valid submit (before POST) | `plan`, `billing_period` |
| `subscription_activated` | **NOT WIRED — deferred** (see §3) | `plan`, `value`, `currency` |

### `signup_started` sources
Set via `?source=` on each entry link, validated in `RegisterComponent`
(falls back to `direct`):
`pricing_page` (pricing free CTA), `landing` (landing free CTA),
`watch_cta` (Watch clicked while logged out, [subject-detail.component.ts](../src/app/features/search/subject-detail/subject-detail.component.ts)),
`login` ([login.component.ts](../src/app/features/auth/login.component.ts)),
`auth_required` ([auth.guard.ts](../src/app/core/guards/auth.guard.ts)),
`direct` (typed URL / untagged).

### `user_status` mapping
`AuthService.currentUserStatus` ([auth.service.ts](../src/app/core/services/auth.service.ts)):
no user → `anonymous`; tier `free` → `free`; tier `basic`/`enterprise` → `paid`.
(If a logged-in user's profile hasn't loaded yet, reports `free` momentarily.)

### Naming decisions (catalog → reality)
The original event catalog used placeholder names; these were aligned to the
**actual data model** so params match Supabase / the order form:
- `search_type`: dropped `vat` (VAT lookup == IČO lookup). Only `ico` | `name`.
- `Plan`: `free | basic | enterprise` (not `free/solo/business`). Matches `UserTier`.
- `BillingPeriod`: `monthly | annual` (not `monthly/yearly`). Matches the order form.

---

## 3. RESUME HERE — remaining analytics tasks

State as of this session. Everything above §3 is done and builds clean
(`npm run build`). To continue:

### GTM dev hack — already reverted ✅
During development [src/index.html](../src/index.html) was temporarily widened so
GTM Preview attaches on `localhost`. **This has been reverted** — the loader is
back to production-only (`location.hostname==='firmometr.cz'`). If you need GTM
Preview on localhost again while continuing this work, re-add `||location.hostname==='localhost'`
to that condition, then remove it again before merging. GTM must NOT load on
localhost in shipped code.

### Task A — Step 7: `subscription_activated` (deferred)
There is **no real payment event** today: the order form does
`POST /api/v1/order` (a manual order/lead, not a Stripe charge), and
`subscriptionsEnabled` is `false` in production
([environment.production.ts](../src/environments/environment.production.ts)).
Decision taken this session: **do not connect Stripe yet** (still validating
demand; Stripe is multi-day work incl. Czech DPH/VAT, a webhook Pages Function,
and subscription lifecycle). Options when revisiting:
- **(a)** Wire `subscription_activated` for real once Stripe/payment exists (fire
  on payment confirmation — webhook or success redirect), with the real CZK `value`.
- **(b)** Interim: fire an honest "order placed" proxy on the `POST /api/v1/order`
  success in `OrderComponent.submit()` — but label it as *order submitted* in GA4,
  and do **not** treat it as paid revenue.
The typed helper `analytics.subscriptionActivated({ plan, value, currency: 'CZK' })`
already exists and is ready to call.

### Task B — Phase 3: GTM configuration (no code, just clicks in the GTM UI)
The dataLayer pushes are live, but GTM still needs tags/variables to forward them
to GA4. Do this in the GTM web UI (container `GTM-TVRVKQWF`):

1. **Universal GA4 event tag**
   - Tags → New → *Google Analytics: GA4 Event*.
   - Configuration tag: your existing GA4 config tag.
   - Event Name: `{{Event}}` (the built-in Event variable — enable it under
     Variables → Configure if hidden).
   - Trigger: New → *Custom Event*, Event name regex:
     `^(search_performed|search_limit_hit|signup_started|signup_completed|plan_viewed|checkout_started|subscription_activated)$`,
     with "Use regex matching" checked.

2. **Data Layer Variables** — create one per parameter (Variables → New → *Data
   Layer Variable*, name = the dataLayer key):
   `search_type`, `user_status`, `search_count`, `source`, `plan`,
   `billing_period`, `value`, `currency`.

3. **Event Parameters on the universal tag** — under the GA4 event tag's *Event
   Parameters*, map each parameter name to its `{{Data Layer Variable}}`
   (e.g. `plan` → `{{plan}}`). Unused params on a given event simply stay empty.

4. **Mark Key Events** (GA4 → Admin → Events): flag `signup_completed`,
   `checkout_started`, and `subscription_activated` (when it exists) as Key Events.

5. **Verify in GA4 DebugView**: with GTM Preview connected, perform each action
   and confirm events arrive with parameters. Remember Consent Mode defaults to
   `denied` — accept the cookie banner so GA4 (not just GTM Preview) records them.

### Verification cheat-sheet (local, dev)
GTM only loads on the production hostname, so to use GTM Preview locally first
re-add `||location.hostname==='localhost'` to the loader condition in
[src/index.html](../src/index.html) (and remove it before merging). Then
`npm start` (port 4201) + GTM Preview on `http://localhost:4201`:
- Name search → `search_performed` (`search_type: name`, `search_count: 1`).
- Open a company by IČO → `search_performed` (`search_type: ico`, count increments).
- Trip the rate limit while logged out → `search_limit_hit`.
- Open `/register` from various CTAs → `signup_started` with the matching `source`.
- Register a fresh email → `signup_completed` (`plan: free`).
- Logged in, open `/objednat?plan=basic&billing=annual` → `plan_viewed` (`plan: basic`).
- Submit a valid order → `checkout_started` (`plan: basic`, `billing_period: annual`).
Reset the counter with `sessionStorage.removeItem('fm_search_count')`.
