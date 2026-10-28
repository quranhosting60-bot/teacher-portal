'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { pkSlot, pkNow, dayNames, nowIn, DAYS } from '../../lib/time';
import { COUNTRIES } from '../../lib/zones';

const COUNTRY_LIST = Object.keys(COUNTRIES);
const money = (n) => 'Rs ' + Math.round(n || 0).toLocaleString('en-US');
const when = (d) => new Date(d).toLocaleString('en-GB', { timeZone: 'Asia/Karachi', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase() + ' PKT';

export default function Dashboard() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [rows, setRows] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [anns, setAnns] = useState([]);
  const [annText, setAnnText] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [openT, setOpenT] = useState(null);
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState('schedule');
  const [filter, setFilter] = useState('');
  const [q, setQ] = useState('');
  const [f, setF] = useState({ tn: '', tp: '', tpw: '', sn: '', roll: '', pay: '', country: 'United States', state: 'Alabama', ct: '', cs: '', time: '18:00', days: [] });
  const set = (k, v) => setF((o) => ({ ...o, [k]: v }));

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return router.push('/');
    const { data: p } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    setMe(p);
    setAnns((await supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(30)).data || []);
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
    const pay = f.pay === '' ? 0 : Number(f.pay);
    if (isNaN(pay) || pay < 0) return setMsg('Pay per class must be a valid number.');
    const { error } = await supabase.from('students').insert({ roll_no: f.roll.trim(), name: f.sn.trim(), country: f.country, state: f.state, tz: COUNTRIES[f.country][f.state], pay_per_class: pay });
    if (error) return setMsg(error.message.includes('duplicate') ? 'This roll number is already used by another student.' : 'Error: ' + error.message);
    setMsg('Student added.'); setF((o) => ({ ...o, sn: '', roll: '', pay: '' })); load(); setTab('students');
  }
  async function editPay(s) {
    const v = prompt(`Pay per class for ${s.name} (PKR):`, s.pay_per_class ?? 0);
    if (v === null) return;
    const n = Number(v);
    if (v.trim() === '' || isNaN(n) || n < 0) return setMsg('Please enter a valid amount.');
    const { error } = await supabase.from('students').update({ pay_per_class: n }).eq('id', s.id);
    setMsg(error ? 'Error: ' + error.message : 'Pay updated.'); load();
  }
  async function addClass() {
    if (!f.ct || !f.cs || !f.days.length) return setMsg('Please select a teacher, a student and at least one day.');
    const { error } = await supabase.from('classes').insert({ teacher_id: f.ct, student_id: f.cs, weekdays: f.days, local_time: f.time });
    if (error) return setMsg('Error: ' + error.message);
    setMsg('Class added.'); set('days', []); load(); setTab('schedule');
  }
  async function postAnn() {
    if (!annText.trim()) return;
    const { error } = await supabase.from('announcements').insert({ body: annText.trim(), author_id: me.id, author_name: me.full_name, author_role: me.role });
    if (error) return setMsg('Error: ' + error.message);
    setAnnText(''); setMsg('Announcement posted.'); load();
  }
  async function del(table, id, label) {
    if (!confirm(`Delete ${label}?`)) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    setMsg(error ? 'Error: ' + error.message + (table === 'students' ? ' (delete the related classes first)' : '') : 'Deleted.'); load();
  }
  const toggleDay = (d) => set('days', f.days.includes(d) ? f.days.filter((x) => x !== d) : [...f.days, d]);
  const logout = async () => { await supabase.auth.signOut(); router.push('/'); };

  if (!me) return <p style={{ padding: 20 }}>Loading...</p>;
  const isMgr = me.role === 'manager', isTeacher = me.role === 'teacher', canPost = !isTeacher;
  const byId = (list, id) => list.find((x) => x.id === id);

  const Header = (
    <div className="bar">
      <div className="brand"><img src="/logo.png" alt="Quran Hosting" /><div><b>Quran Hosting</b><span>Class Portal</span></div></div>
      <div className="user"><span><b>{me.full_name}</b> <span className="role">{me.role.toUpperCase()}</span></span><button className="btn out" onClick={logout}>Sign out</button></div>
    </div>
  );

  const shown = showAll ? anns : anns.slice(0, 3);
  const Ann = (
    <div className="panel ann"><h3>📢 Announcements</h3>
      {canPost && <div style={{ marginBottom: 10 }}>
        <textarea placeholder="Write an announcement for everyone..." value={annText} onChange={(e) => setAnnText(e.target.value)} />
        <div className="row"><button className="btn" onClick={postAnn}>Post announcement</button></div></div>}
      {anns.length === 0 && <div className="hint">No announcements yet.</div>}
      {shown.map((a) => <div className="item" key={a.id}>
        <div className="meta"><b>{a.author_name || 'Admin'}</b>{a.author_role && <span className="role">{a.author_role.toUpperCase()}</span>}<span>{when(a.created_at)}</span>
          {canPost && <button className="link" style={{ color: '#c0392b' }} onClick={() => del('announcements', a.id, 'this announcement')}>Delete</button>}</div>
        <div className="body">{a.body}</div></div>)}
      {anns.length > 3 && <button className="link" onClick={() => setShowAll(!showAll)}>{showAll ? 'Show fewer' : `Show older (${anns.length - 3} more)`}</button>}
    </div>
  );

  if (isTeacher) return (<>{Header}<div className="wrap">
    {msg && <div className="msg">{msg}</div>}
    {Ann}
    <div className="profile">
      <span className="tid">{me.username}</span>
      <div><h2>{me.full_name}</h2><small>{me.phone ? 'Contact: ' + me.phone : 'Teacher'}</small></div>
      <div className="big"><b>{rows.length}</b><span>Total classes</span></div>
    </div>
    <div className="panel"><h3>My classes <small style={{ fontWeight: 400, color: '#7a6d8a' }}>(Pakistan Time, PKT)</small></h3>
      <table><thead><tr><th>#</th><th>Roll No</th><th>Student</th><th>Days (PKT)</th><th>Time (PKT)</th></tr></thead>
        <tbody>{rows.length === 0 && <tr><td colSpan="5" className="empty">No classes assigned yet.</td></tr>}
          {rows.map((r, i) => <tr key={r.class_id}><td>{i + 1}</td><td><span className="pk">{r.roll_no || '-'}</span></td><td><b>{r.student_name}</b></td><td>{dayNames(r.pk_days)}</td><td><span className="pk">{r.pk_time}</span></td></tr>)}</tbody></table>
    </div></div></>);

  const now = pkNow();
  const slotsOf = (tid) => classes.filter((c) => c.teacher_id === tid).map((c) => { const s = byId(students, c.student_id); return s ? pkSlot(c.local_time, s.tz, c.weekdays) : null; }).filter(Boolean);
  const monthlyOf = (tid) => classes.filter((c) => c.teacher_id === tid).reduce((sum, c) => { const s = byId(students, c.student_id); return sum + (s ? Number(s.pay_per_class || 0) * c.weekdays.length * 4 : 0); }, 0);
  const visible = classes.filter((c) => !filter || c.teacher_id === filter);
  const tabs = [['schedule', 'Schedule'], ['teachers', 'Teachers'], ['students', 'Students'], ...(isMgr ? [['add', '+ Add New']] : [])];
  const dt = openT ? byId(teachers, openT) : null;

  return (<>{Header}<div className="wrap">
    {msg && <div className="msg">{msg}</div>}
    {Ann}
    <div className="stats">
      <div className="stat"><b>{teachers.length}</b><span>Teachers</span></div>
      <div className="stat"><b>{students.length}</b><span>Students</span></div>
      <div className="stat"><b>{classes.length}</b><span>Classes</span></div>
    </div>
    <div className="tabs">{tabs.map(([k, l]) => <button key={k} className={'tab' + (tab === k ? ' on' : '')} onClick={() => { setTab(k); setOpenT(null); }}>{l}</button>)}</div>

    {tab === 'schedule' && <div className="panel">
      <div className="head"><h3>Full schedule</h3>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}><option value="">All teachers</option>{teachers.map((t) => <option key={t.id} value={t.id}>{t.username} - {t.full_name}</option>)}</select></div>
      <table><thead><tr><th>Teacher</th><th>Roll No</th><th>Student</th><th>Country / State</th><th>Student&apos;s schedule</th><th>Pakistan day &amp; time</th><th>Time there now</th>{isMgr && <th></th>}</tr></thead>
        <tbody>{visible.length === 0 && <tr><td colSpan="8" className="empty">No classes found.</td></tr>}
          {visible.map((c) => { const s = byId(students, c.student_id), t = byId(teachers, c.teacher_id); if (!s) return null; const k = pkSlot(c.local_time, s.tz, c.weekdays);
            return (<tr key={c.id}><td><span className="tid">{t?.username}</span> <b>{t?.full_name}</b></td><td><b>{s.roll_no || '-'}</b></td><td><b>{s.name}</b></td><td>{s.country} / {s.state}</td><td>{dayNames(c.weekdays)} {c.local_time.slice(0, 5)}</td>
              <td><span className="pk">{dayNames(k.days)} {k.time}</span></td><td>{nowIn(s.tz)}</td>{isMgr && <td><button className="btn sm" onClick={() => del('classes', c.id, 'this class')}>Delete</button></td>}</tr>); })}</tbody></table></div>}

    {tab === 'teachers' && !dt && <div className="panel"><h3>Teachers <small style={{ fontWeight: 400, color: '#7a6d8a' }}>(click a teacher to see all students &amp; timings)</small></h3>
      <table><thead><tr><th>ID</th><th>Name</th><th>Contact</th><th>Total classes</th><th>Classes today</th><th>Next class today</th><th>Est. monthly pay</th><th></th></tr></thead>
        <tbody>{teachers.length === 0 && <tr><td colSpan="8" className="empty">No teachers yet.</td></tr>}
          {teachers.map((t) => { const sl = slotsOf(t.id), today = sl.filter((k) => k.days.includes(now.day)), next = today.filter((k) => k.mins >= now.mins).sort((a, b) => a.mins - b.mins)[0];
            return (<tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => setOpenT(t.id)}><td><span className="tid">{t.username}</span></td><td><b>{t.full_name}</b></td><td>{t.phone}</td><td><b>{sl.length}</b></td><td><b>{today.length}</b></td><td>{next ? <span className="pk">{next.time}</span> : <span style={{ color: '#7a6d8a' }}>None remaining</span>}</td><td><span className="money">{money(monthlyOf(t.id))}</span></td><td><button className="btn view" onClick={() => setOpenT(t.id)}>Open</button></td></tr>); })}</tbody></table></div>}

    {tab === 'teachers' && dt && (() => {
      const list = classes.filter((c) => c.teacher_id === dt.id).map((c) => { const s = byId(students, c.student_id); return s ? { c, s, k: pkSlot(c.local_time, s.tz, c.weekdays) } : null; }).filter(Boolean).sort((a, b) => a.k.mins - b.k.mins);
      const todayN = list.filter((x) => x.k.days.includes(now.day)).length;
      const monthly = monthlyOf(dt.id), weeklySessions = list.reduce((n, x) => n + x.c.weekdays.length, 0);
      return (<div className="panel">
        <div className="head"><button className="btn out" onClick={() => setOpenT(null)}>← Back to teachers</button></div>
        <div className="head" style={{ justifyContent: 'flex-start', gap: 14 }}><span className="tid" style={{ fontSize: 20 }}>{dt.username}</span><div><h3 style={{ margin: 0, fontSize: 22 }}>{dt.full_name}</h3><small style={{ color: '#7a6d8a' }}>{dt.phone ? 'Contact: ' + dt.phone : ''}</small></div></div>
        <div className="cards">
          <div><b>{new Set(list.map((x) => x.s.id)).size}</b><span>Students</span></div>
          <div><b>{list.length}</b><span>Classes</span></div>
          <div><b>{todayN}</b><span>Classes today (PKT)</span></div>
          <div><b>{weeklySessions}</b><span>Sessions per week</span></div>
          <div><b>{money(monthly)}</b><span>Est. monthly pay (4 weeks)</span></div>
        </div>
        <table><thead><tr><th>Roll No</th><th>Student</th><th>Country / State</th><th>Student&apos;s schedule</th><th>Pakistan day &amp; time</th><th>Pay / class</th><th>Est. monthly</th></tr></thead>
          <tbody>{list.length === 0 && <tr><td colSpan="7" className="empty">No classes assigned to this teacher yet.</td></tr>}
            {list.map(({ c, s, k }) => <tr key={c.id}><td><span className="pk">{s.roll_no || '-'}</span></td><td><b>{s.name}</b></td><td>{s.country} / {s.state}</td><td>{dayNames(c.weekdays)} {c.local_time.slice(0, 5)}</td><td><span className="pk">{dayNames(k.days)} {k.time}</span></td><td><span className="money">{money(s.pay_per_class)}</span></td><td><span className="money">{money(Number(s.pay_per_class || 0) * c.weekdays.length * 4)}</span></td></tr>)}</tbody></table>
        <div className="hint">Estimated monthly pay = pay per class × sessions per week × 4 weeks. Pay is visible only to the CEO and managers.</div>
      </div>);
    })()}

    {tab === 'students' && <div className="panel">
      <div className="head"><h3>Students</h3><input style={{ width: 260 }} placeholder="Search by roll no or name" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <table><thead><tr><th>Roll No</th><th>Name</th><th>Classes (teacher &amp; Pakistan time)</th><th>Country</th><th>State</th><th>Time there now</th><th>Pay / class</th>{isMgr && <th></th>}</tr></thead>
        <tbody>{students.length === 0 && <tr><td colSpan="8" className="empty">No students yet.</td></tr>}
          {students.filter((s) => !q || (s.name + ' ' + (s.roll_no || '')).toLowerCase().includes(q.toLowerCase())).map((s) => {
            const mine = classes.filter((c) => c.student_id === s.id);
            return (<tr key={s.id}><td><span className="pk">{s.roll_no || '-'}</span></td><td><b>{s.name}</b><span className="sub">{mine.length} class{mine.length === 1 ? '' : 'es'}</span></td>
              <td>{mine.length ? mine.map((c) => { const t = byId(teachers, c.teacher_id), k = pkSlot(c.local_time, s.tz, c.weekdays); return <div className="line" key={c.id}><span className="tid">{t?.username}</span> {t?.full_name} — <span className="pk">{dayNames(k.days)} {k.time}</span></div>; }) : <span style={{ color: '#7a6d8a' }}>Not assigned</span>}</td>
              <td>{s.country}</td><td>{s.state}</td><td>{nowIn(s.tz)}</td><td><span className="money">{money(s.pay_per_class)}</span></td>
              {isMgr && <td style={{ whiteSpace: 'nowrap' }}><button className="btn edit" onClick={() => editPay(s)}>Edit pay</button><button className="btn sm" onClick={() => del('students', s.id, s.name)}>Delete</button></td>}</tr>); })}</tbody></table></div>}

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
        <label>Teacher pay per class (PKR)</label><input type="number" min="0" value={f.pay} onChange={(e) => set('pay', e.target.value)} placeholder="e.g. 500" />
        <button className="btn" onClick={addStudent}>Add student</button><div className="hint">Time zone is set automatically from the state. Teachers cannot see the pay.</div></div>
      <div className="panel form"><h3>3. Add class</h3>
        <label>Teacher</label><select value={f.ct} onChange={(e) => set('ct', e.target.value)}><option value="">Select teacher</option>{teachers.map((t) => <option key={t.id} value={t.id}>{t.username} - {t.full_name}</option>)}</select>
        <label>Student</label><select value={f.cs} onChange={(e) => set('cs', e.target.value)}><option value="">Select student</option>{students.map((s) => <option key={s.id} value={s.id}>{s.roll_no ? s.roll_no + ' - ' : ''}{s.name} ({s.state}, {s.country})</option>)}</select>
        {f.cs && <div className="hint">This student already has {classes.filter((c) => c.student_id === f.cs).length} class(es). You can add as many as needed.</div>}
        <label>Class time (student&apos;s local time)</label><input type="time" value={f.time} onChange={(e) => set('time', e.target.value)} />
        <label>Days (student&apos;s local days)</label><div className="days">{DAYS.map((d, i) => <span key={d} className={'day' + (f.days.includes(i + 1) ? ' on' : '')} onClick={() => toggleDay(i + 1)}>{d}</span>)}</div>
        <button className="btn" onClick={addClass}>Add class</button><div className="hint">Pakistan day and time are calculated automatically. For a second class of the same student, add another class with a different time/teacher.</div></div>
    </div>}
  </div></>);
}