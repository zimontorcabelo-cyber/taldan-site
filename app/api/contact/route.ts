import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST(req: Request) {
  const body = await req.json();
  const { name, phone, email, message } = body ?? {};

  if (!name || !phone || !message) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  const { error } = await supabase.rpc('taldan_submit_inquiry', {
    p_name: name,
    p_phone: phone,
    p_email: email ?? null,
    p_message: message,
  });

  if (error) {
    console.error('inquiry insert failed', error);
    return NextResponse.json({ error: 'insert failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
