import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '../../core/services/auth.service';
import { LangService } from '../../core/services/lang.service';
import { PublicNavComponent } from '../../public/public-nav/public-nav.component';
import { PublicFooterComponent } from '../../public/public-footer/public-footer.component';

function passwordMatchValidator(group: AbstractControl) {
  const pw = group.get('password')?.value;
  const cpw = group.get('confirmPassword')?.value;
  return pw === cpw ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    TranslocoPipe,
    PublicNavComponent,
    PublicFooterComponent,
  ],
  template: `
    <app-public-nav />
    <div class="page">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>{{ (isOrderFlow ? 'register.title_order' : 'register.title') | transloco }}</mat-card-title>
          @if (isOrderFlow) {
            <p class="order-hint">{{ 'register.hint_order' | transloco }}</p>
          }
        </mat-card-header>
        <mat-card-content>
          @if (!registered) {
            <form [formGroup]="registerForm" (ngSubmit)="register()" class="form">

              <mat-form-field appearance="outline">
                <mat-label>{{ 'common.email_label' | transloco }}</mat-label>
                <input matInput type="email" formControlName="email" autocomplete="email">
                @if (registerForm.get('email')?.hasError('required') && registerForm.get('email')?.touched) {
                  <mat-error>{{ 'common.email_required' | transloco }}</mat-error>
                } @else if (registerForm.get('email')?.hasError('email') && registerForm.get('email')?.touched) {
                  <mat-error>{{ 'common.email_invalid' | transloco }}</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'common.password_label' | transloco }}</mat-label>
                <input matInput type="password" formControlName="password" autocomplete="new-password">
                @if (registerForm.get('password')?.hasError('required') && registerForm.get('password')?.touched) {
                  <mat-error>{{ 'common.password_required' | transloco }}</mat-error>
                } @else if (registerForm.get('password')?.hasError('minlength') && registerForm.get('password')?.touched) {
                  <mat-error>{{ 'common.password_minlength' | transloco }}</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'common.confirm_password_label' | transloco }}</mat-label>
                <input matInput type="password" formControlName="confirmPassword" autocomplete="new-password">
                @if (registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched) {
                  <mat-error>{{ 'common.passwords_mismatch' | transloco }}</mat-error>
                }
              </mat-form-field>

              @if (error) {
                <p class="error">{{ error }}</p>
              }

              <button class="pub-btn pub-btn-primary" type="submit" [disabled]="loading">
                {{ (loading ? 'register.btn_loading' : 'register.btn') | transloco }}
              </button>

              <p class="link-hint">
                {{ 'register.has_account' | transloco }} <a [routerLink]="ls.p('/login')" [queryParams]="{ returnUrl: returnUrl }">{{ 'register.login_link' | transloco }}</a>
              </p>

            </form>
          } @else {
            <div class="confirmation">
              <mat-icon class="confirm-icon">mark_email_read</mat-icon>
              <h3>{{ 'register.confirm_title' | transloco }}</h3>
              <p>{{ (isOrderFlow ? 'register.confirm_msg_order' : 'register.confirm_msg') | transloco }}</p>
              <a [routerLink]="ls.p('/login')" [queryParams]="{ returnUrl: returnUrl }" class="pub-btn pub-btn-ghost pub-btn-sm">{{ 'register.back_to_login' | transloco }}</a>
            </div>
          }
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
    .form {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-top: 16px;
    }
    mat-form-field { width: 100%; }
    .error { color: #f44336; margin: 0; font-size: 14px; }
    .link-hint { text-align: center; margin: 0; font-size: 14px; }
    .order-hint { font-size: 14px; color: rgba(0,0,0,.6); margin: 4px 0 0; }
    .confirmation {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 12px;
      padding: 24px 0;
    }
    .confirm-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #4caf50;
    }
  `],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  ls = inject(LangService);

  get returnUrl(): string | null { return this.route.snapshot.queryParams['returnUrl'] ?? null; }
  get isOrderFlow(): boolean { return this.returnUrl?.includes('/objednat') ?? false; }

  registerForm = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator }
  );

  loading = false;
  error = '';
  registered = false;

  async register() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    const { email, password } = this.registerForm.value;
    const { error } = await this.auth.signUp(email!, password!, this.returnUrl ?? undefined);
    if (error) {
      this.error = error.message;
    } else {
      this.registered = true;
    }
    this.loading = false;
  }
}
