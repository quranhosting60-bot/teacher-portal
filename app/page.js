'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, emailOf } from '../lib/supabase';

export default function Login() {
  const router = useRouter();
  const [u, setU] = useState(''); const [p, setP] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  async function login(e) {
    e.preventDefault(); setErr(''); setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: emailOf(u), password: p });
    setBusy(false);
    if (error) setErr('Incorrect username or password.'); else router.push('/dashboard');
  }
  return (
    <div className="login">
      <form onSubmit={login} className="lcard">
        <img src="/logo.png" alt="Quran Hosting" />
        <h2>Class Portal</h2>
        <p>Sign in with the username provided by the academy.</p>
        <div className="f">
          <label style={{ fontSize: 12, color: '#7a6d8a' }}>Username</label>
          <input placeholder="e.g. T001" value={u} onChange={(e) => setU(e.target.value)} autoFocus />
          <label style={{ fontSize: 12, color: '#7a6d8a', display: 'block', marginTop: 12 }}>Password</label>
          <input type="password" placeholder="Your password" value={p} onChange={(e) => setP(e.target.value)} />
        </div>
        <button className="btn" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
        {err && <div className="err">{err}</div>}
        <div className="hint" style={{ marginTop: 16 }}>Accounts are created by management. Contact your manager if you need access.</div>
      </form>
    </div>
  );
}