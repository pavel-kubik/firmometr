# English Mutation — Design Spec
_Date: 2026-05-16_

## Context

The app (Firmometr / Proklepni) is Czech-only. All UI strings are hardcoded in component templates. The goal is to add a full English version at `/en/...` URL prefix so the same product can be tested with English-speaking audiences. Czech paths stay unchanged. No page is excluded — all 10 routes get English equivalents.

---

## Architecture

### Language detection

Language is determined exclusively by URL prefix:

| Language | Root | Example |
|---|---|---|
| Czech (default) | `/` | `/ceny`, `/search/12345678` |
| English | `/en` | `/en/pricing`, `/en/search/12345678` |

A functional Angular route **resolver** on the `/en` parent route calls `translocoService.setActiveLang('en')` before any child component mounts. Czech routes have no resolver — `'cs'` is the Transloco default language.

Both languages reuse the **same components**. No component is duplicated.

### URL slug mapping

| Czech | English |
|---|---|
| `/` | `/en` |
| `/ceny` | `/en/pricing` |
| `/kontakt` | `/en/contact` |
| `/obchodni-podminky` | `/en/terms` |
| `/gdpr` | `/en/gdpr` |
| `/dashboard` | `/en/dashboard` |
| `/search` | `/en/search` |
| `/search/:ico` | `/en/search/:ico` |
| `/login` | `/en/login` |
| `/register` | `/en/register` |

---

## Dependencies

Install: `@jsverse/transloco` (supports Angular 18 standalone, lazy loading).

Configure with `HttpLoader` pointing at `assets/i18n/{lang}.json`.

Default language: `cs`. Available languages: `['cs', 'en']`. Missing-key strategy: fall back to key name.

---

## Translation files

Two flat JSON files with page-scoped prefixes:

```
assets/i18n/cs.json
assets/i18n/en.json
```

Key naming convention: `<page>.<key>`, e.g.:

```json
{
  "nav.login": "Přihlásit se",
  "nav.register": "Zaregistrovat se",
  "landing.hero_title": "Prověřte každého obchodního partnera za 10 sekund",
  "search.placeholder": "Zadejte IČO nebo název firmy",
  "dashboard.empty_title": "Zatím žádné sledované subjekty"
}
```

Shared strings (e.g. button labels reused across pages) use `common.*` prefix.

---

## Component changes

Every component:
1. Adds `TranslocoModule` to its `imports[]` array
2. Replaces hardcoded Czech strings in templates with `{{ 'key' | transloco }}`
3. For HTML attributes: `[placeholder]="'key' | transloco"` or `transloco="key"` directive
4. For TypeScript strings (snack bar messages, validation errors): inject `TranslocoService`, call `this.translocoService.translate('key')`

**Files to modify (13 components):**
- `src/app/public/landing/landing.component.ts`
- `src/app/public/pricing/pricing.component.ts`
- `src/app/public/contact/contact.component.ts`
- `src/app/public/legal-terms/legal-terms.component.ts`
- `src/app/public/legal-gdpr/legal-gdpr.component.ts`
- `src/app/public/public-nav/public-nav.component.ts`
- `src/app/public/public-footer/public-footer.component.ts`
- `src/app/features/dashboard/dashboard.component.ts`
- `src/app/features/search/search.component.ts`
- `src/app/features/search/subject-detail/subject-detail.component.ts`
- `src/app/features/auth/login.component.ts`
- `src/app/features/auth/register.component.ts`

---

## Routing changes

**File:** `src/app/app.routes.ts`

Add an `en` parent route with a language resolver as a child group. The resolver sets `'en'` before any child loads. Czech routes stay untouched.

```ts
// New en parent route (added alongside existing routes)
{
  path: 'en',
  resolve: { lang: () => inject(TranslocoService).setActiveLang('en') },
  children: [
    { path: '', loadComponent: () => LandingComponent },
    { path: 'pricing', loadComponent: () => PricingComponent },
    { path: 'contact', loadComponent: () => ContactComponent },
    { path: 'terms', loadComponent: () => LegalTermsComponent },
    { path: 'gdpr', loadComponent: () => LegalGdprComponent },
    { path: 'dashboard', loadComponent: () => DashboardComponent },
    { path: 'search', loadComponent: () => SearchComponent },
    { path: 'search/:ico', loadComponent: () => SubjectDetailComponent },
    { path: 'login', loadComponent: () => LoginComponent },
    { path: 'register', loadComponent: () => RegisterComponent },
  ]
}
```

---

## Nav language switcher

**File:** `src/app/public/public-nav/public-nav.component.ts`

Add a `RouteMapService` (or inline constant in nav) holding the bidirectional slug map. On each navigation event, the nav reads the current URL, determines active language, and renders:

- Czech active: `[CS]  EN →` link pointing to the English equivalent
- English active: `← CS  [EN]` link pointing to the Czech equivalent

The switcher preserves `:ico` params (e.g. `/search/12345678` ↔ `/en/search/12345678`).

---

## New files

| File | Purpose |
|---|---|
| `assets/i18n/cs.json` | Czech translation strings |
| `assets/i18n/en.json` | English translation strings |
| `src/app/core/services/route-map.service.ts` | Maps CS ↔ EN slugs for nav switcher |

---

## Verification

1. `ng serve` — app loads, Czech routes work as before
2. Navigate to `/en` — page renders in English
3. Navigate to `/en/pricing` — pricing page in English
4. Navigate to `/en/search/12345678` — subject detail in English
5. CZ/EN toggle in nav: clicking EN on `/ceny` navigates to `/en/pricing` and vice versa
6. Auth flows (login, register) work in both languages with translated validation messages
7. No Czech strings visible on any `/en/` page
8. No English strings visible on any Czech-prefixed page
