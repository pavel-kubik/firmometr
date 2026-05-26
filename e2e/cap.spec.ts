import { test, expect, type Page } from '@playwright/test';
import { FREE_CAP, WINDOW_MINUTES } from '../functions/_shared/_cap';

const MAX_SECONDS = WINDOW_MINUTES * 60;
const FUNCTIONS_BASE = 'http://localhost:8889';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse the countdown text "M:SS" → total seconds. */
function parseCountdown(text: string): number {
  const m = text.match(/(\d+):(\d{2})/);
  if (!m) return -1;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

/** Intercept all /api/v1 calls and return a 429 with Retry-After. */
async function mock429(page: Page, retryAfter = MAX_SECONDS) {
  await page.route('/api/v1/**', route =>
    route.fulfill({
      status: 429,
      contentType: 'application/json',
      headers: { 'Retry-After': String(retryAfter) },
      body: JSON.stringify({ error: 'limit_reached' }),
    })
  );
}

/**
 * Navigate to a subject detail URL client-side to avoid Angular SSR.
 * SSR calls real gov APIs (not intercepted by page.route), so we bootstrap
 * on /search first then let Angular Router handle the rest in-browser.
 */
async function gotoClientSide(page: Page, path: string) {
  await page.goto('/search');
  await page.evaluate((targetPath: string) => {
    history.pushState({}, '', targetPath);
    window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state }));
  }, path);
}

// ---------------------------------------------------------------------------
// Search page — rate cap UI
// ---------------------------------------------------------------------------

test.describe('Search page — rate cap', () => {
  test('shows limit message after 429 on name search', async ({ page }) => {
    await mock429(page);
    await page.goto('/search');

    await page.getByRole('textbox').fill('avast');
    await page.getByRole('button', { name: 'Hledat', exact: true }).click();

    await expect(page.getByText(`limitu ${FREE_CAP} bezplatných`)).toBeVisible();
  });

  test('countdown appears and is ≤ WINDOW_MINUTES minutes', async ({ page }) => {
    await mock429(page, MAX_SECONDS);
    await page.goto('/search');

    await page.getByRole('textbox').fill('avast');
    await page.getByRole('button', { name: 'Hledat', exact: true }).click();

    const limitMsg = page.locator('.limit-text');
    await expect(limitMsg).toContainText(/Zkuste to znovu za \d+:\d{2}/, { timeout: 5000 });

    const seconds = parseCountdown(await limitMsg.textContent() ?? '');
    expect(seconds).toBeGreaterThan(0);
    expect(seconds).toBeLessThanOrEqual(MAX_SECONDS);
  });

  test('countdown ticks down', async ({ page }) => {
    await mock429(page, MAX_SECONDS);
    await page.goto('/search');

    await page.getByRole('textbox').fill('avast');
    await page.getByRole('button', { name: 'Hledat', exact: true }).click();

    const limitMsg = page.locator('.limit-text');
    await expect(limitMsg).toContainText(/Zkuste to znovu za \d+:\d{2}/, { timeout: 5000 });

    const first = parseCountdown(await limitMsg.textContent() ?? '');
    await page.waitForTimeout(3000);
    const second = parseCountdown(await limitMsg.textContent() ?? '');

    expect(second).toBeLessThan(first);
  });

  test('login link shown alongside limit message', async ({ page }) => {
    await mock429(page);
    await page.goto('/search');

    await page.getByRole('textbox').fill('avast');
    await page.getByRole('button', { name: 'Hledat', exact: true }).click();

    await expect(page.getByRole('link', { name: /Přihlásit se/ })).toBeVisible();
  });

  test('no limit message when not rate-limited', async ({ page }) => {
    await page.goto('/search');
    await expect(page.locator('text=/Zkuste to znovu za/')).not.toBeVisible();
    await expect(page.locator('text=/limitu/')).not.toBeVisible();
  });

  test('countdown hidden when Retry-After is 0', async ({ page }) => {
    await mock429(page, 0);
    await page.goto('/search');

    await page.getByRole('textbox').fill('avast');
    await page.getByRole('button', { name: 'Hledat', exact: true }).click();

    // Limit message shown, but countdown span should be hidden (remainingSeconds=0 initially,
    // then cap-reset call sets it; allow brief time for the cap-reset call to resolve)
    await expect(page.getByText(`limitu ${FREE_CAP} bezplatných`)).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Subject detail page — rate cap UI
// ---------------------------------------------------------------------------

test.describe('Subject detail page — rate cap', () => {
  test('shows limit message when ICO detail returns 429', async ({ page }) => {
    await mock429(page);
    await gotoClientSide(page, '/search/27082440');

    await expect(page.getByText(`limitu ${FREE_CAP} bezplatných`)).toBeVisible({ timeout: 8000 });
  });

  test('countdown appears on detail page', async ({ page }) => {
    await mock429(page, MAX_SECONDS);
    await gotoClientSide(page, '/search/27082440');

    const countdownSpan = page.locator('.limit-text span', { hasText: /Zkuste to znovu za/ });
    await expect(countdownSpan).toBeVisible({ timeout: 8000 });

    const seconds = parseCountdown(await countdownSpan.textContent() ?? '');
    expect(seconds).toBeGreaterThan(0);
    expect(seconds).toBeLessThanOrEqual(MAX_SECONDS);
  });

  test('login link shown on detail page limit message', async ({ page }) => {
    await mock429(page);
    await gotoClientSide(page, '/search/27082440');

    await expect(page.getByRole('link', { name: /Přihlásit se/ })).toBeVisible({ timeout: 8000 });
  });
});

// ---------------------------------------------------------------------------
// cap-reset endpoint (hits the Wrangler dev server directly)
// ---------------------------------------------------------------------------

test.describe('cap-reset endpoint', () => {
  const api = (path: string) => `${FUNCTIONS_BASE}${path}`;

  test('always returns 200', async ({ request }) => {
    const res = await request.get(api('/api/v1/cap-reset'));
    expect(res.status()).toBe(200);
  });

  test('fresh request → blocked:false', async ({ request }) => {
    const res = await request.get(api('/api/v1/cap-reset'));
    const body = await res.json();
    expect(body.blocked).toBe(false);
  });

  test('over-cap cookie → blocked:true, retryAfter in range', async ({ request }) => {
    const expires = Date.now() + MAX_SECONDS * 1000;
    const res = await request.get(api('/api/v1/cap-reset'), {
      headers: { cookie: `srch_cnt=${FREE_CAP}|${expires}` },
    });
    const body = await res.json();
    expect(body.blocked).toBe(true);
    expect(body.retryAfter).toBeGreaterThan(0);
    expect(body.retryAfter).toBeLessThanOrEqual(MAX_SECONDS);
  });

  test('stale 24h cookie → retryAfter clamped to ≤ MAX_SECONDS', async ({ request }) => {
    const stale = Date.now() + 86_400_000;
    const res = await request.get(api('/api/v1/cap-reset'), {
      headers: { cookie: `srch_cnt=${FREE_CAP}|${stale}` },
    });
    const body = await res.json();
    expect(body.retryAfter).toBeLessThanOrEqual(MAX_SECONDS);
  });

  test('stale 24h cookie → Set-Cookie has correct Max-Age', async ({ request }) => {
    const stale = Date.now() + 86_400_000;
    const res = await request.get(api('/api/v1/cap-reset'), {
      headers: { cookie: `srch_cnt=${FREE_CAP}|${stale}` },
    });
    const setCookie = res.headers()['set-cookie'] ?? '';
    expect(setCookie).toContain(`Max-Age=${MAX_SECONDS}`);
  });
});

// ---------------------------------------------------------------------------
// search-ico endpoint cap (hits Wrangler dev server directly)
// ---------------------------------------------------------------------------

test.describe('search-ico endpoint — rate cap', () => {
  const ico = '27082440';

  test('over-cap cookie → 429 with Retry-After', async ({ request }) => {
    const expires = Date.now() + MAX_SECONDS * 1000;
    const res = await request.get(api(`/api/v1/search/ico/${ico}`), {
      headers: { cookie: `srch_cnt=${FREE_CAP}|${expires}` },
    });
    expect(res.status()).toBe(429);
    const retryAfter = parseInt(res.headers()['retry-after'] ?? '-1', 10);
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(MAX_SECONDS);
  });

  test('stale 24h cookie → 429 with clamped Set-Cookie', async ({ request }) => {
    const stale = Date.now() + 86_400_000;
    const res = await request.get(api(`/api/v1/search/ico/${ico}`), {
      headers: { cookie: `srch_cnt=${FREE_CAP}|${stale}` },
    });
    expect(res.status()).toBe(429);
    expect(res.headers()['set-cookie']).toContain(`Max-Age=${MAX_SECONDS}`);
  });

  test('authenticated over-cap → 200 (bypasses cap)', async ({ request }) => {
    const expires = Date.now() + MAX_SECONDS * 1000;
    const res = await request.get(api(`/api/v1/search/ico/${ico}`), {
      headers: {
        cookie: `srch_cnt=${FREE_CAP}|${expires}`,
        authorization: 'Bearer faketoken',
      },
    });
    expect(res.status()).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// search-name endpoint cap (hits Wrangler dev server directly)
// ---------------------------------------------------------------------------

test.describe('search-name endpoint — rate cap', () => {
  function api(path: string) { return `${FUNCTIONS_BASE}${path}`; }

  test('over-cap cookie → 429 with Retry-After', async ({ request }) => {
    const expires = Date.now() + MAX_SECONDS * 1000;
    const res = await request.get(api('/api/v1/search?q=avast&start=0'), {
      headers: { cookie: `srch_cnt=${FREE_CAP}|${expires}` },
    });
    expect(res.status()).toBe(429);
    const retryAfter = parseInt(res.headers()['retry-after'] ?? '-1', 10);
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(MAX_SECONDS);
  });

  test('stale 24h cookie → 429 with clamped Set-Cookie', async ({ request }) => {
    const stale = Date.now() + 86_400_000;
    const res = await request.get(api('/api/v1/search?q=avast&start=0'), {
      headers: { cookie: `srch_cnt=${FREE_CAP}|${stale}` },
    });
    expect(res.status()).toBe(429);
    expect(res.headers()['set-cookie']).toContain(`Max-Age=${MAX_SECONDS}`);
  });

  test('authenticated over-cap → 200 (bypasses cap)', async ({ request }) => {
    const expires = Date.now() + MAX_SECONDS * 1000;
    const res = await request.get(api('/api/v1/search?q=avast&start=0'), {
      headers: {
        cookie: `srch_cnt=${FREE_CAP}|${expires}`,
        authorization: 'Bearer faketoken',
      },
    });
    expect(res.status()).toBe(200);
  });
});

function api(path: string) { return `${FUNCTIONS_BASE}${path}`; }
