import { homepageMarkdown, companyMarkdown } from './_shared/_markdown';

const HOME_PATHS = new Set(['/', '/en', '/en/']);
const EN_ICO_RE = /^\/en\/search\/(\d{1,8})$/;

export const onRequest = async ({
  request,
  next,
}: {
  request: Request;
  next: () => Promise<Response>;
}) => {
  const url = new URL(request.url);
  const accept = request.headers.get('Accept') ?? '';

  if (accept.includes('text/markdown')) {
    if (HOME_PATHS.has(url.pathname)) {
      const lang = url.pathname.startsWith('/en') ? 'en' : 'cs';
      return new Response(homepageMarkdown(lang), {
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
      });
    }

    const m = url.pathname.match(EN_ICO_RE);
    if (m) {
      try {
        const apiRes = await fetch(`${url.origin}/api/v1/search/ico/${m[1]}`, {
          headers: { Authorization: request.headers.get('Authorization') ?? '' },
          signal: AbortSignal.timeout(20_000),
        });
        if (apiRes.ok) {
          return new Response(companyMarkdown(await apiRes.json()), {
            headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
          });
        }
      } catch {
        // fall through to next()
      }
    }
  }

  const response = await next();
  if (url.hostname !== 'firmometr.cz') {
    const blocked = new Response(response.body, response);
    blocked.headers.set('X-Robots-Tag', 'noindex');
    return blocked;
  }
  return response;
};
