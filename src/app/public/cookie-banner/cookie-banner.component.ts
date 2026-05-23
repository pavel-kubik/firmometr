import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { CookieConsentService } from '../../core/services/cookie-consent.service';
import { LangService } from '../../core/services/lang.service';

@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [RouterLink, TranslocoPipe],
  template: `
    @if (consent.status() === null) {
      <div class="cookie-bar">
        <p class="cookie-text">
          {{ 'cookies.text' | transloco }}
          <a [routerLink]="ls.p('/gdpr')" class="cookie-link">{{ 'cookies.more' | transloco }}</a>
        </p>
        <div class="cookie-actions">
          <button class="pub-btn pub-btn-ghost cookie-btn-reject" (click)="consent.reject()">
            {{ 'cookies.reject' | transloco }}
          </button>
          <button class="pub-btn pub-btn-primary cookie-btn-accept" (click)="consent.accept()">
            {{ 'cookies.accept' | transloco }}
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    .cookie-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      background: var(--pub-dark);
      border-top: 1px solid #1e293b;
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
      animation: slide-up 0.25s ease-out;
    }
    @keyframes slide-up {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
    .cookie-text {
      margin: 0;
      font-size: 13px;
      color: var(--pub-text-subtle);
      line-height: 1.5;
      flex: 1;
      min-width: 200px;
    }
    .cookie-link {
      color: var(--pub-green);
      text-decoration: none;
      margin-left: 6px;
      white-space: nowrap;
    }
    .cookie-link:hover { text-decoration: underline; }
    .cookie-actions {
      display: flex;
      gap: 10px;
      flex-shrink: 0;
    }
    .pub-btn {
      padding: 8px 18px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      white-space: nowrap;
    }
    .pub-btn-primary {
      background: var(--pub-green);
      color: #fff;
    }
    .pub-btn-primary:hover { background: #047857; }
    .pub-btn-ghost {
      background: transparent;
      color: var(--pub-text-subtle);
      border: 1px solid #334155;
    }
    .pub-btn-ghost:hover { color: #fff; border-color: #64748b; }
    @media (max-width: 600px) {
      .cookie-bar { flex-direction: column; align-items: flex-start; }
      .cookie-actions { width: 100%; }
      .pub-btn { flex: 1; text-align: center; }
    }
  `]
})
export class CookieBannerComponent {
  consent = inject(CookieConsentService);
  ls = inject(LangService);
}
