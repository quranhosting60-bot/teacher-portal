'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { pkSlot, pkNow, dayNames, nowIn, DAYS } from '../../lib/time';
import { COUNTRIES } from '../../lib/zones';

const COUNTRY_LIST = Object.keys(COUNTRIES);

export default function Dashboard() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [rows, setRows] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState('schedule');
  const [filter, setFilter] = useState('');
  const [q, setQ] = useState('');
  const [f, setF] = useState({ tn: '', tp: '', tpw: '', sn: '', roll: '', country: 'United States', state: 'Alabama', ct: '', cs: '', time: '18:00', days: [] });
  const set = (k, v) => setF((o) => ({ ...o, [k]: v }));

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return router.push('/');
    const { data: p } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    setMe(p);
    if (p.role === 'teacher') {
      const { data } = await supabase.rpc('teacher_classes');
      setRows(data || []);
    } else {
      setTeachers((await supabase.from('profiles').select('*').eq('role', 'teacher').order('username')).data || []);
      setStudents((await supabase.from('students').select('*').order('name')).data || []);
      setClasses((await supabase.from('classes').select('*')).data || []);
    }
  }, [router]);
  useEffect(() => { load(); }, [load]);

  async function addTeacher() {
    const { data: { session } } = await supabase.auth.getSession();
    const r = await fetch('/api/create-teacher', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token }, body: JSON.stringify({ name: f.tn, phone: f.tp, password: f.tpw }) });
    const j = await r.json();
    if (!r.ok) return setMsg('Error: ' + j.error);
    setMsg(`Teacher created.  Username: ${j.username}   Password: ${f.tpw}   (share these with the teacher)`);
    setF((o) => ({ ...o, tn: '', tp: '', tpw: '' })); load(); setTab('teachers');
  }
  async function addStudent() {
    if (!f.roll.trim() || !f.sn.trim()) return setMsg('Please enter the roll number and the student name.');
    const { error } = await supabase.from('students').insert({ roll_no: f.roll.trim(), name: f.sn.trim(), country: f.country, state: f.state, tz: COUNTRIES[f.country][f.state] });
    if (error) return setMsg(error.message.includes('duplicate') ? 'This roll number is already used by another student.' : 'Error: ' + error.message);
    setMsg('Student added.'); set('sn', ''); set('roll', ''); load(); setTab('students');
  }
  async function addClass() {
    if (!f.ct || !f.cs || !f.days.length) return setMsg('Please select a teacher, a student and at least one day.');
    const { error } = await supabase.from('classes').insert({ teacher_id: f.ct, student_id: f.cs, weekdays: f.days, local_time: f.time });
    if (error) return setMsg('Error: ' + error.message);
    setMsg('Class added.'); load(); setTab('schedule');
  }
  async function del(table, id, label) {
    if (!confirm(`Delete ${label}?`)) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    setMsg(error ? 'Error: ' + error.message + ' (delete the related classes first)' : 'Deleted.'); load();
  }
  const toggleDay = (d) => set('days', f.days.includes(d) ? f.days.filter((x) => x !== d) : [...f.days, d]);
  const logout = async () => { await supabase.auth.signOut(); router.push('/'); };

  if (!me) return <p style={{ padding: 20 }}>Loading...</p>;
  const isMgr = me.role === 'manager', isTeacher = me.role === 'teacher';
  const byId = (list, id) => list.find((x) => x.id === id);

  const Header = (
    <div className="bar">
      <div className="brand"><img src="/logo.png" alt="Quran Hosting" /><div><b>Quran Hosting</b><span>Class Portal</span></div></div>
      <div className="user"><span><b>{me.full_name}</b> <span className="role">{me.role.toUpperCase()}</span></span><button className="btn out" onClick={logout}>Sign out</button></div>
    </div>
  );

  if (isTeacher) return (<>{Header}<div className="wrap">
    <div className="profile">
      <span className="tid">{me.username}</span>
      <div><h2>{me.full_name}</h2><small>{me.phone ? 'Contact: ' + me.phone : 'Teacher'}</small></div>
      <div className="big"><b>{rows.length}</b><span>Total classes</span></div>
    </div>
    <div className="panel"><h3>My classes <small style={{ fontWeight: 400, color: '#7a6d8a' }}>(Pakistan Time, PKT)</small></h3>
      <table><thead><tr><th>#</th><th>Student</th><th>Days (PKT)</th><th>Time (PKT)</th></tr></thead>
        <tbody>{rows.length === 0 && <tr><td colSpan="4" className="empty">No classes assigned yet.</td></tr>}
          {rows.map((r, i) => <tr key={r.class_id}><td>{i + 1}</td><td><b>{r.student_name}</b></td><td>{dayNames(r.pk_days)}</td><td><span className="pk">{r.pk_time}</span></td></tr>)}</tbody></table>
    </div></div></>);

  const now = pkNow();
  const slotsOf = (tid) => classes.filter((c) => c.teacher_id === tid).map((c) => { const s = byId(students, c.student_id); return s ? pkSlot(c.local_time, s.tz, c.weekdays) : null; }).filter(Boolean);
  const visible = classes.filter((c) => !filter || c.teacher_id === filter);
  const tabs = [['schedule', 'Schedule'], ['teachers', 'Teachers'], ['students', 'Students'], ...(isMgr ? [['add', '+ Add New']] : [])];

  return (<>{Header}<div className="wrap">
    {msg && <div className="msg">{msg}</div>}
    <div className="stats">
      <div className="stat"><b>{teachers.length}</b><span>Teachers</span></div>
      <div className="stat"><b>{students.length}</b><span>Students</span></div>
      <div className="stat"><b>{classes.length}</b><span>Classes</span></div>
    </div>
    <div className="tabs">{tabs.map(([k, l]) => <button key={k} className={'tab' + (tab === k ? ' on' : '')} onClick={() => setTab(k)}>{l}</button>)}</div>

    {tab === 'schedule' && <div className="panel">
      <div className="head"><h3>Full schedule</h3>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}><option value="">All teachers</option>{teachers.map((t) => <option key={t.id} value={t.id}>{t.username} - {t.full_name}</option>)}</select></div>
      <table><thead><tr><th>Teacher</th><th>Roll No</th><th>Student</th><th>Country / State</th><th>Student&apos;s schedule</th><th>Pakistan day &amp; time</th><th>Time there now</th>{isMgr && <th></th>}</tr></thead>
        <tbody>{visible.length === 0 && <tr><td colSpan="8" className="empty">No classes found.</td></tr>}
          {visible.map((c) => { const s = byId(students, c.student_id), t = byId(teachers, c.teacher_id); if (!s) return null; const k = pkSlot(c.local_time, s.tz, c.weekdays);
            return (<tr key={c.id}><td><span className="tid">{t?.username}</span> <b>{t?.full_name}</b></td><td><b>{s.roll_no || '-'}</b></td><td><b>{s.name}</b></td><td>{s.country} / {s.state}</td><td>{dayNames(c.weekdays)} {c.local_time.slice(0, 5)}</td>
              <td><span className="pk">{dayNames(k.days)} {k.time}</span></td><td>{nowIn(s.tz)}</td>{isMgr && <td><button className="btn sm" onClick={() => del('classes', c.id, 'this class')}>Delete</button></td>}</tr>); })}</tbody></table></div>}

    {tab === 'teachers' && <div className="panel"><h3>Teachers <small style={{ fontWeight: 400, color: '#7a6d8a' }}>(workload in Pakistan Time)</small></h3>
      <table><thead><tr><th>ID</th><th>Name</th><th>Contact</th><th>Total classes</th><th>Classes today</th><th>Next class today</th></tr></thead>
        <tbody>{teachers.length === 0 && <tr><td colSpan="6" className="empty">No teachers yet.</td></tr>}
          {teachers.map((t) => { const sl = slotsOf(t.id), today = sl.filter((k) => k.days.includes(now.day)), next = today.filter((k) => k.mins >= now.mins).sort((a, b) => a.mins - b.mins)[0];
            return (<tr key={t.id}><td><span className="tid">{t.username}</span></td><td><b>{t.full_name}</b></td><td>{t.phone}</td><td><b>{sl.length}</b></td><td><b>{today.length}</b></td><td>{next ? <span className="pk">{next.time}</span> : <span style={{ color: '#7a6d8a' }}>None remaining</span>}</td></tr>); })}</tbody></table></div>}

    {tab === 'students' && <div className="panel">
      <div className="head"><h3>Students</h3><input style={{ width: 260 }} placeholder="Search by roll no or name" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <table><thead><tr><th>Roll No</th><th>Name</th><th>Teacher</th><th>Country</th><th>State</th><th>Time there now</th><th>Classes</th>{isMgr && <th></th>}</tr></thead>
        <tbody>{students.length === 0 && <tr><td colSpan="8" className="empty">No students yet.</td></tr>}
          {students.filter((s) => !q || (s.name + ' ' + (s.roll_no || '')).toLowerCase().includes(q.toLowerCase())).map((s) => {
            const mine = classes.filter((c) => c.student_id === s.id);
            const tl = [...new Set(mine.map((c) => c.teacher_id))].map((id) => byId(teachers, id)).filter(Boolean);
            return (<tr key={s.id}><td><span className="pk">{s.roll_no || '-'}</span></td><td><b>{s.name}</b></td>
              <td>{tl.length ? tl.map((t) => <div key={t.id}><span className="tid">{t.username}</span> <b>{t.full_name}</b></div>) : <span style={{ color: '#7a6d8a' }}>Not assigned</span>}</td>
              <td>{s.country}</td><td>{s.state}</td><td>{nowIn(s.tz)}</td><td>{mine.length}</td>
              {isMgr && <td><button className="btn sm" onClick={() => del('students', s.id, s.name)}>Delete</button></td>}</tr>); })}</tbody></table></div>}

    {tab === 'add' && isMgr && <div className="grid">
      <div className="panel form"><h3>1. Add teacher</h3>
        <label>Full name</label><input value={f.tn} onChange={(e) => set('tn', e.target.value)} />
        <label>Contact number</label><input value={f.tp} onChange={(e) => set('tp', e.target.value)} />
        <label>Password (min. 6 characters)</label><input value={f.tpw} onChange={(e) => set('tpw', e.target.value)} />
        <button className="btn" onClick={addTeacher}>Add teacher</button><div className="hint">The ID (T001, T002...) is generated automatically.</div></div>
      <div className="panel form"><h3>2. Add student</h3>
        <label>Roll number</label><input value={f.roll} onChange={(e) => set('roll', e.target.value)} placeholder="e.g. QH-1025" />
        <label>Student name</label><input value={f.sn} onChange={(e) => set('sn', e.target.value)} />
        <label>Country</label><select value={f.country} onChange={(e) => setF((o) => ({ ...o, country: e.target.value, state: Object.keys(COUNTRIES[e.target.value])[0] }))}>{COUNTRY_LIST.map((c) => <option key={c}>{c}</option>)}</select>
        <label>State / Region</label><select value={f.state} onChange={(e) => set('state', e.target.value)}>{Object.keys(COUNTRIES[f.country]).map((s) => <option key={s}>{s}</option>)}</select>
        <button className="btn" onClick={addStudent}>Add student</button><div className="hint">Time zone is set automatically from the state.</div></div>
      <div className="panel form"><h3>3. Add class</h3>
        <label>Teacher</label><select value={f.ct} onChange={(e) => set('ct', e.target.value)}><option value="">Select teacher</option>{teachers.map((t) => <option key={t.id} value={t.id}>{t.username} - {t.full_name}</option>)}</select>
        <label>Student</label><select value={f.cs} onChange={(e) => set('cs', e.target.value)}><option value="">Select student</option>{students.map((s) => <option key={s.id} value={s.id}>{s.roll_no ? s.roll_no + ' - ' : ''}{s.name} ({s.state}, {s.country})</option>)}</select>
        <label>Class time (student&apos;s local time)</label><input type="time" value={f.time} onChange={(e) => set('time', e.target.value)} />
        <label>Days (student&apos;s local days)</label><div className="days">{DAYS.map((d, i) => <span key={d} className={'day' + (f.days.includes(i + 1) ? ' on' : '')} onClick={() => toggleDay(i + 1)}>{d}</span>)}</div>
        <button className="btn" onClick={addClass}>Add class</button><div className="hint">Pakistan day and time are calculated automatically.</div></div>
    </div>}
  </div></>);
}