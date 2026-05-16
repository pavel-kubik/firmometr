import { AsyncPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-public-nav',
  standalone: true,
  imports: [AsyncPipe, RouterLink, RouterLinkActive],
  template: `
    <nav class="pub-nav">
      <div class="pub-nav-inner">
        <a class="pub-logo" routerLink="/">FIRM<span>O</span>METR</a>

        <div class="pub-nav-links">
          <a routerLink="/search" routerLinkActive="nav-active" (click)="menuOpen.set(false)">Vyhledat</a>
          <a routerLink="/dashboard" routerLinkActive="nav-active" (click)="menuOpen.set(false)">Sledované</a>
          <a routerLink="/ceny" routerLinkActive="nav-active" (click)="menuOpen.set(false)">Ceny</a>
          <a routerLink="/kontakt" routerLinkActive="nav-active" (click)="menuOpen.set(false)">Kontakt</a>
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
                  <button (click)="logout()">Odhlásit se</button>
                </div>
              }
            </div>
          } @else {
            <a routerLink="/login" class="pub-btn pub-btn-ghost pub-btn-sm">Přihlásit se</a>
            <a routerLink="/search" class="pub-btn pub-btn-primary pub-btn-sm">Vyzkoušet zdarma →</a>
          }
          <button class="pub-hamburger" (click)="menuOpen.set(!menuOpen())" [attr.aria-label]="menuOpen() ? 'Zavřít menu' : 'Otevřít menu'">
            {{ menuOpen() ? '✕' : '☰' }}
          </button>
        </div>
      </div>

      @if (menuOpen()) {
        <div class="pub-nav-mobile-links">
          <a routerLink="/search" (click)="menuOpen.set(false)">Vyhledat</a>
          <a routerLink="/dashboard" (click)="menuOpen.set(false)">Sledované</a>
          <a routerLink="/ceny" (click)="menuOpen.set(false)">Ceny</a>
          <a routerLink="/kontakt" (click)="menuOpen.set(false)">Kontakt</a>
          @if (user$ | async) {
            <button class="mobile-action-btn" (click)="logout()">Odhlásit se</button>
          } @else {
            <a routerLink="/login" (click)="menuOpen.set(false)">Přihlásit se</a>
          }
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
    @media (max-width: 768px) {
      .pub-nav-links { display: none; }
      .pub-hamburger { display: flex; }
      .pub-nav-actions .pub-btn-ghost,
      .pub-nav-actions .pub-btn-primary { display: none; }
      .nav-user { display: none; }
      .pub-nav-mobile-links { display: flex; }
    }
  `]
})
export class PublicNavComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  user$ = this.auth.user$;
  menuOpen = signal(false);
  userMenuOpen = signal(false);

  async logout() {
    await this.auth.signOut();
    this.userMenuOpen.set(false);
    this.menuOpen.set(false);
    this.router.navigate(['/']);
  }
}
