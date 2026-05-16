import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { WatchService } from '../../core/services/watch.service';
import { WatchedEntity } from '../../core/models/watch.model';
import { AuthService } from '../../core/services/auth.service';
import { PublicNavComponent } from '../../public/public-nav/public-nav.component';
import { PublicFooterComponent } from '../../public/public-footer/public-footer.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule, MatIconModule,
    MatProgressBarModule, MatSnackBarModule,
    PublicNavComponent, PublicFooterComponent,
  ],
  template: `
    <app-public-nav />
    <main class="page-main">

      <section class="dashboard-hero">
        <div class="hero-inner">
          <h1>Sledované subjekty</h1>
          <button class="pub-btn pub-btn-primary" (click)="goSearch()">+ Přidat subjekt</button>
        </div>
      </section>

      <div class="dashboard-content">
        <mat-progress-bar *ngIf="loading" mode="indeterminate"></mat-progress-bar>

        <div *ngIf="!loading && isLoggedIn && entities.length === 0" class="empty-state">
          <mat-icon>visibility_off</mat-icon>
          <h2>Zatím žádné sledované subjekty</h2>
          <p>Vyhledejte firmu nebo osobu a přidejte ji ke sledování.</p>
          <button class="pub-btn pub-btn-primary" (click)="goSearch()">Vyhledat subjekt</button>
        </div>

        <!-- Real entities (logged in) -->
        <div *ngIf="isLoggedIn" class="entities-grid">
          <mat-card *ngFor="let entity of entities" class="entity-card" [ngClass]="getStatusClass(entity)">
            <mat-card-header>
              <mat-icon mat-card-avatar>business</mat-icon>
              <mat-card-title>{{ entity.displayName }}</mat-card-title>
              <mat-card-subtitle>IČO: {{ entity.ico }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="status-chips">
                <span *ngIf="entity.isirClarity === 'ACTIVE_DEBTOR'" class="badge badge-danger">Aktivní insolvenční řízení</span>
                <span *ngIf="entity.isirClarity === 'ACTIVE_CO_DEBTOR'" class="badge badge-warn">Spoluodpovědný dlužník</span>
                <span *ngIf="entity.isirClarity === 'PAST_DEBTOR'" class="badge badge-past">Minulý dlužník</span>
                <span *ngIf="entity.isirClarity === 'CLEAR'" class="badge badge-ok">Bez insolvencí</span>
                <span *ngIf="entity.dphNespolehlivy" class="badge badge-danger">Nespolehlivý plátce DPH</span>
              </div>
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
              <button class="pub-btn pub-btn-ghost pub-btn-sm" (click)="goDetail(entity.ico)">Detail →</button>
              <button class="pub-btn pub-btn-danger pub-btn-sm" (click)="unwatch(entity)">Odebrat</button>
            </mat-card-actions>
          </mat-card>
        </div>

        <!-- Demo entities (not logged in) -->
        <ng-container *ngIf="!loading && !isLoggedIn">
          <p class="demo-notice">
            <mat-icon class="small-icon">info</mat-icon>
            Přihlaste se pro správu vlastního portfolia sledovaných subjektů.
          </p>
          <div class="entities-grid">
            <mat-card *ngFor="let entity of demoEntities" class="entity-card demo-card" [ngClass]="getStatusClass(entity)">
              <div class="demo-strap">DEMO</div>
              <mat-card-header>
                <mat-icon mat-card-avatar>business</mat-icon>
                <mat-card-title>{{ entity.displayName }}</mat-card-title>
                <mat-card-subtitle>IČO: {{ entity.ico }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="status-chips">
                  <span *ngIf="entity.isirClarity === 'ACTIVE_DEBTOR'" class="badge badge-danger">Aktivní insolvenční řízení</span>
                  <span *ngIf="entity.isirClarity === 'ACTIVE_CO_DEBTOR'" class="badge badge-warn">Spoluodpovědný dlužník</span>
                  <span *ngIf="entity.isirClarity === 'PAST_DEBTOR'" class="badge badge-past">Minulý dlužník</span>
                  <span *ngIf="entity.isirClarity === 'CLEAR'" class="badge badge-ok">Bez insolvencí</span>
                  <span *ngIf="entity.dphNespolehlivy" class="badge badge-danger">Nespolehlivý plátce DPH</span>
                </div>
                <p class="last-checked">
                  <mat-icon class="small-icon">schedule</mat-icon>
                  Poslední kontrola: {{ formatDate(entity.lastCheckedAt!) }}
                </p>
              </mat-card-content>
            </mat-card>
          </div>
        </ng-container>
      </div>

    </main>
    <app-public-footer />
  `,
  styles: [`
    :host { display: flex; flex-direction: column; min-height: 100vh; }
    .page-main { flex: 1; display: flex; flex-direction: column; }

    .dashboard-hero {
      background: linear-gradient(160deg, #f0fdf4 0%, #ecfdf5 50%, #fff 100%);
      border-bottom: 1px solid #d1fae5;
    }
    .hero-inner {
      max-width: 1200px; margin: 0 auto; padding: 32px 24px;
      display: flex; justify-content: space-between; align-items: center;
    }
    .hero-inner h1 { margin: 0; font-size: 28px; font-weight: 700; color: var(--pub-text); }

    .dashboard-content { flex: 1; padding: 32px 24px; max-width: 1200px; margin: 0 auto; width: 100%; box-sizing: border-box; }
    .entities-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    @media (max-width: 768px) { .entities-grid { grid-template-columns: 1fr; } }
    .entity-card { height: 100%; }
    .empty-state { text-align: center; padding: 80px 24px; color: #999; }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; margin-bottom: 16px; }
    .empty-state h2 { color: #555; }
    .last-checked, .notify-email { display: flex; align-items: center; gap: 4px; color: #666; font-size: 14px; margin: 4px 0; }
    .small-icon { font-size: 16px; width: 16px; height: 16px; }
    .status-green  { border-left: 4px solid #4caf50; }
    .status-orange { border-left: 4px solid #ff9800; }
    .status-red    { border-left: 4px solid #f44336; }
    .status-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
    .badge { display: inline-block; font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
    .badge-ok     { background: #e8f5e9; color: #2e7d32; }
    .badge-past   { background: #fff8e1; color: #f57f17; }
    .badge-warn   { background: #fff3e0; color: #e65100; }
    .badge-danger { background: #ffebee; color: #c62828; }
    .demo-notice { display: flex; align-items: center; gap: 6px; color: #666; font-size: 14px; margin-bottom: 20px; }
    .demo-card { position: relative; overflow: hidden; }
    .demo-strap {
      position: absolute; top: 22px; right: -30px;
      width: 120px; text-align: center;
      background: #059669; color: #fff;
      font-size: 11px; font-weight: 700; letter-spacing: 2px;
      padding: 5px 0;
      transform: rotate(45deg);
      pointer-events: none;
      z-index: 1;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private watchService = inject(WatchService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  entities: WatchedEntity[] = [];
  loading = true;
  isLoggedIn = false;

  readonly demoEntities: WatchedEntity[] = [
    {
      id: 'demo-1', ico: '12345678', displayName: 'Spolehlivý řemeslník',
      addedAt: new Date().toISOString(), lastCheckedAt: new Date().toISOString(),
      notifyEmail: null, isirClarity: 'CLEAR', aresStavKod: 'AKTIVNI', dphNespolehlivy: false,
    },
    {
      id: 'demo-2', ico: '87654321', displayName: 'Podezřelá a.s.',
      addedAt: new Date().toISOString(), lastCheckedAt: new Date().toISOString(),
      notifyEmail: null, isirClarity: 'PAST_DEBTOR', aresStavKod: 'AKTIVNI', dphNespolehlivy: false,
    },
    {
      id: 'demo-3', ico: '11223344', displayName: 'Nespolehlivá s.r.o.',
      addedAt: new Date().toISOString(), lastCheckedAt: new Date().toISOString(),
      notifyEmail: null, isirClarity: 'ACTIVE_DEBTOR', aresStavKod: 'AKTIVNI', dphNespolehlivy: true,
    },
  ];

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.isLoggedIn = !!user;
      if (this.isLoggedIn) this.load();
      else this.loading = false;
    });
  }

  load() {
    this.loading = true;
    this.watchService.listAll().subscribe({
      next: (data) => { this.entities = data; this.loading = false; },
      error: () => { this.loading = false; },
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
  formatDate(iso: string) {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? iso : d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' });
  }
}
