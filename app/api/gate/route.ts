import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { clientIp, gateToken } from '../../../lib/gate';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const code = typeof body?.code === 'string' ? body.code.slice(0, 64) : '';
  if (!code) return NextResponse.json({ ok: false }, { status: 400 });

  const token = gateToken();
  if (!token) return NextResponse.json({ ok: false }, { status: 500 });

  // One round trip does everything: rate limit per visitor, code check,
  // use counter (row-locked, so two simultaneous entries can't overshoot the
  // limit) and an access-log row.
  const { data, error } = await supabase.rpc('taldan_gate_attempt', {
    p_code: code,
    p_ip: clientIp(req),
    p_ua: req.headers.get('user-agent') ?? '',
  });
  if (error) {
    console.error('gate attempt failed', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  if (data === 'locked') {
    return NextResponse.json({ ok: false, locked: true }, { status: 429 });
  }
  if (data === 'fail') {
    return NextResponse.json({ ok: false });
  }

  const res = NextResponse.json({ ok: true });
  // Session cookie (no Max-Age): a genuinely new visit later asks for the
  // code again, which is what advances the use counter.
  res.cookies.set('taldan_gate', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
  });
  return res;
}
