# Landing Page Design — Firmometr

**Date:** 2026-05-16
**Status:** Approved by user

---

## Goal

Build a proper public-facing marketing site for Firmometr within the existing Angular 18 app. The site must cover: landing page, pricing page, contact, obchodní podmínky, and GDPR. All pages must be mobile-responsive.

---

## Design System

| Token | Value |
|---|---|
| Primary color | `#059669` (emerald-600) |
| Primary light | `#dcfce7` |
| Primary dark | `#065f46` |
| Text primary | `#0f172a` |
| Text secondary | `#475569` |
| Text muted | `#94a3b8` |
| Background | `#f8fafc` |
| Surface | `#ffffff` |
| Border | `#e2e8f0` |
| Dark bg (footer, CTA) | `#0f172a` |
| Font | System stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` |
| Logo | `FIRMOMETR` — all-caps, font-weight 900, letter-spacing 3px |

Style direction: modern SaaS (inspired by Notion/Linear). Rounded corners, clean whitespace, green accent on white/light-green backgrounds.

---

## Architecture

### Two-layout approach

Public marketing pages use a new `PublicLayoutComponent`. Existing app pages (`/dashboard`, `/search`, `/login`, `/register`) keep the current `mat-toolbar` shell untouched.

```
AppComponent
  ├── PublicLayoutComponent  (new)
  │     ├── PublicNavComponent      (FIRMOMETR logo, nav links, login + CTA)
  │     └── PublicFooterComponent   (links, legal info, copyright)
  │
  │   Routes using public layout:
  │     /                    → LandingComponent
  │     /ceny                → PricingComponent
  │     /kontakt             → ContactComponent
  │     /obchodni-podminky   → LegalTermsComponent
  │     /gdpr                → LegalGdprComponent
  │
  └── Existing app shell (mat-toolbar)
        /dashboard, /search, /search/:ico, /login, /register
```

### Route change

Remove the current `'' → dashboard` redirect. Route `''` now loads `PublicLayoutComponent` containing `LandingComponent`.

---

## Pages

### 1. Landing page (`/`)

Sections top to bottom:

1. **Nav** — sticky, white background, border-bottom. Logo left, nav links center-left, login + "Vyzkoušet zdarma →" right.
2. **Hero** — light green gradient background. Badge "✓ Bez registrace, bez kreditní karty". H1: "Prověřte každého obchodního partnera za 10 sekund". Subtext. Two buttons: "Vyhledat firmu zdarma" (primary, goes to `/search`) + "Zobrazit ceny" (ghost, goes to `/ceny`). Live demo search box (functional — submits to `/search?q=`). Trust strip: ISIR, DPH, OR, ARES.
3. **Features grid** — white background. 6 cards: ISIR, DPH, OR, ARES, Watchlist, Rizikový semafor. 3-col on desktop, 1-col on mobile.
4. **How it works** — 3 numbered steps. 3-col on desktop, 1-col mobile.
5. **Pricing teaser** — light green bg. 3 plan cards (Free / Solo / Business). "BRZY" badge on Solo + Business. CTA button → `/ceny` for waitlist.
6. **Dark CTA strip** — dark bg (#0f172a), white text, single CTA "Vyhledat firmu →" to `/search`.
7. **Footer** — dark bg. Logo, product links, legal links, IČO, copyright, email.

### 2. Pricing page (`/ceny`)

- Nav + Footer (PublicLayout)
- Hero: "Vyberte plán" headline, short description
- 3 plan cards side by side (desktop), stacked (mobile):
  - **Free** — Zdarma navždy, features list, "Začít zdarma" → `/search`
  - **Solo** — "Brzy dostupné", features list, waitlist form inline
  - **Business** — "Brzy dostupné", features list, waitlist form inline
- Single shared waitlist form below cards (alternative): email input + plan selector + submit
- Form submits via POST to `/api/v1/contact` (Cloudflare Pages Function, sends email via Brevo)
- Success state: inline thank-you message

### 3. Contact page (`/kontakt`)

- Nav + Footer
- Two-column layout (desktop): left = contact info, right = contact form
- Contact info:
  - Email: info@firmometr.cz
  - Company: Butterfly Flowers s.r.o., IČO 07102127
  - Address: Srbínská 867/4, Strašnice, 10000 Praha 10
- Contact form: jméno, e-mail, zpráva, submit via POST `/api/v1/contact`
- Mobile: stacked, form below info

### 4. Obchodní podmínky (`/obchodni-podminky`)

- Nav + Footer
- Single-column readable text layout, max-width 760px, centered
- Standard Czech B2B SaaS terms covering: provozovatel, předmět smlouvy, uživatelský účet, platby a fakturace, omezení odpovědnosti, zpracování osobních údajů odkaz na GDPR, závěrečná ustanovení
- Legal entity: Butterfly Flowers s.r.o., IČO 07102127, Srbínská 867/4, 10000 Praha 10, info@firmometr.cz
- Effective date: 2026-05-16

### 5. GDPR / Ochrana osobních údajů (`/gdpr`)

- Nav + Footer
- Single-column text layout, max-width 760px
- Covers: správce údajů, jaké údaje zpracováváme (e-mail pro registraci, watchlist IČO, technické logy), právní základ, doba uchování, práva subjektu (přístup, oprava, výmaz, přenositelnost), cookies, kontakt DPO
- Note on ISIR data: RČ fyzických osob podnikatelů zpracováváme pouze z veřejného rejstříku, nejsou ukládány
- Contact: info@firmometr.cz

---

## Mobile Responsiveness

All breakpoints handled via CSS (no Angular CDK breakpoints needed — CSS only is simpler and sufficient).

| Breakpoint | Layout changes |
|---|---|
| `≥ 1024px` | 3-col features grid, side-by-side nav, horizontal footer |
| `768px–1023px` | 2-col features grid, condensed nav |
| `< 768px` | 1-col everything, hamburger menu (or simplified nav), stacked footer |

Mobile nav: hide nav links on `< 768px`, show hamburger `☰` button. `PublicNavComponent` tracks `menuOpen: boolean`; clicking hamburger toggles it; links render in a dropdown below the nav bar via `@if (menuOpen)`. "Vyzkoušet zdarma" button stays visible at all widths.

---

## Waitlist Form

- Submit via POST `/api/v1/contact` (Cloudflare Pages Function)
- Fields: email (required), plan selection (Free / Solo / Business radio or dropdown), optional message
- On submit: show inline success message, no page navigation

---

## Routing Changes

Current `app.routes.ts`:
```ts
{ path: '', redirectTo: 'dashboard', pathMatch: 'full' }  // REMOVE
```

New routes to add:
```ts
{ path: '', component: PublicLayoutComponent, children: [
  { path: '', component: LandingComponent },
  { path: 'ceny', component: PricingComponent },
  { path: 'kontakt', component: ContactComponent },
  { path: 'obchodni-podminky', component: LegalTermsComponent },
  { path: 'gdpr', component: LegalGdprComponent },
]}
```

---

## Files to Create

```
src/app/
  public/
    public-layout/
      public-layout.component.ts
    public-nav/
      public-nav.component.ts
    public-footer/
      public-footer.component.ts
    landing/
      landing.component.ts
    pricing/
      pricing.component.ts
    contact/
      contact.component.ts
    legal-terms/
      legal-terms.component.ts
    legal-gdpr/
      legal-gdpr.component.ts
```

---

## Out of Scope

- Blog / SEO articles
- Stripe / Comgate payment integration
- Email alert backend
- CSV import
- SSR / Angular Universal
