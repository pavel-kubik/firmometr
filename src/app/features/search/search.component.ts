import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { TranslocoPipe } from '@jsverse/transloco';
import { SearchService } from '../../core/services/search.service';
import { SubjectSummary } from '../../core/models/subject.model';
import { SEARCH_FREE_CAP, SEARCH_WINDOW_MINUTES } from '../../core/config/rate-limit';
import { LangService } from '../../core/services/lang.service';
import { PublicNavComponent } from '../../public/public-nav/public-nav.component';
import { PublicFooterComponent } from '../../public/public-footer/public-footer.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatTableModule, MatProgressBarModule, MatIconModule,
    MatPaginatorModule, TranslocoPipe, PublicNavComponent, PublicFooterComponent,
  ],
  template: `
    <app-public-nav />
    <main class="page-main">

      <section class="search-hero">
        <div class="hero-inner">
          <div class="section-label">{{ 'search.label' | transloco }}</div>
          <h1>{{ 'search.title' | transloco }}</h1>
          <p class="hero-sub">{{ 'search.sub' | transloco }}</p>
          <div class="search-box">
            <div class="search-box-label">{{ 'search.input_label' | transloco }}</div>
            <div class="search-row">
              <input
                class="search-input-field"
                [(ngModel)]="query"
                (keyup.enter)="search()"
                [placeholder]="'search.placeholder' | transloco"
                [disabled]="loading"
              >
              <button class="pub-btn pub-btn-primary" (click)="search()" [disabled]="loading">{{ 'search.btn' | transloco }}</button>
            </div>
          </div>
        </div>
      </section>

      <div class="search-content">
        <mat-progress-bar *ngIf="loading" mode="indeterminate"></mat-progress-bar>
        <div *ngIf="error" class="error-msg">{{ error }}</div>
        <div *ngIf="limitReached" class="limit-banner">
          <mat-icon class="limit-icon">hourglass_top</mat-icon>
          <div class="limit-text">
            <strong>{{ 'search.limit_msg' | transloco : { freeCap: freeCap, windowMinutes: windowMinutes } }}</strong>
            <span *ngIf="remainingSeconds > 0"> {{ 'search.limit_retry' | transloco : { countdown: countdownDisplay } }}</span>
          </div>
          <a [routerLink]="ls.p('/login')" class="pub-btn pub-btn-ghost pub-btn-sm limit-login-btn">{{ 'search.login_cta' | transloco }}</a>
        </div>

        <div *ngIf="results.length > 0" class="results">
          <p class="result-count">{{ 'search.result_count' | transloco : { total: total } }}</p>
          <table mat-table [dataSource]="results" class="results-table">
            <ng-container matColumnDef="ico">
              <th mat-header-cell *matHeaderCellDef>{{ 'search.col_ico' | transloco }}</th>
              <td mat-cell *matCellDef="let r">{{ r.ico }}</td>
            </ng-container>
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>{{ 'search.col_name' | transloco }}</th>
              <td mat-cell *matCellDef="let r">{{ r.obchodniFirma }}</td>
            </ng-container>
            <ng-container matColumnDef="address">
              <th mat-header-cell *matHeaderCellDef>{{ 'search.col_address' | transloco }}</th>
              <td mat-cell *matCellDef="let r">{{ r.sidloText }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>{{ 'search.col_status' | transloco }}</th>
              <td mat-cell *matCellDef="let r">
                <span [class]="'status-badge ' + (r.stavNazev === 'Aktivní' ? 'badge-active' : 'badge-inactive')">
                  {{ r.stavNazev }}
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="chevron">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let r" class="chevron-cell">
                <mat-icon class="row-chevron">chevron_right</mat-icon>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;" class="clickable-row" (click)="goToDetail(row.ico)"></tr>
          </table>
          <mat-paginator
            [length]="total"
            [pageSize]="pageSize"
            [pageIndex]="pageIndex"
            [hidePageSize]="true"
            (page)="onPage($event)">
          </mat-paginator>
        </div>

        <div *ngIf="!loading && !searched" class="zero-state">
          <mat-icon>manage_search</mat-icon>
          <p>{{ 'search.input_label' | transloco }}</p>
        </div>

        <div *ngIf="!loading && searched && results.length === 0 && !error" class="empty-state">
          <mat-icon>search_off</mat-icon>
          <p>{{ 'search.no_results' | transloco }}</p>
        </div>
      </div>

    </main>
    <app-public-footer />
  `,
  styles: [`
    :host { display: flex; flex-direction: column; min-height: 100vh; }
    .page-main { flex: 1; display: flex; flex-direction: column; }

    .search-hero {
      background: linear-gradient(160deg, #f0fdf4 0%, #ecfdf5 50%, #fff 100%);
      border-bottom: 1px solid #d1fae5;
      padding: 48px 24px 40px;
      text-align: center;
    }
    .hero-inner { max-width: 620px; margin: 0 auto; }
    .section-label { font-size: 12px; font-weight: 700; color: var(--pub-green); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
    .search-hero h1 { font-size: 36px; font-weight: 700; color: var(--pub-text); margin: 0 0 12px; }
    .hero-sub { font-size: 16px; color: var(--pub-text-muted); margin: 0 0 28px; line-height: 1.6; }

    .search-box {
      background: #fff; border-radius: 12px; padding: 20px 24px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08); border: 1px solid var(--pub-border);
      text-align: left;
    }
    .search-box-label { font-size: 11px; font-weight: 700; color: var(--pub-text-subtle); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; }
    .search-row { display: flex; gap: 8px; }
    .search-input-field {
      flex: 1; padding: 10px 14px; border: 1px solid var(--pub-border); border-radius: 8px;
      font-size: 14px; font-family: inherit; background: #f8fafc; color: #333; outline: none;
    }
    .search-input-field:focus { border-color: var(--pub-green); }
    .search-input-field:disabled { opacity: 0.6; cursor: not-allowed; }

    .search-content { flex: 1; padding: 32px 24px; max-width: 1000px; margin: 0 auto; width: 100%; box-sizing: border-box; }
    .results-table { width: 100%; }
    .clickable-row { cursor: pointer; }
    .clickable-row:hover { background: #f5f5f5; }
    .result-count { color: #666; margin-bottom: 8px; }
    .error-msg { color: #f44336; margin: 16px 0; }
    .limit-banner { display: flex; align-items: center; gap: 12px; background: #fff8e1; border: 1px solid #ffe082; border-radius: 8px; padding: 12px 16px; margin: 16px 0; }
    .limit-icon { color: #f9a825; flex-shrink: 0; }
    .limit-text { flex: 1; color: #555; font-size: 14px; }
    .limit-login-btn { white-space: nowrap; }
    .empty-state, .zero-state { text-align: center; padding: 48px; color: #999; }
    .empty-state mat-icon, .zero-state mat-icon { font-size: 48px; width: 48px; height: 48px; display: block; margin: 0 auto 12px; }
    .chevron-cell { width: 32px; padding-right: 8px; }
    .row-chevron { color: #bdbdbd; vertical-align: middle; }

    .status-badge { display: inline-block; font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
    .badge-active { background: #dcfce7; color: #065f46; }
    .badge-inactive { background: #fee2e2; color: #991b1b; }
  `]
})
export class SearchComponent implements OnInit, OnDestroy {
  private searchService = inject(SearchService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  ls = inject(LangService);

  readonly freeCap = SEARCH_FREE_CAP;
  readonly windowMinutes = SEARCH_WINDOW_MINUTES;
  remainingSeconds = 0;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;
  query = '';
  results: SubjectSummary[] = [];

  ngOnInit() {
    const q = this.route.snapshot.queryParamMap.get('q');
    if (q) { this.query = q; this.search(); }
  }
  total = 0;
  loading = false;
  searched = false;
  error = '';
  limitReached = false;
  columns = ['ico', 'name', 'address', 'status', 'chevron'];
  readonly pageSize = 20;
  pageIndex = 0;

  search() {
    if (!this.query.trim()) return;
    this.pageIndex = 0;
    this.fetchPage(0);
  }

  onPage(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.fetchPage(event.pageIndex * this.pageSize);
  }

  private fetchPage(start: number) {
    const isIco = /^\d{8}$/.test(this.query.trim());
    if (isIco) {
      this.router.navigate([this.ls.p('/search'), this.query.trim()]);
      return;
    }

    this.loading = true;
    this.error = '';
    this.limitReached = false;
    this.results = [];
    this.searched = false;

    this.searchService.searchByName(this.query, start).subscribe({
      next: (res) => {
        this.results = res.items;
        this.total = res.total;
        this.loading = false;
        this.searched = true;
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 429) {
          this.limitReached = true;
          this.startCountdown(parseInt(err.headers.get('Retry-After') ?? '0', 10) || 0);
        } else {
          this.error = 'Chyba při vyhledávání. Zkuste to prosím znovu.';
        }
        this.loading = false;
        this.searched = true;
      }
    });
  }

  goToDetail(ico: string) {
    this.router.navigate([this.ls.p('/search'), ico]);
  }

  get countdownDisplay(): string {
    const m = Math.floor(this.remainingSeconds / 60);
    const s = this.remainingSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  private startCountdown(seconds: number) {
    const max = SEARCH_WINDOW_MINUTES * 60;
    if (seconds > 0 && seconds <= max) {
      this.startTimer(seconds);
    } else {
      this.remainingSeconds = max;
      this.searchService.capStatus().subscribe({
        next: ({ retryAfter }) => this.startTimer(Math.min(retryAfter, max)),
        error: () => this.startTimer(max),
      });
    }
  }

  private startTimer(seconds: number) {
    this.remainingSeconds = seconds;
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.countdownInterval = setInterval(() => {
      this.remainingSeconds = Math.max(0, this.remainingSeconds - 1);
      if (this.remainingSeconds === 0) {
        clearInterval(this.countdownInterval!);
        this.countdownInterval = null;
      }
    }, 1000);
  }

  ngOnDestroy() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
  }
}
