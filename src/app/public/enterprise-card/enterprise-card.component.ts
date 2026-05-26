import { Component, HostBinding, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { LangService } from '../../core/services/lang.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-enterprise-card',
  standalone: true,
  imports: [RouterLink, TranslocoPipe],
  template: `
    <div class="plan-badge">{{ 'landing.plan_business_badge' | transloco }}</div>
    <div class="plan-name">{{ 'landing.plan_business_name' | transloco }}</div>
    <div class="plan-desc">{{ 'landing.plan_business_price' | transloco }}</div>
    <ul class="plan-features">
      <li>{{ 'landing.plan_business_feat1' | transloco }}</li>
      <li>{{ 'landing.plan_business_feat2' | transloco }}</li>
      <li>{{ 'landing.plan_business_feat3' | transloco }}</li>
      <li>{{ 'landing.plan_business_feat4' | transloco }}</li>
      <li>{{ 'landing.plan_business_feat5' | transloco }}</li>
    </ul>
    @if (subscriptionsEnabled) {
      <a [routerLink]="ls.p('/kontakt')" [queryParams]="{message: 'Mam zájem o enterprise řešení.'}"
         class="pub-btn pub-btn-outline plan-btn">{{ 'landing.plan_business_cta' | transloco }}</a>
    } @else {
      <a href="#waitlist" (click)="scrollToWaitlist($event)" class="pub-btn pub-btn-outline plan-btn">
        {{ 'pricing.waitlist_btn' | transloco }}
      </a>
    }
  `,
  styles: [`
    :host {
      display: flex; flex-direction: column;
      background: #fff; border: 1px solid var(--pub-border); border-radius: 12px;
      padding: 28px 24px; position: relative;
    }
    :host.coming-soon { opacity: .8; }
    .plan-badge {
      display: inline-block; align-self: flex-start;
      font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
      color: #fff; background: #64748b; padding: 3px 10px; border-radius: 20px;
      margin-bottom: 10px;
    }
    .plan-name { font-size: 18px; font-weight: 700; color: var(--pub-text); margin-bottom: 4px; }
    .plan-desc {
      font-size: 13px; color: var(--pub-text-subtle);
      padding-bottom: 16px; border-bottom: 1px solid #f1f5f9; margin-bottom: 16px;
    }
    .plan-features {
      list-style: none; padding: 0; margin: 0 0 20px;
      display: flex; flex-direction: column; gap: 8px; flex: 1;
    }
    .plan-features li { font-size: 13px; color: var(--pub-text-muted); display: flex; gap: 8px; align-items: flex-start; }
    .plan-features li::before { content: '✓'; color: var(--pub-green); font-weight: 700; flex-shrink: 0; }
    .plan-btn { width: 100%; text-align: center; box-sizing: border-box; margin-top: auto; }
  `]
})
export class EnterpriseCardComponent {
  ls = inject(LangService);
  subscriptionsEnabled = environment.subscriptionsEnabled;

  @HostBinding('class.coming-soon') get comingSoon() { return !this.subscriptionsEnabled; }

  scrollToWaitlist(event: Event) {
    event.preventDefault();
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
  }
}
