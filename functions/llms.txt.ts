interface Env {
  LLMS_LOGS: KVNamespace;
  ASSETS: Fetcher;
}

export const onRequest = async ({ request, env }: { request: Request; env: Env }) => {
  const entry = {
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get('User-Agent') || 'unknown',
    ip: request.headers.get('CF-Connecting-IP') || 'unknown',
    country: request.headers.get('CF-IPCountry') || 'unknown',
  };
  const key = `log:${entry.timestamp}:${Math.random().toString(36).slice(2, 7)}`;
  await env.LLMS_LOGS.put(key, JSON.stringify(entry), { expirationTtl: 60 * 60 * 24 * 30 });

  return env.ASSETS.fetch(request);
};
