import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/services/auth.service';
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
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    PublicNavComponent,
    PublicFooterComponent,
  ],
  template: `
    <app-public-nav />
    <div class="page">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>Registrace</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (!registered) {
            <form [formGroup]="registerForm" (ngSubmit)="register()" class="form">

              <mat-form-field appearance="outline">
                <mat-label>E-mail</mat-label>
                <input matInput type="email" formControlName="email" autocomplete="email">
                @if (registerForm.get('email')?.hasError('required') && registerForm.get('email')?.touched) {
                  <mat-error>E-mail je povinný</mat-error>
                } @else if (registerForm.get('email')?.hasError('email') && registerForm.get('email')?.touched) {
                  <mat-error>Zadejte platný e-mail</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Heslo</mat-label>
                <input matInput type="password" formControlName="password" autocomplete="new-password">
                @if (registerForm.get('password')?.hasError('required') && registerForm.get('password')?.touched) {
                  <mat-error>Heslo je povinné</mat-error>
                } @else if (registerForm.get('password')?.hasError('minlength') && registerForm.get('password')?.touched) {
                  <mat-error>Heslo musí mít alespoň 6 znaků</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Potvrdit heslo</mat-label>
                <input matInput type="password" formControlName="confirmPassword" autocomplete="new-password">
                @if (registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched) {
                  <mat-error>Hesla se neshodují</mat-error>
                }
              </mat-form-field>

              @if (error) {
                <p class="error">{{ error }}</p>
              }

              <button mat-raised-button color="primary" type="submit" [disabled]="loading">
                {{ loading ? 'Registruji…' : 'Zaregistrovat se' }}
              </button>

              <p class="link-hint">
                Již máte účet? <a routerLink="/login">Přihlaste se</a>
              </p>

            </form>
          } @else {
            <div class="confirmation">
              <mat-icon class="confirm-icon">mark_email_read</mat-icon>
              <h3>Potvrďte e-mail</h3>
              <p>Zaslali jsme vám potvrzovací odkaz. Zkontrolujte svůj e-mail a klikněte na odkaz pro dokončení registrace.</p>
              <a routerLink="/login" mat-stroked-button>Zpět na přihlášení</a>
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
    const { error } = await this.auth.signUp(email!, password!);
    if (error) {
      this.error = error.message;
    } else {
      this.registered = true;
    }
    this.loading = false;
  }
}
