import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const token = (req.headers.get('authorization') || '').replace('Bearer ', '');
  const { data: u } = await admin.auth.getUser(token);
  if (!u?.user) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
  const { data: me } = await admin.from('profiles').select('role').eq('id', u.user.id).single();
  if (!me) return NextResponse.json({ error: 'Server key problem: check SUPABASE_SERVICE_ROLE_KEY in .env.local (it must be the service_role key, not the anon key).' }, { status: 403 });
  if (me.role !== 'manager') return NextResponse.json({ error: 'Only a manager can add teachers.' }, { status: 403 });

  const { name, phone, password } = await req.json();
  if (!name || !password || password.length < 6) return NextResponse.json({ error: 'Enter a name and a password of at least 6 characters.' }, { status: 400 });
  const { count } = await admin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher');
  const username = 'T' + String((count || 0) + 1).padStart(3, '0');
  const { data: created, error } = await admin.auth.admin.createUser({ email: `${username.toLowerCase()}@quranportal.com`, password, email_confirm: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const { error: pe } = await admin.from('profiles').insert({ id: created.user.id, username, full_name: name, phone, role: 'teacher' });
  if (pe) return NextResponse.json({ error: pe.message }, { status: 400 });
  return NextResponse.json({ username });
}
