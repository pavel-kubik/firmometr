const FREE_CAP = 5;
const WINDOW_MS = 86_400_000; // 24h

export interface CapResult {
  blocked: boolean;
  cookieValue: string;
}

export function checkCap(req: Request): CapResult {
  if (req.headers.get('authorization')) {
    return { blocked: false, cookieValue: '' };
  }

  const raw = (req.headers.get('cookie') ?? '')
    .match(/(?:^|;)\s*srch_cnt=([^;]*)/)?.[1] ?? '';
  const [countStr, expiresStr] = raw.split('|');
  const now = Date.now();
  const expires = parseInt(expiresStr ?? '0', 10) || 0;
  const count = now > expires ? 0 : (parseInt(countStr ?? '0', 10) || 0);
  const newExpires = expires > now ? expires : now + WINDOW_MS;

  if (count >= FREE_CAP) {
    return { blocked: true, cookieValue: `${count}|${newExpires}` };
  }
  return { blocked: false, cookieValue: `${count + 1}|${newExpires}` };
}

export function withCap(body: unknown, cap: CapResult, status = 200): Response {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (cap.cookieValue) {
    headers['Set-Cookie'] = `srch_cnt=${cap.cookieValue}; Path=/; Max-Age=86400; SameSite=Lax`;
  }
  return new Response(JSON.stringify(body), { status, headers });
}
