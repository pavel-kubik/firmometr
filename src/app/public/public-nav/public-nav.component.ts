import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-public-nav',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="pub-nav">
      <div class="pub-nav-inner">
        <a class="pub-logo" routerLink="/">FIRM<span>O</span>METR</a>
        <div class="pub-nav-links" [class.open]="menuOpen()">
          <a routerLink="/ceny" (click)="menuOpen.set(false)">Ceny</a>
          <a routerLink="/kontakt" (click)="menuOpen.set(false)">Kontakt</a>
        </div>
        <div class="pub-nav-actions">
          <a routerLink="/login" class="pub-btn pub-btn-ghost pub-btn-sm">Přihlásit se</a>
          <a routerLink="/search" class="pub-btn pub-btn-primary pub-btn-sm">Vyzkoušet zdarma →</a>
          <button class="pub-hamburger" (click)="menuOpen.set(!menuOpen())" [attr.aria-label]="menuOpen() ? 'Zavřít menu' : 'Otevřít menu'">
            {{ menuOpen() ? '✕' : '☰' }}
          </button>
        </div>
      </div>
      @if (menuOpen()) {
        <div class="pub-nav-mobile-links">
          <a routerLink="/ceny" (click)="menuOpen.set(false)">Ceny</a>
          <a routerLink="/kontakt" (click)="menuOpen.set(false)">Kontakt</a>
          <a routerLink="/login" (click)="menuOpen.set(false)">Přihlásit se</a>
          <a routerLink="/search" class="pub-btn pub-btn-primary pub-btn-sm" (click)="menuOpen.set(false)">Vyzkoušet zdarma →</a>
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
      max-width: 1100px; margin: 0 auto; padding: 0 24px;
      display: flex; align-items: center; height: 60px; gap: 32px;
    }
    .pub-logo {
      font-size: 17px; font-weight: 900; letter-spacing: 3px;
      color: var(--pub-text); text-decoration: none; flex-shrink: 0;
    }
    .pub-logo span { color: var(--pub-green); }
    .pub-nav-links {
      display: flex; gap: 28px; flex: 1;
    }
    .pub-nav-links a {
      font-size: 14px; font-weight: 500; color: var(--pub-text-muted);
      text-decoration: none; transition: color .15s;
    }
    .pub-nav-links a:hover { color: var(--pub-green); }
    .pub-nav-actions { display: flex; align-items: center; gap: 10px; margin-left: auto; }
    .pub-hamburger {
      display: none; background: none; border: 1px solid var(--pub-border);
      border-radius: 6px; width: 36px; height: 36px; cursor: pointer;
      font-size: 18px; color: var(--pub-text-muted);
    }
    .pub-nav-mobile-links {
      display: none; flex-direction: column; gap: 4px;
      padding: 12px 24px 16px; border-top: 1px solid var(--pub-border);
      background: #fff;
    }
    .pub-nav-mobile-links a {
      font-size: 15px; font-weight: 500; color: var(--pub-text-muted);
      text-decoration: none; padding: 8px 0;
    }
    @media (max-width: 768px) {
      .pub-nav-links { display: none; }
      .pub-hamburger { display: flex; align-items: center; justify-content: center; }
      .pub-nav-actions .pub-btn-ghost { display: none; }
      .pub-nav-mobile-links { display: flex; }
    }
  `]
})
export class PublicNavComponent {
  menuOpen = signal(false);
}
