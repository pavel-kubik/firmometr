import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { PublicNavComponent } from '../public-nav/public-nav.component';
import { PublicFooterComponent } from '../public-footer/public-footer.component';
import { LangService } from '../../core/services/lang.service';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslocoPipe, PublicNavComponent, PublicFooterComponent],
  template: `
    <app-public-nav />

    <main class="pricing-page">
      <div class="page-hero">
        <div class="section-label">{{ 'pricing.label' | transloco }}</div>
        <h1>{{ 'pricing.title' | transloco }}</h1>
        <p>{{ 'pricing.sub' | transloco }}</p>
      </div>

      <div class="plans-section">
        <div class="plans-grid">

          <!-- Free -->
          <div class="plan-card">
            <div class="plan-name">{{ 'pricing.plan_free_name' | transloco }}</div>
            <div class="plan-price">{{ 'pricing.plan_free_price' | transloco }}</div>
            <ul class="plan-features">
              <li>{{ 'pricing.plan_free_feat1' | transloco }}</li>
              <li>{{ 'pricing.plan_free_feat2' | transloco }}</li>
              <li>{{ 'pricing.plan_free_feat3' | transloco }}</li>
            </ul>
            <a [routerLink]="ls.p('/search')" class="pub-btn pub-btn-outline plan-btn">{{ 'pricing.plan_free_cta' | transloco }}</a>
          </div>

          <!-- Solo -->
          <div class="plan-card plan-featured">
            <div class="plan-badge">{{ 'pricing.plan_solo_badge' | transloco }}</div>
            <div class="plan-name">{{ 'pricing.plan_solo_name' | transloco }}</div>
            <div class="plan-price">{{ 'pricing.plan_solo_price' | transloco }}</div>
            <ul class="plan-features">
              <li>{{ 'pricing.plan_solo_feat1' | transloco }}</li>
              <li>{{ 'pricing.plan_solo_feat2' | transloco }}</li>
              <li>{{ 'pricing.plan_solo_feat3' | transloco }}</li>
              <li>{{ 'pricing.plan_solo_feat4' | transloco }}</li>
            </ul>
            <a href="#waitlist" class="pub-btn pub-btn-primary plan-btn" (click)="selectPlan('solo', $event)">{{ 'pricing.plan_solo_cta' | transloco }}</a>
          </div>

          <!-- Business -->
          <div class="plan-card">
            <div class="plan-badge plan-badge-gray">{{ 'pricing.plan_business_badge' | transloco }}</div>
            <div class="plan-name">{{ 'pricing.plan_business_name' | transloco }}</div>
            <div class="plan-price">{{ 'pricing.plan_business_price' | transloco }}</div>
            <ul class="plan-features">
              <li>{{ 'pricing.plan_business_feat1' | transloco }}</li>
              <li>{{ 'pricing.plan_business_feat2' | transloco }}</li>
              <li>{{ 'pricing.plan_business_feat3' | transloco }}</li>
              <li>{{ 'pricing.plan_business_feat4' | transloco }}</li>
              <li>{{ 'pricing.plan_business_feat5' | transloco }}</li>
            </ul>
            <a href="#waitlist" class="pub-btn pub-btn-outline plan-btn" (click)="selectPlan('business', $event)">{{ 'pricing.plan_business_cta' | transloco }}</a>
          </div>

        </div>
      </div>

      <!-- Waitlist form -->
      <section class="waitlist-section" id="waitlist">
        <div class="waitlist-inner">
          @if (!submitted) {
            <div class="waitlist-label">{{ 'pricing.waitlist_label' | transloco }}</div>
            <h2>{{ 'pricing.waitlist_title' | transloco }}</h2>
            <p>{{ 'pricing.waitlist_sub' | transloco }}</p>
            <form [formGroup]="form" (ngSubmit)="submit()" class="waitlist-form">
              <div class="form-row">
                <input
                  formControlName="email"
                  type="email"
                  [placeholder]="'pricing.waitlist_placeholder' | transloco"
                  class="form-input"
                  [class.invalid]="form.get('email')?.invalid && form.get('email')?.touched"
                >
                <select formControlName="plan" class="form-input form-select">
                  <option value="">{{ 'pricing.waitlist_plan_placeholder' | transloco }}</option>
                  <option value="solo">Solo</option>
                  <option value="business">Business</option>
                </select>
                <button type="submit" class="pub-btn pub-btn-primary" [disabled]="form.invalid || submitting">
                  {{ (submitting ? 'common.loading' : 'pricing.waitlist_btn') | transloco }}
                </button>
              </div>
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <p class="form-error">{{ 'common.email_invalid' | transloco }}</p>
              }
              @if (error) {
                <p class="form-error">{{ 'pricing.waitlist_error' | transloco }}</p>
              }
            </form>
          } @else {
            <div class="success-box">
              <div class="success-icon">✓</div>
              <h2>{{ 'pricing.waitlist_success_title' | transloco }}</h2>
              <p>{{ 'pricing.waitlist_success_sub' | transloco }}</p>
            </div>
          }
        </div>
      </section>
    </main>

    <app-public-footer />
  `,
  styles: [`
    :host { display: flex; flex-direction: column; min-height: 100vh; }
    .pricing-page { flex: 1; }

    .page-hero {
      text-align: center; padding: 60px 24px 48px;
      background: linear-gradient(160deg, #f0fdf4, #ecfdf5 60%, #fff);
      border-bottom: 1px solid #d1fae5;
    }
    .section-label { font-size: 12px; font-weight: 700; color: var(--pub-green); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
    .page-hero h1 { font-size: 36px; font-weight: 700; color: var(--pub-text); margin: 0 0 12px; }
    .page-hero p { font-size: 17px; color: var(--pub-text-muted); margin: 0; }

    .plans-section { padding: 48px 24px; }
    .plans-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 900px; margin: 0 auto; }

    .plan-card {
      background: #fff; border: 1px solid var(--pub-border); border-radius: 14px;
      padding: 32px 24px; position: relative;
    }
    .plan-card.plan-featured { border-color: var(--pub-green); border-width: 2px; }
    .plan-badge {
      position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
      background: var(--pub-green); color: #fff; font-size: 10px; font-weight: 700;
      padding: 3px 12px; border-radius: 20px; letter-spacing: 1px; white-space: nowrap;
    }
    .plan-badge.plan-badge-gray { background: #64748b; }
    .plan-name { font-size: 20px; font-weight: 700; color: var(--pub-text); margin-bottom: 4px; }
    .plan-price { font-size: 14px; color: var(--pub-text-subtle); padding-bottom: 18px; border-bottom: 1px solid #f1f5f9; margin-bottom: 18px; }
    .plan-features { list-style: none; padding: 0; margin: 0 0 24px; display: flex; flex-direction: column; gap: 10px; }
    .plan-features li { font-size: 14px; color: var(--pub-text-muted); display: flex; gap: 8px; }
    .plan-features li::before { content: '✓'; color: var(--pub-green); font-weight: 700; flex-shrink: 0; }
    .plan-btn { width: 100%; text-align: center; box-sizing: border-box; }

    .waitlist-section {
      background: var(--pub-dark); padding: 64px 24px;
    }
    .waitlist-inner { max-width: 640px; margin: 0 auto; text-align: center; }
    .waitlist-label { font-size: 11px; font-weight: 700; color: var(--pub-green); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
    .waitlist-inner h2 { font-size: 28px; font-weight: 700; color: #fff; margin: 0 0 10px; }
    .waitlist-inner p { font-size: 16px; color: var(--pub-text-subtle); margin: 0 0 28px; }

    .waitlist-form { text-align: left; }
    .form-row { display: flex; gap: 10px; flex-wrap: wrap; }
    .form-input {
      flex: 1; min-width: 160px; padding: 11px 14px; border: 1px solid #334155;
      border-radius: 8px; font-size: 14px; font-family: inherit;
      background: #1e293b; color: #fff; outline: none;
    }
    .form-input::placeholder { color: #64748b; }
    .form-input:focus { border-color: var(--pub-green); }
    .form-input.invalid { border-color: #ef4444; }
    .form-select { flex: 0 1 160px; }
    .form-error { margin: 8px 0 0; font-size: 13px; color: #f87171; }
    .form-error a { color: var(--pub-green); }

    .success-box { text-align: center; padding: 20px 0; }
    .success-icon {
      width: 56px; height: 56px; background: var(--pub-green); color: #fff;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 24px; font-weight: 700; margin: 0 auto 20px;
    }
    .success-box h2 { font-size: 24px; font-weight: 700; color: #fff; margin: 0 0 8px; }
    .success-box p { font-size: 16px; color: var(--pub-text-subtle); margin: 0; }

    @media (max-width: 768px) {
      .plans-grid { grid-template-columns: 1fr; max-width: 400px; }
      .form-row { flex-direction: column; }
      .form-select { flex: 1; }
    }
  `]
})
export class PricingComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  ls = inject(LangService);

  submitted = false;
  submitting = false;
  error = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    plan: [''],
  });

  selectPlan(plan: string, event: Event) {
    event.preventDefault();
    this.form.patchValue({ plan });
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
  }

  submit() {
    if (this.form.invalid) return;
    this.submitting = true;
    this.error = false;

    const body = new URLSearchParams({
      'form-name': 'waitlist',
      email: this.form.value.email ?? '',
      plan: this.form.value.plan ?? '',
    });

    this.http.post('/', body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      responseType: 'text',
    }).subscribe({
      next: () => { this.submitted = true; this.submitting = false; },
      error: () => { this.error = true; this.submitting = false; },
    });
  }
}
