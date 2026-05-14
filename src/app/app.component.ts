import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    AsyncPipe,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
  ],
  template: `
    <mat-toolbar color="primary">
      <mat-icon style="margin-right: 8px">policy</mat-icon>
      <span style="font-weight: 700; margin-right: 32px">Lustrare</span>
      <button mat-button routerLink="/dashboard" routerLinkActive="active-link">
        <mat-icon>dashboard</mat-icon> Sledované
      </button>
      <button mat-button routerLink="/search" routerLinkActive="active-link">
        <mat-icon>search</mat-icon> Vyhledat
      </button>
      <span class="spacer"></span>
      @if (user$ | async; as user) {
        <button mat-button [matMenuTriggerFor]="userMenu">
          <mat-icon>account_circle</mat-icon>
          {{ user.email }}
          <mat-icon>arrow_drop_down</mat-icon>
        </button>
        <mat-menu #userMenu="matMenu">
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon> Odhlásit se
          </button>
        </mat-menu>
      } @else {
        <button mat-button routerLink="/login">
          <mat-icon>login</mat-icon> Přihlásit se
        </button>
      }
    </mat-toolbar>
    <router-outlet />
  `,
  styles: [`
    mat-toolbar { position: sticky; top: 0; z-index: 100; }
    .active-link { background: rgba(255,255,255,0.15); border-radius: 4px; }
    .spacer { flex: 1 1 auto; }
  `]
})
export class AppComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  user$ = this.auth.user$;

  async logout() {
    await this.auth.signOut();
    this.router.navigate(['/login']);
  }
}
