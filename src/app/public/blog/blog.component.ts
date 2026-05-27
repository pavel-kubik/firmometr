import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { TranslocoPipe } from '@jsverse/transloco';
import { PublicNavComponent } from '../public-nav/public-nav.component';
import { PublicFooterComponent } from '../public-footer/public-footer.component';
import { LangService } from '../../core/services/lang.service';
import { BLOG_ARTICLES, BlogArticle } from './blog.data';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [RouterLink, TranslocoPipe, PublicNavComponent, PublicFooterComponent],
  template: `
    <app-public-nav />

    <main class="blog-page">
      <div class="page-hero">
        <div class="section-label">{{ 'blog.label' | transloco }}</div>
        <h1>{{ 'blog.title' | transloco }}</h1>
        <p>{{ 'blog.sub' | transloco }}</p>
      </div>

      <div class="articles-grid">
        @for (article of articles; track article.slug) {
          <a [routerLink]="ls.p('/blog/' + article.slug)" class="article-card">
            <div class="article-meta">
              <span class="article-date">{{ formatDate(article.publishedAt) }}</span>
              <span class="article-sep">·</span>
              <span class="article-read">{{ article.readMinutes }} {{ 'blog.min_read' | transloco }}</span>
            </div>
            <h2>{{ article.title }}</h2>
            <p class="article-excerpt">{{ article.excerpt }}</p>
            <span class="article-cta">{{ 'blog.read_more' | transloco }} →</span>
          </a>
        }
      </div>
    </main>

    <app-public-footer />
  `,
  styles: [`
    :host { display: flex; flex-direction: column; min-height: 100vh; animation: page-enter .3s ease-out; }
    .blog-page { flex: 1; }

    .page-hero {
      text-align: center; padding: 60px 24px 48px;
      background: linear-gradient(160deg, #f0fdf4, #ecfdf5 60%, #fff);
      border-bottom: 1px solid #d1fae5;
    }
    .section-label { font-size: 12px; font-weight: 700; color: var(--pub-green); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
    .page-hero h1 { font-size: 36px; font-weight: 700; color: var(--pub-text); margin: 0 0 12px; }
    .page-hero p { font-size: 17px; color: var(--pub-text-muted); margin: 0; }

    .articles-grid {
      max-width: 860px; margin: 0 auto; padding: 56px 24px;
      display: grid; gap: 24px;
    }

    .article-card {
      display: block; text-decoration: none;
      background: #fff; border: 1px solid var(--pub-border); border-radius: 12px;
      padding: 32px; transition: box-shadow .15s, border-color .15s;
    }
    .article-card:hover { border-color: var(--pub-green); box-shadow: 0 4px 20px rgba(5,150,105,.08); }

    .article-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
    .article-date { font-size: 13px; color: var(--pub-text-subtle); }
    .article-sep { color: var(--pub-text-subtle); }
    .article-read { font-size: 13px; color: var(--pub-text-subtle); }

    .article-card h2 { font-size: 22px; font-weight: 700; color: var(--pub-text); margin: 0 0 12px; line-height: 1.35; }
    .article-excerpt { font-size: 15px; color: var(--pub-text-muted); line-height: 1.6; margin: 0 0 20px; }
    .article-cta { font-size: 14px; font-weight: 600; color: var(--pub-green); }

    @media (max-width: 600px) {
      .page-hero h1 { font-size: 28px; }
      .article-card { padding: 24px; }
      .article-card h2 { font-size: 19px; }
    }
  `]
})
export class BlogComponent implements OnInit {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  ls = inject(LangService);

  articles: BlogArticle[] = BLOG_ARTICLES;

  ngOnInit() {
    this.titleService.setTitle('Blog — Firmometr | Prověřování českých firem');
    this.metaService.updateTag({ name: 'description', content: 'Průvodce prověřováním obchodních partnerů, insolvencí a DPH registru. Tipy a návody pro OSVČ a malé firmy.' });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('cs-CZ', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}
