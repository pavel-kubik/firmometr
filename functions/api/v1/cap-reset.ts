import { resetCap, withCap } from '../../../_shared/_cap';

export const onRequest = async ({ request }: { request: Request }) => {
  const cap = resetCap(request);
  const expires = parseInt(cap.cookieValue.split('|')[1] ?? '0', 10) || 0;
  const retryAfter = Math.max(0, Math.ceil((expires - Date.now()) / 1000));
  return withCap({ retryAfter, blocked: cap.blocked }, cap, 200);
};
