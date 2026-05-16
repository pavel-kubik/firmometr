import { AsyncPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe],
  template: `
    <nav class="app-nav">
      <div class="app-nav-inner">
        <a class="app-logo" routerLink="/">FIRM<span>O</span>METR</a>
        <div class="app-nav-links" [class.open]="menuOpen()">
          <a routerLink="/dashboard" routerLinkActive="active" (click)="menuOpen.set(false)">Sledované</a>
          <a routerLink="/search" routerLinkActive="active" (click)="menuOpen.set(false)">Vyhledat</a>
        </div>
        <div class="app-nav-actions">
          @if (user$ | async; as user) {
            <div class="user-menu" [class.open]="userMenuOpen()">
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
          }
          <button class="app-hamburger" (click)="menuOpen.set(!menuOpen())" [attr.aria-label]="menuOpen() ? 'Zavřít menu' : 'Otevřít menu'">
            {{ menuOpen() ? '✕' : '☰' }}
          </button>
        </div>
      </div>
      @if (menuOpen()) {
        <div class="app-nav-mobile-links">
          <a routerLink="/dashboard" routerLinkActive="active" (click)="menuOpen.set(false)">Sledované</a>
          <a routerLink="/search" routerLinkActive="active" (click)="menuOpen.set(false)">Vyhledat</a>
          @if (user$ | async) {
            <button class="mobile-logout" (click)="logout()">Odhlásit se</button>
          } @else {
            <a routerLink="/login" (click)="menuOpen.set(false)">Přihlásit se</a>
          }
        </div>
      }
    </nav>
    <router-outlet />
  `,
  styles: [`
    .app-nav {
      background: #fff;
      border-bottom: 1px solid var(--pub-border);
      position: sticky; top: 0; z-index: 100;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    .app-nav-inner {
      max-width: 1200px; margin: 0 auto; padding: 0 24px;
      display: flex; align-items: center; height: 60px; gap: 32px;
    }
    .app-logo {
      font-size: 17px; font-weight: 900; letter-spacing: 3px;
      color: var(--pub-text); text-decoration: none; flex-shrink: 0;
    }
    .app-logo span { color: var(--pub-green); }
    .app-nav-links { display: flex; gap: 4px; flex: 1; }
    .app-nav-links a {
      font-size: 14px; font-weight: 500; color: var(--pub-text-muted);
      text-decoration: none; padding: 6px 12px; border-radius: 6px; transition: all .15s;
    }
    .app-nav-links a:hover { color: var(--pub-green); background: var(--pub-green-bg); }
    .app-nav-links a.active { color: var(--pub-green); background: var(--pub-green-light); font-weight: 600; }
    .app-nav-actions { display: flex; align-items: center; gap: 10px; margin-left: auto; }
    .app-hamburger {
      display: none; background: none; border: 1px solid var(--pub-border);
      border-radius: 6px; width: 36px; height: 36px; cursor: pointer;
      font-size: 18px; color: var(--pub-text-muted);
    }
    .user-menu { position: relative; }
    .user-btn {
      display: flex; align-items: center; gap: 6px; background: none;
      border: 1px solid var(--pub-border); border-radius: 8px;
      padding: 6px 12px; cursor: pointer; font-family: inherit; font-size: 14px;
      color: var(--pub-text-muted); transition: border-color .15s;
    }
    .user-btn:hover { border-color: var(--pub-green); color: var(--pub-green); }
    .user-email { max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
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
    .app-nav-mobile-links {
      display: none; flex-direction: column; gap: 4px;
      padding: 12px 24px 16px; border-top: 1px solid var(--pub-border);
    }
    .app-nav-mobile-links a {
      font-size: 15px; font-weight: 500; color: var(--pub-text-muted);
      text-decoration: none; padding: 8px 0;
    }
    .app-nav-mobile-links a.active { color: var(--pub-green); }
    .mobile-logout {
      background: none; border: none; padding: 8px 0; font-family: inherit;
      font-size: 15px; color: var(--pub-text-muted); cursor: pointer; text-align: left;
    }
    @media (max-width: 768px) {
      .app-nav-links { display: none; }
      .app-hamburger { display: flex; align-items: center; justify-content: center; }
      .app-nav-mobile-links { display: flex; }
      .user-menu { display: none; }
    }
  `]
})
export class AppShellComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  user$ = this.auth.user$;
  menuOpen = signal(false);
  userMenuOpen = signal(false);

  async logout() {
    await this.auth.signOut();
    this.userMenuOpen.set(false);
    this.router.navigate(['/login']);
  }
}
