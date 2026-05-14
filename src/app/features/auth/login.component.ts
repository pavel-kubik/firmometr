import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTabsModule,
  ],
  template: `
    <div class="page">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>Přihlásit se</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-tab-group>

            <mat-tab label="Email a heslo">
              <form [formGroup]="passwordForm" (ngSubmit)="loginWithPassword()" class="tab-form">
                <mat-form-field appearance="outline">
                  <mat-label>E-mail</mat-label>
                  <input matInput type="email" formControlName="email" autocomplete="email">
                  @if (passwordForm.get('email')?.hasError('required') && passwordForm.get('email')?.touched) {
                    <mat-error>E-mail je povinný</mat-error>
                  } @else if (passwordForm.get('email')?.hasError('email') && passwordForm.get('email')?.touched) {
                    <mat-error>Zadejte platný e-mail</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Heslo</mat-label>
                  <input matInput type="password" formControlName="password" autocomplete="current-password">
                  @if (passwordForm.get('password')?.hasError('required') && passwordForm.get('password')?.touched) {
                    <mat-error>Heslo je povinné</mat-error>
                  }
                </mat-form-field>

                @if (passwordError) {
                  <p class="error">{{ passwordError }}</p>
                }

                <button mat-raised-button color="primary" type="submit" [disabled]="loading">
                  {{ loading ? 'Přihlašuji…' : 'Přihlásit se' }}
                </button>

                <p class="link-hint">
                  Nemáte účet? <a routerLink="/register">Zaregistrujte se</a>
                </p>
              </form>
            </mat-tab>

            <mat-tab label="Magic link">
              @if (!magicLinkSent) {
                <form [formGroup]="magicForm" (ngSubmit)="loginWithMagicLink()" class="tab-form">
                  <p class="hint">Zadejte svůj e-mail a pošleme vám přihlašovací odkaz.</p>

                  <mat-form-field appearance="outline">
                    <mat-label>E-mail</mat-label>
                    <input matInput type="email" formControlName="email" autocomplete="email">
                    @if (magicForm.get('email')?.hasError('required') && magicForm.get('email')?.touched) {
                      <mat-error>E-mail je povinný</mat-error>
                    } @else if (magicForm.get('email')?.hasError('email') && magicForm.get('email')?.touched) {
                      <mat-error>Zadejte platný e-mail</mat-error>
                    }
                  </mat-form-field>

                  @if (magicError) {
                    <p class="error">{{ magicError }}</p>
                  }

                  <button mat-raised-button color="primary" type="submit" [disabled]="loading">
                    {{ loading ? 'Odesílám…' : 'Odeslat odkaz' }}
                  </button>
                </form>
              } @else {
                <div class="confirmation tab-form">
                  <mat-icon class="confirm-icon">mark_email_read</mat-icon>
                  <h3>Odkaz odeslán!</h3>
                  <p>Zkontrolujte svůj e-mail a klikněte na přihlašovací odkaz.</p>
                </div>
              }
            </mat-tab>

          </mat-tab-group>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page {
      display: flex;
      justify-content: center;
      padding: 48px 24px;
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

  passwordForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  magicForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

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
      this.router.navigate(['/dashboard']);
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
    const { error } = await this.auth.signInWithOtp(this.magicForm.value.email!);
    if (error) {
      this.magicError = error.message;
    } else {
      this.magicLinkSent = true;
    }
    this.loading = false;
  }
}
