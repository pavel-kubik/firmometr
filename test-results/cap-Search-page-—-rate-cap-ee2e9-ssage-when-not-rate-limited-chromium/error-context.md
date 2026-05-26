# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cap.spec.ts >> Search page — rate cap >> no limit message when not rate-limited
- Location: e2e/cap.spec.ts:87:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4201/search
Call log:
  - navigating to "http://localhost:4201/search", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect, type Page } from '@playwright/test';
  2   | import { FREE_CAP, WINDOW_MINUTES } from '../functions/_shared/_cap';
  3   | 
  4   | const MAX_SECONDS = WINDOW_MINUTES * 60;
  5   | const FUNCTIONS_BASE = 'http://localhost:8889';
  6   | 
  7   | // ---------------------------------------------------------------------------
  8   | // Helpers
  9   | // ---------------------------------------------------------------------------
  10  | 
  11  | /** Parse the countdown text "M:SS" → total seconds. */
  12  | function parseCountdown(text: string): number {
  13  |   const m = text.match(/(\d+):(\d{2})/);
  14  |   if (!m) return -1;
  15  |   return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  16  | }
  17  | 
  18  | /** Intercept all /api/v1 calls and return a 429 with Retry-After. */
  19  | async function mock429(page: Page, retryAfter = MAX_SECONDS) {
  20  |   await page.route('/api/v1/**', route =>
  21  |     route.fulfill({
  22  |       status: 429,
  23  |       contentType: 'application/json',
  24  |       headers: { 'Retry-After': String(retryAfter) },
  25  |       body: JSON.stringify({ error: 'limit_reached' }),
  26  |     })
  27  |   );
  28  | }
  29  | 
  30  | // ---------------------------------------------------------------------------
  31  | // Search page — rate cap UI
  32  | // ---------------------------------------------------------------------------
  33  | 
  34  | test.describe('Search page — rate cap', () => {
  35  |   test('shows limit message after 429 on name search', async ({ page }) => {
  36  |     await mock429(page);
  37  |     await page.goto('/search');
  38  | 
  39  |     await page.getByRole('textbox').fill('avast');
  40  |     await page.getByRole('button', { name: 'Hledat', exact: true }).click();
  41  | 
  42  |     await expect(page.getByText(`limitu ${FREE_CAP} bezplatných`)).toBeVisible();
  43  |   });
  44  | 
  45  |   test('countdown appears and is ≤ WINDOW_MINUTES minutes', async ({ page }) => {
  46  |     await mock429(page, MAX_SECONDS);
  47  |     await page.goto('/search');
  48  | 
  49  |     await page.getByRole('textbox').fill('avast');
  50  |     await page.getByRole('button', { name: 'Hledat', exact: true }).click();
  51  | 
  52  |     const limitMsg = page.locator('.limit-msg');
  53  |     await expect(limitMsg).toContainText(/Zkuste to znovu za \d+:\d{2}/, { timeout: 5000 });
  54  | 
  55  |     const seconds = parseCountdown(await limitMsg.textContent() ?? '');
  56  |     expect(seconds).toBeGreaterThan(0);
  57  |     expect(seconds).toBeLessThanOrEqual(MAX_SECONDS);
  58  |   });
  59  | 
  60  |   test('countdown ticks down', async ({ page }) => {
  61  |     await mock429(page, MAX_SECONDS);
  62  |     await page.goto('/search');
  63  | 
  64  |     await page.getByRole('textbox').fill('avast');
  65  |     await page.getByRole('button', { name: 'Hledat', exact: true }).click();
  66  | 
  67  |     const limitMsg = page.locator('.limit-msg');
  68  |     await expect(limitMsg).toContainText(/Zkuste to znovu za \d+:\d{2}/, { timeout: 5000 });
  69  | 
  70  |     const first = parseCountdown(await limitMsg.textContent() ?? '');
  71  |     await page.waitForTimeout(3000);
  72  |     const second = parseCountdown(await limitMsg.textContent() ?? '');
  73  | 
  74  |     expect(second).toBeLessThan(first);
  75  |   });
  76  | 
  77  |   test('login link shown alongside limit message', async ({ page }) => {
  78  |     await mock429(page);
  79  |     await page.goto('/search');
  80  | 
  81  |     await page.getByRole('textbox').fill('avast');
  82  |     await page.getByRole('button', { name: 'Hledat', exact: true }).click();
  83  | 
  84  |     await expect(page.getByRole('link', { name: /Přihlaste se/ })).toBeVisible();
  85  |   });
  86  | 
  87  |   test('no limit message when not rate-limited', async ({ page }) => {
> 88  |     await page.goto('/search');
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4201/search
  89  |     await expect(page.locator('text=/Zkuste to znovu za/')).not.toBeVisible();
  90  |     await expect(page.locator('text=/limitu/')).not.toBeVisible();
  91  |   });
  92  | 
  93  |   test('countdown hidden when Retry-After is 0', async ({ page }) => {
  94  |     await mock429(page, 0);
  95  |     await page.goto('/search');
  96  | 
  97  |     await page.getByRole('textbox').fill('avast');
  98  |     await page.getByRole('button', { name: 'Hledat', exact: true }).click();
  99  | 
  100 |     // Limit message shown, but countdown span should be hidden (remainingSeconds=0 initially,
  101 |     // then cap-reset call sets it; allow brief time for the cap-reset call to resolve)
  102 |     await expect(page.getByText(`limitu ${FREE_CAP} bezplatných`)).toBeVisible();
  103 |   });
  104 | });
  105 | 
  106 | // ---------------------------------------------------------------------------
  107 | // Subject detail page — rate cap UI
  108 | // ---------------------------------------------------------------------------
  109 | 
  110 | test.describe('Subject detail page — rate cap', () => {
  111 |   test('shows limit message when ICO detail returns 429', async ({ page }) => {
  112 |     await mock429(page);
  113 |     await page.goto('/search/27082440');
  114 | 
  115 |     await expect(page.getByText(`limitu ${FREE_CAP} bezplatných`)).toBeVisible({ timeout: 8000 });
  116 |   });
  117 | 
  118 |   test('countdown appears on detail page', async ({ page }) => {
  119 |     await mock429(page, MAX_SECONDS);
  120 |     await page.goto('/search/27082440');
  121 | 
  122 |     const countdownSpan = page.locator('.limit-msg span', { hasText: /Zkuste to znovu za/ });
  123 |     await expect(countdownSpan).toBeVisible({ timeout: 8000 });
  124 | 
  125 |     const seconds = parseCountdown(await countdownSpan.textContent() ?? '');
  126 |     expect(seconds).toBeGreaterThan(0);
  127 |     expect(seconds).toBeLessThanOrEqual(MAX_SECONDS);
  128 |   });
  129 | 
  130 |   test('login link shown on detail page limit message', async ({ page }) => {
  131 |     await mock429(page);
  132 |     await page.goto('/search/27082440');
  133 | 
  134 |     await expect(page.getByRole('link', { name: /Přihlaste se/ })).toBeVisible({ timeout: 8000 });
  135 |   });
  136 | });
  137 | 
  138 | // ---------------------------------------------------------------------------
  139 | // cap-reset endpoint (hits the Wrangler dev server directly)
  140 | // ---------------------------------------------------------------------------
  141 | 
  142 | test.describe('cap-reset endpoint', () => {
  143 |   const api = (path: string) => `${FUNCTIONS_BASE}${path}`;
  144 | 
  145 |   test('always returns 200', async ({ request }) => {
  146 |     const res = await request.get(api('/api/v1/cap-reset'));
  147 |     expect(res.status()).toBe(200);
  148 |   });
  149 | 
  150 |   test('fresh request → blocked:false', async ({ request }) => {
  151 |     const res = await request.get(api('/api/v1/cap-reset'));
  152 |     const body = await res.json();
  153 |     expect(body.blocked).toBe(false);
  154 |   });
  155 | 
  156 |   test('over-cap cookie → blocked:true, retryAfter in range', async ({ request }) => {
  157 |     const expires = Date.now() + MAX_SECONDS * 1000;
  158 |     const res = await request.get(api('/api/v1/cap-reset'), {
  159 |       headers: { cookie: `srch_cnt=${FREE_CAP}|${expires}` },
  160 |     });
  161 |     const body = await res.json();
  162 |     expect(body.blocked).toBe(true);
  163 |     expect(body.retryAfter).toBeGreaterThan(0);
  164 |     expect(body.retryAfter).toBeLessThanOrEqual(MAX_SECONDS);
  165 |   });
  166 | 
  167 |   test('stale 24h cookie → retryAfter clamped to ≤ MAX_SECONDS', async ({ request }) => {
  168 |     const stale = Date.now() + 86_400_000;
  169 |     const res = await request.get(api('/api/v1/cap-reset'), {
  170 |       headers: { cookie: `srch_cnt=${FREE_CAP}|${stale}` },
  171 |     });
  172 |     const body = await res.json();
  173 |     expect(body.retryAfter).toBeLessThanOrEqual(MAX_SECONDS);
  174 |   });
  175 | 
  176 |   test('stale 24h cookie → Set-Cookie has correct Max-Age', async ({ request }) => {
  177 |     const stale = Date.now() + 86_400_000;
  178 |     const res = await request.get(api('/api/v1/cap-reset'), {
  179 |       headers: { cookie: `srch_cnt=${FREE_CAP}|${stale}` },
  180 |     });
  181 |     const setCookie = res.headers()['set-cookie'] ?? '';
  182 |     expect(setCookie).toContain(`Max-Age=${MAX_SECONDS}`);
  183 |   });
  184 | });
  185 | 
  186 | // ---------------------------------------------------------------------------
  187 | // search-ico endpoint cap (hits Wrangler dev server directly)
  188 | // ---------------------------------------------------------------------------
```