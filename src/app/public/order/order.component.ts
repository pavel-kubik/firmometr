import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslocoPipe } from '@jsverse/transloco';
import { PublicNavComponent } from '../public-nav/public-nav.component';
import { PublicFooterComponent } from '../public-footer/public-footer.component';

const PLANS = {
  basic:      { name: 'BASIC',      monthly: 349, annualPerMonth: 299, annual: 299 * 11 },
  enterprise: { name: 'ENTERPRISE', monthly: 899, annualPerMonth: 799, annual: 799 * 11 },
} as const;


@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslocoPipe, PublicNavComponent, PublicFooterComponent],
  template: `
    <app-public-nav />

    <main class="order-page">
      <div class="page-hero">
        <div class="section-label">{{ 'order.label' | transloco }}</div>
        <h1>{{ 'order.title' | transloco }}</h1>
        <p>{{ 'order.sub' | transloco }}</p>
      </div>

      <div class="order-body">
        @if (!submitted) {
          <form [formGroup]="form" (ngSubmit)="submit()" class="order-form">

            <!-- Plan selection -->
            <div class="form-section">
              <div class="section-title">{{ 'order.plan_section' | transloco }}</div>
              <div class="plan-cards">
                <label class="plan-card" [class.selected]="form.value.plan === 'basic'">
                  <input type="radio" formControlName="plan" value="basic" class="sr-only">
                  <div class="plan-card-inner">
                    <div class="plan-name">{{ 'landing.plan_solo_name' | transloco }}</div>
                    <div class="plan-price">od 299 Kč<span class="plan-per"> / {{ 'pricing.per_month' | transloco }}</span></div>
                    <ul class="plan-features">
                      <li>{{ 'landing.plan_solo_feat1' | transloco }}</li>
                      <li>{{ 'landing.plan_solo_feat2' | transloco }}</li>
                      <li>{{ 'landing.plan_solo_feat3' | transloco }}</li>
                      <li>{{ 'landing.plan_solo_feat4' | transloco }}</li>
                    </ul>
                  </div>
                </label>
                <div class="plan-card plan-card-disabled">
                  <div class="plan-card-inner">
                    <div class="plan-name">{{ 'landing.plan_business_name' | transloco }}</div>
                    <div class="plan-coming-badge">{{ 'landing.plan_business_badge' | transloco }}</div>
                    <div class="plan-price plan-price-muted">{{ 'landing.plan_business_price' | transloco }}</div>
                    <ul class="plan-features">
                      <li>{{ 'landing.plan_business_feat1' | transloco }}</li>
                      <li>{{ 'landing.plan_business_feat2' | transloco }}</li>
                      <li>{{ 'landing.plan_business_feat3' | transloco }}</li>
                      <li>{{ 'landing.plan_business_feat4' | transloco }}</li>
                      <li>{{ 'landing.plan_business_feat5' | transloco }}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- Billing period -->
            <div class="form-section">
              <div class="section-title">{{ 'order.billing_section' | transloco }}</div>
              <div class="billing-toggle">
                <label class="billing-option" [class.selected]="form.value.billing === 'monthly'">
                  <input type="radio" formControlName="billing" value="monthly" class="sr-only">
                  {{ 'order.billing_monthly' | transloco }}
                </label>
                <label class="billing-option" [class.selected]="form.value.billing === 'annual'">
                  <input type="radio" formControlName="billing" value="annual" class="sr-only">
                  {{ 'order.billing_annual' | transloco }}
                  <span class="billing-badge">{{ 'order.billing_annual_badge' | transloco }}</span>
                </label>
              </div>
            </div>

            <!-- Invoice details -->
            <div class="form-section">
              <div class="section-title">{{ 'order.invoice_section' | transloco }}</div>
              <div class="fields">
                <div class="form-group">
                  <label>{{ 'order.field_jmeno' | transloco }} *</label>
                  <input formControlName="jmeno" type="text" class="form-input"
                    [class.invalid]="form.get('jmeno')?.invalid && form.get('jmeno')?.touched"
                    placeholder="Firma s.r.o.">
                  @if (form.get('jmeno')?.invalid && form.get('jmeno')?.touched) {
                    <span class="form-error">{{ 'order.field_required' | transloco }}</span>
                  }
                </div>
                <div class="fields-row">
                  <div class="form-group">
                    <label>{{ 'order.field_ico' | transloco }} *</label>
                    <input formControlName="ico" type="text" class="form-input"
                      [class.invalid]="form.get('ico')?.invalid && form.get('ico')?.touched"
                      placeholder="12345678">
                    @if (form.get('ico')?.invalid && form.get('ico')?.touched) {
                      <span class="form-error">{{ 'order.field_required' | transloco }}</span>
                    }
                  </div>
                  <div class="form-group">
                    <label>{{ 'order.field_dic' | transloco }}</label>
                    <input formControlName="dic" type="text" class="form-input" placeholder="CZ12345678">
                  </div>
                </div>
                <div class="form-group">
                  <label>{{ 'order.field_adresa' | transloco }} *</label>
                  <input formControlName="adresa" type="text" class="form-input"
                    [class.invalid]="form.get('adresa')?.invalid && form.get('adresa')?.touched"
                    placeholder="Ulice 1, 110 00 Praha 1">
                  @if (form.get('adresa')?.invalid && form.get('adresa')?.touched) {
                    <span class="form-error">{{ 'order.field_required' | transloco }}</span>
                  }
                </div>
                <div class="fields-row">
                  <div class="form-group">
                    <label>{{ 'order.field_email' | transloco }} *</label>
                    <input formControlName="email" type="email" class="form-input"
                      [class.invalid]="form.get('email')?.invalid && form.get('email')?.touched"
                      placeholder="jan@firma.cz">
                    @if (form.get('email')?.invalid && form.get('email')?.touched) {
                      <span class="form-error">{{ 'order.field_email_invalid' | transloco }}</span>
                    }
                  </div>
                  <div class="form-group">
                    <label>{{ 'order.field_telefon' | transloco }} *</label>
                    <input formControlName="telefon" type="tel" class="form-input"
                      [class.invalid]="form.get('telefon')?.invalid && form.get('telefon')?.touched"
                      placeholder="+420 600 000 000">
                    @if (form.get('telefon')?.invalid && form.get('telefon')?.touched) {
                      <span class="form-error">{{ 'order.field_required' | transloco }}</span>
                    }
                  </div>
                </div>
              </div>
            </div>

            <!-- Price summary + submit -->
            <div class="price-summary">
              <div class="price-row">
                <span class="price-label">{{ 'order.price_label' | transloco }}</span>
                <span class="price-value">{{ price }} Kč / {{ 'pricing.per_month' | transloco }}</span>
              </div>
              @if (form.value.billing === 'annual') {
                <div class="price-note">{{ (form.value.plan === 'enterprise' ? 'pricing.annual_note_enterprise' : 'pricing.annual_note_basic') | transloco }}</div>
              }
            </div>

            @if (error) {
              <p class="form-error-global">
                {{ 'order.error' | transloco }}
                <a href="mailto:info@firmometr.cz">info&#64;firmometr.cz</a>.
              </p>
            }

            <button type="submit" class="pub-btn pub-btn-primary submit-btn" [disabled]="submitting">
              {{ (submitting ? 'order.submitting' : 'order.submit') | transloco }}
            </button>

          </form>
        } @else {
          <div class="success-box">
            <div class="success-icon">✓</div>
            <h2>{{ 'order.success_title' | transloco }}</h2>
            <p>{{ 'order.success_sub' | transloco }}</p>
          </div>
        }
      </div>
    </main>

    <app-public-footer />
  `,
  styles: [`
    :host { display: flex; flex-direction: column; min-height: 100vh; }
    .order-page { flex: 1; }

    .page-hero {
      text-align: center; padding: 60px 24px 48px;
      background: linear-gradient(160deg, #f0fdf4, #ecfdf5 60%, #fff);
      border-bottom: 1px solid #d1fae5;
    }
    .section-label { font-size: 12px; font-weight: 700; color: var(--pub-green); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
    .page-hero h1 { font-size: 36px; font-weight: 700; color: var(--pub-text); margin: 0 0 12px; }
    .page-hero p { font-size: 17px; color: var(--pub-text-muted); margin: 0; }

    .order-body { max-width: 640px; margin: 0 auto; padding: 48px 24px 64px; }

    .order-form { display: flex; flex-direction: column; gap: 36px; }
    .form-section { display: flex; flex-direction: column; gap: 16px; }
    .section-title { font-size: 13px; font-weight: 700; color: var(--pub-text-muted); letter-spacing: 1px; text-transform: uppercase; }

    /* Plan cards */
    .plan-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .plan-card {
      cursor: pointer; border: 2px solid var(--pub-border); border-radius: 12px;
      padding: 20px; transition: border-color .15s, box-shadow .15s;
    }
    .plan-card:hover { border-color: #86efac; }
    .plan-card.selected { border-color: var(--pub-green); box-shadow: 0 0 0 3px #d1fae5; }
    .plan-card.plan-card-disabled { cursor: default; opacity: .55; pointer-events: none; }
    .plan-coming-badge {
      display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 1px;
      background: #f1f5f9; color: #64748b; padding: 3px 10px; border-radius: 20px;
    }
    .plan-price-muted { font-size: 15px; font-weight: 500; color: var(--pub-text-muted); }
    .plan-card-inner { display: flex; flex-direction: column; gap: 10px; }
    .plan-name { font-size: 16px; font-weight: 700; color: var(--pub-text); }
    .plan-price { font-size: 24px; font-weight: 700; color: var(--pub-text); }
    .plan-per { font-size: 13px; font-weight: 400; color: var(--pub-text-muted); }
    .plan-features { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
    .plan-features li { font-size: 13px; color: var(--pub-text-muted); display: flex; gap: 6px; }
    .plan-features li::before { content: '✓'; color: var(--pub-green); font-weight: 700; flex-shrink: 0; }

    /* Billing toggle */
    .billing-toggle { display: flex; gap: 12px; }
    .billing-option {
      cursor: pointer; border: 2px solid var(--pub-border); border-radius: 8px;
      padding: 12px 20px; font-size: 14px; font-weight: 500; color: var(--pub-text-muted);
      display: flex; align-items: center; gap: 8px; transition: border-color .15s, color .15s;
    }
    .billing-option:hover { border-color: #86efac; }
    .billing-option.selected { border-color: var(--pub-green); color: var(--pub-text); }
    .billing-badge {
      font-size: 11px; font-weight: 700; background: #d1fae5; color: #065f46;
      padding: 2px 8px; border-radius: 20px; letter-spacing: .5px;
    }

    /* Fields */
    .fields { display: flex; flex-direction: column; gap: 16px; }
    .fields-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { font-size: 13px; font-weight: 600; color: var(--pub-text-muted); }
    .form-input {
      padding: 11px 14px; border: 1px solid var(--pub-border); border-radius: 8px;
      font-size: 14px; font-family: inherit; background: #f8fafc; color: var(--pub-text); outline: none;
    }
    .form-input:focus { border-color: var(--pub-green); background: #fff; }
    .form-input.invalid { border-color: #ef4444; }
    .form-error { font-size: 12px; color: #ef4444; }
    .form-error-global { font-size: 13px; color: #ef4444; margin: 0; }
    .form-error-global a { color: var(--pub-green); }

    /* Price summary */
    .price-summary {
      background: #f0fdf4; border: 1px solid #d1fae5; border-radius: 10px;
      padding: 18px 20px; display: flex; flex-direction: column; gap: 6px;
    }
    .price-row { display: flex; justify-content: space-between; align-items: center; }
    .price-label { font-size: 14px; font-weight: 600; color: var(--pub-text-muted); }
    .price-value { font-size: 22px; font-weight: 700; color: var(--pub-text); }
    .price-note { font-size: 12px; color: #065f46; }

    .submit-btn { width: 100%; }

    /* Success */
    .success-box { text-align: center; padding: 60px 0; }
    .success-icon {
      width: 60px; height: 60px; background: var(--pub-green); color: #fff;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 28px; font-weight: 700; margin: 0 auto 24px;
    }
    .success-box h2 { font-size: 24px; font-weight: 700; color: var(--pub-text); margin: 0 0 10px; }
    .success-box p { font-size: 15px; color: var(--pub-text-muted); margin: 0; }

    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

    @media (max-width: 600px) {
      .plan-cards { grid-template-columns: 1fr; }
      .fields-row { grid-template-columns: 1fr; }
      .billing-toggle { flex-direction: column; }
    }
  `]
})
export class OrderComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  submitted = false;
  submitting = false;
  error = false;

  form = this.fb.group({
    plan:     ['basic',   Validators.required],
    billing:  ['monthly', Validators.required],
    jmeno:    ['', Validators.required],
    ico:      ['', Validators.required],
    dic:      [''],
    adresa:   ['', Validators.required],
    email:    ['', [Validators.required, Validators.email]],
    telefon:  ['', Validators.required],
  });

  ngOnInit() {
    const { plan, billing } = this.route.snapshot.queryParams;
    if (plan === 'basic') this.form.patchValue({ plan });
    if (billing === 'monthly' || billing === 'annual') this.form.patchValue({ billing });
  }

  get price(): number {
    const key = this.form.value.plan as 'basic' | 'enterprise';
    const p = PLANS[key] ?? PLANS.basic;
    return this.form.value.billing === 'annual' ? p.annualPerMonth : p.monthly;
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    this.error = false;

    const v = this.form.value;
    const body = {
      plan:    v.plan    ?? '',
      billing: v.billing ?? '',
      jmeno:   v.jmeno   ?? '',
      ico:     v.ico     ?? '',
      dic:     v.dic     ?? '',
      adresa:  v.adresa  ?? '',
      email:   v.email   ?? '',
      telefon: v.telefon ?? '',
    };

    this.http.post('/api/v1/order', body).subscribe({
      next: () => { this.submitted = true; this.submitting = false; },
      error: () => { this.error = true; this.submitting = false; },
    });
  }
}
