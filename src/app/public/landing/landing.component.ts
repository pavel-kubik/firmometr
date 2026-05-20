import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { PublicNavComponent } from '../public-nav/public-nav.component';
import { PublicFooterComponent } from '../public-footer/public-footer.component';
import { LangService } from '../../core/services/lang.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslocoPipe, PublicNavComponent, PublicFooterComponent],
  template: `
    <app-public-nav />

    <main class="landing">

      <!-- Hero -->
      <section class="hero">
        <div class="hero-inner">
          <div class="hero-badge">{{ 'landing.badge' | transloco }}</div>
          <h1>{{ 'landing.hero_title_line1' | transloco }}<br>{{ 'landing.hero_title_line2' | transloco }}<br><em>{{ 'landing.hero_title_em' | transloco }}</em></h1>
          <p class="hero-sub">{{ 'landing.hero_sub' | transloco }}</p>
          <div class="hero-actions">
            <a [routerLink]="ls.p('/search')" class="pub-btn pub-btn-primary">{{ 'landing.cta_search' | transloco }}</a>
            <a [routerLink]="ls.p('/ceny')" class="pub-btn pub-btn-ghost">{{ 'landing.cta_pricing' | transloco }}</a>
          </div>
          <div class="search-demo">
            <div class="search-label">{{ 'landing.demo_label' | transloco }}</div>
            <div class="search-row">
              <input class="search-input" [(ngModel)]="searchQuery" [placeholder]="'landing.search_placeholder' | transloco" (keyup.enter)="goSearch()">
              <button class="search-btn" (click)="goSearch()">{{ 'landing.search_btn' | transloco }}</button>
            </div>
          </div>
          <div class="trust-strip">
            <span class="trust-item"><span class="dot"></span>{{ 'landing.trust_isir' | transloco }}</span>
            <span class="trust-item"><span class="dot"></span>{{ 'landing.trust_dph' | transloco }}</span>
            <span class="trust-item"><span class="dot"></span>{{ 'landing.trust_or' | transloco }}</span>
            <span class="trust-item"><span class="dot"></span>{{ 'landing.trust_ares' | transloco }}</span>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section class="features">
        <div class="section-inner">
          <div class="section-label">{{ 'landing.features_label' | transloco }}</div>
          <h2>{{ 'landing.features_title_line1' | transloco }}<br>{{ 'landing.features_title_line2' | transloco }}</h2>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">⚖️</div>
              <h3>{{ 'landing.feat_isir_title' | transloco }}</h3>
              <p>{{ 'landing.feat_isir_desc' | transloco }}</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🧾</div>
              <h3>{{ 'landing.feat_dph_title' | transloco }}</h3>
              <p>{{ 'landing.feat_dph_desc' | transloco }}</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🏢</div>
              <h3>{{ 'landing.feat_or_title' | transloco }}</h3>
              <p>{{ 'landing.feat_or_desc' | transloco }}</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📍</div>
              <h3>{{ 'landing.feat_ares_title' | transloco }}</h3>
              <p>{{ 'landing.feat_ares_desc' | transloco }}</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🔔</div>
              <h3>{{ 'landing.feat_watchlist_title' | transloco }}</h3>
              <p>{{ 'landing.feat_watchlist_desc' | transloco }}</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🚦</div>
              <h3>{{ 'landing.feat_semaphore_title' | transloco }}</h3>
              <p>{{ 'landing.feat_semaphore_desc' | transloco }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- How it works -->
      <section class="how">
        <div class="section-inner">
          <div class="section-label">{{ 'landing.how_label' | transloco }}</div>
          <h2>{{ 'landing.how_title' | transloco }}</h2>
          <div class="how-grid">
            <div class="how-step">
              <div class="step-num">1</div>
              <h3>{{ 'landing.how_step1_title' | transloco }}</h3>
              <p>{{ 'landing.how_step1_desc' | transloco }}</p>
            </div>
            <div class="how-arrow">→</div>
            <div class="how-step">
              <div class="step-num">2</div>
              <h3>{{ 'landing.how_step2_title' | transloco }}</h3>
              <p>{{ 'landing.how_step2_desc' | transloco }}</p>
            </div>
            <div class="how-arrow">→</div>
            <div class="how-step">
              <div class="step-num">3</div>
              <h3>{{ 'landing.how_step3_title' | transloco }}</h3>
              <p>{{ 'landing.how_step3_desc' | transloco }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Pricing teaser -->
      <section class="pricing-teaser">
        <div class="section-inner">
          <div class="section-label">{{ 'landing.plans_label' | transloco }}</div>
          <h2>{{ 'landing.plans_title' | transloco }}</h2>
          <p class="section-sub">{{ 'landing.plans_sub' | transloco }}</p>
          <div class="plans-grid">
            <div class="plan-card">
              <div class="plan-name">{{ 'landing.plan_free_name' | transloco }}</div>
              <div class="plan-desc">{{ 'landing.plan_free_price' | transloco }}</div>
              <ul class="plan-features">
                <li>{{ 'landing.plan_free_feat1' | transloco }}</li>
                <li>{{ 'landing.plan_free_feat2' | transloco }}</li>
                <li>{{ 'landing.plan_free_feat3' | transloco }}</li>
              </ul>
              <a [routerLink]="ls.p('/register')" class="pub-btn pub-btn-outline">{{ 'landing.plan_free_cta' | transloco }}</a>
            </div>
            <div class="plan-card plan-featured">
              <div class="plan-badge">{{ 'landing.plan_solo_badge' | transloco }}</div>
              <div class="plan-name">{{ 'landing.plan_solo_name' | transloco }}</div>
              <div class="plan-desc">{{ 'landing.plan_solo_price' | transloco }}</div>
              <ul class="plan-features">
                <li>{{ 'landing.plan_solo_feat1' | transloco }}</li>
                <li>{{ 'landing.plan_solo_feat2' | transloco }}</li>
                <li>{{ 'landing.plan_solo_feat3' | transloco }}</li>
                <li>{{ 'landing.plan_solo_feat4' | transloco }}</li>
              </ul>
              <a [routerLink]="ls.p('/objednat')" [queryParams]="{plan: 'basic'}" class="pub-btn pub-btn-primary">{{ 'landing.plan_solo_cta' | transloco }}</a>
            </div>
            <div class="plan-card">
              <div class="plan-badge plan-badge-gray">{{ 'landing.plan_business_badge' | transloco }}</div>
              <div class="plan-name">{{ 'landing.plan_business_name' | transloco }}</div>
              <div class="plan-desc">{{ 'landing.plan_business_price' | transloco }}</div>
              <ul class="plan-features">
                <li>{{ 'landing.plan_business_feat1' | transloco }}</li>
                <li>{{ 'landing.plan_business_feat2' | transloco }}</li>
                <li>{{ 'landing.plan_business_feat3' | transloco }}</li>
                <li>{{ 'landing.plan_business_feat4' | transloco }}</li>
              </ul>
              <a [routerLink]="ls.p('/objednat')" [queryParams]="{plan: 'enterprise'}" class="pub-btn pub-btn-outline">{{ 'landing.plan_business_cta' | transloco }}</a>
            </div>
          </div>
        </div>
      </section>

      <!-- Dark CTA -->
      <section class="cta-dark">
        <div class="section-label">{{ 'landing.cta_section_label' | transloco }}</div>
        <h2>{{ 'landing.cta_section_title' | transloco }}</h2>
        <p>{{ 'landing.cta_section_sub' | transloco }}</p>
        <a [routerLink]="ls.p('/search')" class="pub-btn pub-btn-primary">{{ 'landing.cta_section_btn' | transloco }}</a>
      </section>

    </main>

    <app-public-footer />
  `,
  styles: [`
    :host { display: flex; flex-direction: column; min-height: 100vh; }
    .landing { flex: 1; }

    /* Hero */
    .hero {
      background: linear-gradient(160deg, #f0fdf4 0%, #ecfdf5 50%, #fff 100%);
      border-bottom: 1px solid #d1fae5;
      padding: 72px 24px 56px;
      text-align: center;
    }
    .hero-inner { max-width: 680px; margin: 0 auto; }
    .hero-badge {
      display: inline-block; background: var(--pub-green-light); color: #065f46;
      font-size: 13px; font-weight: 600; padding: 4px 14px; border-radius: 20px;
      margin-bottom: 24px;
    }
    .hero h1 {
      font-size: 44px; font-weight: 700; line-height: 1.15;
      color: var(--pub-text); margin: 0 0 20px;
    }
    .hero h1 em { color: var(--pub-green); font-style: normal; }
    .hero-sub { font-size: 18px; color: var(--pub-text-muted); line-height: 1.6; margin: 0 0 32px; }
    .hero-actions { display: flex; gap: 12px; justify-content: center; margin-bottom: 40px; flex-wrap: wrap; }

    /* Search demo */
    .search-demo {
      background: #fff; border-radius: 12px; padding: 20px 24px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08); border: 1px solid var(--pub-border);
      text-align: left; margin-bottom: 32px;
    }
    .search-label { font-size: 11px; font-weight: 700; color: var(--pub-text-subtle); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; }
    .search-row { display: flex; gap: 8px; }
    .search-input {
      flex: 1; padding: 10px 14px; border: 1px solid var(--pub-border); border-radius: 8px;
      font-size: 14px; font-family: inherit; background: #f8fafc; color: #333; outline: none;
    }
    .search-input:focus { border-color: var(--pub-green); }
    .search-btn {
      background: var(--pub-green); color: #fff; border: none; padding: 10px 20px;
      border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit;
    }

    /* Trust strip */
    .trust-strip { display: flex; flex-wrap: wrap; gap: 16px 28px; justify-content: center; }
    .trust-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--pub-text-muted); }
    .dot { width: 8px; height: 8px; background: var(--pub-green); border-radius: 50%; flex-shrink: 0; }

    /* Shared section styles */
    .section-inner { max-width: 1100px; margin: 0 auto; }
    .section-label { font-size: 12px; font-weight: 700; color: var(--pub-green); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
    .section-inner h2 { font-size: 32px; font-weight: 700; color: var(--pub-text); margin: 0 0 12px; line-height: 1.2; }
    .section-sub { font-size: 16px; color: var(--pub-text-muted); margin: 0 0 36px; }

    /* Features */
    .features { background: #fff; border-top: 1px solid var(--pub-border); border-bottom: 1px solid var(--pub-border); padding: 64px 24px; }
    .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 36px; }
    .feature-card { padding: 24px; border: 1px solid var(--pub-border); border-radius: 12px; background: #f8fafc; }
    .feature-icon { font-size: 28px; margin-bottom: 14px; }
    .feature-card h3 { font-size: 15px; font-weight: 700; color: var(--pub-text); margin: 0 0 8px; }
    .feature-card p { font-size: 13px; color: var(--pub-text-muted); line-height: 1.6; margin: 0; }

    /* How it works */
    .how { padding: 64px 24px; }
    .how-grid { display: flex; align-items: flex-start; gap: 16px; margin-top: 36px; }
    .how-step { flex: 1; text-align: center; }
    .step-num {
      width: 44px; height: 44px; background: var(--pub-green); color: #fff;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 18px; font-weight: 700; margin: 0 auto 16px;
    }
    .how-step h3 { font-size: 15px; font-weight: 700; color: var(--pub-text); margin: 0 0 8px; }
    .how-step p { font-size: 13px; color: var(--pub-text-muted); line-height: 1.6; margin: 0; }
    .how-arrow { font-size: 24px; color: var(--pub-green-light); padding-top: 12px; flex-shrink: 0; }

    /* Pricing teaser */
    .pricing-teaser {
      background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
      border-top: 1px solid #d1fae5; border-bottom: 1px solid #d1fae5;
      padding: 64px 24px;
    }
    .plans-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 36px; }
    .plan-card {
      background: #fff; border: 1px solid var(--pub-border); border-radius: 12px;
      padding: 28px 24px; position: relative;
    }
    .plan-card.plan-featured { border-color: var(--pub-green); border-width: 2px; }
    .plan-badge {
      position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
      background: var(--pub-green); color: #fff; font-size: 10px; font-weight: 700;
      padding: 3px 12px; border-radius: 20px; letter-spacing: 1px; white-space: nowrap;
    }
    .plan-badge.plan-badge-gray { background: #64748b; }
    .plan-name { font-size: 18px; font-weight: 700; color: var(--pub-text); margin-bottom: 4px; }
    .plan-desc { font-size: 13px; color: var(--pub-text-subtle); padding-bottom: 16px; border-bottom: 1px solid #f1f5f9; margin-bottom: 16px; }
    .plan-features { list-style: none; padding: 0; margin: 0 0 20px; display: flex; flex-direction: column; gap: 8px; }
    .plan-features li { font-size: 13px; color: var(--pub-text-muted); display: flex; gap: 8px; align-items: flex-start; }
    .plan-features li::before { content: '✓'; color: var(--pub-green); font-weight: 700; flex-shrink: 0; }

    /* Dark CTA */
    .cta-dark {
      background: var(--pub-dark); padding: 72px 24px; text-align: center;
    }
    .cta-dark h2 { font-size: 30px; font-weight: 700; color: #fff; margin: 0 0 12px; }
    .cta-dark p { font-size: 16px; color: var(--pub-text-subtle); margin: 0 0 28px; }

    /* Responsive */
    @media (max-width: 900px) {
      .features-grid { grid-template-columns: repeat(2, 1fr); }
      .plans-grid { grid-template-columns: 1fr; max-width: 400px; }
    }
    @media (max-width: 600px) {
      .hero h1 { font-size: 30px; }
      .hero-sub { font-size: 16px; }
      .features-grid { grid-template-columns: 1fr; }
      .how-grid { flex-direction: column; align-items: center; }
      .how-arrow { transform: rotate(90deg); padding: 0; }
      .section-inner h2 { font-size: 24px; }
    }
  `]
})
export class LandingComponent {
  private router = inject(Router);
  ls = inject(LangService);
  searchQuery = '';

  goSearch() {
    const q = this.searchQuery.trim();
    if (!q) return;
    this.router.navigate([this.ls.p('/search')], { queryParams: { q } });
  }
}
