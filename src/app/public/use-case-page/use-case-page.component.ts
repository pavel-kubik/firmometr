import { Component, OnInit, inject, computed, effect } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { PublicNavComponent } from '../public-nav/public-nav.component';
import { PublicFooterComponent } from '../public-footer/public-footer.component';
import { LangService } from '../../core/services/lang.service';

interface UseCaseFeature {
  icon: string;
  title: string;
  text: string;
}

interface UseCaseStep {
  label: string;
  text: string;
}

interface UseCaseData {
  metaTitle: string;
  metaDescription: string;
  metaTitleEn: string;
  metaDescriptionEn: string;
  label: string;
  headline: string;
  subheadline: string;
  features: UseCaseFeature[];
  steps: UseCaseStep[];
  ctaText: string;
  ctaNote: string;
  sampleIco: string;
  sampleName: string;
}

const USE_CASES: Record<string, UseCaseData> = {
  accountants: {
    metaTitle: 'Firmometr pro účetní — kontrola dodavatele a DPH spolehlivosti',
    metaDescription: 'Ověřte DPH spolehlivost dodavatele, zkontrolujte insolvenci a sledujte změny automaticky. Nástroj pro účetní a daňové poradce — zdarma.',
    metaTitleEn: 'Firmometr for Accountants — Supplier & VAT Reliability Check',
    metaDescriptionEn: 'Verify supplier VAT reliability, check insolvency status and monitor changes automatically. Tool for accountants and tax advisors — free.',
    label: 'Pro účetní a daňové poradce',
    headline: 'Kontrola dodavatele a DPH spolehlivosti za 10 sekund',
    subheadline: 'Nespolehlivý plátce DPH může stát vašeho klienta statisíce korun na ručení za cizí DPH. Firmometr ověří každého dodavatele a upozorní vás na každou změnu.',
    features: [
      {
        icon: 'verified',
        title: 'DPH status v jednom pohledu',
        text: 'Okamžitě zjistíte, zda je dodavatel spolehlivý plátce DPH, neplátce, nebo na blacklistu Finanční správy. Zobrazíme i zveřejněné bankovní účty — abyste věděli, zda platíte na správný.',
      },
      {
        icon: 'gavel',
        title: 'Insolvenční rejstřík (ISIR)',
        text: 'Každý profil automaticky zobrazí aktuální stav v ISIR. Aktivní insolvence, historická řízení i záznamy na jméno jednatelů — vše na jednom místě.',
      },
      {
        icon: 'notifications_active',
        title: 'Automatické sledování změn',
        text: 'Přidejte dodavatele klienta do watchlistu. Jakmile se změní DPH status nebo insolvenční stav, dostanete e-mail — bez ruční kontroly před každou fakturou.',
      },
      {
        icon: 'domain',
        title: 'Obchodní rejstřík a aktuální statutáři',
        text: 'Ověřte, kdo firmu skutečně řídí, kdy vznikla a zda má v sbírce listin uloženou účetní závěrku. Změna jednatele těsně před zakázkou je varující signál.',
      },
    ],
    steps: [
      { label: 'Zadejte IČO nebo název firmy', text: 'Vyhledejte dodavatele klienta jedním dotazem — ARES, ISIR, DPH registr a OR prověříme najednou.' },
      { label: 'Zkontrolujte DPH a insolvenci', text: 'Zelená = vše v pořádku. Oranžová = prověřte detaily. Červená = nespolehlivý plátce DPH nebo aktivní insolvence.' },
      { label: 'Přidejte ke sledování', text: 'Aktivujte watchlist pro průběžný monitoring. Dostanete e-mail ihned po každé změně stavu.' },
    ],
    ctaText: 'Prověřit dodavatele zdarma',
    ctaNote: 'Základní vyhledávání je zdarma. Watchlist pro 3 firmy v bezplatném plánu.',
    sampleIco: '27082440',
    sampleName: 'Zkuste například Alza.cz →',
  },
  lawyers: {
    metaTitle: 'Firmometr pro právníky — prověření protistrany před podpisem smlouvy',
    metaDescription: 'Před podpisem smlouvy ověřte protistranu: insolvence, DPH, obchodní rejstřík, aktuální statutáři. Právní due diligence za 10 sekund — zdarma.',
    metaTitleEn: 'Firmometr for Lawyers — Counterparty Check Before Signing',
    metaDescriptionEn: 'Before signing, verify the counterparty: insolvency, VAT, commercial register, current directors. Legal due diligence in 10 seconds — free.',
    label: 'Pro právníky a advokáty',
    headline: 'Prověřte protistranu před podpisem smlouvy',
    subheadline: 'Smlouva s firmou v insolvenci nebo se záměrně vyměněným statutárem může být neplatná nebo nevymahatelná. Ověřte protistranu ještě před podpisem.',
    features: [
      {
        icon: 'gavel',
        title: 'Insolvenční stav v reálném čase',
        text: 'Aktivní insolvenční řízení (ISIR) znamená, že dispozice s majetkem může být omezena a smlouva může být zpochybnitelná. Kontrola trvá 10 sekund.',
      },
      {
        icon: 'manage_accounts',
        title: 'Aktuální statutáři a jejich oprávnění',
        text: 'Ověřte, kdo je oprávněn podepisovat za protistranu. Zobrazíme aktuální i historické jednatele, jejich funkce a datum vzniku a zániku funkce.',
      },
      {
        icon: 'description',
        title: 'Sbírka listin a účetní závěrky',
        text: 'Zkontrolujte, zda protistrana plní povinnost zveřejňovat účetní závěrky. Chybějící závěrky jsou varovný signál finanční netransparentnosti.',
      },
      {
        icon: 'location_on',
        title: 'Ověřená adresa sídla (RUIAN)',
        text: 'Adresa zobrazená v profilu je ověřena z katastru nemovitostí — ne pouze převzata z přihlášky do rejstříku. Hromadná sídla sdílená stovkami firem jsou ihned viditelná.',
      },
    ],
    steps: [
      { label: 'Vyhledejte protistranu podle IČO', text: 'IČO najdete v návrhu smlouvy, na faktuře nebo v obchodním rejstříku. Stačí ho zadat do Firmometru.' },
      { label: 'Ověřte insolvenční stav a statutáře', text: 'Zkontrolujte, zda neprobíhá insolvenční řízení a zda podepisující osoba je skutečně oprávněna jednat za firmu.' },
      { label: 'Uložte přehled jako důkaz due diligence', text: 'Profil firmy lze kdykoli znovu prověřit. Pro archivaci zachyťte screenshot nebo vytiskněte profil v den podpisu.' },
    ],
    ctaText: 'Prověřit protistranu zdarma',
    ctaNote: 'Firmometr je zdarma bez registrace. Watchlist pro průběžné sledování vyžaduje účet.',
    sampleIco: '27082440',
    sampleName: 'Zkuste příklad prověření firmy →',
  },
  hr: {
    metaTitle: 'Firmometr pro HR — ověření zaměstnavatele před nástupem',
    metaDescription: 'Zjistěte, zda je zaměstnavatel v insolvenci, zda splácí daně a kdo za něj skutečně jedná. Ověření zaměstnavatele zdarma a za 10 sekund.',
    metaTitleEn: 'Firmometr for HR — Verify Your Employer Before Starting',
    metaDescriptionEn: 'Find out if the employer is insolvent, whether they pay taxes and who actually acts on their behalf. Employer verification free in 10 seconds.',
    label: 'Pro uchazeče o zaměstnání a HR',
    headline: 'Ověřte zaměstnavatele před podpisem pracovní smlouvy',
    subheadline: 'Firma v insolvenci může mít problém vyplácet mzdy. Firma na DPH blacklistu má finanční problémy. Zkontrolujte zaměstnavatele dřív, než podepíšete.',
    features: [
      {
        icon: 'gavel',
        title: 'Je firma v insolvenci?',
        text: 'Aktivní insolvenční řízení u zaměstnavatele je přímý rizikový faktor pro výplatu mezd. Zkontrolujte ISIR ještě před podpisem smlouvy.',
      },
      {
        icon: 'verified',
        title: 'Platí firma daně?',
        text: 'Nespolehlivý plátce DPH signalizuje vážné finanční problémy. Firma, která neplatí DPH, může mít záhy problémy s výplatou mezd.',
      },
      {
        icon: 'history',
        title: 'Jak dlouho firma existuje?',
        text: 'Datum vzniku, aktuální statutáři a historické změny vedení — zjistěte, zda je firma zavedená nebo teprve vzniká.',
      },
      {
        icon: 'location_on',
        title: 'Kde firma skutečně sídlí?',
        text: 'Ověřte adresu sídla z katastru nemovitostí (RUIAN). Hromadná sídla nebo virtuální kanceláře jsou signálem nestandardní struktury.',
      },
    ],
    steps: [
      { label: 'Vyhledejte IČO zaměstnavatele', text: 'IČO najdete na pracovní smlouvě, webu zaměstnavatele nebo v pracovní nabídce. Stačí ho zadat do Firmometru.' },
      { label: 'Zkontrolujte insolvenci a DPH', text: 'Zelená = firma je v pořádku. Červená = aktivní insolvenční řízení nebo nespolehlivý plátce DPH. V takovém případě se poraďte.' },
      { label: 'Podívejte se na historii vedení', text: 'Zkontrolujte, kdo firmu řídí a jak dlouho je v obchodním rejstříku. Časté změny jednatelů mohou být varovným signálem.' },
    ],
    ctaText: 'Ověřit zaměstnavatele zdarma',
    ctaNote: 'Základní prověření je zcela zdarma, bez registrace.',
    sampleIco: '27082440',
    sampleName: 'Zkuste příklad prověření firmy →',
  },
  monitoring: {
    metaTitle: 'Sledování změn ve firmě — automatické upozornění na insolvenci a DPH',
    metaDescription: 'Sledujte změny u svých obchodních partnerů automaticky. E-mail upozornění při změně insolvence, DPH statusu nebo stavu firmy. Firmometr watchlist — zdarma.',
    metaTitleEn: 'Company Monitoring — Automatic Insolvency & VAT Alerts',
    metaDescriptionEn: 'Monitor changes at your business partners automatically. Email alerts on insolvency, VAT status or company state changes. Firmometr watchlist — free.',
    label: 'Monitoring firem',
    headline: 'Sledujte změny u obchodních partnerů automaticky',
    subheadline: 'Firma, která je dnes v pořádku, může být zítra v insolvenci. Watchlist v Firmometru vás upozorní e-mailem ihned poté, co se cokoli změní — bez ruční kontroly.',
    features: [
      {
        icon: 'notifications_active',
        title: 'E-mail ihned po změně stavu',
        text: 'Jakmile se změní insolvenční status nebo DPH registrace sledované firmy, dostanete e-mail. Žádné ruční kontroly, žádné překvapení z dlužníka v insolvenci.',
      },
      {
        icon: 'gavel',
        title: 'ISIR a DPH v jedné kontrole',
        text: 'Sledujeme insolvenční rejstřík (ISIR) a registr nespolehlivých plátců DPH — dva nejdůležitější signály finančního zdraví firmy.',
      },
      {
        icon: 'group',
        title: 'Portfolio partnerů v přehledu',
        text: 'Přidejte celé portfolio obchodních partnerů, dodavatelů nebo klientů. Bezplatný plán pokrývá 3 firmy, plán BASIC až 50 subjektů.',
      },
      {
        icon: 'history',
        title: 'Historie změn',
        text: 'Vidíte, kdy a jak se status firmy změnil. Historický záznam pomáhá při vyhodnocování obchodních rizik i při dokumentaci pro právní účely.',
      },
    ],
    steps: [
      { label: 'Prověřte firmu jedním zadáním', text: 'Vyhledejte firmu podle IČO nebo názvu. Okamžitě vidíte aktuální ISIR, DPH a základní profil z ARES a OR.' },
      { label: 'Přidejte firmu ke sledování', text: 'Klikněte na "Sledovat firmu". Firmometr bude každou hodinu kontrolovat změny v ISIR a DPH registru.' },
      { label: 'Dostávejte upozornění e-mailem', text: 'Při jakékoli změně vám přijde e-mail s popisem toho, co se změnilo a co to může znamenat.' },
    ],
    ctaText: 'Začít sledovat firmy zdarma',
    ctaNote: 'Bezplatný účet: sledování 3 firem. Plán BASIC: až 50 firem za 199 Kč/měsíc.',
    sampleIco: '27082440',
    sampleName: 'Prověřte firmu a přidejte ke sledování →',
  },
  duediligence: {
    metaTitle: 'Due diligence české firmy — ověření před akvizicí nebo investicí',
    metaDescription: 'Rychlá due diligence české firmy: insolvence, DPH spolehlivost, statutáři, sbírka listin, adresa sídla. Základ firemního prověření zdarma a za 10 sekund.',
    metaTitleEn: 'Czech Company Due Diligence — Pre-Acquisition Verification',
    metaDescriptionEn: 'Quick due diligence on Czech companies: insolvency, VAT reliability, directors, document collection, registered address. Basic verification free in 10 seconds.',
    label: 'Due diligence a investice',
    headline: 'Due diligence české firmy za 10 sekund',
    subheadline: 'Před akvizicí, investicí nebo vstupem do joint venture ověřte základní právní a finanční profil cílové firmy. Firmometr agreguje ARES, ISIR, DPH registr a Obchodní rejstřík do jednoho přehledu.',
    features: [
      {
        icon: 'gavel',
        title: 'Insolvenční historie (ISIR)',
        text: 'Aktivní i historická insolvenční řízení. Zjistíte, zda cílová firma nebo její jednatelé prošli insolvencí a za jakých okolností.',
      },
      {
        icon: 'verified',
        title: 'DPH spolehlivost a bankovní účty',
        text: 'Status v registru nespolehlivých plátců DPH signalizuje daňové problémy. Zobrazíme i zveřejněné bankovní účty pro ověření platebních toků.',
      },
      {
        icon: 'manage_accounts',
        title: 'Statutáři a vlastnická struktura',
        text: 'Aktuální i historičtí jednatelé, prokuristé a funkcionáři z Obchodního rejstříku. Základ pro ověření signatory authority a identifikace UBO.',
      },
      {
        icon: 'description',
        title: 'Sbírka listin a účetní závěrky',
        text: 'Zkontrolujte, zda firma zveřejňuje účetní závěrky v zákonných termínech. Absence závěrek za poslední roky je varovný signál pro jakýkoli deal.',
      },
    ],
    steps: [
      { label: 'Vyhledejte cílovou firmu podle IČO', text: 'IČO cílové firmy najdete v obchodním rejstříku nebo v jakémkoli veřejném dokumentu. Firmometr prověří ARES, ISIR, DPH a OR najednou.' },
      { label: 'Ověřte insolvenční a daňový profil', text: 'Zkontrolujte ISIR status (aktivní/historické/čisté), DPH spolehlivost a seznam zveřejněných bankovních účtů.' },
      { label: 'Prostudujte strukturu vedení', text: 'Ověřte aktuální statutáře a historii změn ve vedení. Časté střídání jednatelů nebo nedávná změna těsně před dealem jsou varovné signály.' },
    ],
    ctaText: 'Prověřit cílovou firmu zdarma',
    ctaNote: 'Základní due diligence je zdarma bez registrace. Pro průběžný monitoring přidejte firmu do watchlistu.',
    sampleIco: '27082440',
    sampleName: 'Zkuste příklad prověření firmy →',
  },
};

@Component({
  selector: 'app-use-case-page',
  standalone: true,
  imports: [RouterLink, PublicNavComponent, PublicFooterComponent],
  template: `
    <app-public-nav />
    <main class="uc-page">

      <section class="uc-hero">
        <div class="uc-hero-inner">
          <div class="uc-label">{{ data.label }}</div>
          <h1>{{ data.headline }}</h1>
          <p class="uc-sub">{{ data.subheadline }}</p>
          <div class="uc-hero-cta">
            <a [routerLink]="['/search']" class="pub-btn pub-btn-primary pub-btn-lg">{{ data.ctaText }}</a>
            <a [routerLink]="['/search', data.sampleIco]" class="uc-sample-link">{{ data.sampleName }}</a>
          </div>
        </div>
      </section>

      <section class="uc-features">
        <div class="uc-features-inner">
          <div class="uc-features-grid">
            @for (f of data.features; track f.title) {
              <div class="uc-feature-card">
                <div class="uc-feature-icon">
                  <span class="material-icons">{{ f.icon }}</span>
                </div>
                <h3>{{ f.title }}</h3>
                <p>{{ f.text }}</p>
              </div>
            }
          </div>
        </div>
      </section>

      <section class="uc-how">
        <div class="uc-how-inner">
          <h2>Jak to funguje</h2>
          <div class="uc-steps">
            @for (s of data.steps; track s.label; let i = $index) {
              <div class="uc-step">
                <div class="uc-step-num">{{ i + 1 }}</div>
                <div class="uc-step-body">
                  <strong>{{ s.label }}</strong>
                  <p>{{ s.text }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <section class="uc-cta-section">
        <div class="uc-cta-inner">
          <h2>{{ data.ctaText }}</h2>
          <p class="uc-cta-note">{{ data.ctaNote }}</p>
          <a [routerLink]="['/search']" class="pub-btn pub-btn-primary pub-btn-lg">Začít hned</a>
        </div>
      </section>

    </main>
    <app-public-footer />
  `,
  styles: [`
    :host { display: flex; flex-direction: column; min-height: 100vh; }

    .uc-hero {
      background: linear-gradient(160deg, #f0fdf4 0%, #ecfdf5 50%, #fff 100%);
      border-bottom: 1px solid #d1fae5;
      padding: 64px 24px 56px;
    }
    .uc-hero-inner { max-width: 760px; margin: 0 auto; }
    .uc-label { font-size: 13px; font-weight: 600; color: var(--pub-green); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 16px; }
    .uc-hero-inner h1 { font-size: clamp(28px, 4vw, 42px); font-weight: 800; color: var(--pub-text); line-height: 1.15; margin: 0 0 20px; }
    .uc-sub { font-size: 18px; color: var(--pub-text-muted); line-height: 1.6; margin: 0 0 32px; }
    .uc-hero-cta { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
    .uc-sample-link { font-size: 14px; color: var(--pub-green); text-decoration: none; font-weight: 500; }
    .uc-sample-link:hover { text-decoration: underline; }

    .uc-features { padding: 64px 24px; background: #fff; }
    .uc-features-inner { max-width: 1100px; margin: 0 auto; }
    .uc-features-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px; }
    @media (max-width: 640px) { .uc-features-grid { grid-template-columns: 1fr; } }
    .uc-feature-card { padding: 28px; border: 1px solid var(--pub-border); border-radius: 16px; }
    .uc-feature-icon { width: 40px; height: 40px; background: #f0fdf4; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
    .uc-feature-icon .material-icons { color: var(--pub-green); font-size: 22px; }
    .uc-feature-card h3 { font-size: 16px; font-weight: 700; color: var(--pub-text); margin: 0 0 8px; }
    .uc-feature-card p { font-size: 14px; color: var(--pub-text-muted); line-height: 1.6; margin: 0; }

    .uc-how { padding: 64px 24px; background: #fafafa; }
    .uc-how-inner { max-width: 760px; margin: 0 auto; }
    .uc-how-inner h2 { font-size: 26px; font-weight: 700; color: var(--pub-text); margin: 0 0 36px; }
    .uc-steps { display: flex; flex-direction: column; gap: 24px; }
    .uc-step { display: flex; gap: 20px; align-items: flex-start; }
    .uc-step-num { width: 36px; height: 36px; border-radius: 50%; background: var(--pub-green); color: #fff; font-weight: 700; font-size: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .uc-step-body strong { font-size: 15px; color: var(--pub-text); display: block; margin-bottom: 4px; }
    .uc-step-body p { font-size: 14px; color: var(--pub-text-muted); line-height: 1.6; margin: 0; }

    .uc-cta-section { padding: 72px 24px; background: linear-gradient(160deg, #f0fdf4, #ecfdf5); text-align: center; }
    .uc-cta-inner { max-width: 560px; margin: 0 auto; }
    .uc-cta-inner h2 { font-size: 26px; font-weight: 700; color: var(--pub-text); margin: 0 0 12px; }
    .uc-cta-note { font-size: 14px; color: var(--pub-text-muted); margin: 0 0 28px; }
  `],
})
export class UseCasePageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private doc = inject(DOCUMENT);
  private ls = inject(LangService);

  data!: UseCaseData;
  private isCz = computed(() => this.ls.lang() === 'cs');

  constructor() {
    // Track lang signal before the data guard so language switches always re-run this effect.
    effect(() => {
      const cs = this.isCz();
      if (!this.data) return;
      this.applyMeta(cs);
    });
  }

  ngOnInit() {
    const segment = this.route.snapshot.data['segment'] as string;
    const path = this.route.snapshot.url[0]?.path ?? '';
    this.data = USE_CASES[segment];
    const canonicalUrl = `https://firmometr.cz/${path}`;
    this.applyMeta(this.isCz());
    this.metaService.updateTag({ property: 'og:url', content: canonicalUrl });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.setCanonical(canonicalUrl);
  }

  private applyMeta(cs: boolean) {
    const title = cs ? this.data.metaTitle : this.data.metaTitleEn;
    const desc = cs ? this.data.metaDescription : this.data.metaDescriptionEn;
    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: desc });
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: desc });
  }

  private setCanonical(url: string) {
    let link = this.doc.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
