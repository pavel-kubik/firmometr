# Průzkum trhu - Micro SaaS pro sledování kredibility firem

> Stav k 10. 5. 2026, CZ trh

## TL;DR

- Trh je obsazený, ale roztříštěný - jsou tu **3 vrstvy hráčů** (premium enterprise, mid-market, low-end). Mezi mid-market a low-end je mezera pro chytrý a moderní produkt.
- **Cenové kotvy:** insolvenční hlídání 800-3 000 Kč/rok (low-end), komplexní monitoring 5 000-15 000 Kč/rok (mid), enterprise CRIBIS/Cribis tarify běžně desítky tisíc Kč/rok.
- **Klíčový konkurent k pozici proti:** Chytrý rejstřík (chytryrejstrik.cz) - jasný UX, férový ceník, již MCP a AI integrace. Nový vstup musí mít co nabídnout navíc.
- **Doporučená pozice:** "ISIR/insolvenční hlídač + DPH + sbírka listin + AI-driven risk score" pro malé firmy a OSVČ, jednoduchý ceník, ideálně samoobsluha bez obchodního zástupce, Stripe/Comgate. Bonus: napojení do účetních systémů (Fakturoid, iDoklad, Pohoda) a MCP/agent integrace.
- **Realistické pricing brackety:** Free (3-5 IČO, insolvence), Solo 199-299 Kč/měs (20 IČO, vše), Business 599-799 Kč/měs (100 IČO, API), Pro/Enterprise 1 500+ Kč/měs.
- **Doporučený název (krátký list):** `FiRisk`, `Kredo`, `Solventis`, `Prověr`, `Vivid`. Detailní dostupnost domén níže.

---

## 1. Mapa konkurence

### Vrstva A - Enterprise/premium (drahé, B2B sales-led)

| Hráč | Provozovatel | Pozice | Cena |
|---|---|---|---|
| **CRIBIS** | CRIF – Czech Credit Bureau | 10+ mil. subjektů CZ/SK, 43+ zdrojů, mezinárodní reporty SkyMinder, semafor, diagram vazeb | Po dohodě, na klik nezveřejněno - obvykle desítky tisíc Kč/rok + per-query |
| **Dun & Bradstreet (přes ASPI)** | Wolters Kluwer / D&B | KYC/KYB, credit-to-cash, Risk Analytics | 50 reportů/měs v předplatném ASPI, jinak po dohodě |
| **Bisnode** (dnes součást Dun & Bradstreet) | D&B | Credit reporty, monitoring portfolií | Enterprise, po dohodě |

**Charakteristika:** Obrovská hloubka dat, mezinárodní pokrytí, ale složitá UX, sales-led prodej, dlouhé smlouvy. Tady nemá smysl konkurovat - jiný segment trhu.

### Vrstva B - Mid-market (transparentní ceník, samoobsluha)

| Hráč | Provozovatel | USP | Cena (orientačně) |
|---|---|---|---|
| **Chytrý rejstřík** (chytryrejstrik.cz) | Chytryrejstrik.cz s.r.o. (Brno, IČO 23542705) | Analýza + Vyhledávač + Hlídač, finanční benchmark, vozový park, API, MCP server, 30+ filtrů | Přístup od **399 Kč bez DPH/měsíc**; Hlídač **od 20 Kč/IČO/měsíc** (5-200 IČ); API **479 Kč bez DPH/měsíc**; 12 měsíců = 10 + 2 zdarma |
| **Rejstříky.info** | Prowia system s.r.o. | Monitoring insolvence + obch. rejstřík + živn. rejstřík + DPH + EU VIES, lustrace exekucí na kredity | Programy EXE/BASIC/PRO, dle konfigurátoru 50-2 000 IČ, 1 měsíc zdarma, API v ceně; "celý ISIR na míru od **2 300 Kč/měs + DPH**" |
| **ISIR.info** | Prowia system s.r.o. | Starší produkt stejné firmy, migrují na rejstriky.info; XML API (`getevents`, `getsubjects`, `hasrecord`, `iswatched`, `importsubjects`, `deletesubject`) | Po dohodě, uživatelé jsou nyní směrováni na rejstriky.info |
| **Creditcheck.cz** | Creditcheck s.r.o. | "Semafor" Creditcheck **zdarma** pro fakturační systémy, monitoring 70 zdrojů, e-mail alerty | Základní semafor zdarma (B2B integrace), detailní reporty placené, monitoring po dohodě |

**Charakteristika:** Tady je jádro konkurence. Cenové hladiny lze brát jako benchmark.

### Vrstva C - Low-end / specializovaní (úzké zaměření)

| Hráč | Pozice | Cena |
|---|---|---|
| **IsirCheck.cz** | Jednorázové ověření IČO v ISIR | Free (20 ověření/IP/den), placené tarify pro vyšší limity |
| **Sledovani-insolvence.cz** | Insolvenční hlídání | Tarify na ročním modelu, řádově stovky až nižší jednotky tisíc Kč/rok |
| **Justice.cz / ISIR.justice.cz** | Oficiální zdroj státu | Zdarma, ale neuživatelské, bez monitoringu |
| **Hlídač státu** (hlidacstatu.cz) | Open data, registr smluv, dotace | Zdarma, vlastní API |
| **Živéfirmy.cz** | "Insolvenční strážce" jako add-on k firemnímu profilu | V rámci jiných balíčků |

**Charakteristika:** Buď zdarma s omezeným použitím, nebo jednoúčelové. Snadné napadnout chytrým UX a širším záběrem.

### Zdroje dat, na kterých všichni stavějí

Klíčové oficiální zdroje (zdarma, většinou s rate limity):

- **ISIR** (isir.justice.cz) - insolvenční rejstřík, REST i SOAP API
- **ARES** (Ministerstvo financí) - základní data o subjektech, DPH, registr ekonomických subjektů
- **Obchodní rejstřík** (or.justice.cz) - sbírka listin, statutáři
- **Živnostenský rejstřík** (rzp.cz)
- **CEE - Centrální evidence exekucí** (ceecr.cz) - **placené, per-query** (~60-90 Kč/lustrace, slevy na tarify)
- **Registr smluv** (smlouvy.gov.cz) - open data
- **Registr dotací** (CEDR)
- **VIES** - EU DPH ověření
- **Nespolehliví plátci DPH** (gov.cz)
- **Datové schránky** (ISDS)

Z výše uvedeného plyne: většinu dat lze získat zdarma, hodnota tvého produktu bude v **agregaci, normalizaci, monitoringu, alertingu, UX a integraci**.

---

## 2. Cenové hladiny v segmentu (shrnutí)

Pro micro-SaaS dává smysl mířit pod Chytrý rejstřík (segment OSVČ a malé firmy do 50 zaměstnanců, účetní, právníci, freelanceři).

| Tarif | Typická cena | Cílový zákazník | Hlídá |
|---|---|---|---|
| Free | 0 Kč | OSVČ, kdo si chce vyzkoušet | 3-5 IČO, jen ISIR |
| Starter / Solo | 99-299 Kč/měs | OSVČ, freelancer, 1-člověk s.r.o. | 10-30 IČO, ISIR + DPH + obch. rejstřík |
| Business | 499-799 Kč/měs | Účetní, malá s.r.o., 10-50 zaměstnanců | 50-150 IČO, vše + sbírka listin + e-mail alerty + export |
| Pro | 1 500-3 000 Kč/měs | Větší firmy, agentury | 200-500 IČO + API + role/uživatelé |
| Enterprise | Po dohodě, 5 000+ Kč/měs | Banky, leasing, vymáhací společnosti | Neomezeně, on-prem option, white-label |

Doplňkové revenue:
- **Lustrace exekucí (CEE)** - per-query (kredity), markup nad nákladovou cenu (~20-40 %)
- **Detailní credit report** s AI shrnutím a doporučením - 99-299 Kč/report (Chytrý rejstřík dělá AI hodnocení v rámci tarifu)
- **API přístup** - od 479 Kč/měs jako oddělený produkt, nebo zahrnuto v Pro
- **MCP / AI agent integrace** - bonus, prodává se sám jako "future-proof"
- **Plugin / addon pro Fakturoid, iDoklad, Pohoda, ABRA** - může být driver akvizice

---

## 3. Feature description - co by měl micro-SaaS umět

### Must-have (MVP)

1. **Vyhledávání subjektu** podle IČO, názvu, jména osoby
2. **Profil firmy** s agregovanými daty: ARES + ISIR + DPH + obch. rejstřík
3. **Sledování (watchlist)** - přidat IČO, dostávat e-mail při změně
4. **Risk semafor / skóre** - jednoduchý zelená/žlutá/červená podle insolvence, spolehlivosti DPH, věku firmy, posledních změn
5. **E-mail alerty** s nastavitelnou granularitou (okamžitě / denní souhrn)
6. **Hromadný import** seznamu IČO (CSV)
7. **Free trial / freemium** - bez tohoto těžko bude akvizice levná

### Should-have (růst)

8. **Sbírka listin** - upozornění na novou účetní závěrku, výroční zprávu
9. **Lustrace exekucí (CEE)** - per-query s kredity
10. **Finanční výsledky** z účetních závěrek - tržby, zisk, vlastní kapitál, zadluženost (přibližně 320-330 tisíc firem v ČR má závěrku ve sbírce listin)
11. **API** - REST, klíč v admin sekci, rate limits per tarif
12. **Vazby (UBO)** - statutáři, vlastníci, koncoví uživatelé výhod, "vazby na osobu"
13. **Export do Excelu / PDF** - důležité pro účetní a právníky
14. **Multi-uživatelské účty + role** - od Business tarifu

### Nice-to-have (diferenciace)

15. **AI risk assessment** - LLM shrnutí finančního zdraví, červené vlajky, doporučení (1-2 odstavce)
16. **MCP server** - aby Claude/GPT mohli dotazovat tvá data pro AI workflowy
17. **Slack / Teams / Discord notifikace** - pro distribuované týmy
18. **Integrace s účetními systémy** - Fakturoid, iDoklad, Pohoda, ABRA, Money - automatický import zákazníků a denní semafor (přesně to dělá Creditcheck zdarma, takže by to nemělo být placené, ale akviziční kanál)
19. **Webhook na změnu** - pro vývojáře, automatizace
20. **Mobile app / PWA** - lehká, jen push notifikace a quick lookup
21. **"Co se změnilo"** - diff view u změn v obch. rejstříku
22. **AML/KYC light** - sankční seznamy (EU, OFAC, UN), PEP screening (přidaná hodnota, nikdo z low-endu to neřeší dobře)

### Diferenciátory proti Chytrému rejstříku

Chytrý rejstřík je silný a moderní. Aby měl smysl nový vstup, je potřeba:

- **Lepší cenovka pro nejmenší segment** (Free + 99 Kč Solo). Chytrý začíná od 399 Kč.
- **Lepší integrace s konkrétními tools** - Fakturoid plugin, Obsidian plugin, MCP, Zapier/Make.com, Slack.
- **AI-first UX** - "Zeptej se na firmu jazykem" místo proklikávání reportů, generování shrnutí pro klienta na klik.
- **Niche pozicování** - např. "credit check pro freelancery a OSVČ" nebo "pro účetní firmy" - pevnější brand než univerzální.
- **Self-service B2B** - žádný "kontaktujte nás" do 3 000 Kč/měs.

---

## 4. Cílové segmenty a use cases

| Segment | Bolesti | Co kupují |
|---|---|---|
| **OSVČ / freelanceři** | Strach ze špatné platby od nového klienta | Solo tarif, jednoduché "zelená/červená", mobilní lookup |
| **Účetní a daňoví poradci** | Hlídají portfolio klientů + jejich zákazníky, GDPR, AML compliance | Business tarif, integrace s Pohodou/iDokladem, export |
| **Malé a střední s.r.o.** | Riziko sekundární platební neschopnosti, hlídání odběratelů | Business tarif, e-mail alerty pro celý sales/finanční tým |
| **Advokátní kanceláře, exekutorské úřady** | Prověření protistran, lustrace, due diligence | Pro tarif, API, multi-user, export reportů |
| **B2B SaaS provozovatelé** | Riziko nesplacení, churn predikce | API, webhooks, Pro/Enterprise |
| **Marketplace, logistika, e-shop B2B** | Onboarding partnerů, dropshipperi | API + plugin |

---

## 5. Návrhy názvů a domén

### Kritéria

- Krátký, snadno vyslovitelný i česky i anglicky (kvůli budoucímu rozšíření na SK + EU)
- Asociace s "důvěra / kredit / firma / riziko / skóre"
- `.cz` doména volná (klíčové), ideálně i `.eu` / `.io` / `.com`
- Není konflikt s existujícími značkami (žádné soudní spory)

### Kandidáti

| Název | Význam / asociace | Vhodný cíl | Status (orientačně) |
|---|---|---|---|
| **Kredo** | Lat. "věřím" - kredibilita | OSVČ, malé firmy | kredo.cz pravděpodobně obsazená - ověřit |
| **Kredito** | Kredit, credit | Univerzální | Ověřit |
| **Solventis** | Solventnost | Účetní, B2B | Ověřit |
| **Trustly** / **Truster** / **Trustea** | Trust, důvěra | EN-friendly | trustly.com je zaplaceno (zahraniční fintech) - vyhnout se |
| **FiRisk** | Firma + Risk | Profi tone, B2B | Ověřit |
| **Firscore** | Firm + Score | Skóring | Ověřit |
| **Skorista** / **Skorka** | Skóre, hravé | OSVČ | Skorka může znít infantilně |
| **Prověř** / **Prověřka** | Vlastní české sloveso | Místní, CZ-only | prover.cz - ověřit |
| **Verifio** | Verify | Univerzální | Ověřit |
| **Solvento** | Solventnost, ital. nádech | B2B | Ověřit |
| **Kreditus** | Lat. credit | Profi | Ověřit |
| **Bonita** | Bonita = kredibilita (CZ termín) | CZ-native | bonita.cz pravděpodobně obsazená |
| **Vivid** | Živá / aktivní firma | Moderní | vivid.cz pravděpodobně obsazená (Vivid Money) - vyhnout se |
| **Stabil** / **Stabilio** | Stabilita firmy | B2B | Ověřit |
| **Pulz** | Tep firmy, denní monitoring | Hravější značka | Pravděpodobně obsazená |
| **Lustro** | Lustrace - hraje s "look", "luster" | EN/CZ funguje | Ověřit |
| **Kredibo** | Kredit + jednoduchý sufix | OSVČ | Pravděpodobně volné |
| **Riskee** | Risk + casual | Mobile-first | Ověřit |
| **CheckCo** | Check + co (firma) | EN-first | Ověřit |
| **Firmly** | Slovní hříčka firm/pevný | EN-friendly | Pravděpodobně obsazené v EN |

### Můj užší výběr (top 5)

Hodnotil jsem podle: zapamatovatelnost, srozumitelnost cíle, .cz dostupnost (odhad), neporušuje existující brandy:

1. **Kredibo** (`kredibo.cz`) - od "kredibilita", krátké, ozvučné, dobré pro CZ i SK
2. **FiRisk** (`firisk.cz`) - jasně B2B, "firma + risk", krátké
3. **Solvento** (`solvento.cz`) - solventnost, romantický nádech, dobré pro premium
4. **Lustro** (`lustro.cz`) - hraje s lustrací, "look", "luster"; SEO friendly pro CZ termín
5. **Bonio** / **Bonita+** (`bonio.cz`, `mojebonita.cz`) - na bázi českého termínu "bonita" který B2B zákazníci znají

### Dostupnost domén - jak ověřit

Já nemůžu z tohoto prostředí (omezený přístup k whois přes bash) přímo zavolat whois, ale pro tebe doporučuji:

1. **CZ.NIC whois:** https://www.nic.cz/whois/ - zadáš doménu, dostaneš jednoznačnou odpověď zdarma
2. **Wedos / Forpsi:** vyhledávač registrátora rovnou nabídne i alternativy
3. **Pro `.com`:** namecheap.com nebo porkbun.com - často taky levnější než český registrátor

Doporučuji koupit balíček `.cz + .com + .eu + .io` pro jistotu (cca 1 500-2 500 Kč/rok celkem). `.io` je drahá (~700-1 200 Kč/rok), ostatní jsou levnější.

---

## 6. Doporučená pozice a strategie vstupu

### Pozice (1 věta)

> "Nejjednodušší způsob, jak hlídat kredibilitu zákazníků a dodavatelů - pro freelancery, OSVČ a malé firmy. Zdarma do 5 firem, od 199 Kč pro 20+ firem."

### Go-to-market

1. **MVP za 2-3 měsíce** - ISIR + ARES + DPH + e-mail alerty + 1 platba (Stripe/Comgate). PocketBase nebo Supabase jako backend. Použít tvůj Kotlin + Spring Boot stack, nebo Go/Node pro rychlejší MVP.
2. **Freemium akvizice** - free tier 3-5 IČO. Brand "zdarma navždy" pro micro use-case je důležitý.
3. **Content marketing** - blog "Jak prověřit firmu před spoluprací", "Co dělat, když dlužník vyhlásí insolvenci", "Top 10 nespolehlivých plátců DPH 2026". Cíl: SEO na "prověření firmy", "kontrola IČO", "insolvenční rejstřík".
4. **Integrace = akvizice** - Fakturoid plugin, iDoklad plugin = bezplatný marketing kanál (jejich uživatelé hledají credit check). Creditcheck dělá free integraci, taky to může být brutální differentiator.
5. **MCP server od dne 1** - "AI-first credit check". Cílí to na technicky vyspělé zákazníky a media buzz ("první český credit check s MCP serverem").
6. **Affiliate s účetními** - 20-30 % první rok, oni mají portfolia klientů.

### Technické riziko

- **Centrální evidence exekucí** - placené per query (CEE komora), velmi striktní podmínky použití, vyžaduje smlouvu. Bez toho ale chybí jeden z klíčových rizikových signálů.
- **GDPR a osobní údaje** - FO podnikatelé mají v ISIR jméno a RČ, je třeba pravidla pro mazání a retention.
- **Rate limits oficiálních zdrojů** - ISIR má limity, musíš mít vlastní cache a inkrementální sync (Kafka/RabbitMQ pattern, který znáš ze své práce).
- **Real-time freshness** - ISIR má SOAP webservice s minutovou aktualizací; ARES denní; sbírka listin po dnech až týdnech.

---

## 7. Rychlé porovnání - kde to bolí konkurenci

| Slabost konkurence | Tvá příležitost |
|---|---|
| CRIBIS, D&B - drahé, sales-led, složitá UX | Self-service, jednoduchá UX |
| Chytrý rejstřík - od 399 Kč, "fér ceník" ale není freemium | Free tier + sub-200 Kč Solo |
| Rejstříky.info - vizuálně zastaralé, formuláře | Moderní UI/UX, mobile-first |
| ISIR.info - jen XML API, technický | UI + AI vrstva nad daty |
| Creditcheck - silný v integracích, ale slabší v UI a vlastním webu | Stejně silné integrace + lepší web/app |
| IsirCheck - jen 20 lookupů/den zdarma, jednoúčelové | Univerzální tool |

---

## 8. Co dál

Pokud do toho půjdeš, doporučuji:

1. **Validace** - 10-15 rozhovorů s OSVČ, účetními a malými s.r.o. (1-2 týdny). Otázky: kolik si platí dnes, jak často kontrolují, co by je přinutilo zaplatit.
2. **Krátký landing page test** - waitlist + tarify, ad spend 5 000 Kč na Sklik/Meta, měření CTR a sign-up rate.
3. **Doménový balíček** - jakmile máš název, kup `.cz + .com + .eu` najednou (cca 1 500 Kč/rok).
4. **Právní due diligence** - podmínky použití ISIR API, CEE smlouva, GDPR DPA šablona.
5. **Tech stack rozhodnutí** - tvůj Kotlin + Spring Boot je solidní, ale pro rychlé MVP zvaž PocketBase / Supabase + Node/Bun frontend. Kafka/RabbitMQ se hodí pro async sync z ISIR až po Business tarifu.

Hodně štěstí. Tohle je rozumný prostor - zákazníci tu jsou, konkurence není dokonalá, a tvé technické zázemí (distribuované systémy, integrace, AI agenti) je přesně to, co tomu trhu chybí.