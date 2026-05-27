import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { QRCodeModule } from 'angularx-qrcode';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { SearchService } from '../../../core/services/search.service';
import { SEARCH_FREE_CAP, SEARCH_WINDOW_MINUTES } from '../../../core/config/rate-limit';
import { WatchService, WatchLimitError } from '../../../core/services/watch.service';
import { AuthService } from '../../../core/services/auth.service';
import { LangService } from '../../../core/services/lang.service';
import { SubjectDetail } from '../../../core/models/subject.model';
import { PublicNavComponent } from '../../../public/public-nav/public-nav.component';
import { PublicFooterComponent } from '../../../public/public-footer/public-footer.component';

@Component({
  selector: 'app-subject-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatProgressBarModule,
    MatIconModule, MatDividerModule, MatSnackBarModule,
    MatPaginatorModule, QRCodeModule, TranslocoPipe, PublicNavComponent, PublicFooterComponent,
  ],
  template: `
    <app-public-nav />
    <main class="page-main">

      <section class="detail-hero">
        <div class="hero-inner">
          <a [routerLink]="ls.p('/search')" class="back-link">← {{ 'search.title' | transloco }}</a>
          <div class="hero-title-row" *ngIf="subject">
            <h1>{{ subject.obchodniFirma || 'IČO ' + subject.ico }}</h1>
            <div class="header-actions">
              <button class="qr-btn" (click)="showQr = !showQr" [title]="'detail.qr_title' | transloco" [class.qr-btn--active]="showQr">
                <mat-icon>qr_code</mat-icon>
              </button>
              <button *ngIf="!subject.isWatched" class="pub-btn pub-btn-primary" (click)="toggleWatch()">{{ 'detail.watch' | transloco }}</button>
              <button *ngIf="subject.isWatched" class="pub-btn pub-btn-ghost" (click)="toggleWatch()">{{ 'detail.unwatch' | transloco }}</button>
            </div>
          </div>
        </div>
      </section>

      <div class="detail-content">
        <mat-progress-bar *ngIf="loading" mode="indeterminate"></mat-progress-bar>

        <div *ngIf="showQr && subject" class="qr-panel">
          <qrcode [qrdata]="pageUrl" [width]="160" [margin]="1" errorCorrectionLevel="M"></qrcode>
          <p class="qr-url">{{ pageUrl }}</p>
        </div>

        <div *ngIf="error" class="error-msg">{{ error }}</div>
        <div *ngIf="limitReached" class="limit-banner">
          <mat-icon class="limit-icon">hourglass_top</mat-icon>
          <div class="limit-text">
            <strong>{{ 'search.limit_msg' | transloco: { freeCap: freeCap, windowMinutes: windowMinutes } }}</strong>
            <span *ngIf="remainingSeconds > 0"> {{ 'search.limit_retry' | transloco: { countdown: countdownDisplay } }}</span>
          </div>
          <a [routerLink]="ls.p('/login')" class="pub-btn pub-btn-ghost pub-btn-sm limit-login-btn">{{ 'detail.login_cta' | transloco }}</a>
        </div>

        <ng-container *ngIf="subject">
          <div class="cards-grid">
            <!-- ARES card -->
            <mat-card>
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>business</mat-icon> {{ 'detail.ares_title' | transloco }}
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <table class="info-table">
                  <tr><td>{{ 'detail.col_ico' | transloco }}</td><td><strong>{{ subject.ico }}</strong></td></tr>
                  <tr><td>{{ 'detail.col_dic' | transloco }}</td><td>{{ subject.dic || '—' }}</td></tr>
                  <tr><td>{{ 'detail.col_legal_form' | transloco }}</td><td>{{ subject.pravniForma || '—' }}</td></tr>
                  <tr><td>{{ 'detail.col_address' | transloco }}</td><td>{{ subject.sidloEnriched || subject.sidloText || '—' }}</td></tr>
                  <tr><td>{{ 'detail.col_founded' | transloco }}</td><td>{{ formatCzechDate(subject.datumVzniku) }}</td></tr>
                  <tr><td>{{ 'detail.col_status' | transloco }}</td><td>
                    <span [class]="'status-badge ' + (subject.stavKod === 'AKTIVNI' ? 'badge-active' : 'badge-inactive')">
                      {{ subject.stavNazev || subject.stavKod || 'Neznámý' }}
                    </span>
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
                  {{ 'detail.isir_title' | transloco }}
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div *ngIf="subject.isir.clarity === 'CLEAR'" class="isir-ok">
                  <p>{{ 'detail.isir_clear' | transloco }}</p>
                </div>
                <div *ngIf="subject.isir.clarity === 'ACTIVE_DEBTOR'">
                  <p class="isir-warning">{{ 'detail.isir_active' | transloco }}</p>
                </div>
                <div *ngIf="subject.isir.clarity === 'ACTIVE_CO_DEBTOR'">
                  <p class="isir-warning isir-warning-soft">{{ 'detail.isir_co_debtor' | transloco }}</p>
                </div>
                <div *ngIf="subject.isir.clarity === 'PAST_DEBTOR'">
                  <p class="isir-past-debtor">{{ 'detail.isir_past' | transloco }}</p>
                </div>
                <div *ngIf="subject.isir.proceedings.length" class="isir-records">
                  <div *ngFor="let p of subject.isir.proceedings || []"
                       [class]="'isir-record ' + (p.isActive ? 'isir-record-active' : 'isir-record-inactive')">
                    <div class="isir-record-main">
                      <span class="isir-sp-znacka">{{ p.senZnacka || '—' }}</span>
                      <span [class]="'isir-stav-badge ' + (p.isActive ? 'isir-stav-active' : 'isir-stav-done')">
                        {{ p.stavKonkursu || '—' }}
                      </span>
                    </div>
                    <div class="isir-record-meta">
                      <span *ngIf="p.datumZahajeni">{{ 'detail.isir_start_date' | transloco }} {{ formatCzechDate(p.datumZahajeni) }}</span>
                      <a *ngIf="p.urlDetail" [href]="p.urlDetail" target="_blank" rel="noopener"
                         class="isir-link">
                        <mat-icon>open_in_new</mat-icon> {{ 'detail.isir_link' | transloco }}
                      </a>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- DPH card -->
            <mat-card [class]="dphCardClass()">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon [color]="subject.dph.nespolehlivy ? 'warn' : ''">
                    {{ subject.dph.nedostupne ? 'cloud_off' : subject.dph.nespolehlivy ? 'warning' : subject.dph.isPlatce ? 'verified' : 'remove_circle_outline' }}
                  </mat-icon>
                  {{ 'detail.dph_title' | transloco }}
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div *ngIf="subject.dph.nedostupne" class="dph-unavailable">
                  <p>{{ 'detail.dph_unavailable' | transloco }}</p>
                </div>
                <div *ngIf="!subject.dph.nedostupne && !subject.dph.isPlatce" class="dph-neutral">
                  <p>{{ 'detail.dph_not_registered' | transloco }}</p>
                </div>
                <div *ngIf="subject.dph.isPlatce && !subject.dph.nespolehlivy" class="dph-ok">
                  <p>{{ 'detail.dph_reliable' | transloco }}</p>
                </div>
                <div *ngIf="subject.dph.nespolehlivy">
                  <p class="dph-warning">{{ 'detail.dph_unreliable' | transloco }}</p>
                  <p *ngIf="subject.dph.datumNespolehlivosti" class="dph-date">
                    {{ 'detail.dph_since' | transloco }} {{ formatCzechDate(subject.dph.datumNespolehlivosti) }}
                  </p>
                </div>
                <div *ngIf="subject.dph.ucty.length" class="dph-accounts">
                  <p class="dph-accounts-label">{{ 'detail.dph_accounts' | transloco }}</p>
                  <div *ngFor="let u of subject.dph.ucty" class="dph-account">{{ u }}</div>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- OR card -->
            <mat-card *ngIf="subject.or">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>domain</mat-icon> {{ 'detail.or_title' | transloco }}
                </mat-card-title>
                <mat-card-subtitle *ngIf="subject.or.spisovatel">
                  {{ 'detail.or_file_ref' | transloco }} {{ subject.or.spisovatel }}
                </mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div *ngIf="currentStatutari.length > 0" class="or-section">
                  <p class="or-section-label">{{ 'detail.or_directors' | transloco }}</p>
                  <div *ngFor="let s of pagedCurrentStatutari" class="statutar">
                    <div class="statutar-name">{{ s.jmeno || '—' }}</div>
                    <div class="statutar-meta">
                      <span *ngIf="s.funkce" class="statutar-funkce">{{ s.funkce }}</span>
                      <span *ngIf="s.datumVzniku" class="statutar-date">od {{ formatCzechDate(s.datumVzniku) }}</span>
                    </div>
                  </div>
                  <mat-paginator *ngIf="currentStatutari.length > statutarPageSize"
                    [length]="currentStatutari.length"
                    [pageSize]="statutarPageSize"
                    [pageIndex]="statutarPage"
                    [hidePageSize]="true"
                    (page)="statutarPage = $event.pageIndex"
                    class="or-paginator">
                  </mat-paginator>
                </div>
                <div *ngIf="currentStatutari.length === 0" class="or-neutral">
                  <p>{{ 'detail.or_no_directors' | transloco }}</p>
                </div>

                <div *ngIf="pastStatutari.length > 0" class="or-history-toggle">
                  <button class="pub-btn pub-btn-ghost pub-btn-sm history-btn" (click)="showPastStatutari = !showPastStatutari">
                    {{ showPastStatutari ? ('detail.hide_past_directors' | transloco) : ('detail.show_past_directors' | transloco) + ' (' + pastStatutari.length + ')' }}
                  </button>
                  <div *ngIf="showPastStatutari" class="past-statutari">
                    <div *ngFor="let s of pastStatutari" class="statutar statutar-past">
                      <div class="statutar-name">{{ s.jmeno || '—' }}</div>
                      <div class="statutar-meta">
                        <span *ngIf="s.funkce" class="statutar-funkce">{{ s.funkce }}</span>
                        <span *ngIf="s.datumVzniku" class="statutar-date">od {{ formatCzechDate(s.datumVzniku) }}</span>
                        <span *ngIf="s.datumZaniku" class="statutar-date">do {{ formatCzechDate(s.datumZaniku) }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <mat-divider *ngIf="subject.or.sbirkaListin.length > 0" class="or-divider"></mat-divider>

                <div *ngIf="subject.or.sbirkaListin.length > 0" class="or-section">
                  <p class="or-section-label">
                    {{ 'detail.or_documents' | transloco }}
                    <span *ngIf="subject.or.sbirkaListinCelkem > 0" class="or-count">({{ 'detail.or_documents_total' | transloco: { count: subject.or.sbirkaListinCelkem } }})</span>
                  </p>
                  <div *ngFor="let l of pagedListiny" class="listina">
                    <span class="listina-typ">{{ l.typListiny }}</span>
                    <span *ngIf="l.datumVzniku" class="listina-date">{{ formatCzechDate(l.datumVzniku) }}</span>
                  </div>
                  <mat-paginator *ngIf="subject.or.sbirkaListin.length > listinaPageSize"
                    [length]="subject.or.sbirkaListin.length"
                    [pageSize]="listinaPageSize"
                    [pageIndex]="listinaPage"
                    [hidePageSize]="true"
                    (page)="listinaPage = $event.pageIndex"
                    class="or-paginator">
                  </mat-paginator>
                </div>

                <div *ngIf="subject.or.orUrl" class="or-link-row">
                  <a [href]="subject.or.orUrl" target="_blank" rel="noopener" class="or-link">
                    <mat-icon>open_in_new</mat-icon> {{ 'detail.or_link' | transloco }}
                  </a>
                </div>
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

    .detail-hero {
      background: linear-gradient(160deg, #f0fdf4 0%, #ecfdf5 50%, #fff 100%);
      border-bottom: 1px solid #d1fae5;
    }
    .hero-inner { max-width: 1100px; margin: 0 auto; padding: 24px 24px 32px; }
    .back-link {
      display: inline-block; margin-bottom: 16px; font-size: 14px; font-weight: 500;
      color: var(--pub-green); text-decoration: none;
    }
    .back-link:hover { opacity: 0.8; }
    .hero-title-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }
    .hero-title-row h1 { margin: 0; font-size: 28px; font-weight: 700; color: var(--pub-text); }
    .header-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

    .detail-content { flex: 1; padding: 32px 24px; max-width: 1100px; margin: 0 auto; width: 100%; box-sizing: border-box; }
    .qr-panel { display: inline-flex; flex-direction: column; align-items: center; border: 1px solid var(--pub-border); border-radius: 12px; padding: 16px; margin-bottom: 24px; }
    .qr-url { font-size: 11px; color: #757575; margin: 8px 0 0; word-break: break-all; max-width: 200px; text-align: center; }

    .cards-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    @media (max-width: 768px) { .cards-grid { grid-template-columns: 1fr; } }

    .info-table { width: 100%; border-collapse: collapse; }
    .info-table td { padding: 8px 4px; }
    .info-table td:first-child { color: #666; width: 140px; }

    .status-badge { display: inline-block; font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
    .badge-active { background: #dcfce7; color: #065f46; }
    .badge-inactive { background: #fee2e2; color: #991b1b; }

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
    .limit-banner { display: flex; align-items: center; gap: 12px; background: #fff8e1; border: 1px solid #ffe082; border-radius: 8px; padding: 12px 16px; margin: 16px 0; }
    .limit-icon { color: #f9a825; flex-shrink: 0; }
    .limit-text { flex: 1; color: #555; font-size: 14px; }
    .limit-login-btn { white-space: nowrap; }
    .qr-btn { background: none; border: 1px solid var(--pub-border); border-radius: 8px; width: 40px; height: 40px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; color: var(--pub-text-muted); transition: color .15s, border-color .15s; }
    .qr-btn:hover, .qr-btn--active { color: var(--pub-green); border-color: var(--pub-green); }
    mat-card { margin-bottom: 0; }
    mat-card-content { padding-top: 16px; }
    .dph-ok { color: #2e7d32; }
    .dph-unavailable { color: #757575; font-style: italic; }
    .dph-neutral { color: #757575; }
    .dph-warning { color: #c62828; font-weight: 500; margin-bottom: 8px; }
    .dph-date { color: #757575; font-size: 13px; margin: 0; }
    .dph-accounts { margin-top: 16px; }
    .dph-accounts-label { font-size: 13px; color: #666; margin: 0 0 6px; }
    .dph-account { font-family: monospace; font-size: 13px; padding: 4px 8px; background: #f5f5f5; border-radius: 4px; margin-bottom: 4px; }
    .or-section { margin-bottom: 12px; }
    .or-section-label { font-size: 13px; color: #666; margin: 0 0 8px; font-weight: 500; }
    .or-count { font-weight: normal; }
    .or-neutral { color: #757575; font-size: 14px; }
    .statutar { padding: 6px 0; border-bottom: 1px solid #f0f0f0; }
    .statutar:last-child { border-bottom: none; }
    .statutar-name { font-weight: 500; font-size: 14px; }
    .statutar-meta { display: flex; gap: 12px; margin-top: 2px; }
    .statutar-funkce { font-size: 12px; color: #1565c0; background: #e3f2fd; padding: 1px 6px; border-radius: 10px; }
    .statutar-date { font-size: 12px; color: #757575; }
    .or-divider { margin: 12px 0; }
    .listina { display: flex; justify-content: space-between; align-items: baseline; padding: 4px 0; border-bottom: 1px solid #f5f5f5; font-size: 13px; }
    .listina:last-child { border-bottom: none; }
    .listina-typ { color: #333; flex: 1; }
    .listina-date { color: #9e9e9e; font-size: 12px; white-space: nowrap; margin-left: 8px; }
    .or-link-row { margin-top: 12px; }
    .or-link { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; color: #1565c0; text-decoration: none; }
    .or-link mat-icon { font-size: 14px; height: 14px; width: 14px; }
    .or-paginator { margin-top: 4px; }
    .or-history-toggle { margin-top: 8px; }
    .history-btn { margin-top: 4px; }
    .past-statutari { margin-top: 4px; }
    .statutar-past { opacity: 0.55; }
  `]
})
export class SubjectDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private searchService = inject(SearchService);
  private watchService = inject(WatchService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private transloco = inject(TranslocoService);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private doc = inject(DOCUMENT);
  ls = inject(LangService);

  readonly freeCap = SEARCH_FREE_CAP;
  readonly windowMinutes = SEARCH_WINDOW_MINUTES;
  remainingSeconds = 0;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;
  subject: SubjectDetail | null = null;
  loading = false;
  error = '';
  limitReached = false;
  showQr = false;
  showPastStatutari = false;
  pageUrl = '';
  listinaPage = 0;
  readonly listinaPageSize = 5;
  statutarPage = 0;
  readonly statutarPageSize = 3;

  get isLoggedIn(): boolean {
    return this.authService.currentUserId !== null;
  }

  get currentStatutari() {
    return this.subject?.or?.statutari.filter(s => !s.datumZaniku) ?? [];
  }

  get pastStatutari() {
    return this.subject?.or?.statutari.filter(s => !!s.datumZaniku) ?? [];
  }

  get pagedCurrentStatutari() {
    const list = this.currentStatutari;
    return list.slice(this.statutarPage * this.statutarPageSize, (this.statutarPage + 1) * this.statutarPageSize);
  }

  get pagedListiny() {
    const list = this.subject?.or?.sbirkaListin ?? [];
    return list.slice(this.listinaPage * this.listinaPageSize, (this.listinaPage + 1) * this.listinaPageSize);
  }

  ngOnInit() {
    const ico = this.route.snapshot.paramMap.get('ico')!;
    this.pageUrl = `https://firmometr.cz/search/${ico}`;
    this.load(ico);
  }

  load(ico: string) {
    this.loading = true;
    this.error = '';
    this.limitReached = false;
    this.listinaPage = 0;
    this.statutarPage = 0;
    this.searchService.searchByIco(ico).pipe(
      switchMap(data => {
        this.subject = data;
        this.setMetaTags(data);
        // TODO it looks like it doesn't work
        if (!this.isLoggedIn) return of(false);
        return this.watchService.isWatchedByIco(ico);
      })
    ).subscribe({
      next: (isWatched) => {
        this.subject!.isWatched = isWatched;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 429) {
          this.limitReached = true;
          this.startCountdown(parseInt(err.headers.get('Retry-After') ?? '0', 10) || 0);
        } else {
          this.error = this.transloco.translate('detail.load_error');
        }
        this.loading = false;
      }
    });
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

  private setMetaTags(s: SubjectDetail): void {
    const name = s.obchodniFirma || `IČO ${s.ico}`;
    const addr = s.sidloEnriched || s.sidloText || '';
    const isirText = s.isir.clarity === 'CLEAR' ? 'Bez záznamu v insolvenčním rejstříku.'
      : s.isir.clarity === 'PAST_DEBTOR' ? 'Dříve v insolvenci.'
      : 'AKTIVNÍ INSOLVENČNÍ ŘÍZENÍ.';
    const dphText = s.dph.nespolehlivy ? 'NESPOLEHLIVÝ PLÁTCE DPH.'
      : s.dph.isPlatce ? 'Spolehlivý plátce DPH.'
      : 'Neplátce DPH.';
    const title = `${name} (IČO ${s.ico}) — Firmometr`;
    const desc = [name, addr ? `Sídlo: ${addr}.` : '', `IČO: ${s.ico}.`, isirText, dphText]
      .filter(Boolean).join(' ');

    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: desc });
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: desc });
    this.metaService.updateTag({ property: 'og:url', content: this.pageUrl });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary' });
    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({ name: 'twitter:description', content: desc });
    this.setCanonical(this.pageUrl);

    const ld: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': name,
      'identifier': s.ico,
      'url': this.pageUrl,
    };
    if (addr) ld['address'] = { '@type': 'PostalAddress', 'streetAddress': addr, 'addressCountry': 'CZ' };
    if (s.dic) ld['vatID'] = s.dic;

    let script = this.doc.getElementById('ld-company') as HTMLScriptElement | null;
    if (!script) {
      script = this.doc.createElement('script') as HTMLScriptElement;
      script.id = 'ld-company';
      script.type = 'application/ld+json';
      this.doc.head.appendChild(script);
    }
    script.textContent = JSON.stringify(ld);
  }

  private setCanonical(url: string) {
    let link = this.doc.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  ngOnDestroy() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.doc.getElementById('ld-company')?.remove();
  }

  formatCzechDate(iso: string | null | undefined): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' });
  }

  dphCardClass(): string {
    if (!this.subject) return '';
    if (this.subject.dph.nespolehlivy) return 'card-warning';
    return '';
  }

  toggleWatch() {
    if (!this.subject) return;
    if (!this.isLoggedIn) {
      this.router.navigate(['/register']);
      return;
    }
    if (this.subject.isWatched) {
      this.watchService.unwatchByIco(this.subject.ico).subscribe(() => {
        this.subject!.isWatched = false;
        this.snackBar.open(
          this.transloco.translate('detail.unwatched_snack', { name: this.subject!.obchodniFirma || `IČO ${this.subject!.ico}` }),
          'OK', { duration: 3000 }
        );
      });
    } else {
      this.watchService.watch({
        ico: this.subject.ico,
        displayName: this.subject.obchodniFirma || `IČO ${this.subject.ico}`,
        isirClarity: this.subject.isir.clarity,
        aresStavKod: this.subject.stavKod ?? undefined,
        dphNespolehlivy: this.subject.dph.nespolehlivy ?? false,
      }).subscribe({
        next: () => {
          this.subject!.isWatched = true;
          this.snackBar.open(
            this.transloco.translate('detail.watched_snack', { name: this.subject!.obchodniFirma || `IČO ${this.subject!.ico}` }),
            'OK', { duration: 3000 }
          );
        },
        error: (err: unknown) => {
          const key = err instanceof WatchLimitError ? 'dashboard.watch_limit_tooltip' : 'detail.watch_error';
          this.snackBar.open(this.transloco.translate(key), 'OK', { duration: 3000 });
        }
      });
    }
  }
}
