import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ConsentStatus = 'accepted' | 'rejected' | null;

declare function gtag(...args: unknown[]): void;

@Injectable({ providedIn: 'root' })
export class CookieConsentService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY = 'cookie_consent';

  readonly status = signal<ConsentStatus>(null);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    const stored = localStorage.getItem(this.STORAGE_KEY) as ConsentStatus;
    if (stored === 'accepted' || stored === 'rejected') {
      this.status.set(stored);
      this.applyConsent(stored);
    }
  }

  accept(): void {
    this.persist('accepted');
  }

  reject(): void {
    this.persist('rejected');
  }

  private persist(value: 'accepted' | 'rejected'): void {
    this.status.set(value);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, value);
    }
    this.applyConsent(value);
  }

  private applyConsent(status: ConsentStatus): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (typeof gtag !== 'function') return;
    const state = status === 'accepted' ? 'granted' : 'denied';
    gtag('consent', 'update', {
      analytics_storage: state,
      ad_storage: state,
      ad_user_data: state,
      ad_personalization: state,
    });
  }
}
