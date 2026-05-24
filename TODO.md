# Product Plan — Frimometr.cz

> Based on market analysis (CZ market, 2026-05-10). Target: micro-SaaS for B2B credit/insolvency monitoring for freelancers, OSVČ, small firms.
>
> Legend: ✅ done · 🔶 partial · ⬜ not done

---

## Phase 1 — MVP (Free tier + first paid tier)

Goal: working product with freemium acquisition. Timeline: 2–3 months.

### Core data integrations
- ✅ ISIR (isir.justice.cz) — SOAP integration, parses insolvency status (CLEAR / PAST_DEBTOR / ACTIVE_DEBTOR)
- ✅ ARES (Ministerstvo financí) — REST, vrací IČO, název, právní forma, adresa, datum vzniku
- ✅ Nespolehliví plátci DPH (gov.cz)
- ✅ Obchodní rejstřík (or.justice.cz) — statutáři, základní sbírka listin

### User engagement
- ✅ cap free search without login (5 in session)
- ✅ user registration
  - magic link login?
  - user / password
- ⬜ cap free search with login
- ⬜ paid version 99,- / month

### Search & company profile
- 🔶 Vyhledávání podle IČO a názvu firmy ✅ — podle osoby ⬜
- ✅ Profil firmy — agregovaná data z ARES + ISIR + ČÚZK adresa
- 🔶 Risk semafor — vizuální (červená/oranžová/zelená) ✅, plný risk scoring algoritmus (DPH, věk firmy) ⬜
- ✅ OR — Historie statutářů (členové s datumZaniku) — data jsou v API, jen skrytá v UI

### Watchlist & alerts
- ✅ Watchlist — přidat IČO, sledovat změny (localStorage)
- ✅ Watchlist — přidat IČO, sledovat změny (DB for registred users)
- ⬜ E-mail alerty (okamžitě / denní souhrn) — pole notifyEmail existuje v modelu, backend chybí
- ⬜ Hromadný import IČO ze CSV
- ⬜ Connect fakturoid

### Free tier limits
- ⬜ Max 5 sledovaných IČO — bez auth nelze vynucovat
- ⬜ Jen ISIR + DPH semafor
- ⬜ "Zdarma navždy" — brand freemium, žádné credit card required

### Infrastructure
- ⬜ Vlastní cache + inkrementální sync (ISIR má rate limity)
- ⬜ Async job queue pro sync z ISIR (Bull/BullMQ nebo nativní Deno/Node queues — Kafka až od Business tarifu)
- ⬜ GDPR: retention policy pro FO podnikatele (RČ z ISIR), mazání na žádost

---

## Phase 2 — Paid customers (Solo + Business tiers)

### Pricing tiers
- ⬜ **Solo** — 199–299 Kč/měs: 20 IČO, ISIR + DPH + OR alerty, e-mail, CSV import
- ⬜ **Business** — 599–799 Kč/měs: 100 IČO, vše + sbírka listin + export Excel/PDF + multi-user + role

### Payment & billing
- ⬜ Stripe nebo Comgate integrace (samoobslužný checkout, žádné "kontaktujte nás")
- ⬜ Subscription management — upgrade, downgrade, cancel
- ⬜ Automatické faktury / daňové doklady (DUZP, DIČ zákazníka, export PDF)
- ⬜ Webhook na failed payment → grace period → downgrade na Free
- ⬜ Roční platba s bonusem (10 + 2 měsíce zdarma)

### Login & account management
- ⬜ Registrace e-mailem + heslo (nebo magic link)
- ⬜ OAuth — Google přihlášení (volitelné)
- ⬜ Nastavení profilu: jméno, firma, IČO, DIČ, fakturační adresa
- ⬜ Správa předplatného: aktuální tarif, datum obnovy, změna plánu
- ⬜ Seznam faktur s PDF stažením
- ⬜ API klíče (generování, revokace) — od Business tarifu
- ⬜ Multi-user + role (admin / viewer) — od Business tarifu
- ⬜ Smazání účtu + export dat (GDPR)

### Enhanced features (Business tier)
- ⬜ Sbírka listin — upozornění na novou účetní závěrku, výroční zprávu
- ⬜ Finanční výsledky z účetních závěrek (tržby, zisk, vlastní kapitál, zadluženost)
- ⬜ Export do Excelu a PDF
- ⬜ Diff view — "co se změnilo" v obchodním rejstříku
- ⬜ Lustrace exekucí (CEE) — per-query kredity, markup ~20–40 % nad cenou CEE komory

---

## Phase 3 — Growth (Pro + integrations + SEO compound)

### Pro tier (1 500–3 000 Kč/měs)
- ⬜ 200–500 IČO
- ⬜ REST API s API klíčem + rate limits per tarif
- ⬜ Webhooks na změny (pro vývojáře, Make.com, Zapier)
- ⬜ MCP server — Claude/GPT mohou dotazovat data pro AI workflowy
- ⬜ Vazby (UBO) — statutáři, vlastníci, koneční beneficienti

### Integrations (akvizice kanály)
- ⬜ Fakturoid plugin / addon
- ⬜ iDoklad plugin
- ⬜ Pohoda / ABRA / Money import zákazníků
- ⬜ Slack / Teams notifikace
- ⬜ AI risk assessment — LLM shrnutí finančního zdraví, red flags (1–2 odstavce na report)

### Affiliate
- ⬜ Affiliate program pro účetní — 20–30 % z první platby za rok
- ⬜ Referral link tracking

---

## SEO

### Keyword targets
- ⬜ "prověření firmy" — high intent, high volume
- ⬜ "kontrola IČO"
- ⬜ "insolvenční rejstřík"
- ⬜ "nespolehlivý plátce DPH"
- ⬜ "jak prověřit odběratele"
- ⬜ "co dělat když dlužník vyhlásí insolvenci"

### Content plan
- ⬜ Blog: "Jak prověřit firmu před spoluprací" (pillar article)
- ⬜ Blog: "Co dělat, když dlužník vyhlásí insolvenci"
- ⬜ Blog: "Jak zkontrolovat nespolehlivého plátce DPH"
- ⬜ Blog: "Top 10 signálů, že firma má finanční problémy"
- ⬜ Glossary pages: IČO, ISIR, ARES, insolvence, exekuce, DPH registr — long-tail SEO
- 🔶 Free public lookup pages (IČO detail veřejně dostupný ✅, crawlable/SSR ⬜)

### Technical SEO
- ⬜ SSR nebo SSG pro veřejné stránky (Angular Universal nebo přejít na Astro/Next pro landing + blog)
- ⬜ sitemap.xml s dynamickými firemními profily
- ⬜ robots.txt — povolit crawl veřejných IČO stránek
- ⬜ OpenGraph + Twitter card meta tagy
- ⬜ Core Web Vitals — LCP < 2.5 s, CLS < 0.1
- ⬜ Structured data (schema.org) pro firemní profily

### Off-page
- ⬜ PR článek na Fakturoid blogu / komunitě
- ⬜ Zmínky v skupinách OSVČ (Facebook, LinkedIn)
- ⬜ ProductHunt launch (CZ + EN verze)

---

## Validation (před velkým vývojem)

- ⬜ 10–15 rozhovorů s OSVČ, účetními, malými s.r.o. — co platí dnes, jak často kontrolují
- ⬜ Landing page s waitlistem + tarifní stránkou — Sklik / Meta ad spend 5 000 Kč, měřit CTR a signup rate
- ⬜ Doménový balíček: zakoupit .cz + .com + .eu jakmile máš název (cca 1 500 Kč/rok)

## Legal & compliance

- ⬜ Podmínky použití ISIR API (ověřit komerční použití)
- ⬜ Smlouva s CEE komorou (exekuce per-query)
- ⬜ GDPR DPA šablona + privacy policy
- ⬜ Zpracování osobních údajů FO podnikatelů (RČ v ISIR) — retention + mazání

---

Interesting ideas

- [ ] Parse "ucetni uzaverka" and make graph with company financial perfirmance during years.
- [ ] Improve design and UX
- [ ] Simple landing page

Logo | Login

Sledované subjekty

Search _____ 

- [ ] Distinquish access from localhost - block, cloudflare preview, prod at Google Analytics
- [ ] Get VAT registration date from registry, it should be 01.08.2024 for ICO 71379487
- [x] Angular SSG (Static Site Generation) for sattic pages
- [ ] Přihlaste se pro správu vlastního portfolia sledovaných subjektů. => + a notifikaci zmen


TOP PRIO
- [x] SSG from previous repo lustrate
- [x] Remove waitlist form
- [x] caching latest search at open registry
- [x] Monitoring of companies and notify by email — see docs/superpowers/specs/2026-05-19-company-monitoring-email-design.md

- [x] Cookies banner
- [x] Clean netlify
  - [x] TypeScript check — `npx tsc --noEmit` — confirms no type errors across the codebase
  - [x] Broken /kontakt form - Contact form via Wrangler dev — `npx wrangler pages dev --proxy 4201` --compatibility-date=2024-01-01, then go to /kontakt, submit the form, verify the request goes to /api/v1/contact and triggers an email via Brevo
  - [x] Functions unit tests — `npx vitest run functions` — confirms the e2e import from functions/_shared/_cap resolves correctly
- [x] Pricing inconsistency
      - homepage - pripravujeme
      - order - selling
- [x] GDPR compliance
   - [x] Cloudflare
   - [x] Supabase - https://supabase.com/legal/dpa - registrovat - https://supabase.com/downloads/docs/Supabase+DPA+260317.pdf
   - [X] Brevo
   - [x] GTM
- [ ] Vypnout sledovani pro neregistrovane => lock icon a registrovat?
- [ ] ICO optional in order
- [ ] Change angular default app icon
- [x] Errors are not propagated to forms
- [x] Inconsistency in price - "Od " / fix price
- [ ] llms.txt
- [ ] zapomenute heslo

- [ ] Cap usage without login
- [ ] Cap usage for free plan - ? 3x per day ?
- [ ] Show plan after login
- [ ] Set up SPF/DKIM/DMARC on firmometr.cz before any transactional email goes out.
- [ ] X-Robots-Tag: noindex for non prod (firmometr.pages.dev)
- [ ] Order form - ico not mandatory

  - [ ] DOBRE NAVRHNOUT ARCHITEKTURU A MIT STEJNY KOD NE SEARCH A BATCH PROCESSING
  - [ ] What is reference point? watchlist in DB
  - [ ] Zmena semaforu => trigger event
  - [ ] TESTOVAT!
  - [ ] Full watchdog for any change => another feature

- [ ] [Notifications] Allow custom per-company notification email (notify_email field is ready in DB, needs UI + WatchService.setNotification to accept arbitrary email)
- [ ] E2E - Minimal automated test for deployment
  - [ ] Search company
  - [ ] Register lifecycle
  - [ ] Order lifecycle
  - [ ] Add to watchlist lifecycle
  - [ ] Notify about changes
- [ ] BASIC SUBSCRIPTION
  - [ ] Allow buy subscription

FEATURES (deffered after MVP)
- [ ] Update email templates
- [ ] [SEO] Get latest changes on insolvency (like hlidac statu), ...
- [ ] [SEO] SSG for ALL / important? / some companies (may be use KV)

ERRORS:
- [x] when switch tab and come back, spinner on Watched page is activated even nothing is loading


1. Enable Email Routing for your domain

Cloudflare Dashboard → your domain (firmometr.cz) → Email → Email Routing → Enable it. Cloudflare will show you MX records to add — they're added automatically if your DNS is on Cloudflare.

2. Verify the destination address

Email Routing → Destination addresses → Add info@firmometr.cz → Cloudflare sends a verification email → click the link.

3. Verify the sender address

For the SEND_EMAIL binding to send from noreply@firmometr.cz, go to Email Routing → Settings → verify that address too (or use a catch-all route on the domain).

4. Connect the binding to your Pages project

Cloudflare Dashboard → Pages → firmometr → Settings → Functions → Email bindings → Add binding:

Variable name: SEND_EMAIL
Destination: info@firmometr.cz
This is what wires env.SEND_EMAIL in the function to an actual destination.

5. Deploy


npx wrangler pages deploy dist/firmometr-ui/browser
The [[send_email]] block in wrangler.toml tells Wrangler the binding exists — the actual routing destination is set in the dashboard (step 4).

Test it by submitting the order form once deployed. If the email doesn't arrive, check Pages → Functions → Logs for the [order] email error message.