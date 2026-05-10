import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar color="primary">
      <mat-icon style="margin-right: 8px">policy</mat-icon>
      <span style="font-weight: 700; margin-right: 32px">Proklepni</span>
      <button mat-button routerLink="/dashboard" routerLinkActive="active-link">
        <mat-icon>dashboard</mat-icon> Sledované
      </button>
      <button mat-button routerLink="/search" routerLinkActive="active-link">
        <mat-icon>search</mat-icon> Vyhledat
      </button>
    </mat-toolbar>
    <router-outlet />
  `,
  styles: [`
    mat-toolbar { position: sticky; top: 0; z-index: 100; }
    .active-link { background: rgba(255,255,255,0.15); border-radius: 4px; }
  `]
})
export class AppComponent {}
