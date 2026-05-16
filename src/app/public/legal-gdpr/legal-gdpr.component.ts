import { Component } from '@angular/core';
import { PublicNavComponent } from '../public-nav/public-nav.component';
import { PublicFooterComponent } from '../public-footer/public-footer.component';

@Component({
  selector: 'app-legal-gdpr',
  standalone: true,
  imports: [PublicNavComponent, PublicFooterComponent],
  template: `
    <app-public-nav />

    <main class="legal-page">
      <div class="legal-inner">
        <div class="section-label">Právní dokumenty</div>
        <h1>Zásady ochrany osobních údajů</h1>
        <p class="effective">Účinné od 16. 5. 2026</p>

        <div class="legal-body">

          <h2>1. Správce osobních údajů</h2>
          <p>
            Butterfly Flowers s.r.o.<br>
            IČO: 07102127<br>
            Sídlo: Srbínská 867/4, Strašnice, 10000 Praha 10<br>
            Kontakt: <a href="mailto:info@firmometr.cz">info&#64;firmometr.cz</a>
          </p>

          <h2>2. Jaké osobní údaje zpracováváme</h2>

          <h3>Registrovaní uživatelé</h3>
          <ul>
            <li>E-mailová adresa (pro přihlášení a komunikaci)</li>
            <li>Datum a čas registrace</li>
            <li>Sledovaná IČO (pro funkci watchlistu)</li>
          </ul>

          <h3>Všichni návštěvníci</h3>
          <ul>
            <li>Technické záznamy přístupu (IP adresa, čas přístupu, typ prohlížeče) — uchovávány max. 30 dní v provozních logách</li>
            <li>Anonymizovaná analytická data prostřednictvím Google Tag Manager</li>
          </ul>

          <h3>Data z veřejných rejstříků</h3>
          <p>Aplikace zobrazuje data z veřejných rejstříků, včetně rodných čísel fyzických osob podnikatelů obsažených v Insolvenčním rejstříku. Tato data <strong>nejsou provozovatelem ukládána</strong> — jsou načítána v reálném čase přímo ze zdrojových registrů a nejsou perzistována v databázi provozovatele.</p>

          <h2>3. Účel a právní základ zpracování</h2>
          <table>
            <thead>
              <tr><th>Údaje</th><th>Účel</th><th>Právní základ</th></tr>
            </thead>
            <tbody>
              <tr><td>E-mail</td><td>Autentizace a komunikace</td><td>Plnění smlouvy (čl. 6 odst. 1 písm. b) GDPR)</td></tr>
              <tr><td>Watchlist IČO</td><td>Funkce sledování firem</td><td>Plnění smlouvy</td></tr>
              <tr><td>Provozní logy</td><td>Bezpečnost a diagnostika</td><td>Oprávněný zájem (čl. 6 odst. 1 písm. f) GDPR)</td></tr>
              <tr><td>Analytická data</td><td>Měření návštěvnosti</td><td>Oprávněný zájem</td></tr>
            </tbody>
          </table>

          <h2>4. Doba uchování</h2>
          <ul>
            <li>E-mail a watchlist: po dobu trvání uživatelského účtu, nejdéle 3 roky od poslední aktivity</li>
            <li>Provozní logy: max. 30 dní</li>
          </ul>

          <h2>5. Vaše práva</h2>
          <p>Máte právo na:</p>
          <ul>
            <li><strong>Přístup</strong> — kdykoli si vyžádat kopii svých osobních údajů</li>
            <li><strong>Opravu</strong> — požádat o opravu nepřesných údajů</li>
            <li><strong>Výmaz</strong> — požádat o smazání svého účtu a všech osobních údajů</li>
            <li><strong>Omezení zpracování</strong> — v zákonem stanovených případech</li>
            <li><strong>Přenositelnost</strong> — obdržet své údaje ve strojově čitelném formátu</li>
          </ul>
          <p>Svá práva uplatňujte na adrese <a href="mailto:info@firmometr.cz">info&#64;firmometr.cz</a>. Máte také právo podat stížnost u <a href="https://www.uoou.cz" target="_blank" rel="noopener">Úřadu pro ochranu osobních údajů (uoou.cz)</a>.</p>

          <h2>6. Předávání třetím stranám</h2>
          <p>Vaše osobní údaje jsou zpracovávány prostřednictvím těchto poskytovatelů:</p>
          <ul>
            <li><strong>Supabase</strong> (Supabase Inc., USA) — autentizace a databáze; certifikován v rámci EU-US Data Privacy Framework</li>
            <li><strong>Netlify</strong> (Netlify Inc., USA) — hostingové a provozní služby</li>
            <li><strong>Google</strong> — anonymizovaná analytika prostřednictvím Google Tag Manager</li>
          </ul>
          <p>Žádné osobní údaje nejsou předávány dalším třetím stranám za účelem marketingu nebo profilování.</p>

          <h2>7. Soubory cookies</h2>
          <p>Aplikace využívá Google Tag Manager pro anonymní analytické sledování návštěvnosti. Přihlašovací relace jsou uchovávány v localStorage prohlížeče. Podrobné nastavení cookies bude doplněno v příští verzi aplikace.</p>

          <h2>8. Kontakt</h2>
          <p>Veškeré dotazy ohledně zpracování osobních údajů zasílejte na <a href="mailto:info@firmometr.cz">info&#64;firmometr.cz</a>.</p>

        </div>
      </div>
    </main>

    <app-public-footer />
  `,
  styles: [`
    :host { display: flex; flex-direction: column; min-height: 100vh; }
    .legal-page { flex: 1; padding: 60px 24px; }
    .legal-inner { max-width: 760px; margin: 0 auto; }
    .section-label { font-size: 12px; font-weight: 700; color: var(--pub-green); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
    h1 { font-size: 36px; font-weight: 700; color: var(--pub-text); margin: 0 0 8px; }
    .effective { font-size: 14px; color: var(--pub-text-subtle); margin: 0 0 40px; }
    .legal-body h2 { font-size: 18px; font-weight: 700; color: var(--pub-text); margin: 32px 0 12px; }
    .legal-body h3 { font-size: 15px; font-weight: 700; color: var(--pub-text); margin: 20px 0 8px; }
    .legal-body p, .legal-body ul { font-size: 15px; color: var(--pub-text-muted); line-height: 1.7; margin: 0 0 16px; }
    .legal-body ul { padding-left: 20px; }
    .legal-body ul li { margin-bottom: 6px; }
    .legal-body a { color: var(--pub-green); text-decoration: none; }
    .legal-body a:hover { text-decoration: underline; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px; }
    th { background: #f8fafc; color: var(--pub-text); font-weight: 600; text-align: left; padding: 10px 12px; border: 1px solid var(--pub-border); }
    td { padding: 9px 12px; border: 1px solid var(--pub-border); color: var(--pub-text-muted); vertical-align: top; }
    @media (max-width: 600px) {
      table, thead, tbody, th, td, tr { display: block; }
      thead { display: none; }
      td { border: none; border-bottom: 1px solid var(--pub-border); padding: 8px 0; }
    }
  `]
})
export class LegalGdprComponent {}
