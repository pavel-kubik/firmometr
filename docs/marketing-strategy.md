# Firmometr.cz — Marketing Strategy

## Goal

Increase organic visitors by owning Czech business verification queries in search and professional communities.

## Core insight

Firmometr is a utility people use on demand — the goal is to be the first result when they have the need, not to build a brand they remember. SEO and professional community placement outperform social media or ads for this type of product.

---

## 1. SEO — Highest ROI

### Company landing pages

Generate static pages for active Czech companies: `/firma/[nazev-firmy]-[ico]`

Each page includes: company name, IČO, legal form, address, VAT status, insolvency flag.

These pages rank for branded queries like:
- *"Alza.cz insolvenční rejstřík"*
- *"[firma] spolehlivost DPH"*

This is a traffic flywheel — each page ranks, drives visitors, some sign up for the watchlist.

**Implementation:** Expand `prerender-routes.txt` by running a script against ARES top companies. Start with the top 50k by relevance.

### Informational content

| Article | Target query | Audience |
|---|---|---|
| Jak zkontrolovat firmu před spoluprací | due diligence česká firma | SMB, procurement |
| Jak číst insolvenční rejstřík | insolvenční rejstřík jak funguje | General |
| Nespolehlivý plátce DPH — co to znamená | nespolehlivý plátce DPH | Accountants |
| ARES — jak vyhledat firmu | ares vyhledávání firmy | General |

### Technical SEO

- Ensure Angular prerenders all company pages (expand `prerender-routes.txt`)
- Add Organization structured data (JSON-LD) to company pages
- Submit sitemap covering all company URLs

---

## 2. Professional Use-Case Landing Pages

Map real Czech jobs to the tool — each page targets a professional segment and a specific query.

| Page | Target query | Audience |
|---|---|---|
| `/pro-uctarny` | kontrola dodavatele DPH | Accountants |
| `/pro-pravniky` | prověření protistrany smlouva | Lawyers |
| `/pro-hr` | ověření zaměstnavatele | Job seekers |
| `/monitoring-firem` | sledování změn ve firmě | SMB owners |
| `/due-diligence` | due diligence česká firma | M&A, investors |

Each page: explains the workflow, shows a screenshot, links to a sample company search.

---

## 3. Word-of-Mouth Among Professionals

### Accountants and bookkeepers (~30,000 in CZ)

Highest-value distribution channel — they check VAT reliability weekly.

- Post in Facebook groups: *Účetní a daňoví poradci ČR*, *Podnikatelé CZ*
- Write for [Účetní kavárna](https://www.ucetnikavarna.cz/) — they publish guest how-tos
- Article pitch: *"Jak automaticky sledovat nespolehlivé plátce DPH u svých klientů"* — this is exactly the watchlist feature

### Procurement / supply chain managers

- LinkedIn posts framed as risk management, not a tool demo
- Example angle: *"Prověřili jsme 200 dodavatelů a u 12 byl problém. Tady jak."*

---

## 4. Product-Led Growth

### Shareable results
Add a "sdílet výsledek" button that generates a permanent link to a company report. Recipients who land on it become users.

### API / embed
Offer a simple iframe or JS snippet so developers, lawyers, and accountants can embed a company check on their own tools. Each embed is a free backlink and a discovery path.

### Browser extension
When someone visits a company website, show an IČO badge with a quick lookup. High retention, high virality among power users.

---

## 5. PR and Link Building

### Czech media targets

- [Lupa.cz](https://lupa.cz), [Podnikatel.cz](https://podnikatel.cz), Hospodářské noviny
- Pitch angle: *"Free alternative to paid business registries"*
- Article hook: *"Jak zjistit, jestli je firma v insolvenci, zdarma a za 3 sekundy"*

### Data stories (once usage data is available)

- *"Nejvíce insolvencí v ČR: kraje, odvětví"*
- *"Počet nespolehlivých plátců DPH v roce 2025"*

These get picked up by financial and business journalists organically.

---

## 6. Quick Wins (This Month)

- Submit to Czech startup directories: StartupJobs.cz, Czech100, Česká inovace
- Post on Reddit: r/czech, r/financecz — genuine helpful thread about verifying firms
- Expand prerendering — top 50k companies from ARES

---

## Priority Order

| Priority | Action | Leverage |
|---|---|---|
| 1 | Company landing pages | SEO flywheel, long-term compounding |
| 2 | 3–5 professional use-case pages | Conversion + backlinks |
| 3 | Accountant community outreach | Fast word-of-mouth |
| 4 | Shareable results link | Product-led, low dev effort |
| 5 | Data story pitch to Lupa.cz | One-time PR spike |
