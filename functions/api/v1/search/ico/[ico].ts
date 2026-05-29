import { checkCap, withCap } from '../../../../_shared/_cap';
import { getCompanyByIco, parseUserIdFromJwt, type CompanyCtx, type CompanyEnv } from '../../../../_shared/_company';

export const onRequest = async ({
  request,
  params,
  env,
  waitUntil,
}: {
  request: Request;
  params: Record<string, string>;
  env: CompanyEnv;
  waitUntil: (p: Promise<unknown>) => void;
}) => {
  const ico = params['ico'];
  if (!ico || !/^\d{1,8}$/.test(ico)) {
    return Response.json({ error: 'Invalid IČO' }, { status: 400 });
  }

  const cap = checkCap(request);
  if (cap.blocked) return withCap({ error: 'limit_reached' }, cap, 429);

  const authHeader = request.headers.get('authorization') ?? '';
  const userId = authHeader.startsWith('Bearer ') ? parseUserIdFromJwt(authHeader.slice(7)) : null;

  const maxCacheAgeParam = new URL(request.url).searchParams.get('max_cache_age');
  const maxCacheAgeSecs = maxCacheAgeParam !== null ? parseInt(maxCacheAgeParam, 10) : undefined;

  const hostname = new URL(request.url).hostname;
  const deployEnv = hostname === 'localhost' || hostname === '127.0.0.1' ? 'local' : 'prod';

  const ctx: CompanyCtx = {
    env,
    ico,
    sourceIp: request.headers.get('CF-Connecting-IP'),
    userAgent: request.headers.get('User-Agent'),
    userId,
    waitUntil,
    maxCacheAgeSecs,
    deployEnv,
  };

  const profile = await getCompanyByIco(ctx);
  return withCap(profile, cap);
};
