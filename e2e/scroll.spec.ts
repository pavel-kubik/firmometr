import { test, expect, type Page } from '@playwright/test';
import type { SubjectDetail, CompanyStatements } from '../src/app/core/models/subject.model';

const MOCK_ICO = '12345678';

const MOCK_SUBJECT: SubjectDetail = {
  ico: MOCK_ICO,
  dic: null,
  obchodniFirma: 'Test Company s.r.o.',
  pravniForma: 'Společnost s ručením omezeným',
  sidloText: 'Praha 1, Testovací 1',
  sidloEnriched: null,
  datumVzniku: '2010-01-01',
  stavKod: 'AKTIVNI',
  stavNazev: 'Aktivní',
  isir: { clarity: 'CLEAR', proceedings: [] },
  dph: {
    isPlatce: false,
    nespolehlivy: null,
    datumNespolehlivosti: null,
    ucty: [],
    nedostupne: false,
  },
  or: {
    spisovatel: null,
    statutari: [],
    sbirkaListin: [],
    sbirkaListinCelkem: 5,
    orUrl: null,
  },
  isWatched: false,
};

const MOCK_STATEMENTS: CompanyStatements = {
  ico: MOCK_ICO,
  statements: [],
  total: 3,
  locked: true,
};

async function mockCompanyApis(page: Page) {
  await page.route(`/api/v1/search/ico/${MOCK_ICO}`, route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_SUBJECT),
    })
  );
  await page.route(`/api/v1/statements/${MOCK_ICO}`, route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_STATEMENTS),
    })
  );
}

async function gotoClientSide(page: Page, path: string) {
  await page.goto('/search');
  await page.evaluate((targetPath: string) => {
    history.pushState({}, '', targetPath);
    window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state }));
  }, path);
}

test.describe('scroll-to-top on navigation', () => {
  test('navigating to /register from a scrolled detail page resets scroll to top', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await mockCompanyApis(page);
    await gotoClientSide(page, `/search/${MOCK_ICO}`);

    await expect(page.getByRole('heading', { name: 'Test Company s.r.o.' })).toBeVisible({ timeout: 8000 });

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const scrolledY = await page.evaluate(() => window.scrollY);
    expect(scrolledY).toBeGreaterThan(50);

    const registerLink = page.locator('.zav-lock a').first();
    await expect(registerLink).toBeVisible();
    await registerLink.click();

    await page.waitForURL('**/register**', { timeout: 5000 });

    const scrollAfter = await page.evaluate(() => window.scrollY);
    expect(scrollAfter).toBeLessThanOrEqual(50);
  });
});
