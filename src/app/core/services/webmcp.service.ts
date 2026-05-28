import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class WebMcpService {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  init(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const ctx = (document as any).modelContext ?? (navigator as any).modelContext;
    if (!ctx?.registerTool) return;

    ctx.registerTool({
      name: 'search_companies',
      title: 'Search companies',
      description: 'Search Czech companies by name in the ARES business registry. Returns matching companies with IČO, name, address, and status.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Company name or part of name to search for' },
          start: { type: 'number', description: 'Pagination offset (default 0)' },
        },
        required: ['query'],
      },
      execute: async (input: { query: string; start?: number }) => {
        const params = new URLSearchParams({ q: input.query });
        if (input.start) params.set('start', String(input.start));
        const res = await fetch(`/api/v1/search?${params}`);
        return res.json();
      },
      annotations: { readOnlyHint: true },
    });

    ctx.registerTool({
      name: 'get_company_details',
      title: 'Get company details',
      description: 'Get full details for a Czech company by its IČO (business ID). Returns registration data, address, insolvency records, VAT status, statutory officers, and court registry links.',
      inputSchema: {
        type: 'object',
        properties: {
          ico: { type: 'string', description: 'Czech company IČO (business ID), 1–8 digits' },
        },
        required: ['ico'],
      },
      execute: async (input: { ico: string }) => {
        const res = await fetch(`/api/v1/search/ico/${encodeURIComponent(input.ico)}`);
        return res.json();
      },
      annotations: { readOnlyHint: true },
    });

    ctx.registerTool({
      name: 'navigate_to_company',
      title: 'Open company page',
      description: 'Navigate the browser to the detail page for a Czech company by its IČO.',
      inputSchema: {
        type: 'object',
        properties: {
          ico: { type: 'string', description: 'Czech company IČO (business ID)' },
        },
        required: ['ico'],
      },
      execute: async (input: { ico: string }) => {
        this.router.navigate(['/search', input.ico]);
        return { navigated: true, ico: input.ico };
      },
    });
  }
}
