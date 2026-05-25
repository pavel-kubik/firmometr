interface KVNamespace {
  get(key: string): Promise<string | null>;
  list(options?: { prefix?: string }): Promise<{ keys: { name: string }[] }>;
}

interface Env {
  LLMS_LOGS: KVNamespace;
  LLMS_LOGS_SECRET: string;
}

export const onRequest = async ({ request, env }: { request: Request; env: Env }) => {
  const secret = new URL(request.url).searchParams.get('secret');
  if (!env.LLMS_LOGS_SECRET || secret !== env.LLMS_LOGS_SECRET) {
    return new Response('Forbidden', { status: 403 });
  }

  const list = await env.LLMS_LOGS.list({ prefix: 'log:' });
  const entries = await Promise.all(
    list.keys.map(async (k) => JSON.parse((await env.LLMS_LOGS.get(k.name)) ?? '{}'))
  );
  entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return new Response(JSON.stringify(entries, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};
