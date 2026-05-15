export const FREE_CAP = 20;
export const WINDOW_MINUTES = 5;
const WINDOW_MS = WINDOW_MINUTES * 60_000;

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
  const newExpires = Math.min(expires > now ? expires : now + WINDOW_MS, now + WINDOW_MS);

  if (count >= FREE_CAP) {
    return { blocked: true, cookieValue: `${count}|${newExpires}` };
  }
  return { blocked: false, cookieValue: `${count + 1}|${newExpires}` };
}

export function resetCap(req: Request): CapResult {
  const raw = (req.headers.get('cookie') ?? '')
    .match(/(?:^|;)\s*srch_cnt=([^;]*)/)?.[1] ?? '';
  const [countStr, expiresStr] = raw.split('|');
  const now = Date.now();
  const expires = parseInt(expiresStr ?? '0', 10) || 0;
  const count = now > expires ? 0 : (parseInt(countStr ?? '0', 10) || 0);
  const newExpires = Math.min(expires > now ? expires : now + WINDOW_MS, now + WINDOW_MS);
  return { blocked: count >= FREE_CAP, cookieValue: `${count}|${newExpires}` };
}

export function withCap(body: unknown, cap: CapResult, status = 200): Response {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (cap.cookieValue) {
    headers['Set-Cookie'] = `srch_cnt=${cap.cookieValue}; Path=/; Max-Age=${WINDOW_MINUTES * 60}; SameSite=Lax`;
  }
  if (status === 429 && cap.cookieValue) {
    const expires = parseInt(cap.cookieValue.split('|')[1] ?? '0', 10) || 0;
    headers['Retry-After'] = String(Math.max(0, Math.ceil((expires - Date.now()) / 1000)));
  }
  return new Response(JSON.stringify(body), { status, headers });
}
