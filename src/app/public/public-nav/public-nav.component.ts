import { AsyncPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { LangService } from '../../core/services/lang.service';

@Component({
  selector: 'app-public-nav',
  standalone: true,
  imports: [AsyncPipe, RouterLink, RouterLinkActive, TranslocoPipe],
  template: `
    <nav class="pub-nav">
      <div class="pub-nav-inner">
        <a class="pub-logo" [routerLink]="ls.p('/')">FIRM<span>O</span>METR@if (isDev) {<sup class="dev-badge">dev</sup>}</a>

        <div class="pub-nav-links">
          <a [routerLink]="ls.p('/search')" routerLinkActive="nav-active" (click)="menuOpen.set(false)">{{ 'nav.search' | transloco }}</a>
          <a [routerLink]="ls.p('/dashboard')" routerLinkActive="nav-active" (click)="menuOpen.set(false)">{{ 'nav.watched' | transloco }}</a>
          <a [routerLink]="ls.p('/ceny')" routerLinkActive="nav-active" (click)="menuOpen.set(false)">{{ 'nav.pricing' | transloco }}</a>
          <a [routerLink]="ls.p('/blog')" routerLinkActive="nav-active" (click)="menuOpen.set(false)">{{ 'nav.blog' | transloco }}</a>
          <a [routerLink]="ls.p('/kontakt')" routerLinkActive="nav-active" (click)="menuOpen.set(false)">{{ 'nav.contact' | transloco }}</a>
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
            <a [routerLink]="ls.p('/login')" class="pub-btn pub-btn-ghost pub-btn-sm">{{ 'nav.login' | transloco }}</a>
            <a [routerLink]="ls.p('/search')" class="pub-btn pub-btn-primary pub-btn-sm">{{ 'nav.try_free' | transloco }}</a>
          }

          <!-- Language switcher -->
          <div class="lang-switcher">
            <button
              class="lang-btn"
              [class.lang-btn--active]="ls.lang() === 'cs'"
              (click)="ls.switchLang('cs')"
              title="Česky"
            >
              <span class="flag">🇨🇿</span>
              <span class="lang-code">CZ</span>
            </button>
            <button
              class="lang-btn"
              [class.lang-btn--active]="ls.lang() === 'en'"
              (click)="ls.switchLang('en')"
              title="English"
            >
              <span class="flag">🇬🇧</span>
              <span class="lang-code">EN</span>
            </button>
          </div>

          <button
            class="pub-hamburger"
            (click)="menuOpen.set(!menuOpen())"
            [attr.aria-label]="(menuOpen() ? 'nav.close_menu' : 'nav.open_menu') | transloco"
          >
            {{ menuOpen() ? '✕' : '☰' }}
          </button>
        </div>
      </div>

      @if (menuOpen()) {
        <div class="pub-nav-mobile-links">
          <a [routerLink]="ls.p('/search')" (click)="menuOpen.set(false)">{{ 'nav.search' | transloco }}</a>
          <a [routerLink]="ls.p('/dashboard')" (click)="menuOpen.set(false)">{{ 'nav.watched' | transloco }}</a>
          <a [routerLink]="ls.p('/ceny')" (click)="menuOpen.set(false)">{{ 'nav.pricing' | transloco }}</a>
          <a [routerLink]="ls.p('/blog')" (click)="menuOpen.set(false)">{{ 'nav.blog' | transloco }}</a>
          <a [routerLink]="ls.p('/kontakt')" (click)="menuOpen.set(false)">{{ 'nav.contact' | transloco }}</a>
          @if (user$ | async) {
            <button class="mobile-action-btn" (click)="logout()">{{ 'nav.logout' | transloco }}</button>
          } @else {
            <a [routerLink]="ls.p('/login')" (click)="menuOpen.set(false)">{{ 'nav.login' | transloco }}</a>
          }
          <div class="mobile-lang-switcher">
            <button class="lang-btn" [class.lang-btn--active]="ls.lang() === 'cs'" (click)="ls.switchLang('cs'); menuOpen.set(false)">
              <span class="flag">🇨🇿</span> CZ
            </button>
            <button class="lang-btn" [class.lang-btn--active]="ls.lang() === 'en'" (click)="ls.switchLang('en'); menuOpen.set(false)">
              <span class="flag">🇬🇧</span> EN
            </button>
          </div>
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
    .dev-badge {
      font-size: 9px; font-weight: 700; letter-spacing: 1px;
      background: #f59e0b; color: #fff; border-radius: 3px;
      padding: 1px 4px; margin-left: 3px; vertical-align: super;
    }
    .pub-nav-links { display: flex; gap: 4px; flex: 1; }
    .pub-nav-links a {
      font-size: 14px; font-weight: 500; color: var(--pub-text-muted);
      text-decoration: none; padding: 6px 12px; border-radius: 6px; transition: all .15s;
    }
    .pub-nav-links a:hover { color: var(--pub-green); background: var(--pub-green-bg); }
    .pub-nav-links a.nav-active { color: var(--pub-green); background: var(--pub-green-light); font-weight: 600; }
    .pub-nav-actions { display: flex; align-items: center; gap: 10px; margin-left: auto; }
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

    /* Language switcher */
    .lang-switcher {
      display: flex; align-items: center; gap: 2px;
      border: 1px solid var(--pub-border); border-radius: 8px; overflow: hidden;
    }
    .lang-btn {
      display: flex; align-items: center; gap: 4px;
      background: none; border: none; padding: 5px 8px; cursor: pointer;
      font-family: inherit; font-size: 12px; font-weight: 600;
      color: var(--pub-text-muted); transition: all .15s; letter-spacing: .5px;
    }
    .lang-btn:hover { background: var(--pub-green-bg); color: var(--pub-green); }
    .lang-btn--active { background: var(--pub-green-light); color: var(--pub-green); }
    .flag { font-size: 14px; line-height: 1; }
    .lang-code { font-size: 11px; }

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
    .mobile-lang-switcher {
      display: flex; gap: 8px; padding-top: 8px; border-top: 1px solid var(--pub-border); margin-top: 4px;
    }
    .mobile-lang-switcher .lang-btn {
      border: 1px solid var(--pub-border); border-radius: 6px; padding: 6px 12px;
      font-size: 13px;
    }
    @media (max-width: 768px) {
      .pub-nav-links { display: none; }
      .pub-hamburger { display: flex; }
      .pub-nav-actions .pub-btn-ghost,
      .pub-nav-actions .pub-btn-primary { display: none; }
      .nav-user { display: none; }
      .lang-switcher { display: none; }
      .pub-nav-mobile-links { display: flex; }
    }
  `]
})
export class PublicNavComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  ls = inject(LangService);
  isDev = environment.branch !== 'main';

  user$ = this.auth.user$;
  menuOpen = signal(false);
  userMenuOpen = signal(false);

  async logout() {
    await this.auth.signOut();
    this.userMenuOpen.set(false);
    this.menuOpen.set(false);
    this.router.navigate([this.ls.p('/')]);
  }
}
