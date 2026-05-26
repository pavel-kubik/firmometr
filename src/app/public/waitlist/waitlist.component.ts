import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-waitlist',
  standalone: true,
  imports: [FormsModule, TranslocoPipe],
  template: `
    <section class="waitlist">
      <div class="waitlist-inner">
        <div class="section-label">{{ 'pricing.waitlist_label' | transloco }}</div>
        <h2>{{ 'pricing.waitlist_title' | transloco }}</h2>
        <p class="waitlist-sub">{{ 'pricing.waitlist_sub' | transloco }}</p>

        @if (!submitted) {
          <form class="waitlist-form" (submit)="submit($event)">
            <input
              class="waitlist-input"
              type="email"
              [(ngModel)]="email"
              name="email"
              [placeholder]="'pricing.waitlist_placeholder' | transloco"
              required
            >
            <button type="submit" class="pub-btn pub-btn-primary" [disabled]="submitting">
              {{ 'pricing.waitlist_btn' | transloco }}
            </button>
          </form>
          @if (error) {
            <p class="waitlist-error">{{ 'pricing.waitlist_error' | transloco }}</p>
          }
          <p class="waitlist-note">{{ 'pricing.waitlist_note' | transloco }}</p>
        } @else {
          <div class="waitlist-success">
            <div class="success-icon">✓</div>
            <strong>{{ 'pricing.waitlist_success_title' | transloco }}</strong>
            <span>{{ 'pricing.waitlist_success_sub' | transloco }}</span>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .waitlist {
      background: #fff; border-top: 1px solid var(--pub-border);
      border-bottom: 1px solid var(--pub-border); padding: 56px 24px;
      text-align: center;
    }
    .waitlist-inner { max-width: 520px; margin: 0 auto; }
    .section-label { font-size: 12px; font-weight: 700; color: var(--pub-green); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
    .waitlist-inner h2 { font-size: 26px; font-weight: 700; color: var(--pub-text); margin: 0 0 10px; }
    .waitlist-sub { font-size: 15px; color: var(--pub-text-muted); margin: 0 0 24px; line-height: 1.6; }

    .waitlist-form { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
    .waitlist-input {
      flex: 1; min-width: 220px; max-width: 320px;
      padding: 11px 16px; border: 1px solid var(--pub-border); border-radius: 8px;
      font-size: 14px; font-family: inherit; background: #f8fafc; color: var(--pub-text); outline: none;
    }
    .waitlist-input:focus { border-color: var(--pub-green); background: #fff; }

    .waitlist-note { font-size: 12px; color: var(--pub-text-subtle); margin: 12px 0 0; }
    .waitlist-error { font-size: 13px; color: #ef4444; margin: 10px 0 0; }

    .waitlist-success {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      padding: 8px 0;
    }
    .success-icon {
      width: 44px; height: 44px; background: var(--pub-green); color: #fff;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 20px; font-weight: 700; margin-bottom: 4px;
    }
    .waitlist-success strong { font-size: 18px; color: var(--pub-text); }
    .waitlist-success span { font-size: 14px; color: var(--pub-text-muted); }
  `]
})
export class WaitlistComponent {
  private http = inject(HttpClient);

  email = '';
  submitting = false;
  submitted = false;
  error = false;

  submit(event: Event) {
    event.preventDefault();
    if (!this.email || !this.email.includes('@')) return;
    this.submitting = true;
    this.error = false;

    this.http.post('/api/v1/waitlist', { email: this.email }).subscribe({
      next: () => { this.submitted = true; this.submitting = false; },
      error: () => { this.error = true; this.submitting = false; },
    });
  }
}
