# Product Plan — Proklepni.cz

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

- [ ] Distinquish access from localhost - block, netlify, prod at Google Analytics
- [ ] Get VAT registration date from registry, it should be 01.08.2024 for ICO 71379487
- [ ] Angular SSG (Static Site Generation) for sattic pages
- [ ] Přihlaste se pro správu vlastního portfolia sledovaných subjektů. => + a notifikaci zmen


TOP PRIO
- [x] SSG from previous repo lustrate
- [x] Remove waitlist form
- [ ] caching latest search at open registry
- [ ] Get latest changes on insolvency (like hlidac statu), ...
- [ ] SSG for ALL / important? / some companies
- [ ] Monitoring of companies and notify by email
- [ ] 
