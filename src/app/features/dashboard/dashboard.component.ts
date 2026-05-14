import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { WatchService } from '../../core/services/watch.service';
import { WatchedEntity } from '../../core/models/watch.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressBarModule, MatChipsModule, MatSnackBarModule
  ],
  template: `
    <div class="dashboard-page">
      <div class="page-header">
        <h1>Sledované subjekty</h1>
        <button mat-raised-button color="primary" (click)="goSearch()">
          <mat-icon>add</mat-icon> Přidat subjekt
        </button>
      </div>

      <mat-progress-bar *ngIf="loading" mode="indeterminate"></mat-progress-bar>

      <div *ngIf="!loading && entities.length === 0" class="empty-state">
        <mat-icon>visibility_off</mat-icon>
        <h2>Zatím žádné sledované subjekty</h2>
        <p>Vyhledejte firmu nebo osobu a přidejte ji ke sledování.</p>
        <button mat-raised-button color="primary" (click)="goSearch()">Vyhledat subjekt</button>
      </div>

      <div class="entities-grid">
        <mat-card *ngFor="let entity of entities" class="entity-card" [ngClass]="getStatusClass(entity)">
          <mat-card-header>
            <mat-icon mat-card-avatar>business</mat-icon>
            <mat-card-title>{{ entity.displayName }}</mat-card-title>
            <mat-card-subtitle>IČO: {{ entity.ico }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p class="last-checked">
              <mat-icon class="small-icon">schedule</mat-icon>
              Poslední kontrola: {{ entity.lastCheckedAt ? formatDate(entity.lastCheckedAt) : 'Zatím nekontrolováno' }}
            </p>
            <p *ngIf="entity.notifyEmail" class="notify-email">
              <mat-icon class="small-icon">email</mat-icon>
              {{ entity.notifyEmail }}
            </p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary" (click)="goDetail(entity.ico)">
              <mat-icon>open_in_new</mat-icon> Detail
            </button>
            <button mat-button color="warn" (click)="unwatch(entity)">
              <mat-icon>delete</mat-icon> Odebrat
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { margin: 0; }
    .entities-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
    .entity-card { height: 100%; }
    .empty-state { text-align: center; padding: 80px 24px; color: #999; }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; margin-bottom: 16px; }
    .empty-state h2 { color: #555; }
    .last-checked, .notify-email { display: flex; align-items: center; gap: 4px; color: #666; font-size: 14px; margin: 4px 0; }
    .small-icon { font-size: 16px; width: 16px; height: 16px; }
    .status-green  { border-right: 4px solid #4caf50; }
    .status-orange { border-right: 4px solid #ff9800; }
    .status-red    { border-right: 4px solid #f44336; }
  `]
})
export class DashboardComponent implements OnInit {
  private watchService = inject(WatchService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  entities: WatchedEntity[] = [];
  loading = true;

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.watchService.listAll().subscribe({
      next: (data) => { this.entities = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  unwatch(entity: WatchedEntity) {
    this.watchService.unwatch(entity.id).subscribe(() => {
      this.entities = this.entities.filter(e => e.id !== entity.id);
      this.snackBar.open(`${entity.displayName} odebrán ze sledování`, 'OK', { duration: 3000 });
    });
  }

  getStatusClass(entity: WatchedEntity): string {
    if (entity.isirClarity === 'ACTIVE_DEBTOR' || entity.isirClarity === 'ACTIVE_CO_DEBTOR') return 'status-red';
    if (entity.dphNespolehlivy === true) return 'status-red';
    if (entity.isirClarity === 'PAST_DEBTOR') return 'status-orange';
    if (entity.isirClarity === 'CLEAR' && entity.aresStavKod === 'AKTIVNI') return 'status-green';
    return 'status-orange';
  }

  goSearch() { this.router.navigate(['/search']); }
  goDetail(ico: string) { this.router.navigate(['/search', ico]); }
  formatDate(iso: string) { return new Date(iso).toLocaleString('cs-CZ'); }
}
