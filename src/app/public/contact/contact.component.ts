import { Component, OnInit, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Title, Meta } from '@angular/platform-browser';
import { TranslocoPipe } from '@jsverse/transloco';
import { PublicNavComponent } from '../public-nav/public-nav.component';
import { PublicFooterComponent } from '../public-footer/public-footer.component';
import { LangService } from '../../core/services/lang.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, TranslocoPipe, PublicNavComponent, PublicFooterComponent],
  template: `
    <app-public-nav />

    <main class="contact-page">
      <div class="page-hero">
        <div class="section-label">{{ 'contact.label' | transloco }}</div>
        <h1>{{ 'contact.title' | transloco }}</h1>
        <p>{{ 'contact.sub' | transloco }}</p>
      </div>

      <div class="contact-body">

        <!-- Info -->
        <div class="contact-info">
          <h2>{{ 'contact.info_title' | transloco }}</h2>
          <div class="info-item">
            <div class="info-icon">✉️</div>
            <div>
              <div class="info-label">{{ 'contact.email_label' | transloco }}</div>
              <a href="mailto:info@firmometr.cz" class="info-value">info&#64;firmometr.cz</a>
            </div>
          </div>
          <div class="info-item">
            <div class="info-icon">🏢</div>
            <div>
              <div class="info-label">{{ 'contact.company_label' | transloco }}</div>
              <div class="info-value">Butterfly Flowers s.r.o.</div>
              <div class="info-sub">IČO 07102127</div>
              <div class="info-sub">Srbínská 867/4, Strašnice<br>10000 Praha 10</div>
            </div>
          </div>
          <div class="info-item">
            <div class="info-icon">⏱️</div>
            <div>
              <div class="info-label">{{ 'contact.response_label' | transloco }}</div>
              <div class="info-value">{{ 'contact.response_value' | transloco }}</div>
            </div>
          </div>
        </div>

        <!-- Form -->
        <div class="contact-form-col">
          @if (!submitted) {
            <form [formGroup]="form" (ngSubmit)="submit()" class="contact-form">
              <div class="form-group">
                <label>{{ 'contact.form_name_label' | transloco }}</label>
                <input formControlName="name" type="text" [placeholder]="'contact.form_name_placeholder' | transloco" class="form-input">
              </div>
              <div class="form-group">
                <label>{{ 'contact.form_email_label' | transloco }}</label>
                <input
                  formControlName="email"
                  type="email"
                  placeholder="jan@firma.cz"
                  class="form-input"
                  [class.invalid]="form.get('email')?.invalid && form.get('email')?.touched"
                >
                @if (form.get('email')?.invalid && form.get('email')?.touched) {
                  <span class="form-error">{{ 'common.email_invalid' | transloco }}</span>
                }
              </div>
              <div class="form-group">
                <label>{{ 'contact.form_message_label' | transloco }}</label>
                <textarea
                  formControlName="message"
                  rows="5"
                  [placeholder]="'contact.form_message_placeholder' | transloco"
                  class="form-input"
                  [class.invalid]="form.get('message')?.invalid && form.get('message')?.touched"
                ></textarea>
              </div>
              @if (error) {
                <p class="form-error-global">Nepodařilo se odeslat. Napište přímo na <a href="mailto:info@firmometr.cz">info&#64;firmometr.cz</a>.</p>
              }
              <button type="submit" class="pub-btn pub-btn-primary" [disabled]="form.invalid || submitting">
                {{ 'contact.form_btn' | transloco }}
              </button>
            </form>
          } @else {
            <div class="success-box">
              <div class="success-icon">✓</div>
              <h2>{{ 'contact.success_title' | transloco }}</h2>
              <p>{{ 'contact.success_sub' | transloco }}</p>
            </div>
          }
        </div>

      </div>
    </main>

    <app-public-footer />
  `,
  styles: [`
    :host { display: flex; flex-direction: column; min-height: 100vh; }
    .contact-page { flex: 1; }

    .page-hero {
      text-align: center; padding: 60px 24px 48px;
      background: linear-gradient(160deg, #f0fdf4, #ecfdf5 60%, #fff);
      border-bottom: 1px solid #d1fae5;
    }
    .section-label { font-size: 12px; font-weight: 700; color: var(--pub-green); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
    .page-hero h1 { font-size: 36px; font-weight: 700; color: var(--pub-text); margin: 0 0 12px; }
    .page-hero p { font-size: 17px; color: var(--pub-text-muted); margin: 0; }

    .contact-body {
      max-width: 900px; margin: 0 auto; padding: 56px 24px;
      display: grid; grid-template-columns: 1fr 1.6fr; gap: 60px;
    }

    .contact-info h2 { font-size: 20px; font-weight: 700; color: var(--pub-text); margin: 0 0 28px; }
    .info-item { display: flex; gap: 14px; margin-bottom: 28px; }
    .info-icon { font-size: 22px; flex-shrink: 0; margin-top: 2px; }
    .info-label { font-size: 11px; font-weight: 700; color: var(--pub-text-subtle); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
    .info-value { font-size: 15px; color: var(--pub-text); text-decoration: none; font-weight: 500; }
    a.info-value:hover { color: var(--pub-green); }
    .info-sub { font-size: 13px; color: var(--pub-text-muted); line-height: 1.5; margin-top: 2px; }

    .contact-form { display: flex; flex-direction: column; gap: 20px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { font-size: 13px; font-weight: 600; color: var(--pub-text-muted); }
    .form-input {
      padding: 11px 14px; border: 1px solid var(--pub-border); border-radius: 8px;
      font-size: 14px; font-family: inherit; background: #f8fafc; color: var(--pub-text); outline: none;
      resize: vertical;
    }
    .form-input:focus { border-color: var(--pub-green); background: #fff; }
    .form-input.invalid { border-color: #ef4444; }
    .form-error { font-size: 12px; color: #ef4444; }
    .form-error-global { font-size: 13px; color: #ef4444; margin: 0; }
    .form-error-global a { color: var(--pub-green); }

    .success-box { text-align: center; padding: 40px 0; }
    .success-icon {
      width: 56px; height: 56px; background: var(--pub-green); color: #fff;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 24px; font-weight: 700; margin: 0 auto 20px;
    }
    .success-box h2 { font-size: 22px; font-weight: 700; color: var(--pub-text); margin: 0 0 8px; }
    .success-box p { font-size: 15px; color: var(--pub-text-muted); margin: 0; }

    @media (max-width: 700px) {
      .contact-body { grid-template-columns: 1fr; gap: 36px; }
    }
  `]
})
export class ContactComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private doc = inject(DOCUMENT);
  private ls = inject(LangService);

  submitted = false;
  submitting = false;
  error = false;

  form = this.fb.group({
    name: [''],
    email: ['', [Validators.required, Validators.email]],
    message: ['', Validators.required],
  });

  ngOnInit() {
    const { message } = this.route.snapshot.queryParams;
    if (message) this.form.patchValue({ message });

    const cs = this.ls.lang() === 'cs';
    const title = cs ? 'Kontakt — Firmometr' : 'Contact — Firmometr';
    const desc = cs
      ? 'Máte dotaz nebo zpětnou vazbu? Napište nám na info@firmometr.cz nebo použijte kontaktní formulář.'
      : 'Have a question or feedback? Write to us at info@firmometr.cz or use the contact form.';
    const url = cs ? 'https://firmometr.cz/kontakt' : 'https://firmometr.cz/en/kontakt';
    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: desc });
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: desc });
    this.metaService.updateTag({ property: 'og:url', content: url });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.setCanonical(url);
  }

  private setCanonical(url: string) {
    let link = this.doc.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  submit() {
    if (this.form.invalid) return;
    this.submitting = true;
    this.error = false;

    const body = {
      name: this.form.value.name ?? '',
      email: this.form.value.email ?? '',
      message: this.form.value.message ?? '',
    };

    this.http.post('/api/v1/contact', body).subscribe({
      next: () => { this.submitted = true; this.submitting = false; },
      error: () => { this.error = true; this.submitting = false; },
    });
  }
}
