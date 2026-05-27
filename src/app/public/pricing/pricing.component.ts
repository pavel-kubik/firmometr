import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { PublicNavComponent } from '../public-nav/public-nav.component';
import { PublicFooterComponent } from '../public-footer/public-footer.component';
import { LangService } from '../../core/services/lang.service';
import { BasicCardComponent } from '../basic-card/basic-card.component';
import { EnterpriseCardComponent } from '../enterprise-card/enterprise-card.component';
import { WaitlistComponent } from '../waitlist/waitlist.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [RouterLink, TranslocoPipe, PublicNavComponent, PublicFooterComponent, BasicCardComponent, EnterpriseCardComponent, WaitlistComponent],
  template: `
    <app-public-nav />

    <main class="pricing-page">
      <div class="page-hero">
        <div class="section-label">{{ 'pricing.label' | transloco }}</div>
        <h1>{{ 'pricing.title' | transloco }}</h1>
        <p>{{ 'pricing.sub' | transloco }}</p>
      </div>

      <!-- Billing toggle -->
      <div class="billing-toggle-wrap">
        <div class="billing-toggle">
          <button class="toggle-btn" [class.active]="billing === 'monthly'" (click)="billing = 'monthly'">
            {{ 'order.billing_monthly' | transloco }}
          </button>
          <button class="toggle-btn" [class.active]="billing === 'annual'" (click)="billing = 'annual'">
            {{ 'order.billing_annual' | transloco }}
            <span class="toggle-badge">{{ 'order.billing_annual_badge' | transloco }}</span>
          </button>
        </div>
      </div>

      <div class="plans-section">
        <div class="plans-grid">

          <!-- Free -->
          <div class="plan-card">
            <div class="plan-name">{{ 'pricing.plan_free_name' | transloco }}</div>
            <div class="plan-price-wrap">
              <span class="plan-price-amount">0 Kč</span>
              <span class="plan-price-per">/ {{ 'pricing.forever' | transloco }}</span>
            </div>
            <ul class="plan-features">
              <li>{{ 'pricing.plan_free_feat1' | transloco }}</li>
              <li>{{ 'pricing.plan_free_feat2' | transloco }}</li>
              <li>{{ 'pricing.plan_free_feat3' | transloco }}</li>
            </ul>
            <a [routerLink]="ls.p('/register')" class="pub-btn pub-btn-outline plan-btn">{{ 'pricing.plan_free_cta' | transloco }}</a>
          </div>

          <!-- BASIC -->
          <app-basic-card [billing]="billing" />

          <!-- ENTERPRISE -->
          <app-enterprise-card />

        </div>
      </div>

      @if (!subscriptionsEnabled) {
        <app-waitlist id="waitlist" />
      }

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

    /* Billing toggle */
    .billing-toggle-wrap { display: flex; justify-content: center; padding: 32px 24px 0; }
    .billing-toggle { display: flex; gap: 0; background: #f1f5f9; border-radius: 10px; padding: 4px; }
    .toggle-btn {
      padding: 9px 22px; border: none; background: transparent; border-radius: 7px;
      font-size: 14px; font-weight: 500; color: var(--pub-text-muted); cursor: pointer;
      display: flex; align-items: center; gap: 8px; transition: background .15s, color .15s;
    }
    .toggle-btn.active { background: #fff; color: var(--pub-text); box-shadow: 0 1px 4px rgba(0,0,0,.08); }
    .toggle-badge {
      font-size: 11px; font-weight: 700; background: #d1fae5; color: #065f46;
      padding: 2px 7px; border-radius: 20px;
    }

    /* Plans */
    .plans-section { padding: 32px 24px 56px; }
    .plans-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 900px; margin: 0 auto; }

    .plan-card {
      background: #fff; border: 1px solid var(--pub-border); border-radius: 14px;
      padding: 32px 24px; display: flex; flex-direction: column;
    }

    .plan-name { font-size: 20px; font-weight: 700; color: var(--pub-text); margin-bottom: 12px; }

    .plan-price-wrap { display: flex; align-items: baseline; gap: 4px; margin-bottom: 4px; }
    .plan-price-amount { font-size: 32px; font-weight: 700; color: var(--pub-text); }
    .plan-price-per { font-size: 13px; color: var(--pub-text-muted); }

    .plan-features { list-style: none; padding: 0; margin: 16px 0 24px; display: flex; flex-direction: column; gap: 10px; flex: 1; }
    .plan-features li { font-size: 14px; color: var(--pub-text-muted); display: flex; gap: 8px; }
    .plan-features li::before { content: '✓'; color: var(--pub-green); font-weight: 700; flex-shrink: 0; }
    .plan-btn { width: 100%; text-align: center; box-sizing: border-box; margin-top: auto; }

    @media (max-width: 768px) {
      .plans-grid { grid-template-columns: 1fr; max-width: 400px; }
    }
  `]
})
export class PricingComponent {
  ls = inject(LangService);
  billing: 'monthly' | 'annual' = 'annual';
  subscriptionsEnabled = environment.subscriptionsEnabled;
}
