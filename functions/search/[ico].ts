import { companyMarkdown } from '../_shared/_markdown';

export const onRequest = async ({
  request,
  params,
  next,
}: {
  request: Request;
  params: Record<string, string>;
  next: () => Promise<Response>;
}) => {
  if (!request.headers.get('Accept')?.includes('text/markdown')) {
    return next();
  }

  const ico = params['ico'];
  const url = new URL(request.url);

  try {
    const apiRes = await fetch(`${url.origin}/api/v1/search/ico/${ico}`, {
      headers: { Authorization: request.headers.get('Authorization') ?? '' },
      signal: AbortSignal.timeout(20_000),
    });

    if (!apiRes.ok) return next();

    return new Response(companyMarkdown(await apiRes.json()), {
      headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
  } catch {
    return next();
  }
};
