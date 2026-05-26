import { Component, HostBinding, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { LangService } from '../../core/services/lang.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-basic-card',
  standalone: true,
  imports: [RouterLink, TranslocoPipe],
  template: `
    @if (subscriptionsEnabled) {
      <div class="plan-name">{{ 'landing.plan_solo_name' | transloco }}</div>
      <div class="plan-price-wrap">
        <span class="plan-price-amount">{{ showFrom() ? 'od ' : '' }}{{ billing() === 'annual' ? 299 : 349 }} Kč</span>
        <span class="plan-price-per">/ {{ 'pricing.per_month' | transloco }}</span>
      </div>
      @if (billing() === 'annual') {
        <div class="plan-annual-note">{{ 'pricing.annual_note_basic' | transloco }}</div>
      }
      <ul class="plan-features">
        <li>{{ 'landing.plan_solo_feat1' | transloco }}</li>
        <li>{{ 'landing.plan_solo_feat2' | transloco }}</li>
        <li>{{ 'landing.plan_solo_feat3' | transloco }}</li>
        <li>{{ 'landing.plan_solo_feat4' | transloco }}</li>
      </ul>
      <a [routerLink]="ls.p('/objednat')" [queryParams]="{plan: 'basic', billing: billing()}"
         class="pub-btn pub-btn-primary plan-btn">{{ 'landing.plan_solo_cta' | transloco }}</a>
    } @else {
      <div class="plan-coming-badge">{{ 'pricing.plan_solo_badge' | transloco }}</div>
      <div class="plan-name">{{ 'landing.plan_solo_name' | transloco }}</div>
      <div class="plan-price-muted">{{ 'pricing.plan_solo_price' | transloco }}</div>
      <ul class="plan-features">
        <li>{{ 'landing.plan_solo_feat1' | transloco }}</li>
        <li>{{ 'landing.plan_solo_feat2' | transloco }}</li>
        <li>{{ 'landing.plan_solo_feat3' | transloco }}</li>
        <li>{{ 'landing.plan_solo_feat4' | transloco }}</li>
      </ul>
      <a href="#waitlist" (click)="scrollToWaitlist($event)" class="pub-btn pub-btn-outline plan-btn">
        {{ 'pricing.waitlist_btn' | transloco }}
      </a>
    }
  `,
  styles: [`
    :host {
      display: flex; flex-direction: column;
      background: #fff; border: 2px solid var(--pub-green); border-radius: 12px;
      padding: 28px 24px; position: relative;
    }
    :host.coming-soon {
      border: 1px solid var(--pub-border); opacity: .8;
    }
    .plan-coming-badge {
      display: inline-block; align-self: flex-start;
      font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
      color: #fff; background: #64748b; padding: 3px 10px; border-radius: 20px;
      margin-bottom: 10px;
    }
    .plan-name { font-size: 18px; font-weight: 700; color: var(--pub-text); margin-bottom: 12px; }
    .plan-price-wrap { display: flex; align-items: baseline; gap: 4px; margin-bottom: 4px; }
    .plan-price-amount { font-size: 32px; font-weight: 700; color: var(--pub-text); }
    .plan-price-per { font-size: 13px; color: var(--pub-text-muted); }
    .plan-price-muted {
      font-size: 15px; font-weight: 500; color: var(--pub-text-muted);
      padding-bottom: 16px; border-bottom: 1px solid #f1f5f9; margin-bottom: 16px;
    }
    .plan-annual-note {
      font-size: 12px; color: #065f46; background: #f0fdf4; border-radius: 6px;
      padding: 4px 8px; margin-bottom: 16px; display: inline-block;
    }
    .plan-features {
      list-style: none; padding: 0; margin: 16px 0 24px;
      display: flex; flex-direction: column; gap: 8px; flex: 1;
    }
    .plan-features li { font-size: 13px; color: var(--pub-text-muted); display: flex; gap: 8px; align-items: flex-start; }
    .plan-features li::before { content: '✓'; color: var(--pub-green); font-weight: 700; flex-shrink: 0; }
    .plan-btn { width: 100%; text-align: center; box-sizing: border-box; margin-top: auto; }
  `]
})
export class BasicCardComponent {
  ls = inject(LangService);
  billing = input<'monthly' | 'annual'>('annual');
  showFrom = input<boolean>(false);
  subscriptionsEnabled = environment.subscriptionsEnabled;

  @HostBinding('class.coming-soon') get comingSoon() { return !this.subscriptionsEnabled; }

  scrollToWaitlist(event: Event) {
    event.preventDefault();
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
  }
}
