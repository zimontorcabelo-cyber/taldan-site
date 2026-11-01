import { createHmac, timingSafeEqual } from 'crypto';
import { ADMIN_SECRET } from './admin';

/** Value of the `taldan_gate` cookie. It is an HMAC keyed with a server-only
 *  secret, so it cannot be guessed or forged from the outside. */
export function gateToken(): string {
  if (!ADMIN_SECRET) return '';
  return createHmac('sha256', ADMIN_SECRET).update('taldan-gate-v1').digest('hex');
}

export function gateCookieValid(value: string | undefined): boolean {
  const expected = gateToken();
  if (!expected || !value || value.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}

/** Constant-time string comparison that tolerates different lengths. */
export function safeEqual(a: string, b: string): boolean {
  if (!a || !b) return false;
  const ha = createHmac('sha256', 'cmp').update(a).digest();
  const hb = createHmac('sha256', 'cmp').update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function clientIp(req: Request): string {
  const xf = req.headers.get('x-forwarded-for');
  return (xf ? xf.split(',')[0].trim() : req.headers.get('x-real-ip') || '').slice(0, 64) || '?';
}
