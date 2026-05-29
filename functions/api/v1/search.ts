import { checkCap, withCap } from '../../_shared/_cap';
import { searchCompaniesByName } from '../../_shared/_search';

export const onRequest = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') ?? '';
  const start = parseInt(url.searchParams.get('start') ?? '0', 10) || 0;

  if (!q.trim()) {
    return Response.json({ total: 0, items: [] });
  }

  const cap = checkCap(request);
  if (cap.blocked) return withCap({ error: 'limit_reached' }, cap, 429);

  const result = await searchCompaniesByName(q, start);
  return withCap(result, cap);
};
