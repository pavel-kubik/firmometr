import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { PublicNavComponent } from '../public-nav/public-nav.component';
import { PublicFooterComponent } from '../public-footer/public-footer.component';
import { LangService } from '../../core/services/lang.service';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [RouterLink, TranslocoPipe, PublicNavComponent, PublicFooterComponent],
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
            <a [routerLink]="ls.p('/register')" class="pub-btn pub-btn-outline plan-btn">{{ 'pricing.plan_free_cta' | transloco }}</a>
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
            <a [routerLink]="ls.p('/objednat')" [queryParams]="{plan: 'basic'}" class="pub-btn pub-btn-primary plan-btn">{{ 'pricing.plan_solo_cta' | transloco }}</a>
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
            <a [routerLink]="ls.p('/objednat')" [queryParams]="{plan: 'enterprise'}" class="pub-btn pub-btn-outline plan-btn">{{ 'pricing.plan_business_cta' | transloco }}</a>
          </div>

        </div>
      </div>

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

    @media (max-width: 768px) {
      .plans-grid { grid-template-columns: 1fr; max-width: 400px; }
    }
  `]
})
export class PricingComponent {
  ls = inject(LangService);
}
