import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class LangService {
  private transloco = inject(TranslocoService);
  private router = inject(Router);

  readonly lang = signal<string>('cs');

  private platformId = inject(PLATFORM_ID);

  init() {
    const initialUrl = typeof location !== 'undefined' ? location.pathname : this.router.url;
    this.updateFromUrl(initialUrl);
    if (isPlatformBrowser(this.platformId)) {
      this.router.events.pipe(filter(e => e instanceof NavigationEnd))
        .subscribe((e: NavigationEnd) => this.updateFromUrl(e.urlAfterRedirects));
    }
  }

  private updateFromUrl(url: string) {
    const isEn = url === '/en' || url.startsWith('/en/');
    const lang = isEn ? 'en' : 'cs';
    this.lang.set(lang);
    if (this.transloco.getActiveLang() !== lang) {
      this.transloco.setActiveLang(lang);
    }
  }

  /** Return a lang-prefixed path for routerLink */
  p(path: string): string {
    const l = this.lang();
    if (l === 'en') {
      return path === '/' ? '/en' : '/en' + path;
    }
    return path;
  }

  switchLang(lang: string) {
    if (lang === this.lang()) return;
    const current = this.router.url.split('?')[0];
    if (lang === 'en') {
      const newUrl = current === '/' ? '/en' : '/en' + current;
      this.router.navigateByUrl(newUrl);
    } else {
      const stripped = current.replace(/^\/en/, '') || '/';
      this.router.navigateByUrl(stripped);
    }
  }
}
