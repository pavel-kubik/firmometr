import { Component, OnInit, inject, computed } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslocoPipe } from '@jsverse/transloco';
import { PublicNavComponent } from '../../public-nav/public-nav.component';
import { PublicFooterComponent } from '../../public-footer/public-footer.component';
import { LangService } from '../../../core/services/lang.service';
import { findArticle, BlogArticle } from '../blog.data';

@Component({
  selector: 'app-blog-article',
  standalone: true,
  imports: [RouterLink, TranslocoPipe, PublicNavComponent, PublicFooterComponent],
  template: `
    <app-public-nav />

    <main class="article-page">
      @if (article) {
        <div class="article-hero">
          <a [routerLink]="ls.p('/blog')" class="back-link">← {{ 'blog.back' | transloco }}</a>
          <div class="article-meta">
            <span class="article-date">{{ formatDate(article.publishedAt) }}</span>
            <span class="article-sep">·</span>
            <span class="article-read">{{ article.readMinutes }} {{ 'blog.min_read' | transloco }}</span>
          </div>
          <h1>{{ isCz() ? article.titleCs : article.titleEn }}</h1>
          <p class="article-desc">{{ isCz() ? article.descriptionCs : article.descriptionEn }}</p>
        </div>

        <article class="article-body" [innerHTML]="safeContent"></article>

        <div class="article-cta-box">
          <div class="cta-inner">
            <h2>{{ 'blog.cta_title' | transloco }}</h2>
            <p>{{ 'blog.cta_sub' | transloco }}</p>
            <a [routerLink]="ls.p('/search')" class="pub-btn pub-btn-primary">{{ 'blog.cta_btn' | transloco }}</a>
          </div>
        </div>
      } @else {
        <div class="not-found">
          <h1>404</h1>
          <p>{{ 'blog.not_found' | transloco }}</p>
          <a [routerLink]="ls.p('/blog')" class="pub-btn pub-btn-primary">{{ 'blog.back' | transloco }}</a>
        </div>
      }
    </main>

    <app-public-footer />
  `,
  styles: [`
    :host { display: flex; flex-direction: column; min-height: 100vh; animation: page-enter .3s ease-out; }
    .article-page { flex: 1; }

    .article-hero {
      max-width: 760px; margin: 0 auto; padding: 48px 24px 40px;
      border-bottom: 1px solid var(--pub-border);
    }
    .back-link {
      display: inline-block; font-size: 13px; font-weight: 600;
      color: var(--pub-green); text-decoration: none; margin-bottom: 24px;
    }
    .back-link:hover { text-decoration: underline; }

    .article-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
    .article-date, .article-read { font-size: 13px; color: var(--pub-text-subtle); }
    .article-sep { color: var(--pub-text-subtle); }

    .article-hero h1 { font-size: 34px; font-weight: 700; color: var(--pub-text); margin: 0 0 14px; line-height: 1.25; }
    .article-desc { font-size: 17px; color: var(--pub-text-muted); line-height: 1.6; margin: 0; }

    .article-body {
      max-width: 760px; margin: 0 auto; padding: 40px 24px 56px;
      font-size: 16px; line-height: 1.75; color: var(--pub-text);
    }
    :host ::ng-deep .article-body h2 {
      font-size: 24px; font-weight: 700; color: var(--pub-text);
      margin: 40px 0 14px; line-height: 1.3;
    }
    :host ::ng-deep .article-body h3 {
      font-size: 20px; font-weight: 700; color: var(--pub-text);
      margin: 32px 0 12px;
    }
    :host ::ng-deep .article-body p { margin: 0 0 18px; }
    :host ::ng-deep .article-body ul, :host ::ng-deep .article-body ol {
      padding-left: 24px; margin: 0 0 18px;
    }
    :host ::ng-deep .article-body li { margin-bottom: 8px; }
    :host ::ng-deep .article-body strong { font-weight: 700; color: var(--pub-text); }
    :host ::ng-deep .article-body a { color: var(--pub-green); }
    :host ::ng-deep .article-body a:hover { text-decoration: underline; }

    .article-cta-box {
      background: linear-gradient(160deg, #f0fdf4, #ecfdf5);
      border-top: 1px solid #d1fae5;
      padding: 56px 24px;
      text-align: center;
    }
    .cta-inner { max-width: 540px; margin: 0 auto; }
    .cta-inner h2 { font-size: 28px; font-weight: 700; color: var(--pub-text); margin: 0 0 12px; }
    .cta-inner p { font-size: 16px; color: var(--pub-text-muted); margin: 0 0 24px; }

    .not-found { text-align: center; padding: 80px 24px; }
    .not-found h1 { font-size: 64px; font-weight: 900; color: var(--pub-text-subtle); margin: 0 0 12px; }
    .not-found p { font-size: 18px; color: var(--pub-text-muted); margin: 0 0 28px; }

    @media (max-width: 600px) {
      .article-hero h1 { font-size: 26px; }
      :host ::ng-deep .article-body h2 { font-size: 20px; }
    }
  `]
})
export class BlogArticleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private sanitizer = inject(DomSanitizer);
  ls = inject(LangService);

  article: BlogArticle | undefined;
  safeContent: SafeHtml = '';
  isCz = computed(() => this.ls.lang() === 'cs');

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.article = findArticle(slug);

    if (this.article) {
      const cs = this.isCz();
      const title = cs ? this.article.titleCs : this.article.titleEn;
      const description = cs ? this.article.descriptionCs : this.article.descriptionEn;
      this.titleService.setTitle(`${title} — Firmometr`);
      this.metaService.updateTag({ name: 'description', content: description });
      this.metaService.updateTag({ property: 'og:title', content: title });
      this.metaService.updateTag({ property: 'og:description', content: description });
      // Content is hardcoded in blog.data.ts — safe to trust
      const html = cs ? this.article.contentHtmlCs : this.article.contentHtmlEn;
      this.safeContent = this.sanitizer.bypassSecurityTrustHtml(html);
    }
  }

  formatDate(iso: string): string {
    const locale = this.isCz() ? 'cs-CZ' : 'en-GB';
    return new Date(iso).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
  }
}
