import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

// Pure helpers (no Next.js imports) so proxy.ts, server code and tests can share them.

const b64 = (b: Buffer | string) => Buffer.from(b).toString('base64url');
const mac = (data: string, secret: string) => createHmac('sha256', secret).update(data).digest();

/** Constant-time string compare that does not leak length. */
export function safeEqual(a: string, b: string): boolean {
  const h = (s: string) => createHash('sha256').update(s).digest();
  return timingSafeEqual(h(a), h(b));
}

export function signToken(maxAgeSec: number, secret: string, now = Date.now()): string {
  const body = b64(JSON.stringify({ exp: Math.floor(now / 1000) + maxAgeSec }));
  return `${body}.${b64(mac(body, secret))}`;
}

export function verifyToken(token: string | undefined, secret: string, now = Date.now()): boolean {
  if (!token) return false;
  const [body, sig] = token.split('.');
  if (!body || !sig) return false;
  const expected = mac(body, secret);
  const given = Buffer.from(sig, 'base64url');
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(body, 'base64url').toString());
    return typeof exp === 'number' && exp * 1000 > now;
  } catch {
    return false;
  }
}

/** Secret key for the calendar feed URL (calendar apps cannot send the login cookie). Rotates with SESSION_SECRET. */
export function feedKey(secret: string): string {
  return b64(mac('calendar-feed', secret)).slice(0, 32);
}

export function sessionSecret(): string | null {
  const s = process.env.SESSION_SECRET;
  return s && s.length >= 32 ? s : null;
}

export const SESSION_COOKIE = 'phd_session';
export const SESSION_AGE = 60 * 60 * 24 * 30;
