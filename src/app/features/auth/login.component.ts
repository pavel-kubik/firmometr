import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '../../core/services/auth.service';
import { LangService } from '../../core/services/lang.service';
import { PublicNavComponent } from '../../public/public-nav/public-nav.component';
import { PublicFooterComponent } from '../../public/public-footer/public-footer.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTabsModule,
    TranslocoPipe,
    PublicNavComponent,
    PublicFooterComponent,
  ],
  template: `
    <app-public-nav />
    <div class="page">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>{{ (isOrderFlow ? 'login.title_order' : 'login.title') | transloco }}</mat-card-title>
          @if (isOrderFlow) {
            <p class="order-hint">{{ 'login.hint_order' | transloco }}</p>
          }
        </mat-card-header>
        <mat-card-content>
          <mat-tab-group>

            <mat-tab [label]="'login.tab_password' | transloco">
              <form [formGroup]="passwordForm" (ngSubmit)="loginWithPassword()" class="tab-form">
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'common.email_label' | transloco }}</mat-label>
                  <input matInput type="email" formControlName="email" autocomplete="email">
                  @if (passwordForm.get('email')?.hasError('required') && passwordForm.get('email')?.touched) {
                    <mat-error>{{ 'common.email_required' | transloco }}</mat-error>
                  } @else if (passwordForm.get('email')?.hasError('email') && passwordForm.get('email')?.touched) {
                    <mat-error>{{ 'common.email_invalid' | transloco }}</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>{{ 'common.password_label' | transloco }}</mat-label>
                  <input matInput type="password" formControlName="password" autocomplete="current-password">
                  @if (passwordForm.get('password')?.hasError('required') && passwordForm.get('password')?.touched) {
                    <mat-error>{{ 'common.password_required' | transloco }}</mat-error>
                  }
                </mat-form-field>

                @if (passwordError) {
                  <p class="error">{{ passwordError }}</p>
                }

                <button class="pub-btn pub-btn-primary" type="submit" [disabled]="loading">
                  {{ (loading ? 'login.btn_loading' : 'login.btn') | transloco }}
                </button>

                <p class="link-hint">
                  {{ 'login.no_account' | transloco }} <a [routerLink]="ls.p('/register')" [queryParams]="{ returnUrl: returnUrl }">{{ 'login.register_link' | transloco }}</a>
                </p>
              </form>
            </mat-tab>

            <mat-tab [label]="'login.tab_magic' | transloco">
              @if (!magicLinkSent) {
                <form [formGroup]="magicForm" (ngSubmit)="loginWithMagicLink()" class="tab-form">
                  <p class="hint">{{ 'login.magic_hint' | transloco }}</p>

                  <mat-form-field appearance="outline">
                    <mat-label>{{ 'common.email_label' | transloco }}</mat-label>
                    <input matInput type="email" formControlName="email" autocomplete="email">
                    @if (magicForm.get('email')?.hasError('required') && magicForm.get('email')?.touched) {
                      <mat-error>{{ 'common.email_required' | transloco }}</mat-error>
                    } @else if (magicForm.get('email')?.hasError('email') && magicForm.get('email')?.touched) {
                      <mat-error>{{ 'common.email_invalid' | transloco }}</mat-error>
                    }
                  </mat-form-field>

                  @if (magicError) {
                    <p class="error">{{ magicError }}</p>
                  }

                  <button class="pub-btn pub-btn-primary" type="submit" [disabled]="loading">
                    {{ (loading ? 'login.magic_btn_loading' : 'login.magic_btn') | transloco }}
                  </button>
                </form>
              } @else {
                <div class="confirmation tab-form">
                  <mat-icon class="confirm-icon">mark_email_read</mat-icon>
                  <h3>{{ 'login.magic_sent_title' | transloco }}</h3>
                  <p>{{ 'login.magic_sent_msg' | transloco }}</p>
                </div>
              }
            </mat-tab>

          </mat-tab-group>
        </mat-card-content>
      </mat-card>
    </div>
    <app-public-footer />
  `,
  styles: [`
    :host { display: flex; flex-direction: column; min-height: 100vh; }
    .page {
      display: flex;
      justify-content: center;
      padding: 48px 24px;
      flex: 1;
    }
    .auth-card {
      width: 100%;
      max-width: 420px;
    }
    .tab-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 24px 0 8px;
    }
    mat-form-field { width: 100%; }
    .error { color: #f44336; margin: 0; font-size: 14px; }
    .hint { color: rgba(0,0,0,.6); margin: 0; font-size: 14px; }
    .link-hint { text-align: center; margin: 0; font-size: 14px; }
    .order-hint { font-size: 14px; color: rgba(0,0,0,.6); margin: 4px 0 0; }
    .confirmation {
      align-items: center;
      text-align: center;
    }
    .confirm-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #4caf50;
    }
  `],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  ls = inject(LangService);

  passwordForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  magicForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  get returnUrl(): string | null { return this.route.snapshot.queryParams['returnUrl'] ?? null; }
  get isOrderFlow(): boolean { return this.returnUrl?.includes('/objednat') ?? false; }

  loading = false;
  passwordError = '';
  magicError = '';
  magicLinkSent = false;

  async loginWithPassword() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.passwordError = '';
    const { email, password } = this.passwordForm.value;
    const { error } = await this.auth.signInWithPassword(email!, password!);
    if (error) {
      this.passwordError = error.message;
    } else {
      const returnUrl = this.route.snapshot.queryParams['returnUrl'];
      returnUrl ? this.router.navigateByUrl(returnUrl) : this.router.navigate([this.ls.p('/dashboard')]);
    }
    this.loading = false;
  }

  async loginWithMagicLink() {
    if (this.magicForm.invalid) {
      this.magicForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.magicError = '';
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];
    const { error } = await this.auth.signInWithOtp(this.magicForm.value.email!, returnUrl);
    if (error) {
      this.magicError = error.message;
    } else {
      this.magicLinkSent = true;
    }
    this.loading = false;
  }
}
