import type { Config } from "@netlify/functions";
import { resetCap, withCap } from './_cap.mjs';

export default async (req: Request) => {
  const cap = resetCap(req);
  const expires = parseInt(cap.cookieValue.split('|')[1] ?? '0', 10) || 0;
  const retryAfter = Math.max(0, Math.ceil((expires - Date.now()) / 1000));
  return withCap({ retryAfter, blocked: cap.blocked }, cap, 200);
};

export const config: Config = { path: "/api/v1/cap-reset" };
