import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const token = (req.headers.get('authorization') || '').replace('Bearer ', '');
  const { data: u } = await admin.auth.getUser(token);
  if (!u?.user) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
  const { data: me } = await admin.from('profiles').select('role').eq('id', u.user.id).single();
  if (!me) return NextResponse.json({ error: 'Server key problem: check SUPABASE_SERVICE_ROLE_KEY (it must be the service_role key, not the anon key).' }, { status: 403 });
  if (me.role !== 'manager') return NextResponse.json({ error: 'Only a manager can add teachers.' }, { status: 403 });

  const { name, phone, password } = await req.json();
  if (!name || !password || password.length < 6) return NextResponse.json({ error: 'Enter a name and a password of at least 6 characters.' }, { status: 400 });

  const { data: all } = await admin.from('profiles').select('username').eq('role', 'teacher');
  let n = Math.max(0, ...(all || []).map((p) => parseInt((p.username || '').replace(/\D/g, ''), 10) || 0)) + 1;
  let lastErr = 'Could not create the teacher.';
  for (let i = 0; i < 10; i++, n++) {
    const username = 'T' + String(n).padStart(3, '0');
    const { data: created, error } = await admin.auth.admin.createUser({ email: `${username.toLowerCase()}@quranportal.com`, password, email_confirm: true });
    if (error) { lastErr = error.message; continue; }
    const { error: pe } = await admin.from('profiles').insert({ id: created.user.id, username, full_name: name, phone, role: 'teacher' });
    if (pe) { await admin.auth.admin.deleteUser(created.user.id); return NextResponse.json({ error: pe.message }, { status: 400 }); }
    return NextResponse.json({ username });
  }
  return NextResponse.json({ error: lastErr }, { status: 400 });
}