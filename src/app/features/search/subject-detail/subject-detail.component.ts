import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SearchService } from '../../../core/services/search.service';
import { WatchService } from '../../../core/services/watch.service';
import { SubjectDetail } from '../../../core/models/subject.model';

@Component({
  selector: 'app-subject-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatChipsModule, MatProgressBarModule,
    MatIconModule, MatDividerModule, MatSnackBarModule
  ],
  template: `
    <div class="detail-page">
      <div class="back-nav">
        <button mat-button routerLink="/search">
          <mat-icon>arrow_back</mat-icon> Zpět na vyhledávání
        </button>
      </div>

      <mat-progress-bar *ngIf="loading" mode="indeterminate"></mat-progress-bar>
      <div *ngIf="error" class="error-msg">{{ error }}</div>

      <ng-container *ngIf="subject">
        <div class="header-row">
          <h1>{{ subject.obchodniFirma || 'IČO ' + subject.ico }}</h1>
          <button mat-raised-button
            [color]="subject.isWatched ? 'warn' : 'accent'"
            (click)="toggleWatch()">
            <mat-icon>{{ subject.isWatched ? 'visibility_off' : 'visibility' }}</mat-icon>
            {{ subject.isWatched ? 'Přestat sledovat' : 'Sledovat' }}
          </button>
        </div>

        <div class="cards-grid">
          <!-- ARES card -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>
                <mat-icon>business</mat-icon> ARES — Obchodní rejstřík
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <table class="info-table">
                <tr><td>IČO</td><td><strong>{{ subject.ico }}</strong></td></tr>
                <tr><td>Právní forma</td><td>{{ subject.pravniForma || '—' }}</td></tr>
                <tr><td>Sídlo</td><td>{{ subject.sidloEnriched || subject.sidloText || '—' }}</td></tr>
                <tr><td>Datum vzniku</td><td>{{ subject.datumVzniku || '—' }}</td></tr>
                <tr><td>Stav</td><td>
                  <mat-chip-listbox>
                    <mat-chip [class]="subject.stavKod === 'AKTIVNI' ? 'chip-active' : 'chip-inactive'">
                      {{ subject.stavNazev || subject.stavKod || 'Neznámý' }}
                    </mat-chip>
                  </mat-chip-listbox>
                </td></tr>
              </table>
            </mat-card-content>
          </mat-card>

          <!-- ISIR card -->
          <mat-card [class]="subject.isir.clarity === 'ACTIVE_DEBTOR' || subject.isir.clarity === 'ACTIVE_CO_DEBTOR' ? 'card-warning' : subject.isir.clarity === 'PAST_DEBTOR' ? 'card-past' : ''">
            <mat-card-header>
              <mat-card-title>
                <mat-icon [color]="subject.isir.clarity === 'ACTIVE_DEBTOR' || subject.isir.clarity === 'ACTIVE_CO_DEBTOR' ? 'warn' : ''">
                  {{ subject.isir.clarity === 'CLEAR' ? 'check_circle' : subject.isir.clarity === 'PAST_DEBTOR' ? 'history' : 'warning' }}
                </mat-icon>
                ISIR — Insolvenční rejstřík
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div *ngIf="subject.isir.clarity === 'CLEAR'" class="isir-ok">
                <p>Žádná aktivní insolvenční řízení</p>
              </div>
              <div *ngIf="subject.isir.clarity === 'ACTIVE_DEBTOR'">
                <p class="isir-warning">Subjekt je dlužníkem v aktivním insolvenčním řízení!</p>
              </div>
              <div *ngIf="subject.isir.clarity === 'ACTIVE_CO_DEBTOR'">
                <p class="isir-warning isir-warning-soft">Subjekt je společným dlužníkem (SNM) v aktivním řízení.</p>
              </div>
              <div *ngIf="subject.isir.clarity === 'PAST_DEBTOR'">
                <p class="isir-past-debtor">Subjekt byl v minulosti dlužníkem v insolvenčním řízení (řízení již skončilo).</p>
              </div>
              <div *ngIf="subject.isir.proceedings?.length" class="isir-records">
                <div *ngFor="let p of subject.isir.proceedings || []"
                     [class]="'isir-record ' + (p.isActive ? 'isir-record-active' : 'isir-record-inactive')">
                  <div class="isir-record-main">
                    <span class="isir-sp-znacka">{{ p.senZnacka || '—' }}</span>
                    <span [class]="'isir-stav-badge ' + (p.isActive ? 'isir-stav-active' : 'isir-stav-done')">
                      {{ p.stavKonkursu || '—' }}
                    </span>
                  </div>
                  <div class="isir-record-meta">
                    <span *ngIf="p.datumZahajeni">Zahájení: {{ p.datumZahajeni }}</span>
                    <a *ngIf="p.urlDetail" [href]="p.urlDetail" target="_blank" rel="noopener"
                       class="isir-link">
                      <mat-icon>open_in_new</mat-icon> Zobrazit v ISIR
                    </a>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .detail-page { padding: 24px; max-width: 1100px; margin: 0 auto; }
    .back-nav { margin-bottom: 16px; }
    .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { margin: 0; }
    .cards-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px; }
    @media (max-width: 768px) { .cards-grid { grid-template-columns: 1fr; } }
    .info-table { width: 100%; border-collapse: collapse; }
    .info-table td { padding: 8px 4px; }
    .info-table td:first-child { color: #666; width: 140px; }
    .isir-ok { color: #2e7d32; display: flex; align-items: center; gap: 8px; }
    .isir-warning { color: #c62828; font-weight: 500; margin-bottom: 16px; }
    .isir-warning-soft { color: #e65100; }
    .isir-records { margin-top: 12px; display: flex; flex-direction: column; gap: 8px; }
    .isir-record { border-radius: 6px; padding: 10px 12px; border: 1px solid #e0e0e0; }
    .isir-record-active { border-left: 4px solid #c62828; background: #fff8f8; }
    .isir-record-inactive { border-left: 4px solid #9e9e9e; background: #fafafa; }
    .isir-record-main { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
    .isir-sp-znacka { font-family: monospace; font-size: 13px; }
    .isir-stav-badge { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 12px; white-space: nowrap; }
    .isir-stav-active { background: #ffebee; color: #c62828; }
    .isir-stav-done { background: #f5f5f5; color: #616161; }
    .isir-record-meta { font-size: 12px; color: #757575; display: flex; align-items: center; gap: 16px; }
    .isir-link { display: inline-flex; align-items: center; gap: 2px; font-size: 12px; color: #1565c0; text-decoration: none; }
    .isir-link mat-icon { font-size: 14px; height: 14px; width: 14px; }
    .card-warning { border-left: 4px solid #f44336 !important; }
    .card-past { border-left: 4px solid #f9a825 !important; }
    .isir-past-debtor { color: #f57f17; font-weight: 500; margin-bottom: 16px; }
    mat-card-title { display: flex; align-items: center; gap: 8px; }
    .error-msg { color: #f44336; margin: 16px 0; }
    .chip-active { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .chip-inactive { background: #fce4ec !important; color: #c62828 !important; }
    mat-card { margin-bottom: 0; }
    mat-card-content { padding-top: 16px; }
  `]
})
export class SubjectDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private searchService = inject(SearchService);
  private watchService = inject(WatchService);
  private snackBar = inject(MatSnackBar);

  subject: SubjectDetail | null = null;
  loading = false;
  error = '';

  ngOnInit() {
    const ico = this.route.snapshot.paramMap.get('ico')!;
    this.load(ico);
  }

  load(ico: string) {
    this.loading = true;
    this.error = '';
    this.searchService.searchByIco(ico).subscribe({
      next: (data) => {
        this.subject = data;
        this.subject.isWatched = this.watchService.isWatchedByIco(ico);
        this.loading = false;
      },
      error: () => {
        this.error = 'Nepodařilo se načíst data subjektu.';
        this.loading = false;
      }
    });
  }

  toggleWatch() {
    if (!this.subject) return;
    if (this.subject.isWatched) {
      const entity = this.watchService.getByIco(this.subject.ico);
      if (entity) {
        this.watchService.unwatch(entity.id).subscribe(() => {
          this.subject!.isWatched = false;
          this.snackBar.open('Sledování odebráno', 'OK', { duration: 3000 });
        });
      }
    } else {
      this.watchService.watch({
        ico: this.subject.ico,
        displayName: this.subject.obchodniFirma || `IČO ${this.subject.ico}`,
        isirClarity: this.subject.isir.clarity,
        aresStavKod: this.subject.stavKod ?? undefined,
      }).subscribe({
        next: () => {
          this.subject!.isWatched = true;
          this.snackBar.open('Subjekt přidán ke sledování', 'OK', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Chyba při přidávání ke sledování', 'OK', { duration: 3000 });
        }
      });
    }
  }
}
