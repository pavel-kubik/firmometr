# English Mutation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full English version of all 10 routes under the `/en/` URL prefix using Transloco, with a CZ/EN toggle in the nav, reusing all existing components.

**Architecture:** `@jsverse/transloco` with an `HttpLoader` reads `assets/i18n/{lang}.json`. Language is set via a functional route resolver on the `/en` parent route — Czech routes are unchanged. Every component imports `TranslocoModule` and uses the `transloco` pipe; nav and footer compute language-aware links from `TranslocoService.langChanges$`.

**Tech Stack:** Angular 18 standalone, `@jsverse/transloco` ^7, `toSignal` from `@angular/core/rxjs-interop`

---

## File Map

| Action | Path |
|---|---|
| Create | `assets/i18n/cs.json` |
| Create | `assets/i18n/en.json` |
| Create | `src/app/core/services/route-map.service.ts` |
| Modify | `src/app/app.config.ts` |
| Modify | `src/app/app.routes.ts` |
| Modify | `src/app/public/public-nav/public-nav.component.ts` |
| Modify | `src/app/public/public-footer/public-footer.component.ts` |
| Modify | `src/app/public/landing/landing.component.ts` |
| Modify | `src/app/public/pricing/pricing.component.ts` |
| Modify | `src/app/public/contact/contact.component.ts` |
| Modify | `src/app/public/legal-terms/legal-terms.component.ts` |
| Modify | `src/app/public/legal-gdpr/legal-gdpr.component.ts` |
| Modify | `src/app/features/search/search.component.ts` |
| Modify | `src/app/features/search/subject-detail/subject-detail.component.ts` |
| Modify | `src/app/features/dashboard/dashboard.component.ts` |
| Modify | `src/app/features/auth/login.component.ts` |
| Modify | `src/app/features/auth/register.component.ts` |

---

## Task 1: Install Transloco and create translation files

**Files:**
- Create: `assets/i18n/cs.json`
- Create: `assets/i18n/en.json`
- Modify: `src/app/app.config.ts`

- [ ] **Step 1: Install the package**

```bash
npm install @jsverse/transloco
```

Expected: `@jsverse/transloco` appears in `package.json` dependencies.

- [ ] **Step 2: Create `assets/i18n/cs.json`**

```json
{
  "nav.search": "Vyhledat",
  "nav.watched": "Sledované",
  "nav.pricing": "Ceny",
  "nav.contact": "Kontakt",
  "nav.login": "Přihlásit se",
  "nav.try_free": "Vyzkoušet zdarma →",
  "nav.logout": "Odhlásit se",
  "nav.open_menu": "Otevřít menu",
  "nav.close_menu": "Zavřít menu",
  "nav.lang_switch": "EN",

  "footer.tagline": "Prověřování českých firem z veřejných rejstříků.",
  "footer.company": "Butterfly Flowers s.r.o., IČO 07102127",
  "footer.col_product": "Produkt",
  "footer.search": "Vyhledat firmu",
  "footer.pricing": "Ceny",
  "footer.contact": "Kontakt",
  "footer.col_legal": "Právní",
  "footer.terms": "Obchodní podmínky",
  "footer.gdpr": "GDPR / Ochrana dat",
  "footer.copyright": "© 2026 Firmometr. Všechna práva vyhrazena.",

  "landing.badge": "✓ Bez registrace, bez kreditní karty",
  "landing.hero_title_line1": "Prověřte každého",
  "landing.hero_title_line2": "obchodního partnera",
  "landing.hero_title_em": "za 10 sekund",
  "landing.hero_sub": "Insolvence, DPH registr, obchodní rejstřík a statutáři — vše z českých veřejných rejstříků na jednom místě.",
  "landing.cta_search": "Vyhledat firmu zdarma",
  "landing.cta_pricing": "Zobrazit ceny",
  "landing.demo_label": "ŽIVÉ DEMO",
  "landing.search_placeholder": "Zadejte IČO nebo název firmy…",
  "landing.search_btn": "Hledat",
  "landing.trust_isir": "ISIR — Insolvenční rejstřík",
  "landing.trust_dph": "DPH — Nespolehliví plátci",
  "landing.trust_or": "OR — Obchodní rejstřík",
  "landing.trust_ares": "ARES — Základní údaje",
  "landing.features_label": "Co Firmometr kontroluje",
  "landing.features_title_line1": "Kompletní prověření firmy",
  "landing.features_title_line2": "z veřejných rejstříků",
  "landing.feat_isir_title": "Insolvenční rejstřík (ISIR)",
  "landing.feat_isir_desc": "Okamžitá kontrola aktivních i historických insolvencí. Semafor: čistá / minulý dlužník / aktivní řízení.",
  "landing.feat_dph_title": "Nespolehliví plátci DPH",
  "landing.feat_dph_desc": "Databáze Ministerstva financí — ověření spolehlivosti plátce nebo zjištění, zda firma DPH vůbec odvádí.",
  "landing.feat_or_title": "Obchodní rejstřík",
  "landing.feat_or_desc": "Statutáři, právní forma, datum vzniku, základní kapitál a stav firmy přímo z justice.cz.",
  "landing.feat_ares_title": "Adresa a základní údaje",
  "landing.feat_ares_desc": "Ověřená adresa ze ČÚZK / RUIAN, IČO, DIČ, právní forma a celý profil z ARES.",
  "landing.feat_watchlist_title": "Watchlist a sledování",
  "landing.feat_watchlist_desc": "Uložte si firmy do sledovaných a mějte přehled o jejich stavu bez nutnosti hledat znova.",
  "landing.feat_semaphore_title": "Rizikový semafor",
  "landing.feat_semaphore_desc": "Vizuální přehled: zelená = ok, oranžová = pozor, červená = problém. Rychlé rozhodnutí na první pohled.",
  "landing.how_label": "Jak to funguje",
  "landing.how_title": "3 kroky k úplnému přehledu",
  "landing.how_step1_title": "Zadejte IČO nebo název",
  "landing.how_step1_desc": "Vyhledejte firmu bez registrace — okamžitě a zdarma.",
  "landing.how_step2_title": "Získejte kompletní profil",
  "landing.how_step2_desc": "Firmometr agreguje data z ISIR, DPH registru, ARES a OR do přehledného profilu.",
  "landing.how_step3_title": "Sledujte změny",
  "landing.how_step3_desc": "Přidejte firmu do watchlistu a mějte vždy přehled o aktuálním stavu.",
  "landing.plans_label": "Plány",
  "landing.plans_title": "Vyberte plán podle potřeb",
  "landing.plans_sub": "Základní prověření zdarma. Pokročilé funkce pro registrované uživatele.",
  "landing.plan_free_name": "Free",
  "landing.plan_free_price": "Zdarma navždy",
  "landing.plan_free_feat1": "5 vyhledání za relaci",
  "landing.plan_free_feat2": "ISIR + DPH semafor",
  "landing.plan_free_feat3": "Základní profil firmy",
  "landing.plan_free_cta": "Začít zdarma",
  "landing.plan_solo_badge": "PŘIPRAVUJEME",
  "landing.plan_solo_name": "Solo",
  "landing.plan_solo_price": "Brzy dostupné",
  "landing.plan_solo_feat1": "20 sledovaných IČO",
  "landing.plan_solo_feat2": "ISIR + DPH + OR alerty",
  "landing.plan_solo_feat3": "E-mailová upozornění",
  "landing.plan_solo_feat4": "CSV import",
  "landing.plan_solo_cta": "Přidat na waitlist",
  "landing.plan_business_badge": "PŘIPRAVUJEME",
  "landing.plan_business_name": "Business",
  "landing.plan_business_price": "Brzy dostupné",
  "landing.plan_business_feat1": "100 sledovaných IČO",
  "landing.plan_business_feat2": "Vše ze Solo +",
  "landing.plan_business_feat3": "Export Excel / PDF",
  "landing.plan_business_feat4": "Multi-user a role",
  "landing.plan_business_feat5": "Sbírka listin",
  "landing.plan_business_cta": "Přidat na waitlist",
  "landing.cta_section_label": "Začněte dnes",
  "landing.cta_section_title": "Připraveni prověřit svého partnera?",
  "landing.cta_section_sub": "Bezplatné vyhledávání bez registrace. Pokročilé funkce po přihlášení.",
  "landing.cta_section_btn": "Vyhledat firmu zdarma",

  "pricing.label": "Plány",
  "pricing.title": "Vyberte plán podle potřeb",
  "pricing.sub": "Základní prověření zdarma. Pokročilé funkce pro registrované uživatele.",
  "pricing.plan_free_name": "Free",
  "pricing.plan_free_price": "Zdarma navždy",
  "pricing.plan_free_feat1": "5 vyhledání za relaci",
  "pricing.plan_free_feat2": "ISIR + DPH semafor",
  "pricing.plan_free_feat3": "Základní profil firmy",
  "pricing.plan_free_cta": "Začít zdarma",
  "pricing.plan_solo_badge": "PŘIPRAVUJEME",
  "pricing.plan_solo_name": "Solo",
  "pricing.plan_solo_price": "Brzy dostupné",
  "pricing.plan_solo_feat1": "20 sledovaných IČO",
  "pricing.plan_solo_feat2": "ISIR + DPH + OR alerty",
  "pricing.plan_solo_feat3": "E-mailová upozornění",
  "pricing.plan_solo_feat4": "CSV import",
  "pricing.plan_solo_cta": "Přidat na waitlist",
  "pricing.plan_business_badge": "PŘIPRAVUJEME",
  "pricing.plan_business_name": "Business",
  "pricing.plan_business_price": "Brzy dostupné",
  "pricing.plan_business_feat1": "100 sledovaných IČO",
  "pricing.plan_business_feat2": "Vše ze Solo +",
  "pricing.plan_business_feat3": "Export Excel / PDF",
  "pricing.plan_business_feat4": "Multi-user a role",
  "pricing.plan_business_feat5": "Sbírka listin",
  "pricing.plan_business_cta": "Přidat na waitlist",
  "pricing.waitlist_label": "WAITLIST",
  "pricing.waitlist_title": "Upozorníme vás, jakmile bude plán dostupný",
  "pricing.waitlist_sub": "Vyplňte e-mail a my vás budeme první informovat při spuštění.",
  "pricing.waitlist_placeholder": "vas@email.cz",
  "pricing.waitlist_btn": "Přidat na waitlist",
  "pricing.waitlist_note": "Bez spamu. Odhlásit se lze kdykoliv.",
  "pricing.waitlist_success_title": "Jste na listině!",
  "pricing.waitlist_success_sub": "Ozveme se vám jako prvním, jakmile budou plány k dispozici.",

  "contact.label": "Kontakt",
  "contact.title": "Napište nám",
  "contact.sub": "Máte otázku, nápad nebo chcete vědět více? Rádi se ozveme.",
  "contact.info_title": "Kontaktní údaje",
  "contact.email_label": "E-mail",
  "contact.company_label": "Provozovatel",
  "contact.response_label": "Odezva",
  "contact.response_value": "Obvykle do 24–48 hodin",
  "contact.form_name_label": "Jméno",
  "contact.form_name_placeholder": "Jan Novák",
  "contact.form_email_label": "E-mail *",
  "contact.form_message_label": "Zpráva *",
  "contact.form_message_placeholder": "Vaše zpráva…",
  "contact.form_btn": "Odeslat zprávu",
  "contact.success_title": "Zpráva odeslána!",
  "contact.success_sub": "Ozveme se vám co nejdříve.",

  "terms.label": "Právní dokumenty",
  "terms.title": "Obchodní podmínky",
  "terms.effective": "Účinné od 16. 5. 2026",

  "gdpr.label": "Právní dokumenty",
  "gdpr.title": "Zásady ochrany osobních údajů",
  "gdpr.effective": "Účinné od 16. 5. 2026",

  "search.label": "Vyhledávání",
  "search.title": "Vyhledat subjekt",
  "search.sub": "Ověřte solventnost a registrační stav českých firem z veřejných rejstříků (ARES, ISIR, DPH).",
  "search.input_label": "IČO nebo název firmy",
  "search.placeholder": "Např. 27082440 nebo Avast",
  "search.btn": "Hledat",
  "search.limit_msg": "Dosáhli jste limitu {{ freeCap }} bezplatných vyhledávání za {{ windowMinutes }} minut.",
  "search.limit_retry": "Zkuste to znovu za {{ countdown }}.",
  "search.login_cta": "Přihlásit se",
  "search.result_count": "Nalezeno: {{ total }} subjektů",
  "search.col_ico": "IČO",
  "search.col_name": "Název",
  "search.col_address": "Sídlo",
  "search.col_status": "Stav",
  "search.no_results": "Žádné výsledky nenalezeny.",

  "detail.watch": "Sledovat",
  "detail.unwatch": "Přestat sledovat",
  "detail.login_cta": "Přihlásit se",
  "detail.qr_title": "QR kód stránky",
  "detail.col_ico": "IČO",
  "detail.col_dic": "DIČ",
  "detail.col_legal_form": "Právní forma",
  "detail.col_address": "Sídlo",
  "detail.col_founded": "Datum vzniku",
  "detail.col_status": "Stav",
  "detail.isir_clear": "Žádná aktivní insolvenční řízení",
  "detail.isir_active": "Subjekt je dlužníkem v aktivním insolvenčním řízení!",
  "detail.isir_co_debtor": "Subjekt je společným dlužníkem (SNM) v aktivním řízení.",
  "detail.isir_past": "Subjekt byl v minulosti dlužníkem v insolvenčním řízení (řízení již skončilo).",
  "detail.dph_unavailable": "Data o DPH nejsou momentálně dostupná.",
  "detail.dph_not_registered": "Subjekt není evidován jako plátce DPH.",
  "detail.dph_reliable": "Spolehlivý plátce DPH",
  "detail.dph_unreliable": "Nespolehlivý plátce DPH!",
  "detail.dph_accounts": "Zveřejněné účty:",
  "detail.or_directors": "Statutáři",
  "detail.or_no_directors": "Žádní aktivní statutáři nenalezeni.",
  "detail.show_past_directors": "Zobrazit historii",
  "detail.hide_past_directors": "Skrýt historii",
  "detail.watched_snack": "{{ name }} přidán ke sledování",
  "detail.unwatched_snack": "{{ name }} odebrán ze sledování",

  "dashboard.title": "Sledované subjekty",
  "dashboard.add_btn": "+ Přidat subjekt",
  "dashboard.empty_title": "Zatím žádné sledované subjekty",
  "dashboard.empty_sub": "Vyhledejte firmu nebo osobu a přidejte ji ke sledování.",
  "dashboard.empty_btn": "Vyhledat subjekt",
  "dashboard.demo_notice": "Přihlaste se pro správu vlastního portfolia sledovaných subjektů.",
  "dashboard.badge_active_debtor": "Aktivní insolvenční řízení",
  "dashboard.badge_co_debtor": "Spoluodpovědný dlužník",
  "dashboard.badge_past_debtor": "Minulý dlužník",
  "dashboard.badge_clear": "Bez insolvencí",
  "dashboard.badge_dph": "Nespolehlivý plátce DPH",
  "dashboard.last_checked": "Poslední kontrola:",
  "dashboard.not_checked": "Zatím nekontrolováno",
  "dashboard.btn_detail": "Detail →",
  "dashboard.btn_remove": "Odebrat",
  "dashboard.removed_snack": "odebrán ze sledování",
  "dashboard.auth_title": "Začněte sledovat firmy ještě dnes",
  "dashboard.auth_sub": "Zaregistrujte se zdarma a získejte přehled o svých obchodních partnerech.",
  "dashboard.tab_login": "Přihlásit se",
  "dashboard.tab_register": "Registrovat se",
  "dashboard.login_btn_loading": "Přihlašuji…",
  "dashboard.login_btn": "Přihlásit se",
  "dashboard.register_btn_loading": "Registruji…",
  "dashboard.register_btn": "Zaregistrovat se",
  "dashboard.confirm_title": "Potvrďte e-mail",
  "dashboard.confirm_msg": "Zaslali jsme vám potvrzovací odkaz. Klikněte na něj pro dokončení registrace.",

  "common.email_label": "E-mail",
  "common.password_label": "Heslo",
  "common.confirm_password_label": "Potvrdit heslo",
  "common.email_required": "E-mail je povinný",
  "common.email_invalid": "Zadejte platný e-mail",
  "common.password_required": "Heslo je povinné",
  "common.password_minlength": "Heslo musí mít alespoň 6 znaků",
  "common.passwords_mismatch": "Hesla se neshodují",

  "login.title": "Přihlásit se",
  "login.tab_password": "Email a heslo",
  "login.tab_magic": "Magic link",
  "login.magic_hint": "Zadejte svůj e-mail a pošleme vám přihlašovací odkaz.",
  "login.btn_loading": "Přihlašuji…",
  "login.btn": "Přihlásit se",
  "login.magic_btn_loading": "Odesílám…",
  "login.magic_btn": "Odeslat odkaz",
  "login.no_account": "Nemáte účet?",
  "login.register_link": "Zaregistrujte se",
  "login.magic_sent_title": "Odkaz odeslán!",
  "login.magic_sent_msg": "Zkontrolujte svůj e-mail a klikněte na přihlašovací odkaz.",

  "register.title": "Registrace",
  "register.btn_loading": "Registruji…",
  "register.btn": "Zaregistrovat se",
  "register.has_account": "Již máte účet?",
  "register.login_link": "Přihlaste se",
  "register.confirm_title": "Potvrďte e-mail",
  "register.confirm_msg": "Zaslali jsme vám potvrzovací odkaz. Zkontrolujte svůj e-mail a klikněte na odkaz pro dokončení registrace.",
  "register.back_to_login": "Zpět na přihlášení"
}
```

- [ ] **Step 3: Create `assets/i18n/en.json`**

```json
{
  "nav.search": "Search",
  "nav.watched": "Watched",
  "nav.pricing": "Pricing",
  "nav.contact": "Contact",
  "nav.login": "Log in",
  "nav.try_free": "Try for free →",
  "nav.logout": "Log out",
  "nav.open_menu": "Open menu",
  "nav.close_menu": "Close menu",
  "nav.lang_switch": "CZ",

  "footer.tagline": "Verifying Czech companies from public registries.",
  "footer.company": "Butterfly Flowers s.r.o., ID 07102127",
  "footer.col_product": "Product",
  "footer.search": "Search company",
  "footer.pricing": "Pricing",
  "footer.contact": "Contact",
  "footer.col_legal": "Legal",
  "footer.terms": "Terms of Service",
  "footer.gdpr": "GDPR / Data Protection",
  "footer.copyright": "© 2026 Firmometr. All rights reserved.",

  "landing.badge": "✓ No registration, no credit card",
  "landing.hero_title_line1": "Check every",
  "landing.hero_title_line2": "business partner",
  "landing.hero_title_em": "in 10 seconds",
  "landing.hero_sub": "Insolvency, VAT registry, commercial register and directors — all from Czech public registries in one place.",
  "landing.cta_search": "Search company for free",
  "landing.cta_pricing": "View pricing",
  "landing.demo_label": "LIVE DEMO",
  "landing.search_placeholder": "Enter company ID or name…",
  "landing.search_btn": "Search",
  "landing.trust_isir": "ISIR — Insolvency Register",
  "landing.trust_dph": "VAT — Unreliable payers",
  "landing.trust_or": "CR — Commercial Register",
  "landing.trust_ares": "ARES — Basic data",
  "landing.features_label": "What Firmometr checks",
  "landing.features_title_line1": "Complete company verification",
  "landing.features_title_line2": "from public registries",
  "landing.feat_isir_title": "Insolvency Register (ISIR)",
  "landing.feat_isir_desc": "Instant check of active and historical insolvencies. Traffic light: clean / past debtor / active proceedings.",
  "landing.feat_dph_title": "Unreliable VAT payers",
  "landing.feat_dph_desc": "Ministry of Finance database — verify payer reliability or check if the company pays VAT at all.",
  "landing.feat_or_title": "Commercial Register",
  "landing.feat_or_desc": "Directors, legal form, founding date, share capital and company status directly from justice.cz.",
  "landing.feat_ares_title": "Address and basic data",
  "landing.feat_ares_desc": "Verified address from ČÚZK / RUIAN, company ID, VAT ID, legal form and full profile from ARES.",
  "landing.feat_watchlist_title": "Watchlist and monitoring",
  "landing.feat_watchlist_desc": "Save companies to your watchlist and track their status without searching again.",
  "landing.feat_semaphore_title": "Risk traffic light",
  "landing.feat_semaphore_desc": "Visual overview: green = ok, orange = caution, red = problem. Quick decision at a glance.",
  "landing.how_label": "How it works",
  "landing.how_title": "3 steps to complete overview",
  "landing.how_step1_title": "Enter company ID or name",
  "landing.how_step1_desc": "Search for a company without registration — instantly and for free.",
  "landing.how_step2_title": "Get complete profile",
  "landing.how_step2_desc": "Firmometr aggregates data from ISIR, VAT registry, ARES and CR into a clear profile.",
  "landing.how_step3_title": "Monitor changes",
  "landing.how_step3_desc": "Add the company to your watchlist and always stay up to date.",
  "landing.plans_label": "Plans",
  "landing.plans_title": "Choose a plan for your needs",
  "landing.plans_sub": "Basic verification for free. Advanced features for registered users.",
  "landing.plan_free_name": "Free",
  "landing.plan_free_price": "Free forever",
  "landing.plan_free_feat1": "5 searches per session",
  "landing.plan_free_feat2": "ISIR + VAT traffic light",
  "landing.plan_free_feat3": "Basic company profile",
  "landing.plan_free_cta": "Start for free",
  "landing.plan_solo_badge": "COMING SOON",
  "landing.plan_solo_name": "Solo",
  "landing.plan_solo_price": "Coming soon",
  "landing.plan_solo_feat1": "20 watched companies",
  "landing.plan_solo_feat2": "ISIR + VAT + CR alerts",
  "landing.plan_solo_feat3": "Email notifications",
  "landing.plan_solo_feat4": "CSV import",
  "landing.plan_solo_cta": "Join waitlist",
  "landing.plan_business_badge": "COMING SOON",
  "landing.plan_business_name": "Business",
  "landing.plan_business_price": "Coming soon",
  "landing.plan_business_feat1": "100 watched companies",
  "landing.plan_business_feat2": "Everything in Solo +",
  "landing.plan_business_feat3": "Excel / PDF export",
  "landing.plan_business_feat4": "Multi-user and roles",
  "landing.plan_business_feat5": "Document collection",
  "landing.plan_business_cta": "Join waitlist",
  "landing.cta_section_label": "Get started",
  "landing.cta_section_title": "Ready to verify your partner?",
  "landing.cta_section_sub": "Free search without registration. Advanced features after login.",
  "landing.cta_section_btn": "Search company for free",

  "pricing.label": "Plans",
  "pricing.title": "Choose a plan for your needs",
  "pricing.sub": "Basic verification for free. Advanced features for registered users.",
  "pricing.plan_free_name": "Free",
  "pricing.plan_free_price": "Free forever",
  "pricing.plan_free_feat1": "5 searches per session",
  "pricing.plan_free_feat2": "ISIR + VAT traffic light",
  "pricing.plan_free_feat3": "Basic company profile",
  "pricing.plan_free_cta": "Start for free",
  "pricing.plan_solo_badge": "COMING SOON",
  "pricing.plan_solo_name": "Solo",
  "pricing.plan_solo_price": "Coming soon",
  "pricing.plan_solo_feat1": "20 watched companies",
  "pricing.plan_solo_feat2": "ISIR + VAT + CR alerts",
  "pricing.plan_solo_feat3": "Email notifications",
  "pricing.plan_solo_feat4": "CSV import",
  "pricing.plan_solo_cta": "Join waitlist",
  "pricing.plan_business_badge": "COMING SOON",
  "pricing.plan_business_name": "Business",
  "pricing.plan_business_price": "Coming soon",
  "pricing.plan_business_feat1": "100 watched companies",
  "pricing.plan_business_feat2": "Everything in Solo +",
  "pricing.plan_business_feat3": "Excel / PDF export",
  "pricing.plan_business_feat4": "Multi-user and roles",
  "pricing.plan_business_feat5": "Document collection",
  "pricing.plan_business_cta": "Join waitlist",
  "pricing.waitlist_label": "WAITLIST",
  "pricing.waitlist_title": "We'll notify you as soon as the plan is available",
  "pricing.waitlist_sub": "Enter your email and we'll be the first to let you know at launch.",
  "pricing.waitlist_placeholder": "your@email.com",
  "pricing.waitlist_btn": "Join waitlist",
  "pricing.waitlist_note": "No spam. Unsubscribe anytime.",
  "pricing.waitlist_success_title": "You're on the list!",
  "pricing.waitlist_success_sub": "We'll reach out to you first as soon as plans are available.",

  "contact.label": "Contact",
  "contact.title": "Get in touch",
  "contact.sub": "Have a question, idea or want to learn more? We'd love to hear from you.",
  "contact.info_title": "Contact information",
  "contact.email_label": "Email",
  "contact.company_label": "Operator",
  "contact.response_label": "Response time",
  "contact.response_value": "Usually within 24–48 hours",
  "contact.form_name_label": "Name",
  "contact.form_name_placeholder": "John Smith",
  "contact.form_email_label": "Email *",
  "contact.form_message_label": "Message *",
  "contact.form_message_placeholder": "Your message…",
  "contact.form_btn": "Send message",
  "contact.success_title": "Message sent!",
  "contact.success_sub": "We'll get back to you as soon as possible.",

  "terms.label": "Legal documents",
  "terms.title": "Terms of Service",
  "terms.effective": "Effective from 16 May 2026",

  "gdpr.label": "Legal documents",
  "gdpr.title": "Privacy Policy",
  "gdpr.effective": "Effective from 16 May 2026",

  "search.label": "Search",
  "search.title": "Search subject",
  "search.sub": "Verify solvency and registration status of Czech companies from public registries (ARES, ISIR, VAT).",
  "search.input_label": "Company ID or name",
  "search.placeholder": "E.g. 27082440 or Avast",
  "search.btn": "Search",
  "search.limit_msg": "You have reached the limit of {{ freeCap }} free searches per {{ windowMinutes }} minutes.",
  "search.limit_retry": "Try again in {{ countdown }}.",
  "search.login_cta": "Log in",
  "search.result_count": "Found: {{ total }} subjects",
  "search.col_ico": "Reg. No.",
  "search.col_name": "Name",
  "search.col_address": "Address",
  "search.col_status": "Status",
  "search.no_results": "No results found.",

  "detail.watch": "Monitor",
  "detail.unwatch": "Stop monitoring",
  "detail.login_cta": "Log in",
  "detail.qr_title": "Page QR code",
  "detail.col_ico": "Reg. No.",
  "detail.col_dic": "VAT No.",
  "detail.col_legal_form": "Legal form",
  "detail.col_address": "Address",
  "detail.col_founded": "Founded",
  "detail.col_status": "Status",
  "detail.isir_clear": "No active insolvency proceedings",
  "detail.isir_active": "Subject is a debtor in active insolvency proceedings!",
  "detail.isir_co_debtor": "Subject is a joint debtor (SNM) in active proceedings.",
  "detail.isir_past": "Subject was previously a debtor in insolvency proceedings (proceedings have ended).",
  "detail.dph_unavailable": "VAT data is currently unavailable.",
  "detail.dph_not_registered": "Subject is not registered as a VAT payer.",
  "detail.dph_reliable": "Reliable VAT payer",
  "detail.dph_unreliable": "Unreliable VAT payer!",
  "detail.dph_accounts": "Published accounts:",
  "detail.or_directors": "Directors",
  "detail.or_no_directors": "No active directors found.",
  "detail.show_past_directors": "Show history",
  "detail.hide_past_directors": "Hide history",
  "detail.watched_snack": "{{ name }} added to monitoring",
  "detail.unwatched_snack": "{{ name }} removed from monitoring",

  "dashboard.title": "Watched subjects",
  "dashboard.add_btn": "+ Add subject",
  "dashboard.empty_title": "No watched subjects yet",
  "dashboard.empty_sub": "Search for a company or person and add it to monitoring.",
  "dashboard.empty_btn": "Search subject",
  "dashboard.demo_notice": "Log in to manage your own portfolio of watched subjects.",
  "dashboard.badge_active_debtor": "Active insolvency proceedings",
  "dashboard.badge_co_debtor": "Co-responsible debtor",
  "dashboard.badge_past_debtor": "Past debtor",
  "dashboard.badge_clear": "No insolvencies",
  "dashboard.badge_dph": "Unreliable VAT payer",
  "dashboard.last_checked": "Last check:",
  "dashboard.not_checked": "Not checked yet",
  "dashboard.btn_detail": "Detail →",
  "dashboard.btn_remove": "Remove",
  "dashboard.removed_snack": "removed from monitoring",
  "dashboard.auth_title": "Start monitoring companies today",
  "dashboard.auth_sub": "Register for free and get an overview of your business partners.",
  "dashboard.tab_login": "Log in",
  "dashboard.tab_register": "Register",
  "dashboard.login_btn_loading": "Logging in…",
  "dashboard.login_btn": "Log in",
  "dashboard.register_btn_loading": "Registering…",
  "dashboard.register_btn": "Register",
  "dashboard.confirm_title": "Confirm your email",
  "dashboard.confirm_msg": "We sent you a confirmation link. Click it to complete registration.",

  "common.email_label": "Email",
  "common.password_label": "Password",
  "common.confirm_password_label": "Confirm password",
  "common.email_required": "Email is required",
  "common.email_invalid": "Please enter a valid email",
  "common.password_required": "Password is required",
  "common.password_minlength": "Password must be at least 6 characters",
  "common.passwords_mismatch": "Passwords do not match",

  "login.title": "Log in",
  "login.tab_password": "Email and password",
  "login.tab_magic": "Magic link",
  "login.magic_hint": "Enter your email and we'll send you a login link.",
  "login.btn_loading": "Logging in…",
  "login.btn": "Log in",
  "login.magic_btn_loading": "Sending…",
  "login.magic_btn": "Send link",
  "login.no_account": "Don't have an account?",
  "login.register_link": "Register",
  "login.magic_sent_title": "Link sent!",
  "login.magic_sent_msg": "Check your email and click the login link.",

  "register.title": "Register",
  "register.btn_loading": "Registering…",
  "register.btn": "Register",
  "register.has_account": "Already have an account?",
  "register.login_link": "Log in",
  "register.confirm_title": "Confirm your email",
  "register.confirm_msg": "We sent you a confirmation link. Check your email and click the link to complete registration.",
  "register.back_to_login": "Back to login"
}
```

- [ ] **Step 4: Configure Transloco in `app.config.ts`**

Replace the contents of `src/app/app.config.ts`:

```typescript
import { APP_INITIALIZER, ApplicationConfig, ErrorHandler, inject, isDevMode, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient, HttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideTransloco, TranslocoLoader, Translation } from '@jsverse/transloco';
import * as Sentry from '@sentry/angular';
import { routes } from './app.routes';

class AppTranslocoLoader implements TranslocoLoader {
  private http = inject(HttpClient);
  getTranslation(lang: string) {
    return this.http.get<Translation>(`/assets/i18n/${lang}.json`);
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    provideTransloco({
      config: {
        availableLangs: ['cs', 'en'],
        defaultLang: 'cs',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: AppTranslocoLoader,
    }),
    { provide: ErrorHandler, useValue: Sentry.createErrorHandler() },
    { provide: Sentry.TraceService, deps: [Router] },
    { provide: APP_INITIALIZER, useFactory: () => () => {}, deps: [Sentry.TraceService], multi: true },
  ]
};
```

- [ ] **Step 5: Verify build**

```bash
ng build --configuration development 2>&1 | tail -20
```

Expected: build succeeds, no Transloco import errors.

- [ ] **Step 6: Commit**

```bash
git add assets/i18n/cs.json assets/i18n/en.json src/app/app.config.ts package.json package-lock.json
git commit -m "feat: install Transloco and create translation files"
```

---

## Task 2: RouteMapService and /en routes

**Files:**
- Create: `src/app/core/services/route-map.service.ts`
- Modify: `src/app/app.routes.ts`

- [ ] **Step 1: Create `src/app/core/services/route-map.service.ts`**

```typescript
import { Injectable } from '@angular/core';

const CS_TO_EN: Record<string, string> = {
  '/': '/en',
  '/ceny': '/en/pricing',
  '/kontakt': '/en/contact',
  '/obchodni-podminky': '/en/terms',
  '/gdpr': '/en/gdpr',
  '/dashboard': '/en/dashboard',
  '/search': '/en/search',
  '/login': '/en/login',
  '/register': '/en/register',
};

const EN_TO_CS: Record<string, string> = Object.fromEntries(
  Object.entries(CS_TO_EN).map(([k, v]) => [v, k])
);

@Injectable({ providedIn: 'root' })
export class RouteMapService {
  toEnglish(csPath: string): string {
    const icoMatch = csPath.match(/^\/search\/(.+)$/);
    if (icoMatch) return `/en/search/${icoMatch[1]}`;
    return CS_TO_EN[csPath] ?? '/en';
  }

  toCzech(enPath: string): string {
    const icoMatch = enPath.match(/^\/en\/search\/(.+)$/);
    if (icoMatch) return `/search/${icoMatch[1]}`;
    return EN_TO_CS[enPath] ?? '/';
  }

  isEnglish(path: string): boolean {
    return path === '/en' || path.startsWith('/en/');
  }
}
```

- [ ] **Step 2: Update `src/app/app.routes.ts`**

```typescript
import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./public/landing/landing.component').then(m => m.LandingComponent) },
  { path: 'ceny', loadComponent: () => import('./public/pricing/pricing.component').then(m => m.PricingComponent) },
  { path: 'kontakt', loadComponent: () => import('./public/contact/contact.component').then(m => m.ContactComponent) },
  { path: 'obchodni-podminky', loadComponent: () => import('./public/legal-terms/legal-terms.component').then(m => m.LegalTermsComponent) },
  { path: 'gdpr', loadComponent: () => import('./public/legal-gdpr/legal-gdpr.component').then(m => m.LegalGdprComponent) },
  { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'search', loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent) },
  { path: 'search/:ico', loadComponent: () => import('./features/search/subject-detail/subject-detail.component').then(m => m.SubjectDetailComponent) },
  { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent) },
  {
    path: 'en',
    resolve: { _lang: () => { inject(TranslocoService).setActiveLang('en'); return 'en'; } },
    children: [
      { path: '', pathMatch: 'full', loadComponent: () => import('./public/landing/landing.component').then(m => m.LandingComponent) },
      { path: 'pricing', loadComponent: () => import('./public/pricing/pricing.component').then(m => m.PricingComponent) },
      { path: 'contact', loadComponent: () => import('./public/contact/contact.component').then(m => m.ContactComponent) },
      { path: 'terms', loadComponent: () => import('./public/legal-terms/legal-terms.component').then(m => m.LegalTermsComponent) },
      { path: 'gdpr', loadComponent: () => import('./public/legal-gdpr/legal-gdpr.component').then(m => m.LegalGdprComponent) },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'search', loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent) },
      { path: 'search/:ico', loadComponent: () => import('./features/search/subject-detail/subject-detail.component').then(m => m.SubjectDetailComponent) },
      { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent) },
    ],
  },
];
```

- [ ] **Step 3: Verify build**

```bash
ng build --configuration development 2>&1 | tail -10
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/app/core/services/route-map.service.ts src/app/app.routes.ts
git commit -m "feat: add RouteMapService and /en child routes"
```

---

## Task 3: Update PublicNavComponent

**Files:**
- Modify: `src/app/public/public-nav/public-nav.component.ts`

The nav must: (1) replace all hardcoded strings with `transloco` pipe, (2) make all links language-aware using computed signals, (3) show a CZ/EN switcher.

- [ ] **Step 1: Replace the full component**

```typescript
import { AsyncPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../../core/services/auth.service';
import { RouteMapService } from '../../core/services/route-map.service';

@Component({
  selector: 'app-public-nav',
  standalone: true,
  imports: [AsyncPipe, RouterLink, RouterLinkActive, TranslocoModule],
  template: `
    <nav class="pub-nav">
      <div class="pub-nav-inner">
        <a class="pub-logo" [routerLink]="logoLink()">FIRM<span>O</span>METR</a>

        <div class="pub-nav-links">
          <a [routerLink]="searchLink()" routerLinkActive="nav-active" (click)="menuOpen.set(false)">{{ 'nav.search' | transloco }}</a>
          <a [routerLink]="dashboardLink()" routerLinkActive="nav-active" (click)="menuOpen.set(false)">{{ 'nav.watched' | transloco }}</a>
          <a [routerLink]="pricingLink()" routerLinkActive="nav-active" (click)="menuOpen.set(false)">{{ 'nav.pricing' | transloco }}</a>
          <a [routerLink]="contactLink()" routerLinkActive="nav-active" (click)="menuOpen.set(false)">{{ 'nav.contact' | transloco }}</a>
        </div>

        <div class="pub-nav-actions">
          @if (user$ | async; as user) {
            <div class="nav-user">
              <button class="user-btn" (click)="userMenuOpen.set(!userMenuOpen())">
                <span class="user-email">{{ user.email }}</span>
                <span class="chevron">▾</span>
              </button>
              @if (userMenuOpen()) {
                <div class="user-dropdown">
                  <button (click)="logout()">{{ 'nav.logout' | transloco }}</button>
                </div>
              }
            </div>
          } @else {
            <a [routerLink]="loginLink()" class="pub-btn pub-btn-ghost pub-btn-sm">{{ 'nav.login' | transloco }}</a>
            <a [routerLink]="searchLink()" class="pub-btn pub-btn-primary pub-btn-sm">{{ 'nav.try_free' | transloco }}</a>
          }
          <a [routerLink]="switchLink()" class="lang-switch">{{ 'nav.lang_switch' | transloco }}</a>
          <button class="pub-hamburger" (click)="menuOpen.set(!menuOpen())" [attr.aria-label]="(menuOpen() ? 'nav.close_menu' : 'nav.open_menu') | transloco">
            {{ menuOpen() ? '✕' : '☰' }}
          </button>
        </div>
      </div>

      @if (menuOpen()) {
        <div class="pub-nav-mobile-links">
          <a [routerLink]="searchLink()" (click)="menuOpen.set(false)">{{ 'nav.search' | transloco }}</a>
          <a [routerLink]="dashboardLink()" (click)="menuOpen.set(false)">{{ 'nav.watched' | transloco }}</a>
          <a [routerLink]="pricingLink()" (click)="menuOpen.set(false)">{{ 'nav.pricing' | transloco }}</a>
          <a [routerLink]="contactLink()" (click)="menuOpen.set(false)">{{ 'nav.contact' | transloco }}</a>
          @if (user$ | async) {
            <button class="mobile-action-btn" (click)="logout()">{{ 'nav.logout' | transloco }}</button>
          } @else {
            <a [routerLink]="loginLink()" (click)="menuOpen.set(false)">{{ 'nav.login' | transloco }}</a>
          }
          <a [routerLink]="switchLink()" class="mobile-lang-switch">{{ 'nav.lang_switch' | transloco }}</a>
        </div>
      }
    </nav>
  `,
  styles: [`
    .pub-nav {
      background: #fff;
      border-bottom: 1px solid var(--pub-border);
      position: sticky; top: 0; z-index: 100;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    .pub-nav-inner {
      max-width: 1200px; margin: 0 auto; padding: 0 24px;
      display: flex; align-items: center; height: 60px; gap: 32px;
    }
    .pub-logo {
      font-size: 17px; font-weight: 900; letter-spacing: 3px;
      color: var(--pub-text); text-decoration: none; flex-shrink: 0;
    }
    .pub-logo span { color: var(--pub-green); }
    .pub-nav-links { display: flex; gap: 4px; flex: 1; }
    .pub-nav-links a {
      font-size: 14px; font-weight: 500; color: var(--pub-text-muted);
      text-decoration: none; padding: 6px 12px; border-radius: 6px; transition: all .15s;
    }
    .pub-nav-links a:hover { color: var(--pub-green); background: var(--pub-green-bg); }
    .pub-nav-links a.nav-active { color: var(--pub-green); background: var(--pub-green-light); font-weight: 600; }
    .pub-nav-actions { display: flex; align-items: center; gap: 10px; margin-left: auto; }
    .lang-switch {
      font-size: 12px; font-weight: 700; letter-spacing: 1px;
      color: var(--pub-text-muted); text-decoration: none;
      border: 1px solid var(--pub-border); border-radius: 6px;
      padding: 4px 8px; transition: all .15s;
    }
    .lang-switch:hover { color: var(--pub-green); border-color: var(--pub-green); }
    .pub-hamburger {
      display: none; background: none; border: 1px solid var(--pub-border);
      border-radius: 6px; width: 36px; height: 36px; cursor: pointer;
      font-size: 18px; color: var(--pub-text-muted); align-items: center; justify-content: center;
    }
    .nav-user { position: relative; }
    .user-btn {
      display: flex; align-items: center; gap: 6px; background: none;
      border: 1px solid var(--pub-border); border-radius: 8px;
      padding: 6px 12px; cursor: pointer; font-family: inherit; font-size: 14px;
      color: var(--pub-text-muted); transition: border-color .15s;
    }
    .user-btn:hover { border-color: var(--pub-green); color: var(--pub-green); }
    .user-email { max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .chevron { font-size: 11px; }
    .user-dropdown {
      position: absolute; right: 0; top: calc(100% + 6px);
      background: #fff; border: 1px solid var(--pub-border); border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1); min-width: 140px; z-index: 200;
    }
    .user-dropdown button {
      width: 100%; padding: 10px 16px; text-align: left; background: none;
      border: none; cursor: pointer; font-family: inherit; font-size: 14px;
      color: var(--pub-text-muted); border-radius: 8px;
    }
    .user-dropdown button:hover { background: var(--pub-green-bg); color: var(--pub-green); }
    .pub-nav-mobile-links {
      display: none; flex-direction: column; gap: 4px;
      padding: 12px 24px 16px; border-top: 1px solid var(--pub-border); background: #fff;
    }
    .pub-nav-mobile-links a {
      font-size: 15px; font-weight: 500; color: var(--pub-text-muted);
      text-decoration: none; padding: 8px 0;
    }
    .pub-nav-mobile-links a.nav-active { color: var(--pub-green); }
    .mobile-action-btn {
      background: none; border: none; padding: 8px 0; font-family: inherit;
      font-size: 15px; color: var(--pub-text-muted); cursor: pointer; text-align: left;
    }
    .mobile-lang-switch {
      font-size: 13px; font-weight: 700; color: var(--pub-green);
      padding: 8px 0; text-decoration: none;
    }
    @media (max-width: 768px) {
      .pub-nav-links { display: none; }
      .pub-hamburger { display: flex; }
      .pub-nav-actions .pub-btn-ghost,
      .pub-nav-actions .pub-btn-primary { display: none; }
      .nav-user { display: none; }
      .lang-switch { display: none; }
      .pub-nav-mobile-links { display: flex; }
    }
  `]
})
export class PublicNavComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private routeMap = inject(RouteMapService);
  private transloco = inject(TranslocoService);

  user$ = this.auth.user$;
  menuOpen = signal(false);
  userMenuOpen = signal(false);

  private url = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).urlAfterRedirects),
    ),
    { initialValue: this.router.url }
  );

  private isEn = computed(() => this.routeMap.isEnglish(this.url()));

  logoLink = computed(() => this.isEn() ? '/en' : '/');
  searchLink = computed(() => this.isEn() ? '/en/search' : '/search');
  dashboardLink = computed(() => this.isEn() ? '/en/dashboard' : '/dashboard');
  pricingLink = computed(() => this.isEn() ? '/en/pricing' : '/ceny');
  contactLink = computed(() => this.isEn() ? '/en/contact' : '/kontakt');
  loginLink = computed(() => this.isEn() ? '/en/login' : '/login');
  switchLink = computed(() =>
    this.isEn() ? this.routeMap.toCzech(this.url()) : this.routeMap.toEnglish(this.url())
  );

  async logout() {
    await this.auth.signOut();
    this.userMenuOpen.set(false);
    this.menuOpen.set(false);
    this.router.navigate([this.isEn() ? '/en' : '/']);
  }
}
```

- [ ] **Step 2: Build to verify**

```bash
ng build --configuration development 2>&1 | tail -10
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/public/public-nav/public-nav.component.ts
git commit -m "feat: update nav with Transloco strings and CZ/EN switcher"
```

---

## Task 4: Update PublicFooterComponent

**Files:**
- Modify: `src/app/public/public-footer/public-footer.component.ts`

- [ ] **Step 1: Replace the full component**

```typescript
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs';
import { TranslocoModule } from '@jsverse/transloco';
import { RouteMapService } from '../../core/services/route-map.service';

@Component({
  selector: 'app-public-footer',
  standalone: true,
  imports: [RouterLink, TranslocoModule],
  template: `
    <footer class="pub-footer">
      <div class="pub-footer-inner">
        <div class="pub-footer-brand">
          <span class="pub-logo">FIRM<span>O</span>METR</span>
          <p>{{ 'footer.tagline' | transloco }}<br>{{ 'footer.company' | transloco }}</p>
        </div>
        <div class="pub-footer-col">
          <h4>{{ 'footer.col_product' | transloco }}</h4>
          <ul>
            <li><a [routerLink]="searchLink()">{{ 'footer.search' | transloco }}</a></li>
            <li><a [routerLink]="pricingLink()">{{ 'footer.pricing' | transloco }}</a></li>
            <li><a [routerLink]="contactLink()">{{ 'footer.contact' | transloco }}</a></li>
          </ul>
        </div>
        <div class="pub-footer-col">
          <h4>{{ 'footer.col_legal' | transloco }}</h4>
          <ul>
            <li><a [routerLink]="termsLink()">{{ 'footer.terms' | transloco }}</a></li>
            <li><a [routerLink]="gdprLink()">{{ 'footer.gdpr' | transloco }}</a></li>
          </ul>
        </div>
      </div>
      <div class="pub-footer-bottom">
        <span>{{ 'footer.copyright' | transloco }}</span>
        <span>info&#64;firmometr.cz</span>
      </div>
    </footer>
  `,
  styles: [`
    .pub-footer { background: var(--pub-dark); padding: 48px 24px 0; margin-top: auto; }
    .pub-footer-inner {
      max-width: 1100px; margin: 0 auto;
      display: flex; gap: 48px; flex-wrap: wrap; padding-bottom: 40px;
    }
    .pub-footer-brand { flex: 1; min-width: 200px; }
    .pub-logo { font-size: 15px; font-weight: 900; letter-spacing: 3px; color: #fff; display: block; margin-bottom: 10px; }
    .pub-logo span { color: var(--pub-green); }
    .pub-footer-brand p { font-size: 13px; color: var(--pub-text-subtle); line-height: 1.6; margin: 0; }
    .pub-footer-col h4 { font-size: 11px; font-weight: 700; color: #475569; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 12px; }
    .pub-footer-col ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
    .pub-footer-col ul li a { font-size: 13px; color: var(--pub-text-subtle); text-decoration: none; }
    .pub-footer-col ul li a:hover { color: var(--pub-green); }
    .pub-footer-bottom {
      max-width: 1100px; margin: 0 auto; padding: 20px 0;
      border-top: 1px solid #1e293b;
      display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;
      font-size: 12px; color: #475569;
    }
    @media (max-width: 600px) {
      .pub-footer-inner { flex-direction: column; gap: 28px; }
      .pub-footer-bottom { flex-direction: column; }
    }
  `]
})
export class PublicFooterComponent {
  private router = inject(Router);
  private routeMap = inject(RouteMapService);

  private url = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).urlAfterRedirects),
    ),
    { initialValue: this.router.url }
  );

  private isEn = computed(() => this.routeMap.isEnglish(this.url()));

  searchLink = computed(() => this.isEn() ? '/en/search' : '/search');
  pricingLink = computed(() => this.isEn() ? '/en/pricing' : '/ceny');
  contactLink = computed(() => this.isEn() ? '/en/contact' : '/kontakt');
  termsLink = computed(() => this.isEn() ? '/en/terms' : '/obchodni-podminky');
  gdprLink = computed(() => this.isEn() ? '/en/gdpr' : '/gdpr');
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/public/public-footer/public-footer.component.ts
git commit -m "feat: update footer with Transloco strings and language-aware links"
```

---

## Task 5: Update LandingComponent

**Files:**
- Modify: `src/app/public/landing/landing.component.ts`

- [ ] **Step 1: Add `TranslocoModule` to imports and replace all template strings**

Add `TranslocoModule` to the `imports` array:
```typescript
imports: [FormsModule, RouterLink, PublicNavComponent, PublicFooterComponent, TranslocoModule],
```

Add import at top of file:
```typescript
import { TranslocoModule } from '@jsverse/transloco';
```

Replace every hardcoded Czech string in the template with the matching `transloco` pipe key from `cs.json`. Examples of the pattern:

```html
<!-- Before -->
<div class="hero-badge">✓ Bez registrace, bez kreditní karty</div>
<h1>Prověřte každého<br>obchodního partnera<br><em>za 10 sekund</em></h1>
<a routerLink="/search" class="pub-btn pub-btn-primary">Vyhledat firmu zdarma</a>
<a routerLink="/ceny" class="pub-btn pub-btn-ghost">Zobrazit ceny</a>
<input ... placeholder="Zadejte IČO nebo název firmy…" ...>
<button ... >Hledat</button>

<!-- After -->
<div class="hero-badge">{{ 'landing.badge' | transloco }}</div>
<h1>{{ 'landing.hero_title_line1' | transloco }}<br>{{ 'landing.hero_title_line2' | transloco }}<br><em>{{ 'landing.hero_title_em' | transloco }}</em></h1>
<a routerLink="/search" class="pub-btn pub-btn-primary">{{ 'landing.cta_search' | transloco }}</a>
<a routerLink="/ceny" class="pub-btn pub-btn-ghost">{{ 'landing.cta_pricing' | transloco }}</a>
<input ... [placeholder]="'landing.search_placeholder' | transloco" ...>
<button ...>{{ 'landing.search_btn' | transloco }}</button>
```

Apply this pattern to every string in the landing template using the keys in `cs.json` under the `landing.*` prefix. The CTA routerLinks stay as `/search` and `/ceny` — the nav resolver handles the language context, and landing is reused as-is for both languages.

- [ ] **Step 2: Build and verify**

```bash
ng build --configuration development 2>&1 | tail -10
```

- [ ] **Step 3: Commit**

```bash
git add src/app/public/landing/landing.component.ts
git commit -m "feat: translate LandingComponent via Transloco"
```

---

## Task 6: Update PricingComponent and ContactComponent

**Files:**
- Modify: `src/app/public/pricing/pricing.component.ts`
- Modify: `src/app/public/contact/contact.component.ts`

- [ ] **Step 1: Update PricingComponent — add import and replace strings**

Add to imports array: `TranslocoModule`
Add TypeScript import: `import { TranslocoModule } from '@jsverse/transloco';`

Replace every Czech string with the matching `pricing.*` key. Examples:
```html
<!-- Before -->
<div class="section-label">Plány</div>
<h1>Vyberte plán podle potřeb</h1>
<div class="plan-name">Free</div>
<div class="plan-price">Zdarma navždy</div>
<li>5 vyhledání za relaci</li>
<a routerLink="/search" ...>Začít zdarma</a>
<div class="plan-badge">PŘIPRAVUJEME</div>
<a href="#waitlist" ...>Přidat na waitlist</a>
<h2>Upozorníme vás, jakmile bude plán dostupný</h2>
<input ... placeholder="vas@email.cz" ...>
<button ...>Přidat na waitlist</button>

<!-- After -->
<div class="section-label">{{ 'pricing.label' | transloco }}</div>
<h1>{{ 'pricing.title' | transloco }}</h1>
<div class="plan-name">{{ 'pricing.plan_free_name' | transloco }}</div>
<div class="plan-price">{{ 'pricing.plan_free_price' | transloco }}</div>
<li>{{ 'pricing.plan_free_feat1' | transloco }}</li>
<a routerLink="/search" ...>{{ 'pricing.plan_free_cta' | transloco }}</a>
<div class="plan-badge">{{ 'pricing.plan_solo_badge' | transloco }}</div>
<a href="#waitlist" ...>{{ 'pricing.plan_solo_cta' | transloco }}</a>
<h2>{{ 'pricing.waitlist_title' | transloco }}</h2>
<input ... [placeholder]="'pricing.waitlist_placeholder' | transloco" ...>
<button ...>{{ 'pricing.waitlist_btn' | transloco }}</button>
```

- [ ] **Step 2: Update ContactComponent — add import and replace strings**

Add to imports array: `TranslocoModule`
Add TypeScript import: `import { TranslocoModule } from '@jsverse/transloco';`

Replace every Czech string with the matching `contact.*` key:
```html
<!-- Before -->
<div class="section-label">Kontakt</div>
<h1>Napište nám</h1>
<p>Máte otázku, nápad...</p>
<h2>Kontaktní údaje</h2>
<div class="info-label">E-mail</div>
<div class="info-label">Provozovatel</div>
<div class="info-label">Odezva</div>
<div class="info-value">Obvykle do 24–48 hodin</div>
<label>Jméno</label>
<input ... placeholder="Jan Novák" ...>
<label>E-mail *</label>
<label>Zpráva *</label>
<textarea placeholder="Vaše zpráva…"></textarea>
<button ...>Odeslat zprávu</button>
<h2>Zpráva odeslána!</h2>

<!-- After -->
<div class="section-label">{{ 'contact.label' | transloco }}</div>
<h1>{{ 'contact.title' | transloco }}</h1>
<p>{{ 'contact.sub' | transloco }}</p>
<h2>{{ 'contact.info_title' | transloco }}</h2>
<div class="info-label">{{ 'contact.email_label' | transloco }}</div>
<div class="info-label">{{ 'contact.company_label' | transloco }}</div>
<div class="info-label">{{ 'contact.response_label' | transloco }}</div>
<div class="info-value">{{ 'contact.response_value' | transloco }}</div>
<label>{{ 'contact.form_name_label' | transloco }}</label>
<input ... [placeholder]="'contact.form_name_placeholder' | transloco" ...>
<label>{{ 'contact.form_email_label' | transloco }}</label>
<label>{{ 'contact.form_message_label' | transloco }}</label>
<textarea [placeholder]="'contact.form_message_placeholder' | transloco"></textarea>
<button ...>{{ 'contact.form_btn' | transloco }}</button>
<h2>{{ 'contact.success_title' | transloco }}</h2>
```

- [ ] **Step 3: Build and verify**

```bash
ng build --configuration development 2>&1 | tail -10
```

- [ ] **Step 4: Commit**

```bash
git add src/app/public/pricing/pricing.component.ts src/app/public/contact/contact.component.ts
git commit -m "feat: translate PricingComponent and ContactComponent"
```

---

## Task 7: Update Legal pages (LegalTermsComponent + LegalGdprComponent)

**Files:**
- Modify: `src/app/public/legal-terms/legal-terms.component.ts`
- Modify: `src/app/public/legal-gdpr/legal-gdpr.component.ts`

Legal body content is structured HTML with links and paragraphs — it cannot be put in JSON without losing structure or risking XSS. Only the title/label/date go through Transloco; the body content uses `@if (isEn())` to toggle between Czech and English HTML blocks.

- [ ] **Step 1: Update LegalTermsComponent**

Add imports:
```typescript
import { computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs';
import { TranslocoModule } from '@jsverse/transloco';
import { RouteMapService } from '../../../core/services/route-map.service';
// (adjust path depth as needed — legal-terms is at public/legal-terms/)
import { RouteMapService } from '../../core/services/route-map.service';
```

Add to `imports` array: `TranslocoModule`

Add to class body (before or after existing class fields):
```typescript
private router = inject(Router);
private routeMap = inject(RouteMapService);

private url = toSignal(
  this.router.events.pipe(
    filter(e => e instanceof NavigationEnd),
    map(e => (e as NavigationEnd).urlAfterRedirects),
  ),
  { initialValue: this.router.url }
);
isEn = computed(() => this.routeMap.isEnglish(this.url()));
```

In the template, wrap the page-level label/title/date with transloco pipe, and wrap the body content in a language conditional:

```html
<div class="section-label">{{ 'terms.label' | transloco }}</div>
<h1>{{ 'terms.title' | transloco }}</h1>
<p class="effective">{{ 'terms.effective' | transloco }}</p>

<div class="legal-body">
  @if (isEn()) {
    <!-- English legal body — translate all Czech paragraphs/headings to English -->
    <h2>1. Operator</h2>
    <p>The operator of the Firmometr service (available at firmometr.cz) is Butterfly Flowers s.r.o., ID 07102127, registered address Srbínská 867/4, Strašnice, 10000 Prague 10. Email: <a href="mailto:info@firmometr.cz">info&#64;firmometr.cz</a></p>
    <!-- ... translate all remaining sections from the Czech original in the component ... -->
  } @else {
    <!-- Original Czech legal body stays here unchanged -->
    <!-- Copy the existing <div class="legal-body"> content as-is -->
  }
</div>
```

To get the full Czech source text to translate: read the current `legal-terms.component.ts` template, copy the `<div class="legal-body">` contents into the `@else` block unchanged, then create an English translation of it in the `@if (isEn())` block.

- [ ] **Step 2: Update LegalGdprComponent** — same pattern as Step 1 above, using `gdpr.*` keys and reading `legal-gdpr.component.ts` for the body content.

- [ ] **Step 3: Build and verify**

```bash
ng build --configuration development 2>&1 | tail -10
```

- [ ] **Step 4: Commit**

```bash
git add src/app/public/legal-terms/legal-terms.component.ts src/app/public/legal-gdpr/legal-gdpr.component.ts
git commit -m "feat: translate legal pages with bilingual body content"
```

---

## Task 8: Update SearchComponent

**Files:**
- Modify: `src/app/features/search/search.component.ts`

- [ ] **Step 1: Add import and replace strings**

Add to `imports` array: `TranslocoModule`
Add TypeScript import: `import { TranslocoModule } from '@jsverse/transloco';`

Replace every Czech string with matching `search.*` key:

```html
<!-- Before -->
<div class="section-label">Vyhledávání</div>
<h1>Vyhledat subjekt</h1>
<p class="hero-sub">Ověřte solventnost...</p>
<div class="search-box-label">IČO nebo název firmy</div>
<input ... placeholder="Např. 27082440 nebo Avast" ...>
<button ...>Hledat</button>
<strong>Dosáhli jste limitu {{ freeCap }} ...</strong>
<span ... > Zkuste to znovu za {{ countdownDisplay }}.</span>
<a ... >Přihlásit se</a>
<p class="result-count">Nalezeno: {{ total }} subjektů</p>
<th mat-header-cell ...>IČO</th>
<th mat-header-cell ...>Název</th>
<th mat-header-cell ...>Sídlo</th>
<th mat-header-cell ...>Stav</th>

<!-- After -->
<div class="section-label">{{ 'search.label' | transloco }}</div>
<h1>{{ 'search.title' | transloco }}</h1>
<p class="hero-sub">{{ 'search.sub' | transloco }}</p>
<div class="search-box-label">{{ 'search.input_label' | transloco }}</div>
<input ... [placeholder]="'search.placeholder' | transloco" ...>
<button ...>{{ 'search.btn' | transloco }}</button>
<strong>{{ 'search.limit_msg' | transloco: { freeCap: freeCap, windowMinutes: windowMinutes } }}</strong>
<span ...> {{ 'search.limit_retry' | transloco: { countdown: countdownDisplay } }}</span>
<a ...>{{ 'search.login_cta' | transloco }}</a>
<p class="result-count">{{ 'search.result_count' | transloco: { total: total } }}</p>
<th mat-header-cell ...>{{ 'search.col_ico' | transloco }}</th>
<th mat-header-cell ...>{{ 'search.col_name' | transloco }}</th>
<th mat-header-cell ...>{{ 'search.col_address' | transloco }}</th>
<th mat-header-cell ...>{{ 'search.col_status' | transloco }}</th>
```

- [ ] **Step 2: Build and commit**

```bash
ng build --configuration development 2>&1 | tail -10
git add src/app/features/search/search.component.ts
git commit -m "feat: translate SearchComponent"
```

---

## Task 9: Update SubjectDetailComponent

**Files:**
- Modify: `src/app/features/search/subject-detail/subject-detail.component.ts`

- [ ] **Step 1: Add import and replace strings**

Add to `imports` array: `TranslocoModule`
Add TypeScript import: `import { TranslocoModule } from '@jsverse/transloco';`

Also inject `TranslocoService` for the snack bar strings:
```typescript
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
// in class:
private transloco = inject(TranslocoService);
```

Replace snack bar calls:
```typescript
// Before
this.snackBar.open(`${name} přidán ke sledování`, 'OK', { duration: 3000 });
this.snackBar.open(`${name} odebrán ze sledování`, 'OK', { duration: 3000 });

// After
this.snackBar.open(this.transloco.translate('detail.watched_snack', { name }), 'OK', { duration: 3000 });
this.snackBar.open(this.transloco.translate('detail.unwatched_snack', { name }), 'OK', { duration: 3000 });
```

Replace template strings with matching `detail.*` keys:
```html
<!-- Before -->
<button ... title="QR kód stránky" ...>
<button *ngIf="!subject.isWatched" ...>Sledovat</button>
<button *ngIf="subject.isWatched" ...>Přestat sledovat</button>
<a routerLink="/login" ...>Přihlásit se</a>
<td>IČO</td> <td>DIČ</td> <td>Právní forma</td>
<td>Sídlo</td> <td>Datum vzniku</td> <td>Stav</td>
<p>Žádná aktivní insolvenční řízení</p>
<p class="isir-warning">Subjekt je dlužníkem...</p>
<p class="isir-warning isir-warning-soft">Subjekt je společným dlužníkem...</p>
<p class="isir-past-debtor">Subjekt byl v minulosti...</p>
<p>Data o DPH nejsou momentálně dostupná.</p>
<p>Subjekt není evidován jako plátce DPH.</p>
<p>Spolehlivý plátce DPH</p>
<p class="dph-warning">Nespolehlivý plátce DPH!</p>
<p class="dph-accounts-label">Zveřejněné účty:</p>
<p class="or-section-label">Statutáři</p>
<p>Žádní aktivní statutáři nenalezeni.</p>
<button ...>Zobrazit historii</button> / <button ...>Skrýt historii</button>

<!-- After -->
<button ... [title]="'detail.qr_title' | transloco" ...>
<button *ngIf="!subject.isWatched" ...>{{ 'detail.watch' | transloco }}</button>
<button *ngIf="subject.isWatched" ...>{{ 'detail.unwatch' | transloco }}</button>
<a routerLink="/login" ...>{{ 'detail.login_cta' | transloco }}</a>
<td>{{ 'detail.col_ico' | transloco }}</td>
<td>{{ 'detail.col_dic' | transloco }}</td>
<td>{{ 'detail.col_legal_form' | transloco }}</td>
<td>{{ 'detail.col_address' | transloco }}</td>
<td>{{ 'detail.col_founded' | transloco }}</td>
<td>{{ 'detail.col_status' | transloco }}</td>
<p>{{ 'detail.isir_clear' | transloco }}</p>
<p class="isir-warning">{{ 'detail.isir_active' | transloco }}</p>
<p class="isir-warning isir-warning-soft">{{ 'detail.isir_co_debtor' | transloco }}</p>
<p class="isir-past-debtor">{{ 'detail.isir_past' | transloco }}</p>
<p>{{ 'detail.dph_unavailable' | transloco }}</p>
<p>{{ 'detail.dph_not_registered' | transloco }}</p>
<p>{{ 'detail.dph_reliable' | transloco }}</p>
<p class="dph-warning">{{ 'detail.dph_unreliable' | transloco }}</p>
<p class="dph-accounts-label">{{ 'detail.dph_accounts' | transloco }}</p>
<p class="or-section-label">{{ 'detail.or_directors' | transloco }}</p>
<p>{{ 'detail.or_no_directors' | transloco }}</p>
<button ...>{{ showPastStatutari ? ('detail.hide_past_directors' | transloco) : ('detail.show_past_directors' | transloco) }}</button>
```

- [ ] **Step 2: Build and commit**

```bash
ng build --configuration development 2>&1 | tail -10
git add src/app/features/search/subject-detail/subject-detail.component.ts
git commit -m "feat: translate SubjectDetailComponent"
```

---

## Task 10: Update DashboardComponent

**Files:**
- Modify: `src/app/features/dashboard/dashboard.component.ts`

- [ ] **Step 1: Add import, inject TranslocoService, replace strings**

Add to `imports` array: `TranslocoModule`
Add TypeScript imports:
```typescript
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
```

Inject in class:
```typescript
private transloco = inject(TranslocoService);
```

Update `unwatch()` snack bar call:
```typescript
// Before
this.snackBar.open(`${entity.displayName} odebrán ze sledování`, 'OK', { duration: 3000 });

// After
this.snackBar.open(`${entity.displayName} ${this.transloco.translate('dashboard.removed_snack')}`, 'OK', { duration: 3000 });
```

Replace template strings with matching `dashboard.*` and `common.*` keys:
```html
<!-- Hero -->
<h1>{{ 'dashboard.title' | transloco }}</h1>
<button ...>{{ 'dashboard.add_btn' | transloco }}</button>

<!-- Empty state -->
<h2>{{ 'dashboard.empty_title' | transloco }}</h2>
<p>{{ 'dashboard.empty_sub' | transloco }}</p>
<button ...>{{ 'dashboard.empty_btn' | transloco }}</button>

<!-- Demo notice -->
<p class="demo-notice">... {{ 'dashboard.demo_notice' | transloco }}</p>

<!-- Badges -->
<span ... class="badge badge-danger">{{ 'dashboard.badge_active_debtor' | transloco }}</span>
<span ... class="badge badge-warn">{{ 'dashboard.badge_co_debtor' | transloco }}</span>
<span ... class="badge badge-past">{{ 'dashboard.badge_past_debtor' | transloco }}</span>
<span ... class="badge badge-ok">{{ 'dashboard.badge_clear' | transloco }}</span>
<span ... class="badge badge-danger">{{ 'dashboard.badge_dph' | transloco }}</span>

<!-- Last checked -->
Poslední kontrola: → {{ 'dashboard.last_checked' | transloco }}
Zatím nekontrolováno → {{ 'dashboard.not_checked' | transloco }}

<!-- Card actions -->
<button ...>{{ 'dashboard.btn_detail' | transloco }}</button>
<button ...>{{ 'dashboard.btn_remove' | transloco }}</button>

<!-- Auth section -->
<h2 ...>{{ 'dashboard.auth_title' | transloco }}</h2>
<p ...>{{ 'dashboard.auth_sub' | transloco }}</p>
<mat-tab label="{{ 'dashboard.tab_login' | transloco }}">
<mat-tab label="{{ 'dashboard.tab_register' | transloco }}">

<!-- Form labels -->
<mat-label>{{ 'common.email_label' | transloco }}</mat-label>
<mat-label>{{ 'common.password_label' | transloco }}</mat-label>
<mat-error>{{ 'common.email_required' | transloco }}</mat-error>
<mat-error>{{ 'common.email_invalid' | transloco }}</mat-error>
<mat-error>{{ 'common.password_required' | transloco }}</mat-error>
<mat-error>{{ 'common.passwords_mismatch' | transloco }}</mat-error>

<!-- Buttons -->
{{ authLoading ? ('dashboard.login_btn_loading' | transloco) : ('dashboard.login_btn' | transloco) }}
{{ authLoading ? ('dashboard.register_btn_loading' | transloco) : ('dashboard.register_btn' | transloco) }}

<!-- Confirm section -->
<h3>{{ 'dashboard.confirm_title' | transloco }}</h3>
<p>{{ 'dashboard.confirm_msg' | transloco }}</p>
```

- [ ] **Step 2: Build and commit**

```bash
ng build --configuration development 2>&1 | tail -10
git add src/app/features/dashboard/dashboard.component.ts
git commit -m "feat: translate DashboardComponent"
```

---

## Task 11: Update LoginComponent and RegisterComponent

**Files:**
- Modify: `src/app/features/auth/login.component.ts`
- Modify: `src/app/features/auth/register.component.ts`

- [ ] **Step 1: Update LoginComponent**

Add to `imports` array: `TranslocoModule`
Add TypeScript import: `import { TranslocoModule } from '@jsverse/transloco';`

Replace strings:
```html
<mat-card-title>{{ 'login.title' | transloco }}</mat-card-title>
<mat-tab label="{{ 'login.tab_password' | transloco }}">
<mat-tab label="{{ 'login.tab_magic' | transloco }}">
<mat-label>{{ 'common.email_label' | transloco }}</mat-label>
<mat-error>{{ 'common.email_required' | transloco }}</mat-error>
<mat-error>{{ 'common.email_invalid' | transloco }}</mat-error>
<mat-label>{{ 'common.password_label' | transloco }}</mat-label>
<mat-error>{{ 'common.password_required' | transloco }}</mat-error>
{{ loading ? ('login.btn_loading' | transloco) : ('login.btn' | transloco) }}
<p class="hint">{{ 'login.magic_hint' | transloco }}</p>
{{ loading ? ('login.magic_btn_loading' | transloco) : ('login.magic_btn' | transloco) }}
{{ 'login.no_account' | transloco }} <a routerLink="/register">{{ 'login.register_link' | transloco }}</a>
<h3>{{ 'login.magic_sent_title' | transloco }}</h3>
<p>{{ 'login.magic_sent_msg' | transloco }}</p>
```

- [ ] **Step 2: Update RegisterComponent**

Add to `imports` array: `TranslocoModule`
Add TypeScript import: `import { TranslocoModule } from '@jsverse/transloco';`

Replace strings:
```html
<mat-card-title>{{ 'register.title' | transloco }}</mat-card-title>
<mat-label>{{ 'common.email_label' | transloco }}</mat-label>
<mat-error>{{ 'common.email_required' | transloco }}</mat-error>
<mat-error>{{ 'common.email_invalid' | transloco }}</mat-error>
<mat-label>{{ 'common.password_label' | transloco }}</mat-label>
<mat-error>{{ 'common.password_required' | transloco }}</mat-error>
<mat-error>{{ 'common.password_minlength' | transloco }}</mat-error>
<mat-label>{{ 'common.confirm_password_label' | transloco }}</mat-label>
<mat-error>{{ 'common.passwords_mismatch' | transloco }}</mat-error>
{{ loading ? ('register.btn_loading' | transloco) : ('register.btn' | transloco) }}
{{ 'register.has_account' | transloco }} <a routerLink="/login">{{ 'register.login_link' | transloco }}</a>
<h3>{{ 'register.confirm_title' | transloco }}</h3>
<p>{{ 'register.confirm_msg' | transloco }}</p>
<a routerLink="/login" ...>{{ 'register.back_to_login' | transloco }}</a>
```

- [ ] **Step 3: Build and commit**

```bash
ng build --configuration development 2>&1 | tail -10
git add src/app/features/auth/login.component.ts src/app/features/auth/register.component.ts
git commit -m "feat: translate LoginComponent and RegisterComponent"
```

---

## Task 12: End-to-end verification

- [ ] **Step 1: Start dev server**

```bash
ng serve
```

- [ ] **Step 2: Verify Czech routes unchanged**

Navigate to: `http://localhost:4200/` — landing in Czech
Navigate to: `http://localhost:4200/ceny` — pricing in Czech
Navigate to: `http://localhost:4200/kontakt` — contact in Czech
Navigate to: `http://localhost:4200/search` — search in Czech
Navigate to: `http://localhost:4200/dashboard` — dashboard in Czech

Expected: all pages render Czech text, no missing keys in browser console.

- [ ] **Step 3: Verify English routes**

Navigate to: `http://localhost:4200/en` — landing in English
Navigate to: `http://localhost:4200/en/pricing` — pricing in English
Navigate to: `http://localhost:4200/en/contact` — contact in English
Navigate to: `http://localhost:4200/en/search` — search in English
Navigate to: `http://localhost:4200/en/dashboard` — dashboard in English
Navigate to: `http://localhost:4200/en/login` — login in English
Navigate to: `http://localhost:4200/en/register` — register in English
Navigate to: `http://localhost:4200/en/terms` — terms page in English
Navigate to: `http://localhost:4200/en/gdpr` — GDPR page in English

Expected: all pages render English text.

- [ ] **Step 4: Verify CZ/EN switcher**

On `/ceny`, click EN in nav → should navigate to `/en/pricing`
On `/en/pricing`, click CZ in nav → should navigate to `/ceny`
On `/search/27082440`, click EN → should navigate to `/en/search/27082440`
On `/en/search/27082440`, click CZ → should navigate to `/search/27082440`

- [ ] **Step 5: Verify no Czech strings leak into English pages and vice versa**

Open browser DevTools console — no `TRANSLOCO_MISSING_KEY` warnings should appear.
Scan `/en` visually for any remaining Czech strings.

- [ ] **Step 6: Production build**

```bash
ng build 2>&1 | tail -20
```

Expected: build succeeds, no errors.
