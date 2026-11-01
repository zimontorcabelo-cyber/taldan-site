import { NextResponse } from 'next/server';
import { adminAll, adminSave, adminDelete, adminSaveCopyBatch, DASHBOARD_PASSWORD } from '../../../lib/admin';
import { supabase } from '../../../lib/supabase';
import { clientIp, safeEqual } from '../../../lib/gate';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'bad request' }, { status: 400 });

  const { password, op, table, row, id, updates } = body;

  // Fail closed when the password is not configured.
  if (!DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: 'לא הוגדרה סיסמה' }, { status: 503 });
  }

  // 10 wrong passwords in 10 minutes from one visitor locks that visitor out.
  const key = `admin:${clientIp(req)}`;
  const { data: blocked } = await supabase.rpc('taldan_rate_blocked', {
    p_key: key,
    p_limit: 10,
    p_window_secs: 600,
  });
  if (blocked) {
    return NextResponse.json({ error: 'יותר מדי ניסיונות, נסו שוב בעוד כמה דקות' }, { status: 429 });
  }

  if (typeof password !== 'string' || !safeEqual(password, DASHBOARD_PASSWORD)) {
    await supabase.rpc('taldan_rate_fail', { p_key: key });
    return NextResponse.json({ error: 'סיסמה שגויה' }, { status: 401 });
  }

  try {
    if (op === 'read') {
      return NextResponse.json({ ok: true, data: await adminAll() });
    }
    if (op === 'save') {
      await adminSave(table, row);
      return NextResponse.json({ ok: true, data: await adminAll() });
    }
    if (op === 'delete') {
      await adminDelete(table, id);
      return NextResponse.json({ ok: true, data: await adminAll() });
    }
    if (op === 'save_copy') {
      await adminSaveCopyBatch(updates);
      return NextResponse.json({ ok: true, data: await adminAll() });
    }
    return NextResponse.json({ error: 'unknown op' }, { status: 400 });
  } catch (e: any) {
    console.error('admin op failed', e);
    return NextResponse.json({ error: e?.message ?? 'failed' }, { status: 500 });
  }
}
