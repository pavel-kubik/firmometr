import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { WatchService } from '../../core/services/watch.service';
import { WatchedEntity } from '../../core/models/watch.model';
import { AuthService } from '../../core/services/auth.service';
import { PublicNavComponent } from '../../public/public-nav/public-nav.component';
import { PublicFooterComponent } from '../../public/public-footer/public-footer.component';

function passwordMatchValidator(group: AbstractControl) {
  return group.get('password')?.value === group.get('confirmPassword')?.value
    ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule, MatIconModule,
    MatProgressBarModule, MatSnackBarModule,
    MatFormFieldModule, MatInputModule, MatTabsModule,
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

      <!-- Auth CTA section (not logged in) -->
      <section *ngIf="!loading && !isLoggedIn" class="auth-section">
        <div class="auth-inner">
          <h2 class="auth-heading">Začněte sledovat firmy ještě dnes</h2>
          <p class="auth-sub">Zaregistrujte se zdarma a získejte přehled o svých obchodních partnerech.</p>

          <mat-card class="auth-card">
            <mat-card-content>
              <mat-tab-group>

                <mat-tab label="Přihlásit se">
                  <form [formGroup]="loginForm" (ngSubmit)="login()" class="auth-form">
                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>E-mail</mat-label>
                      <input matInput type="email" formControlName="email" autocomplete="email">
                      @if (loginForm.get('email')?.hasError('required') && loginForm.get('email')?.touched) {
                        <mat-error>E-mail je povinný</mat-error>
                      } @else if (loginForm.get('email')?.hasError('email') && loginForm.get('email')?.touched) {
                        <mat-error>Zadejte platný e-mail</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>Heslo</mat-label>
                      <input matInput type="password" formControlName="password" autocomplete="current-password">
                      @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
                        <mat-error>Heslo je povinné</mat-error>
                      }
                    </mat-form-field>

                    @if (loginError) {
                      <p class="auth-error">{{ loginError }}</p>
                    }

                    <button class="pub-btn pub-btn-primary auth-submit" type="submit" [disabled]="authLoading">
                      {{ authLoading ? 'Přihlašuji…' : 'Přihlásit se' }}
                    </button>
                  </form>
                </mat-tab>

                <mat-tab label="Registrovat se">
                  @if (!registered) {
                    <form [formGroup]="registerForm" (ngSubmit)="register()" class="auth-form">
                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>E-mail</mat-label>
                        <input matInput type="email" formControlName="email" autocomplete="email">
                        @if (registerForm.get('email')?.hasError('required') && registerForm.get('email')?.touched) {
                          <mat-error>E-mail je povinný</mat-error>
                        } @else if (registerForm.get('email')?.hasError('email') && registerForm.get('email')?.touched) {
                          <mat-error>Zadejte platný e-mail</mat-error>
                        }
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>Heslo</mat-label>
                        <input matInput type="password" formControlName="password" autocomplete="new-password">
                        @if (registerForm.get('password')?.hasError('required') && registerForm.get('password')?.touched) {
                          <mat-error>Heslo je povinné</mat-error>
                        } @else if (registerForm.get('password')?.hasError('minlength') && registerForm.get('password')?.touched) {
                          <mat-error>Heslo musí mít alespoň 6 znaků</mat-error>
                        }
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>Potvrdit heslo</mat-label>
                        <input matInput type="password" formControlName="confirmPassword" autocomplete="new-password">
                        @if (registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched) {
                          <mat-error>Hesla se neshodují</mat-error>
                        }
                      </mat-form-field>

                      @if (registerError) {
                        <p class="auth-error">{{ registerError }}</p>
                      }

                      <button class="pub-btn pub-btn-primary auth-submit" type="submit" [disabled]="authLoading">
                        {{ authLoading ? 'Registruji…' : 'Zaregistrovat se' }}
                      </button>
                    </form>
                  } @else {
                    <div class="auth-confirm">
                      <mat-icon class="confirm-icon">mark_email_read</mat-icon>
                      <h3>Potvrďte e-mail</h3>
                      <p>Zaslali jsme vám potvrzovací odkaz. Klikněte na něj pro dokončení registrace.</p>
                    </div>
                  }
                </mat-tab>

              </mat-tab-group>
            </mat-card-content>
          </mat-card>
        </div>
      </section>

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

    .dashboard-content { padding: 32px 24px; max-width: 1200px; margin: 0 auto; width: 100%; box-sizing: border-box; }
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

    /* Auth CTA section */
    .auth-section {
      background: linear-gradient(160deg, #f0fdf4 0%, #ecfdf5 50%, #fff 100%);
      padding: 56px 24px 64px;
    }
    .auth-inner {
      max-width: 480px;
      margin: 0 auto;
      text-align: center;
    }
    .auth-heading {
      color: #000;
      font-size: 26px;
      font-weight: 700;
      margin: 0 0 10px;
    }
    .auth-sub {
      color: rgba(0,0,0,0.85);
      font-size: 15px;
      margin: 0 0 32px;
    }
    .auth-card { width: 100%; text-align: left; }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 20px 0 8px;
    }
    .w-full { width: 100%; }
    .auth-submit { width: 100%; margin-top: 8px; }
    .auth-error { color: #f44336; font-size: 14px; margin: 0; }
    .auth-confirm {
      display: flex; flex-direction: column; align-items: center;
      text-align: center; gap: 8px; padding: 32px 0;
    }
    .confirm-icon { font-size: 48px; width: 48px; height: 48px; color: #059669; }
  `]
})
export class DashboardComponent implements OnInit {
  private watchService = inject(WatchService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  entities: WatchedEntity[] = [];
  loading = true;
  isLoggedIn = false;

  authLoading = false;
  loginError = '';
  registerError = '';
  registered = false;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  registerForm = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator }
  );

  readonly demoEntities: WatchedEntity[] = [
    {
      id: 'demo-1', ico: '12345678', displayName: 'Spolehlivý řemeslník s.r.o.',
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

  async login() {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    this.authLoading = true;
    this.loginError = '';
    const { email, password } = this.loginForm.value;
    const { error } = await this.authService.signInWithPassword(email!, password!);
    if (error) { this.loginError = error.message; }
    else { this.router.navigate(['/dashboard']); }
    this.authLoading = false;
  }

  async register() {
    if (this.registerForm.invalid) { this.registerForm.markAllAsTouched(); return; }
    this.authLoading = true;
    this.registerError = '';
    const { email, password } = this.registerForm.value;
    const { error } = await this.authService.signUp(email!, password!);
    if (error) { this.registerError = error.message; }
    else { this.registered = true; }
    this.authLoading = false;
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
