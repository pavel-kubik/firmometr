import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../_shared/_or', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../_shared/_or')>()),
  fetchOrSubjektId: vi.fn(),
  fetchSbirkaListin: vi.fn(),
}));
vi.mock('../../../_shared/_auth', () => ({ isAuthenticated: vi.fn() }));

import { onRequest } from './[ico]';
import { fetchOrSubjektId, fetchSbirkaListin } from '../../../_shared/_or';
import { isAuthenticated } from '../../../_shared/_auth';

const env = { REGISTRY_CACHE: {} as never, SUPABASE_URL: 'https://x.supabase.co', SUPABASE_ANON_KEY: 'anon' };
const call = (ico: string) =>
  onRequest({
    request: new Request('https://firmometr.cz/api/v1/statements/' + ico),
    params: { ico },
    env: env as never,
  } as never) as Promise<Response>;

beforeEach(() => {
  vi.clearAllMocks();
  (isAuthenticated as ReturnType<typeof vi.fn>).mockResolvedValue(true); // authenticated by default
});

describe('statements endpoint', () => {
  it('rejects an invalid IČO', async () => {
    const res = await call('abc');
    expect(res.status).toBe(400);
  });

  it('returns count-only (locked) for anonymous callers, withholding years/links', async () => {
    (isAuthenticated as ReturnType<typeof vi.fn>).mockResolvedValue(false);
    (fetchOrSubjektId as ReturnType<typeof vi.fn>).mockResolvedValue('999');
    (fetchSbirkaListin as ReturnType<typeof vi.fn>).mockResolvedValue({
      celkem: 2,
      listiny: [
        { typListiny: 'účetní závěrka [2024]', datumVzniku: '2024', datumZalozeni: null, url: 'u-2024' },
        { typListiny: 'účetní závěrka [2023]', datumVzniku: '2023', datumZalozeni: null, url: 'u-2023' },
      ],
    });
    const res = await call('12345678');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ ico: '12345678', total: 2, locked: true });
    expect(body.statements).toEqual([]); // years/links withheld
  });

  it('returns empty when the company has no OR record', async () => {
    (fetchOrSubjektId as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await call('12345678');
    const body = await res.json();
    expect(body).toMatchObject({ ico: '12345678', statements: [], total: 0 });
    expect(fetchSbirkaListin).not.toHaveBeenCalled();
  });

  it('filters to účetní závěrky, de-duplicates by year, sorts newest first', async () => {
    (fetchOrSubjektId as ReturnType<typeof vi.fn>).mockResolvedValue('999');
    (fetchSbirkaListin as ReturnType<typeof vi.fn>).mockResolvedValue({
      celkem: 5,
      listiny: [
        { typListiny: 'účetní závěrka [2023]', datumVzniku: '2023', datumZalozeni: null, url: 'u-2023b' },
        { typListiny: 'účetní závěrka [2023] - oprava', datumVzniku: '2023', datumZalozeni: null, url: 'u-2023a' },
        { typListiny: 'výkaz zisku a ztráty [2022]', datumVzniku: '2022', datumZalozeni: null, url: 'u-2022' },
        { typListiny: 'zakladatelská listina', datumVzniku: '2010', datumZalozeni: null, url: 'u-found' },
        { typListiny: 'účetní závěrka [2024]', datumVzniku: '2024', datumZalozeni: null, url: 'u-2024' },
      ],
    });
    const res = await call('12345678');
    const body = await res.json();
    expect(body.total).toBe(4); // 3 distinct závěrka years counted as 4 docs (2 in 2023), founding deed excluded
    expect(body.statements.map((s: { year: number }) => s.year)).toEqual([2024, 2023, 2022]);
    // first 2023 row wins (newest, listing is reverse-chronological)
    const y2023 = body.statements.find((s: { year: number }) => s.year === 2023);
    expect(y2023.url).toBe('u-2023b');
  });
});
