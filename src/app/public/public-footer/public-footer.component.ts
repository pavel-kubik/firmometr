import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { LangService } from '../../core/services/lang.service';

@Component({
  selector: 'app-public-footer',
  standalone: true,
  imports: [RouterLink, TranslocoPipe],
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
            <li><a [routerLink]="ls.p('/search')">{{ 'footer.search' | transloco }}</a></li>
            <li><a [routerLink]="ls.p('/ceny')">{{ 'footer.pricing' | transloco }}</a></li>
            <li><a [routerLink]="ls.p('/kontakt')">{{ 'footer.contact' | transloco }}</a></li>
          </ul>
        </div>
        <div class="pub-footer-col">
          <h4>{{ 'footer.col_legal' | transloco }}</h4>
          <ul>
            <li><a [routerLink]="ls.p('/obchodni-podminky')">{{ 'footer.terms' | transloco }}</a></li>
            <li><a [routerLink]="ls.p('/gdpr')">{{ 'footer.gdpr' | transloco }}</a></li>
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
    .pub-footer {
      background: var(--pub-dark);
      padding: 48px 24px 0;
      margin-top: auto;
    }
    .pub-footer-inner {
      max-width: 1100px; margin: 0 auto;
      display: flex; gap: 48px; flex-wrap: wrap;
      padding-bottom: 40px;
    }
    .pub-footer-brand { flex: 1; min-width: 200px; }
    .pub-logo {
      font-size: 15px; font-weight: 900; letter-spacing: 3px;
      color: #fff; display: block; margin-bottom: 10px;
    }
    .pub-logo span { color: var(--pub-green); }
    .pub-footer-brand p { font-size: 13px; color: var(--pub-text-subtle); line-height: 1.6; margin: 0; }
    .pub-footer-col h4 {
      font-size: 11px; font-weight: 700; color: #475569;
      letter-spacing: 1px; text-transform: uppercase; margin: 0 0 12px;
    }
    .pub-footer-col ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
    .pub-footer-col ul li a { font-size: 13px; color: var(--pub-text-subtle); text-decoration: none; }
    .pub-footer-col ul li a:hover { color: var(--pub-green); }
    .pub-footer-bottom {
      max-width: 1100px; margin: 0 auto;
      padding: 20px 0;
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
  ls = inject(LangService);
}
