import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { PublicNavComponent } from '../public-nav/public-nav.component';
import { PublicFooterComponent } from '../public-footer/public-footer.component';

@Component({
  selector: 'app-legal-terms',
  standalone: true,
  imports: [RouterLink, TranslocoPipe, PublicNavComponent, PublicFooterComponent],
  template: `
    <app-public-nav />

    <main class="legal-page">
      <div class="legal-inner">
        <div class="section-label">{{ 'terms.label' | transloco }}</div>
        <h1>{{ 'terms.title' | transloco }}</h1>
        <p class="effective">{{ 'terms.effective' | transloco }}</p>

        <div class="legal-body">

          <h2>1. Provozovatel</h2>
          <p>
            Butterfly Flowers s.r.o.<br>
            IČO: 07102127<br>
            Sídlo: Srbínská 867/4, Strašnice, 10000 Praha 10<br>
            E-mail: <a href="mailto:info@firmometr.cz">info&#64;firmometr.cz</a>
          </p>

          <h2>2. Předmět služby</h2>
          <p>Firmometr je webová aplikace dostupná na adrese <strong>firmometr.cz</strong>, která umožňuje ověřování informací o právnických a fyzických osobách podnikajících v České republice prostřednictvím dotazů do veřejně přístupných rejstříků a databází:</p>
          <ul>
            <li>Insolvenčního rejstříku (ISIR) spravovaného Ministerstvem spravedlnosti ČR,</li>
            <li>Registru plátců DPH a nespolehlivých plátců (ADIS) spravovaného Finanční správou ČR,</li>
            <li>Administrativního registru ekonomických subjektů (ARES),</li>
            <li>Obchodního rejstříku vedeného u krajských soudů.</li>
          </ul>
          <p>Provozovatel nezaručuje úplnost, přesnost ani aktuálnost zobrazených informací. Aplikace slouží jako informační pomůcka a nenahrazuje právní, finanční ani jiné odborné poradenství.</p>

          <h2>3. Registrace a uživatelský účet</h2>
          <p>Pro přístup k pokročilým funkcím je vyžadována registrace pomocí e-mailové adresy. Uživatel je povinen uchovávat přihlašovací údaje v tajnosti a neprodleně informovat provozovatele na adrese info&#64;firmometr.cz o jakémkoli neoprávněném přístupu k jeho účtu.</p>

          <h2>4. Bezplatná verze a placené plány</h2>
          <p>Základní funkce aplikace jsou dostupné zdarma v omezeném rozsahu bez nutnosti registrace. Podrobnosti o placených plánech a jejich cenách jsou zveřejněny na stránce <a routerLink="/ceny">firmometr.cz/ceny</a>. Provozovatel si vyhrazuje právo podmínky plánů měnit s předchozím upozorněním uživatele minimálně 14 dní předem.</p>

          <h2>5. Práva a povinnosti uživatele</h2>
          <p>Uživatel se zavazuje:</p>
          <ul>
            <li>používat aplikaci v souladu s platnými právními předpisy České republiky,</li>
            <li>nevyužívat aplikaci k automatizovanému hromadnému dotazování způsobem, který by nepřiměřeně zatěžoval infrastrukturu provozovatele nebo zdrojové registry,</li>
            <li>nepokouše se obcházet omezení volného přístupu ani jiná technická opatření aplikace.</li>
          </ul>

          <h2>6. Omezení odpovědnosti</h2>
          <p>Informace zobrazené v aplikaci pocházejí výhradně z veřejně dostupných zdrojů třetích stran. Provozovatel nenese odpovědnost za jejich správnost, úplnost nebo aktuálnost. Provozovatel rovněž nenese odpovědnost za škody vzniklé v důsledku rozhodnutí učiněných na základě výstupů aplikace.</p>

          <h2>7. Ochrana osobních údajů</h2>
          <p>Zpracování osobních údajů se řídí <a routerLink="/gdpr">Zásadami ochrany osobních údajů</a> dostupnými na firmometr.cz/gdpr.</p>

          <h2>8. Závěrečná ustanovení</h2>
          <p>Tyto Podmínky se řídí právním řádem České republiky. Případné spory budou řešeny příslušnými soudy České republiky. Provozovatel si vyhrazuje právo tyto Podmínky jednostranně měnit; změny nabývají účinnosti jejich zveřejněním na webových stránkách aplikace.</p>

        </div>
      </div>
    </main>

    <app-public-footer />
  `,
  styles: [`
    :host { display: flex; flex-direction: column; min-height: 100vh; animation: page-enter .3s ease-out; }
    .legal-page { flex: 1; padding: 60px 24px; }
    .legal-inner { max-width: 760px; margin: 0 auto; }
    .section-label { font-size: 12px; font-weight: 700; color: var(--pub-green); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
    h1 { font-size: 36px; font-weight: 700; color: var(--pub-text); margin: 0 0 8px; }
    .effective { font-size: 14px; color: var(--pub-text-subtle); margin: 0 0 40px; }
    .legal-body h2 { font-size: 18px; font-weight: 700; color: var(--pub-text); margin: 32px 0 12px; }
    .legal-body p, .legal-body ul { font-size: 15px; color: var(--pub-text-muted); line-height: 1.7; margin: 0 0 16px; }
    .legal-body ul { padding-left: 20px; }
    .legal-body ul li { margin-bottom: 6px; }
    .legal-body a { color: var(--pub-green); text-decoration: none; }
    .legal-body a:hover { text-decoration: underline; }
  `]
})
export class LegalTermsComponent {}
