'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { pkSlot, pkNow, pkMins, pkDate, dayNames, nowIn, DAYS } from '../../lib/time';
import { COUNTRIES } from '../../lib/zones';
import { SURAHS } from '../../lib/surahs';

const COUNTRY_LIST = Object.keys(COUNTRIES).sort((a, b) => a.localeCompare(b));
const CSS = `
/* ===== New dashboard design ===== */
body{background:linear-gradient(180deg,#f6f0fc,#fbf9fe 320px,#f8f5fc)}
.wrap{max-width:1180px}
.panel,.card{background:#fff;border:1px solid var(--bd);border-radius:20px;padding:18px 20px;margin-bottom:18px;box-shadow:0 6px 22px #6b3fa012}
.card{overflow:hidden}
.chead{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:14px}.chead h3{margin:0;color:var(--p2);font-size:18px}
.hero{background:linear-gradient(120deg,#5b2f94,#b24bd0 70%,#e05bd0);color:#fff;border-radius:22px;padding:24px 26px;margin-bottom:18px;display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:space-between;box-shadow:0 12px 30px #6b3fa033}
.hero h2{margin:0 0 4px;font-size:24px}.hero p{margin:0;opacity:.9;font-size:14px}
.hero .tid.big{background:#fff;color:var(--p2);font-size:24px;padding:12px 18px;border-radius:14px}
.hero:has(.tid.big){justify-content:flex-start}
.role.light{background:#ffffff33;color:#fff}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:14px;margin-bottom:18px}
.kpi{border-radius:18px;padding:16px 18px;color:#fff;position:relative;overflow:hidden;box-shadow:0 8px 20px #0001}
.kpi i{font-style:normal;font-size:26px;position:absolute;right:14px;top:12px;opacity:.9}
.kpi b{display:block;font-size:34px;line-height:1.1}.kpi span{font-size:13px;opacity:.95}
.k1{background:linear-gradient(135deg,#6b3fa0,#9a4fc4)}.k2{background:linear-gradient(135deg,#d048b8,#ef7fd9)}.k3{background:linear-gradient(135deg,#3f7fd0,#6aa5ef)}.k4{background:linear-gradient(135deg,#2fa57a,#5cc9a0)}
.duo{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:18px;margin-bottom:6px;align-items:start}.duo>*{margin-bottom:0!important}
.tabs{margin-top:18px}
.tab{border-radius:999px;padding:10px 20px;font-weight:600}
.cgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}
.cgrid.tg{grid-template-columns:repeat(auto-fill,minmax(300px,1fr))}
.cls{display:flex;gap:12px;background:#fcfaff;border:1px solid var(--bd);border-radius:16px;padding:12px}
.ctime{background:linear-gradient(160deg,var(--p),var(--pink));color:#fff;border-radius:12px;padding:10px 8px;min-width:78px;text-align:center;font-weight:800;font-size:15px;display:flex;align-items:center;justify-content:center;line-height:1.2}
.cmid{flex:1;min-width:0}.cmid b{font-size:16px;color:var(--tx)}
.state{margin-top:8px;border-radius:10px;padding:8px 10px;font-size:13px;font-weight:700}
.state.ok{background:#e6f7ee;color:#1d7a4c}.state.bad{background:#fdeaea;color:#c0392b}.state.leave{background:#fff3df;color:#b9770e}.state.wait{background:var(--soft);color:var(--p2)}.state.mute{background:#f1f1f4;color:#777}
.abtns,.abtns2{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.abtns2{margin:0}
.abtn{border:0;border-radius:12px;padding:12px 16px;font-size:15px;font-weight:700;cursor:pointer;color:#fff;flex:1;min-height:46px}
.abtn.yes{background:linear-gradient(90deg,#1f9d63,#35c486)}.abtn.no{background:linear-gradient(90deg,#d63c3c,#ef6a6a)}.abtn.leave{background:linear-gradient(90deg,#e08a1e,#f2b04a)}
.abtn:disabled{opacity:.45;cursor:not-allowed}
.tid.sm{font-size:11px;padding:2px 7px}
.alerts.hot{border-color:#f0b6b6;background:linear-gradient(180deg,#fff7f7,#fff);animation:pulse 2s infinite}
@keyframes pulse{0%,100%{box-shadow:0 6px 22px #d63c3c14}50%{box-shadow:0 6px 28px #d63c3c40}}
.count{background:#d63c3c;color:#fff;border-radius:999px;padding:2px 11px;font-weight:800;font-size:14px}
.alert{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:12px;border:1px solid #f4cccc;background:#fff;border-radius:14px;margin-bottom:10px}
.alert .atext{flex:1;min-width:180px}.alert .abtns2 .abtn{padding:10px 18px;min-height:42px;flex:none}
.handled{margin-top:8px;font-size:13px;color:var(--mut)}.handled .hl{padding:4px 0;color:var(--tx)}
.week{display:grid;grid-template-columns:repeat(auto-fit,minmax(138px,1fr));gap:10px}
.wday{background:#fcfaff;border:1px solid var(--bd);border-radius:14px;padding:10px;min-height:110px}
.wday.today{border:2px solid var(--pink);background:#fff7fd}
.wh{font-weight:800;color:var(--p2);margin-bottom:8px;display:flex;justify-content:space-between;align-items:center}.wh em{font-style:normal;font-size:10px;background:var(--pink);color:#fff;border-radius:999px;padding:2px 8px}
.wnone{color:#bbb;text-align:center;padding:10px 0}
.wcls{background:#fff;border:1px solid var(--bd);border-left:4px solid var(--p);border-radius:10px;padding:6px 8px;margin-bottom:6px;font-size:13px}
.wcls b{display:block;color:var(--p2)}.wcls span{display:block;font-weight:600}.wcls small{color:var(--mut)}
.tcard{background:#fff;border:1px solid var(--bd);border-radius:18px;padding:16px;cursor:pointer;transition:.15s;box-shadow:0 4px 14px #6b3fa010}
.tcard:hover{transform:translateY(-3px);box-shadow:0 12px 26px #6b3fa026;border-color:#d9c3f0}
.trow{display:flex;align-items:center;gap:12px;margin-bottom:12px}.trow b{font-size:17px}
.mini{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}
.mini div{background:var(--soft);border-radius:12px;padding:8px;text-align:center}.mini b{display:block;font-size:17px;color:var(--p2)}.mini span{font-size:11px;color:var(--mut)}
.trow2{display:flex;gap:6px}
@media(max-width:600px){.hero h2{font-size:19px}.kpi b{font-size:28px}.wrap{padding:14px}}

.who{margin-bottom:6px;font-size:15px}
.chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:4px}
.chip{padding:9px 14px;border:1px solid var(--bd);border-radius:999px;cursor:pointer;font-size:14px;font-weight:600;color:var(--p2);background:#fff;user-select:none}
.chip.on{background:var(--p);color:#fff;border-color:var(--p)}
.chip.p-excellent.on{background:#1f9d63;border-color:#1f9d63}.chip.p-good.on{background:#3f7fd0;border-color:#3f7fd0}.chip.p-poor.on{background:#e08a1e;border-color:#e08a1e}.chip.p-not_prepared.on{background:#d63c3c;border-color:#d63c3c}
.two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.form textarea{width:100%;min-height:80px;padding:10px;border:1px solid var(--bd);border-radius:9px;font:inherit;resize:vertical}
.pill{display:inline-block;min-width:30px;text-align:center;border-radius:999px;padding:3px 10px;font-weight:700;font-size:13px}
.pill.p-excellent{background:#e6f7ee;color:#1d7a4c}.pill.p-good{background:#e6effc;color:#2a5fa8}.pill.p-poor{background:#fff3df;color:#b9770e}.pill.p-not_prepared{background:#fdeaea;color:#c0392b}
.modal.wide{max-width:560px}
.hlist{margin-top:8px}.hrow{border:1px solid var(--bd);border-radius:12px;padding:10px 12px;margin-bottom:8px;background:#fcfaff}
.hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}.hs{font-size:12px;color:var(--mut);margin-bottom:4px}
.sheetrow{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-top:8px}
.sheet{font-size:12px;color:var(--mut)}.sheet.ok{color:#1d7a4c;font-weight:700}
.sheetrow .btn.edit{margin:0}
.scard{background:#fcfaff;border:1px solid var(--bd);border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:12px;justify-content:space-between}
.scard b{font-size:16px}.scard .sheet{display:block;margin-top:4px}
.filters{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:6px}
.kpis.small{grid-template-columns:repeat(auto-fit,minmax(130px,1fr));margin:14px 0}.kpis.small .kpi b{font-size:26px}
.k5{background:linear-gradient(135deg,#d63c3c,#ef6a6a)}.k6{background:linear-gradient(135deg,#e08a1e,#f2b04a)}

.tgroups{display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:14px}
.tgroup{border:1px solid var(--bd);border-radius:16px;padding:12px;background:#fcfaff}
.tghead{display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap}
.hcls{display:flex;align-items:center;gap:10px;background:#fff;border:1px solid var(--bd);border-radius:12px;padding:8px 10px;margin-bottom:8px}
.ctime.sm{min-width:68px;padding:7px 6px;font-size:13px}
.hmid{flex:1;min-width:0}.hcls .state{margin:0;white-space:nowrap}
.tcols{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:14px}
.tcol{border-radius:16px;padding:12px;border:1px solid var(--bd)}.tcol h4{margin:0 0 10px;color:var(--p2)}
.tcol.good{background:#f1fbf6}.tcol.bad{background:#fff5f5}.tcol.none{background:#f6f6f9}
.tchip{background:#fff;border:1px solid var(--bd);border-radius:12px;padding:8px 10px;margin-bottom:8px;display:flex;justify-content:space-between;gap:8px;align-items:center}
.trow2{flex-wrap:wrap}
.scoreb{padding:10px;border:1px dashed var(--bd);border-radius:9px;font-weight:700;color:var(--p2);background:var(--soft)}

.toasts{position:fixed;right:16px;bottom:16px;z-index:80;display:flex;flex-direction:column;gap:10px;max-width:360px}
.toast{background:#fff;border:1px solid var(--bd);border-left:6px solid var(--p);border-radius:14px;padding:12px 14px;box-shadow:0 12px 30px #0003;cursor:pointer;animation:slidein .25s ease}
.toast.alert{border-left-color:#d63c3c}.toast b{display:block;color:var(--p2);margin-bottom:2px}.toast span{font-size:13px;line-height:1.4}
@keyframes slidein{from{transform:translateY(20px);opacity:0}to{transform:none;opacity:1}}
.nbar{display:flex;gap:12px;align-items:center;flex-wrap:wrap;border-radius:14px;padding:12px 16px;margin-bottom:16px;background:#fff7e6;border:1px solid #f2d9a3}
.nbar.ok{background:#f1fbf6;border-color:#bfe6d0;font-size:13px;padding:8px 14px}
.nbar .btn{width:auto;margin:0;padding:8px 16px}
`;
const SUBJECTS = [['qaida', 'Qaida'], ['quran', 'Quran'], ['islamic', 'Islamic Course'], ['arabic', 'Arabic Course']];
const SUBJ = Object.fromEntries(SUBJECTS);
const PERFS = [['excellent', 'Excellent'], ['good', 'Good'], ['poor', 'Poor'], ['not_prepared', 'Not Prepared']];
const PERF = Object.fromEntries(PERFS);
const BLANK = { subject: 'qaida', ql: '', qv: '', surah: '1', af: '', at: '', det: '', perf: '' };
const fillFrom = (l) => (l ? { subject: l.subject, ql: l.qaida_lesson || '', qv: l.qaida_verse || '', surah: String(l.surah_no || 1), af: l.ayah_from ? String(l.ayah_from) : '', at: l.ayah_to ? String(l.ayah_to) : '', det: l.details || '', perf: l.performance } : BLANK);
const lessonText = (l) => (l.subject === 'qaida' ? `Lesson: ${l.qaida_lesson || '-'}${l.qaida_verse ? ' | Verse: ' + l.qaida_verse : ''}` : l.subject === 'quran' ? `Surah ${SURAHS[(l.surah_no || 1) - 1][0]}, Ayah ${l.ayah_from} to ${l.ayah_to}` : l.details || '');
const fmtD = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
async function fetchAll(q) { let out = [], from = 0; for (;;) { const { data, error } = await q().range(from, from + 999); if (error || !data) break; out = out.concat(data); if (data.length < 1000) break; from += 1000; } return out; }
const fmtM = (m) => { const h = Math.floor(m / 60), mm = m % 60; return `${((h + 11) % 12) + 1}:${String(mm).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; };
const fetchMyTests = () => fetchAll(() => supabase.from('tests').select('*').gte('test_date', pkDate(-45)).order('test_date'));
const downloadCSV = (name, head, rows) => {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [head, ...rows].map((r) => r.map(esc).join(',')).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv' })); a.download = name; a.click(); URL.revokeObjectURL(a.href);
};
let actx = null;
const unlockAudio = () => { try { if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); } catch (e) {} };
const playTune = (kind) => {
  try {
    unlockAudio(); if (!actx) return;
    const t0 = actx.currentTime;
    const notes = kind === 'alert' ? [[880, 0], [1175, 0.18], [1568, 0.36], [1175, 0.7], [1568, 0.88], [1760, 1.06]] : [[784, 0], [1047, 0.2]];
    notes.forEach(([f, d]) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t0 + d); g.gain.exponentialRampToValueAtTime(0.35, t0 + d + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d + 0.34);
      o.connect(g); g.connect(actx.destination); o.start(t0 + d); o.stop(t0 + d + 0.36);
    });
  } catch (e) {}
};
const when = (d) => new Date(d).toLocaleString('en-GB', { timeZone: 'Asia/Karachi', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase() + ' PKT';

export default function Dashboard() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [rows, setRows] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [anns, setAnns] = useState([]);
  const [att, setAtt] = useState([]);
  const [myLessons, setMyLessons] = useState([]);
  const [ls, setLs] = useState(null);
  const [lsErr, setLsErr] = useState('');
  const [hist, setHist] = useState(null);
  const [repMonth, setRepMonth] = useState(() => pkDate().slice(0, 7));
  const [repLessons, setRepLessons] = useState([]);
  const [repAtt, setRepAtt] = useState([]);
  const [repT, setRepT] = useState('');
  const [repQ, setRepQ] = useState('');
  const [myTests, setMyTests] = useState([]);
  const [tm, setTm] = useState(null);
  const [tmErr, setTmErr] = useState('');
  const [repTests, setRepTests] = useState([]);
  const [showFull, setShowFull] = useState(false);
  const purged = useRef(false);
  const meRef = useRef(null);
  const dataRef = useRef({ students: [], teachers: [], classes: [], rows: [] });
  const seen = useRef(new Set());
  const seeded = useRef(false);
  const [toasts, setToasts] = useState([]);
  const [notifPerm, setNotifPerm] = useState('default');
  const [, setTick] = useState(0);
  const [annText, setAnnText] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [openT, setOpenT] = useState(null);
  const [ed, setEd] = useState(null);
  const [edErr, setEdErr] = useState('');
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState('schedule');
  const [filter, setFilter] = useState('');
  const [q, setQ] = useState('');
  const [f, setF] = useState({ tn: '', tp: '', tpw: '', sn: '', roll: '', nc: '1', country: 'United States', state: 'Alabama', ct: '', cs: '', time: '18:00', days: [] });
  const set = (k, v) => setF((o) => ({ ...o, [k]: v }));

  dataRef.current = { students, teachers, classes, rows };
  const fire = useCallback((title, body, kind = 'alert') => {
    playTune(kind);
    setToasts((t) => [...t, { id: Date.now() + Math.random(), title, body, kind }].slice(-4));
    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        const n = new Notification(title, { body, icon: '/logo.png', requireInteraction: kind === 'alert' });
        n.onclick = () => { window.focus(); n.close(); };
      }
    } catch (e) {}
  }, []);
  const applyAtt = useCallback((list, role) => {
    setAtt(list);
    const d = dataRef.current;
    list.forEach((a) => {
      let key = null, fn = null;
      if (role === 'manager' && a.status === 'not_joined' && !a.manager_status) {
        key = a.id + '|nj';
        fn = () => {
          const st = d.students.find((x) => x.id === a.student_id), t = d.teachers.find((x) => x.id === a.teacher_id), c = d.classes.find((x) => x.id === a.class_id);
          const time = c && st ? pkSlot(c.local_time, st.tz, c.weekdays).time : '';
          fire('Student did not join', `Roll ${st?.roll_no || '-'} · ${st?.name || 'Student'} did not join. Teacher: ${t ? t.username + ' ' + t.full_name : ''}${time ? '. Class time ' + time + ' PKT' : ''}.`, 'alert');
        };
      } else if (role === 'teacher' && a.manager_status) {
        key = a.id + '|' + a.manager_status;
        fn = () => { const r = d.rows.find((x) => x.student_id === a.student_id); fire('Manager update', `${r?.student_name || 'Student'} ${a.manager_status === 'leave' ? 'is on leave' : 'is joining the class'}.`, 'info'); };
      }
      if (key && !seen.current.has(key)) { seen.current.add(key); if (seeded.current) fn(); }
    });
    seeded.current = true;
  }, [fire]);
  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return router.push('/');
    const { data: p } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    setMe(p);
    meRef.current = p;
    setAnns((await supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(30)).data || []);
    applyAtt((await supabase.from('attendance').select('*').gte('class_date', pkDate(-1))).data || [], p.role);
    if (p.role !== 'teacher' && !purged.current) { purged.current = true; supabase.rpc('purge_old_sheets').then(() => {}, () => {}); }
    if (p.role === 'teacher') {
      const { data } = await supabase.rpc('teacher_classes');
      setRows(data || []);
      setMyLessons(await fetchAll(() => supabase.from('lessons').select('*').gte('lesson_date', pkDate(-60)).order('lesson_date')));
      setMyTests(await fetchMyTests());
    } else {
      setTeachers((await supabase.from('profiles').select('*').eq('role', 'teacher').order('username')).data || []);
      setStudents((await supabase.from('students').select('*').order('name')).data || []);
      setClasses((await supabase.from('classes').select('*')).data || []);
    }
  }, [router, applyAtt]);
  useEffect(() => { load(); }, [load]);
  const loadAtt = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !meRef.current) return;
    applyAtt((await supabase.from('attendance').select('*').gte('class_date', pkDate(-1))).data || [], meRef.current.role);
    setAnns((await supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(30)).data || []);
  }, [applyAtt]);
  useEffect(() => { const id = setInterval(() => { loadAtt(); setTick((t) => t + 1); }, 15000); return () => clearInterval(id); }, [loadAtt]);
  useEffect(() => {
    if (!me || me.role === 'teacher' || tab !== 'reports') return;
    (async () => {
      const [y, m] = repMonth.split('-').map(Number);
      const start = `${repMonth}-01`, end = `${repMonth}-${String(new Date(Date.UTC(y, m, 0)).getUTCDate()).padStart(2, '0')}`;
      setRepLessons(await fetchAll(() => supabase.from('lessons').select('*').gte('lesson_date', start).lte('lesson_date', end).order('lesson_date')));
      setRepAtt(await fetchAll(() => supabase.from('attendance').select('*').gte('class_date', start).lte('class_date', end).order('class_date')));
    })();
  }, [me, tab, repMonth]);
  useEffect(() => {
    if (!me || me.role === 'teacher' || tab !== 'tests') return;
    (async () => {
      const [y, m] = repMonth.split('-').map(Number);
      const start = `${repMonth}-01`, end = `${repMonth}-${String(new Date(Date.UTC(y, m, 0)).getUTCDate()).padStart(2, '0')}`;
      setRepTests(await fetchAll(() => supabase.from('tests').select('*').gte('test_date', start).lte('test_date', end).order('test_date')));
    })();
  }, [me, tab, repMonth]);
  useEffect(() => {
    if (!me) return;
    const ch = supabase.channel('att-' + me.id).on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, () => loadAtt()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [me && me.id, loadAtt]);
  useEffect(() => {
    setNotifPerm(typeof Notification === 'undefined' ? 'unsupported' : Notification.permission);
    const un = () => unlockAudio();
    window.addEventListener('click', un); window.addEventListener('keydown', un);
    return () => { window.removeEventListener('click', un); window.removeEventListener('keydown', un); };
  }, []);
  useEffect(() => {
    if (!toasts.length) return;
    const id = setTimeout(() => setToasts((t) => t.slice(1)), 9000);
    return () => clearTimeout(id);
  }, [toasts]);
  const pendingN = me && me.role !== 'teacher' ? att.filter((a) => a.status === 'not_joined' && !a.manager_status).length : 0;
  useEffect(() => { document.title = (pendingN ? `(${pendingN}) ` : '') + 'Quran Hosting'; }, [pendingN]);

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
    const nc = parseInt(f.nc, 10);
    if (isNaN(nc) || nc < 1) return setMsg('Number of classes must be at least 1.');
    const { error } = await supabase.from('students').insert({ roll_no: f.roll.trim(), name: f.sn.trim(), country: f.country, state: f.state, tz: COUNTRIES[f.country][f.state], num_classes: nc });
    if (error) return setMsg(error.message.includes('duplicate') ? 'This roll number is already used by another student.' : 'Error: ' + error.message);
    setMsg(`Student added with ${nc} ${nc === 1 ? 'class' : 'classes'}.`); setF((o) => ({ ...o, sn: '', roll: '', nc: '1' })); load(); setTab('students');
  }
  const openStudent = (s) => { setEdErr(''); setEd({ kind: 'student', id: s.id, roll: s.roll_no || '', name: s.name, country: COUNTRIES[s.country] ? s.country : COUNTRY_LIST[0], state: s.state, nc: String(s.num_classes || 1) }); };
  const openTeacher = (t) => { setEdErr(''); setEd({ kind: 'teacher', id: t.id, name: t.full_name || '', phone: t.phone || '' }); };
  const openClass = (c) => { setEdErr(''); setEd({ kind: 'class', id: c.id, teacher: c.teacher_id, student: c.student_id, time: String(c.local_time).slice(0, 5), days: [...c.weekdays] }); };
  const setE = (k, v) => setEd((o) => ({ ...o, [k]: v }));
  async function saveEdit() {
    const e = ed; let error;
    if (e.kind === 'student') {
      const nc = parseInt(e.nc, 10);
      if (!e.roll.trim() || !e.name.trim()) return setEdErr('Roll number and name are required.');
      if (isNaN(nc) || nc < 1) return setEdErr('Number of classes must be at least 1.');
      const tz = (COUNTRIES[e.country] || {})[e.state];
      if (!tz) return setEdErr('Please choose a valid country and state.');
      ({ error } = await supabase.from('students').update({ roll_no: e.roll.trim(), name: e.name.trim(), country: e.country, state: e.state, tz, num_classes: nc }).eq('id', e.id));
      if (error && error.message.includes('duplicate')) return setEdErr('This roll number is already used by another student.');
    } else if (e.kind === 'teacher') {
      if (!e.name.trim()) return setEdErr('Name is required.');
      ({ error } = await supabase.from('profiles').update({ full_name: e.name.trim(), phone: e.phone.trim() }).eq('id', e.id));
    } else {
      if (!e.teacher || !e.student || !e.days.length) return setEdErr('Select a teacher, a student and at least one day.');
      ({ error } = await supabase.from('classes').update({ teacher_id: e.teacher, student_id: e.student, weekdays: [...e.days].sort((a, b) => a - b), local_time: e.time }).eq('id', e.id));
    }
    if (error) return setEdErr('Error: ' + error.message);
    setEd(null); setMsg('Changes saved.'); load();
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
  async function markAtt(r, status) {
    if (status === 'not_joined' && !confirm(`Mark ${r.student_name} as NOT joined? The manager will be notified.`)) return;
    const { error } = await supabase.from('attendance').upsert({ class_id: r.class_id, student_id: r.student_id, teacher_id: me.id, class_date: pkDate(), status, marked_at: new Date().toISOString() }, { onConflict: 'class_id,class_date' });
    if (error) return setMsg('Error: ' + error.message);
    setMsg(status === 'joined' ? `${r.student_name} marked as joined.` : `Manager has been informed about ${r.student_name}.`); loadAtt();
  }
  async function resolveAtt(a, ms) {
    const { error } = await supabase.from('attendance').update({ manager_status: ms, resolved_by: me.id, resolved_at: new Date().toISOString() }).eq('id', a.id);
    if (error) return setMsg('Error: ' + error.message);
    loadAtt();
  }
  const openLesson = (r) => { const date = pkDate(); setLsErr(''); setLs({ r, date, ...fillFrom(myLessons.find((l) => l.class_id === r.class_id && l.lesson_date === date)) }); };
  const setL = (k, v) => setLs((o) => ({ ...o, [k]: v }));
  const changeDate = (d) => setLs((o) => ({ ...o, date: d, ...fillFrom(myLessons.find((l) => l.class_id === o.r.class_id && l.lesson_date === d)) }));
  async function saveLesson() {
    const x = ls;
    if (!x.date) return setLsErr('Choose a date.');
    if (x.date > pkDate()) return setLsErr('The date cannot be in the future.');
    const row = { class_id: x.r.class_id, student_id: x.r.student_id, teacher_id: me.id, lesson_date: x.date, subject: x.subject, qaida_lesson: null, qaida_verse: null, surah_no: null, ayah_from: null, ayah_to: null, details: null, performance: x.perf, updated_at: new Date().toISOString() };
    if (x.subject === 'qaida') { if (!x.ql.trim()) return setLsErr('Enter the lesson.'); row.qaida_lesson = x.ql.trim(); row.qaida_verse = x.qv.trim() || null; }
    else if (x.subject === 'quran') {
      const n = +x.surah, from = parseInt(x.af, 10), to = parseInt(x.at, 10), max = SURAHS[n - 1][1];
      if (isNaN(from) || isNaN(to)) return setLsErr('Enter the ayah numbers (from and to).');
      if (from < 1 || to < from || to > max) return setLsErr(`Ayah numbers must be between 1 and ${max} for this surah, and "to" cannot be smaller than "from".`);
      row.surah_no = n; row.ayah_from = from; row.ayah_to = to;
    } else { if (!x.det.trim()) return setLsErr('Write what was read today.'); row.details = x.det.trim(); }
    if (!x.perf) return setLsErr('Select how the student recited today.');
    const { error } = await supabase.from('lessons').upsert(row, { onConflict: 'class_id,lesson_date' });
    if (error) return setLsErr('Error: ' + error.message);
    setLs(null); setMsg(`Lesson sheet saved for ${x.r.student_name}.`);
    setMyLessons(await fetchAll(() => supabase.from('lessons').select('*').gte('lesson_date', pkDate(-60)).order('lesson_date')));
  }
  const openHist = (r) => setHist({ title: 'Student history', roll: r.roll_no, name: r.student_name, canDelete: true, list: myLessons.filter((l) => l.student_id === r.student_id).sort((a, b) => b.lesson_date.localeCompare(a.lesson_date)), tests: myTests.filter((t) => t.student_id === r.student_id).sort((a, b) => b.test_date.localeCompare(a.test_date)) });
  const openTest = (r) => { setTmErr(''); setTm({ r, date: pkDate(), lesson: '', total: '', correct: '', wrong: '', result: '' }); };
  const setT = (k, v) => setTm((o) => {
    const n = { ...o, [k]: v };
    if (k === 'total' || k === 'correct') { const t = parseInt(n.total, 10), c = parseInt(n.correct, 10); if (t > 0 && !isNaN(c)) { n.result = c / t >= 0.7 ? 'good' : 'bad'; if (k === 'correct' || n.wrong === '') n.wrong = String(Math.max(0, t - c)); } }
    return n;
  });
  async function saveTest() {
    const x = tm, total = parseInt(x.total, 10), correct = parseInt(x.correct, 10), wrong = x.wrong === '' ? NaN : parseInt(x.wrong, 10);
    if (!x.date || x.date > pkDate()) return setTmErr('Choose a valid date (not in the future).');
    if (!x.lesson.trim()) return setTmErr('Enter the lesson that was tested.');
    if (isNaN(total) || total < 1) return setTmErr('Enter how many questions were asked.');
    if (isNaN(correct) || correct < 0 || isNaN(wrong) || wrong < 0) return setTmErr('Enter the correct and wrong answers.');
    if (correct + wrong > total) return setTmErr('Correct plus wrong answers cannot be more than the questions asked.');
    if (!x.result) return setTmErr('Select the test result (Good or Bad).');
    const { error } = await supabase.from('tests').insert({ class_id: x.r.class_id, student_id: x.r.student_id, teacher_id: me.id, test_date: x.date, lesson: x.lesson.trim(), total_q: total, correct, wrong, result: x.result });
    if (error) return setTmErr('Error: ' + error.message);
    setTm(null); setMsg(`Test saved for ${x.r.student_name}.`); setMyTests(await fetchMyTests());
  }
  async function delTest(t) {
    if (!confirm('Delete this test record?')) return;
    const { error } = await supabase.from('tests').delete().eq('id', t.id);
    if (error) return setMsg('Error: ' + error.message);
    setHist((h) => h && { ...h, tests: (h.tests || []).filter((x) => x.id !== t.id) }); setMyTests(await fetchMyTests());
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
  const now = pkNow(), today = pkDate();
  const dateStr = new Date().toLocaleDateString('en-GB', { timeZone: 'Asia/Karachi', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
  const fmtIn = (m) => (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m} min`);
  const attFor = (cid) => att.find((a) => a.class_id === cid && a.class_date === today);
  const lessonUI = ls && isTeacher && (<div className="modal-bg" onClick={() => setLs(null)}><div className="modal form" onClick={(e) => e.stopPropagation()}>
    <h3>Lesson sheet</h3>
    <div className="who"><span className="pk">Roll {ls.r.roll_no || '-'}</span> <b>{ls.r.student_name}</b></div>
    <label>Date</label><input type="date" max={pkDate()} value={ls.date} onChange={(e) => changeDate(e.target.value)} />
    <label>Subject</label><div className="chips">{SUBJECTS.map(([k, l]) => <span key={k} className={'chip' + (ls.subject === k ? ' on' : '')} onClick={() => setL('subject', k)}>{l}</span>)}</div>
    {ls.subject === 'qaida' && <><label>Lesson</label><input value={ls.ql} onChange={(e) => setL('ql', e.target.value)} placeholder="e.g. Lesson 5" /><label>Verse (optional)</label><input value={ls.qv} onChange={(e) => setL('qv', e.target.value)} /></>}
    {ls.subject === 'quran' && <><label>Surah</label><select value={ls.surah} onChange={(e) => setL('surah', e.target.value)}>{SURAHS.map(([n], i) => <option key={i} value={i + 1}>{i + 1}. {n}</option>)}</select>
      <div className="two"><div><label>Ayah from</label><input type="number" min="1" max={SURAHS[+ls.surah - 1][1]} value={ls.af} onChange={(e) => setL('af', e.target.value)} /></div><div><label>Ayah to</label><input type="number" min="1" max={SURAHS[+ls.surah - 1][1]} value={ls.at} onChange={(e) => setL('at', e.target.value)} /></div></div>
      <div className="hint">This surah has {SURAHS[+ls.surah - 1][1]} ayahs.</div></>}
    {(ls.subject === 'islamic' || ls.subject === 'arabic') && <><label>What was read today</label><textarea value={ls.det} onChange={(e) => setL('det', e.target.value)} placeholder="e.g. Lesson 1 and Lesson 2" /></>}
    <label>How did the student recite today?</label><div className="chips">{PERFS.map(([k, l]) => <span key={k} className={'chip p-' + k + (ls.perf === k ? ' on' : '')} onClick={() => setL('perf', k)}>{l}</span>)}</div>
    {lsErr && <div className="err">{lsErr}</div>}
    <div className="mrow"><button className="btn out" onClick={() => setLs(null)}>Cancel</button><button className="btn" onClick={saveLesson}>Save lesson sheet</button></div>
  </div></div>);
  const histUI = hist && (<div className="modal-bg" onClick={() => setHist(null)}><div className="modal form wide" onClick={(e) => e.stopPropagation()}>
    <h3>{hist.title}</h3>
    <div className="who"><span className="pk">Roll {hist.roll || '-'}</span> <b>{hist.name}</b></div>
    {(hist.list || []).length === 0 && !(hist.tests || []).length && <div className="hint">Nothing found.</div>}
    {(hist.list || []).length > 0 && <div className="hs" style={{ margin: '10px 0 6px' }}><b>Lesson sheets</b></div>}
    <div className="hlist">{(hist.list || []).map((l) => <div className="hrow" key={l.id}>
      <div className="hd"><b>{fmtD(l.lesson_date)}</b><span className={'pill p-' + l.performance}>{PERF[l.performance]}</span></div>
      <div className="hs">{SUBJ[l.subject]}{hist.showTeacher && byId(teachers, l.teacher_id) ? ' | ' + byId(teachers, l.teacher_id).full_name : ''}</div>
      <div>{lessonText(l)}</div></div>)}</div>
    {(hist.tests || []).length > 0 && <div className="hs" style={{ margin: '12px 0 6px' }}><b>Tests</b></div>}
    <div className="hlist">{(hist.tests || []).map((t) => <div className="hrow" key={t.id}>
      <div className="hd"><b>{fmtD(t.test_date)}</b><span className={'pill ' + (t.result === 'good' ? 'p-excellent' : 'p-not_prepared')}>{t.result === 'good' ? 'Good' : 'Bad'}</span></div>
      <div className="hs">Lesson: {t.lesson}{hist.showTeacher && byId(teachers, t.teacher_id) ? ' | ' + byId(teachers, t.teacher_id).full_name : ''}</div>
      <div>Asked {t.total_q} | Correct {t.correct} | Wrong {t.wrong} | Score {Math.round((t.correct / t.total_q) * 100)}%</div>
      {hist.canDelete && <button className="link" style={{ color: '#c0392b', marginTop: 4 }} onClick={() => delTest(t)}>Delete this test</button>}</div>)}</div>
    <div className="mrow"><button className="btn out" onClick={() => setHist(null)}>Close</button></div>
  </div></div>);
  const tPct = tm && parseInt(tm.total, 10) > 0 && tm.correct !== '' ? Math.round((parseInt(tm.correct, 10) / parseInt(tm.total, 10)) * 100) : null;
  const testUI = tm && isTeacher && (<div className="modal-bg" onClick={() => setTm(null)}><div className="modal form" onClick={(e) => e.stopPropagation()}>
    <h3>Student test</h3>
    <div className="who"><span className="pk">Roll {tm.r.roll_no || '-'}</span> <b>{tm.r.student_name}</b></div>
    <label>Date</label><input type="date" max={pkDate()} value={tm.date} onChange={(e) => setT('date', e.target.value)} />
    <label>Lesson tested</label><input value={tm.lesson} onChange={(e) => setT('lesson', e.target.value)} placeholder="e.g. Qaida Lesson 5 or Surah Al-Fatihah" />
    <div className="two"><div><label>Questions asked</label><input type="number" min="1" value={tm.total} onChange={(e) => setT('total', e.target.value)} /></div><div><label>Correct answers</label><input type="number" min="0" value={tm.correct} onChange={(e) => setT('correct', e.target.value)} /></div></div>
    <div className="two"><div><label>Wrong answers</label><input type="number" min="0" value={tm.wrong} onChange={(e) => setT('wrong', e.target.value)} /></div><div><label>Score</label><div className="scoreb">{tPct === null ? '-' : tPct + '%'}</div></div></div>
    <label>Test result</label><div className="chips">{[['good', 'Good', 'p-excellent'], ['bad', 'Bad', 'p-not_prepared']].map(([k, l, c]) => <span key={k} className={'chip ' + c + (tm.result === k ? ' on' : '')} onClick={() => setT('result', k)}>{l}</span>)}</div>
    <div className="hint">The result is suggested from the score (70% or more is Good). You can change it.</div>
    {tmErr && <div className="err">{tmErr}</div>}
    <div className="mrow"><button className="btn out" onClick={() => setTm(null)}>Cancel</button><button className="btn" onClick={saveTest}>Save test</button></div>
  </div></div>);
  const myTotal = [...new Map(rows.map((r) => [r.student_id, r.num_classes || 1])).values()].reduce((a, b) => a + b, 0);

  const enableNotif = async () => {
    unlockAudio();
    if (typeof Notification === 'undefined') return setMsg('This browser does not support desktop notifications.');
    const perm = await Notification.requestPermission();
    setNotifPerm(perm);
    if (perm === 'granted') fire('Notifications are on', 'You will get an alert with a sound, even if another tab is open.', 'info');
    else setMsg('Notifications are blocked. Click the lock icon next to the address bar and allow notifications for this site.');
  };
  const notifBanner = notifPerm === 'unsupported' ? null : notifPerm === 'granted'
    ? <div className="nbar ok"><span>Alerts are on for this browser.</span><button className="link" onClick={() => fire('Test alert', 'This is how an alert looks and sounds.', 'info')}>Send a test</button></div>
    : <div className="nbar"><span><b>Turn on notifications.</b> {isTeacher ? 'You will be told when the manager replies about a student.' : isMgr ? 'You will be alerted with a sound when a teacher reports that a student did not join.' : 'Enable alerts in this browser.'}</span><button className="btn" onClick={enableNotif}>Turn on notifications</button></div>;
  const toastUI = toasts.length > 0 && (<div className="toasts">{toasts.map((t) => <div key={t.id} className={'toast ' + t.kind} onClick={() => setToasts((a) => a.filter((x) => x.id !== t.id))}><b>{t.title}</b><span>{t.body}</span></div>)}</div>);
  const Header = (
    <><style>{CSS}</style>{toastUI}<div className="bar">
      <div className="brand"><img src="/logo.png" alt="Quran Hosting" /><div><b>Quran Hosting</b><span>Class Portal</span></div></div>
      <div className="user"><span><b>{me.full_name}</b> <span className="role">{me.role.toUpperCase()}</span></span><button className="btn out" onClick={logout}>Sign out</button></div>
    </div></>
  );

  const shown = showAll ? anns : anns.slice(0, 3);
  const Ann = (
    <div className="panel ann"><h3>Announcements</h3>
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

  if (isTeacher) {
    const withM = (r) => ({ ...r, mins: pkMins(r.pk_time) });
    const myToday = rows.filter((r) => (r.pk_days || []).includes(now.day)).map(withM).sort((a, b) => a.mins - b.mins);
    const todayUnits = [...new Map(myToday.map((r) => [r.student_id, r.num_classes || 1])).values()].reduce((a, b) => a + b, 0);
    const studentsN = new Set(rows.map((r) => r.student_id)).size;
    const myStudents = [...new Map(rows.map((r) => [r.student_id, r])).values()].sort((a, b) => a.student_name.localeCompare(b.student_name));
    const week = [1, 2, 3, 4, 5, 6, 7].map((d) => rows.filter((r) => (r.pk_days || []).includes(d)).map(withM).sort((a, b) => a.mins - b.mins));
    const classCard = (r) => {
      const a = attFor(r.class_id), late = now.mins - r.mins; let body;
      if (a) body = a.status === 'joined' ? <div className="state ok">Joined</div>
        : <div className={'state ' + (a.manager_status === 'leave' ? 'leave' : a.manager_status === 'joining' ? 'ok' : 'bad')}>{a.manager_status === 'leave' ? 'Student is on leave' : a.manager_status === 'joining' ? 'Student is joining' : 'Marked not joined — manager informed'}</div>;
      else if (late < 0) body = <div className="state wait">Starts in {fmtIn(-late)}</div>;
      else if (late <= 120) body = <div className="abtns"><button className="abtn yes" onClick={() => markAtt(r, 'joined')}>Joined</button><button className="abtn no" disabled={late < 5} onClick={() => markAtt(r, 'not_joined')}>{late < 5 ? `Not joined (in ${5 - late} min)` : 'Not joined'}</button></div>;
      else body = <div className="state mute">Time passed — not marked</div>;
      const done = myLessons.find((l) => l.class_id === r.class_id && l.lesson_date === today);
      return (<div className="cls" key={r.class_id}><div className="ctime">{r.pk_time}</div><div className="cmid"><b>{r.student_name}</b><span className="sub">Roll {r.roll_no || '-'}{(r.num_classes || 1) > 1 ? ` · ${r.num_classes} classes` : ''}</span>{body}
        <div className="sheetrow"><span className={'sheet' + (done ? ' ok' : '')}>{done ? `Lesson saved · ${PERF[done.performance]}` : 'Lesson not written yet'}</span><button className="btn edit" onClick={() => openLesson(r)}>{done ? 'Edit lesson sheet' : 'Lesson sheet'}</button></div></div></div>);
    };
    return (<>{Header}<div className="wrap">
      {msg && <div className="msg">{msg}</div>}
      {notifBanner}
      {lessonUI}{testUI}{histUI}
      <div className="hero"><span className="tid big">{me.username}</span><div><h2>Welcome, {me.full_name}</h2><p>{dateStr} · {timeStr} PKT</p></div></div>
      <div className="kpis">
        <div className="kpi k1"><b>{myTotal}</b><span>Total classes</span></div>
        <div className="kpi k2"><b>{studentsN}</b><span>Students</span></div>
        <div className="kpi k3"><b>{todayUnits}</b><span>Classes today</span></div>
      </div>
      <div className="card"><div className="chead"><h3>Today&apos;s classes</h3><span className="pk">{DAYS[now.day - 1]}</span></div>
        {myToday.length === 0 && <div className="empty">No classes today</div>}
        <div className="cgrid">{myToday.map(classCard)}</div></div>
      <div className="card"><div className="chead"><h3>My students</h3><span className="hint">Write the daily lesson sheet or view history</span></div>
        {myStudents.length === 0 && <div className="empty">No students assigned yet.</div>}
        <div className="cgrid">{myStudents.map((r) => { const doneT = myLessons.find((l) => l.student_id === r.student_id && l.lesson_date === today); return (<div className="scard" key={r.student_id}>
          <div><b>{r.student_name}</b><span className="sub">Roll {r.roll_no || '-'} · {r.num_classes || 1} {(r.num_classes || 1) === 1 ? 'class' : 'classes'}</span><span className={'sheet' + (doneT ? ' ok' : '')}>{doneT ? 'Today: ' + PERF[doneT.performance] : 'Today: not written'}</span></div>
          <div className="trow2"><button className="btn view" onClick={() => openLesson(r)}>Write lesson</button><button className="btn view" onClick={() => openTest(r)}>Take test</button><button className="btn edit" onClick={() => openHist(r)}>History</button></div></div>); })}</div></div>
      {Ann}
      <div className="card"><div className="chead"><h3>My weekly timetable</h3><span className="hint">Pakistan time (PKT)</span></div>
        <div className="week">{week.map((list, i) => <div key={i} className={'wday' + (now.day === i + 1 ? ' today' : '')}>
          <div className="wh">{DAYS[i]}{now.day === i + 1 && <em>Today</em>}</div>
          {list.length === 0 && <div className="wnone">—</div>}
          {list.map((r) => <div className="wcls" key={r.class_id}><b>{r.pk_time}</b><span>{r.student_name}</span><small>Roll {r.roll_no || '-'}</small></div>)}</div>)}</div></div>
    </div></>);
  }

  const slotsOf = (tid) => classes.filter((c) => c.teacher_id === tid).map((c) => { const s = byId(students, c.student_id); return s ? pkSlot(c.local_time, s.tz, c.weekdays) : null; }).filter(Boolean);
  const isToday = (c) => { const st = byId(students, c.student_id); return !!st && pkSlot(c.local_time, st.tz, c.weekdays).days.includes(now.day); };
  const unitsOf = (tid, only) => { const m = new Map(); classes.filter((c) => c.teacher_id === tid && (!only || only(c))).forEach((c) => { const st = byId(students, c.student_id); if (st) m.set(st.id, st.num_classes || 1); }); return [...m.values()].reduce((a, b) => a + b, 0); };
  const visible = classes.filter((c) => !filter || c.teacher_id === filter);
  const tabs = [['schedule', 'Schedule'], ['teachers', 'Teachers'], ['students', 'Students'], ['reports', 'Lesson Reports'], ['tests', 'Test Report'], ...(isMgr ? [['add', '+ Add New']] : [])];
  const dt = openT ? byId(teachers, openT) : null;
  const todayList = classes.map((c) => { const st = byId(students, c.student_id), t = byId(teachers, c.teacher_id); if (!st || !t) return null; const k = pkSlot(c.local_time, st.tz, c.weekdays); return k.days.includes(now.day) ? { c, s: st, t, k, a: attFor(c.id) } : null; }).filter(Boolean).sort((x, y) => x.k.mins - y.k.mins);
  const hourStart = Math.floor(now.mins / 60) * 60;
  const hourList = todayList.filter((x) => x.k.mins >= hourStart && x.k.mins < hourStart + 60);
  const hourGroups = teachers.map((t) => [t, hourList.filter((x) => x.t.id === t.id)]).filter(([, l]) => l.length);
  const pending = att.filter((a) => a.status === 'not_joined' && !a.manager_status).sort((x, y) => String(y.marked_at).localeCompare(String(x.marked_at)));
  const handled = att.filter((a) => a.status === 'not_joined' && a.manager_status && a.class_date === today);
  const infoOf = (a) => { const c = classes.find((x) => x.id === a.class_id), st = byId(students, a.student_id), t = byId(teachers, a.teacher_id); return { c, s: st, t, time: c && st ? pkSlot(c.local_time, st.tz, c.weekdays).time : '' }; };
  const monthEnd = (ym) => { const [y, m] = ym.split('-').map(Number); return { y, m, last: new Date(Date.UTC(y, m, 0)).getUTCDate() }; };
  const schedKeys = (c, st) => {
    const k = pkSlot(c.local_time, st.tz, c.weekdays), { y, m, last } = monthEnd(repMonth), created = c.created_at ? String(c.created_at).slice(0, 10) : null, keys = [];
    for (let d = 1; d <= last; d++) {
      const ds = `${repMonth}-${String(d).padStart(2, '0')}`;
      if (ds > today) break;
      if (created && ds < created) continue;
      const dow = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7 + 1;
      if (!k.days.includes(dow)) continue;
      if (ds === today && k.mins > now.mins) continue;
      keys.push(c.id + '|' + ds);
    }
    return keys;
  };
  const report = tab === 'reports' && !isTeacher ? students.map((st) => {
    const cls = classes.filter((c) => c.student_id === st.id && (!repT || c.teacher_id === repT));
    if (!cls.length) return null;
    if (repQ && !(st.name + ' ' + (st.roll_no || '')).toLowerCase().includes(repQ.toLowerCase())) return null;
    const ids = new Set(cls.map((c) => c.id)), sched = new Set();
    cls.forEach((c) => schedKeys(c, st).forEach((k) => sched.add(k)));
    const ls2 = repLessons.filter((l) => l.student_id === st.id && ids.has(l.class_id));
    const taken = new Set(ls2.map((l) => l.class_id + '|' + l.lesson_date));
    repAtt.filter((a) => a.student_id === st.id && ids.has(a.class_id) && a.status === 'joined').forEach((a) => taken.add(a.class_id + '|' + a.class_date));
    const cnt = (p) => ls2.filter((l) => l.performance === p).length;
    return { st, tids: [...new Set(cls.map((c) => c.teacher_id))], scheduled: sched.size, taken: taken.size, missed: [...sched].filter((k) => !taken.has(k)).length, leave: repAtt.filter((a) => a.student_id === st.id && ids.has(a.class_id) && a.manager_status === 'leave').length, ex: cnt('excellent'), good: cnt('good'), poor: cnt('poor'), np: cnt('not_prepared'), lessons: ls2 };
  }).filter(Boolean) : [];
  const testRep = tab === 'tests' && !isTeacher ? students.map((st) => {
    const cls = classes.filter((c) => c.student_id === st.id && (!repT || c.teacher_id === repT));
    if (!cls.length) return null;
    if (repQ && !(st.name + ' ' + (st.roll_no || '')).toLowerCase().includes(repQ.toLowerCase())) return null;
    const ids = new Set(cls.map((c) => c.id));
    const ts = repTests.filter((t) => t.student_id === st.id && ids.has(t.class_id)).sort((a, b) => b.test_date.localeCompare(a.test_date) || String(b.created_at).localeCompare(String(a.created_at)));
    return { st, tids: [...new Set(cls.map((c) => c.teacher_id))], ts, last: ts[0], status: ts[0] ? ts[0].result : 'none' };
  }).filter(Boolean) : [];
  const tnames = (tids) => tids.map((id) => byId(teachers, id)?.username).filter(Boolean).join(', ');
  const downloadReport = () => downloadCSV(`lesson-report-${repMonth}.csv`, ['Roll No', 'Student', 'Teacher', 'Scheduled', 'Taken', 'Not taken', 'On leave', 'Excellent', 'Good', 'Poor', 'Not prepared'], report.map((r) => [r.st.roll_no, r.st.name, tnames(r.tids), r.scheduled, r.taken, r.missed, r.leave, r.ex, r.good, r.poor, r.np]));
  const downloadTests = () => downloadCSV(`test-report-${repMonth}.csv`, ['Roll No', 'Student', 'Teacher', 'Status', 'Tests taken', 'Latest lesson', 'Asked', 'Correct', 'Wrong'], testRep.map((r) => [r.st.roll_no, r.st.name, tnames(r.tids), r.status === 'none' ? 'Not taken' : r.status === 'good' ? 'Good' : 'Bad', r.ts.length, r.last ? r.last.lesson : '', r.ts.reduce((n, t) => n + t.total_q, 0), r.ts.reduce((n, t) => n + t.correct, 0), r.ts.reduce((n, t) => n + t.wrong, 0)]));
  const sum = (k) => report.reduce((n, r) => n + r[k], 0);
  const badgeOf = ({ a, k }) => a ? (a.status === 'joined' ? ['ok', 'Joined'] : a.manager_status === 'leave' ? ['leave', 'On leave'] : a.manager_status === 'joining' ? ['ok', 'Joining'] : ['bad', 'Not joined']) : (now.mins < k.mins ? ['wait', 'Upcoming'] : now.mins <= k.mins + 120 ? ['wait', 'Waiting for teacher'] : ['mute', 'Not marked']);

  return (<>{Header}<div className="wrap">
    {msg && <div className="msg">{msg}</div>}
    {notifBanner}
    {histUI}
    <div className="hero"><div><h2>Welcome, {me.full_name}</h2><p>{dateStr} · {timeStr} PKT</p></div><span className="role light">{me.role.toUpperCase()}</span></div>
    <div className="kpis">
      <div className="kpi k1"><b>{teachers.length}</b><span>Teachers</span></div>
      <div className="kpi k2"><b>{students.length}</b><span>Students</span></div>
      <div className="kpi k3"><b>{students.reduce((n, x) => n + (x.num_classes || 1), 0)}</b><span>Total classes</span></div>
      <div className="kpi k4"><b>{todayList.length}</b><span>Classes scheduled today</span></div>
    </div>
    <div className="duo">
      <div className={'card alerts' + (pending.length ? ' hot' : '')}><div className="chead"><h3>Attendance alerts</h3>{pending.length > 0 && <span className="count">{pending.length}</span>}</div>
        {pending.length === 0 && <div className="hint">No pending alerts. All good </div>}
        {pending.map((a) => { const { s: st, t, time } = infoOf(a); return (<div className="alert" key={a.id}>
          <div className="atext"><b>Roll {st?.roll_no || '-'} · {st?.name}</b> did not join<span className="sub">Teacher: {t?.username} {t?.full_name} · Class time {time} PKT</span></div>
          {isMgr ? <div className="abtns2"><button className="abtn yes" onClick={() => resolveAtt(a, 'joining')}>Joining</button><button className="abtn leave" onClick={() => resolveAtt(a, 'leave')}>Leave</button></div> : <span className="pk">Waiting for manager</span>}</div>); })}
        {handled.length > 0 && <details className="handled"><summary>Handled today ({handled.length})</summary>
          {handled.map((a) => { const { s: st } = infoOf(a); return <div className="hl" key={a.id}>Roll {st?.roll_no || '-'} · {st?.name} — {a.manager_status === 'leave' ? 'on leave' : 'joining'}</div>; })}</details>}
      </div>
      {Ann}
    </div>
    <div className="tabs">{tabs.map(([k, l]) => <button key={k} className={'tab' + (tab === k ? ' on' : '')} onClick={() => { setTab(k); setOpenT(null); }}>{l}</button>)}</div>

    {tab === 'schedule' && <div className="card">
      <div className="chead"><h3>Classes this hour</h3><span className="pk">{fmtM(hourStart)} - {fmtM(hourStart + 59)}</span></div>
      {hourList.length === 0 && <div className="empty">No classes are scheduled in this hour.</div>}
      <div className="tgroups">{hourGroups.map(([t, list]) => <div className="tgroup" key={t.id}>
        <div className="tghead"><span className="tid">{t.username}</span><b>{t.full_name}</b><span className="sub">{list.length} {list.length === 1 ? 'class' : 'classes'}</span></div>
        {list.map(({ c, s: st, k, a }) => { const [cls, label] = badgeOf({ a, k }); return (<div className="hcls" key={c.id}><span className="ctime sm">{k.time}</span><div className="hmid"><b>{st.name}</b><span className="sub">Roll {st.roll_no || '-'}</span></div><span className={'state ' + cls}>{label}</span></div>); })}</div>)}</div>
      <button className="link" style={{ marginTop: 12 }} onClick={() => setShowFull(!showFull)}>{showFull ? 'Hide full timetable' : 'View full timetable'}</button>
    </div>}

    {tab === 'schedule' && showFull && <div className="panel">
      <div className="head"><h3>Full schedule</h3>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}><option value="">All teachers</option>{teachers.map((t) => <option key={t.id} value={t.id}>{t.username} - {t.full_name}</option>)}</select></div>
      <table><thead><tr><th>Teacher</th><th>Roll No</th><th>Student</th><th>Country / State</th><th>Student&apos;s schedule</th><th>Pakistan day &amp; time</th><th>Time there now</th>{isMgr && <th></th>}</tr></thead>
        <tbody>{visible.length === 0 && <tr><td colSpan="8" className="empty">No classes found.</td></tr>}
          {visible.map((c) => { const s = byId(students, c.student_id), t = byId(teachers, c.teacher_id); if (!s) return null; const k = pkSlot(c.local_time, s.tz, c.weekdays);
            return (<tr key={c.id}><td><span className="tid">{t?.username}</span> <b>{t?.full_name}</b></td><td><b>{s.roll_no || '-'}</b></td><td><b>{s.name}</b></td><td>{s.country} / {s.state}</td><td>{dayNames(c.weekdays)} {c.local_time.slice(0, 5)}</td>
              <td><span className="pk">{dayNames(k.days)} {k.time}</span></td><td>{nowIn(s.tz)}</td>{isMgr && <td style={{ whiteSpace: 'nowrap' }}><button className="btn edit" onClick={() => openClass(c)}>Edit</button><button className="btn sm" onClick={() => del('classes', c.id, 'this class')}>Delete</button></td>}</tr>); })}</tbody></table></div>}

    {tab === 'teachers' && !dt && <div className="cgrid tg">
      {teachers.length === 0 && <div className="empty">No teachers yet.</div>}
      {teachers.map((t) => { const todayS = slotsOf(t.id).filter((k) => k.days.includes(now.day)), next = todayS.filter((k) => k.mins >= now.mins).sort((a, b) => a.mins - b.mins)[0];
        return (<div className="tcard" key={t.id} onClick={() => setOpenT(t.id)}>
          <div className="trow"><span className="tid">{t.username}</span><div><b>{t.full_name}</b><span className="sub">{t.phone || 'No contact number'}</span></div></div>
          <div className="mini"><div><b>{unitsOf(t.id)}</b><span>Total classes</span></div><div><b>{unitsOf(t.id, isToday)}</b><span>Today</span></div><div><b>{next ? next.time : '—'}</b><span>Next class</span></div></div>
          <div className="trow2"><button className="btn view" onClick={() => setOpenT(t.id)}>Open</button>{isMgr && <button className="btn edit" onClick={(ev) => { ev.stopPropagation(); openTeacher(t); }}>Edit</button>}</div></div>); })}
    </div>}

    {tab === 'teachers' && dt && (() => {
      const list = classes.filter((c) => c.teacher_id === dt.id).map((c) => { const s = byId(students, c.student_id); return s ? { c, s, k: pkSlot(c.local_time, s.tz, c.weekdays) } : null; }).filter(Boolean).sort((a, b) => a.k.mins - b.k.mins);
      return (<div className="panel">
        <div className="head"><button className="btn out" onClick={() => setOpenT(null)}>← Back to teachers</button>{isMgr && <button className="btn out" style={{ marginLeft: 8 }} onClick={() => openTeacher(dt)}>Edit teacher</button>}</div>
        <div className="head" style={{ justifyContent: 'flex-start', gap: 14 }}><span className="tid" style={{ fontSize: 20 }}>{dt.username}</span><div><h3 style={{ margin: 0, fontSize: 22 }}>{dt.full_name}</h3><small style={{ color: '#7a6d8a' }}>{dt.phone ? 'Contact: ' + dt.phone : ''}</small></div></div>
        <div className="cards">
          <div><b>{new Set(list.map((x) => x.s.id)).size}</b><span>Students</span></div>
          <div><b>{unitsOf(dt.id)}</b><span>Total classes</span></div>
          <div><b>{unitsOf(dt.id, isToday)}</b><span>Classes today (PKT)</span></div>
        </div>
        <table><thead><tr><th>Roll No</th><th>Student</th><th>Classes</th><th>Country / State</th><th>Student&apos;s schedule</th><th>Pakistan day &amp; time</th>{isMgr && <th></th>}</tr></thead>
          <tbody>{list.length === 0 && <tr><td colSpan="7" className="empty">No classes assigned to this teacher yet.</td></tr>}
            {list.map(({ c, s, k }) => <tr key={c.id}><td><span className="pk">{s.roll_no || '-'}</span></td><td><b>{s.name}</b></td><td><b>{s.num_classes || 1}</b></td><td>{s.country} / {s.state}</td><td>{dayNames(c.weekdays)} {c.local_time.slice(0, 5)}</td><td><span className="pk">{dayNames(k.days)} {k.time}</span></td>{isMgr && <td><button className="btn edit" onClick={() => openClass(c)}>Edit</button></td>}</tr>)}</tbody></table>
        
      </div>);
    })()}

    {tab === 'students' && <div className="panel">
      <div className="head"><h3>Students</h3><input style={{ width: 260 }} placeholder="Search by roll no or name" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <table><thead><tr><th>Roll No</th><th>Name</th><th>Classes</th><th>Teacher &amp; Pakistan time</th><th>Country</th><th>State</th><th>Time there now</th>{isMgr && <th></th>}</tr></thead>
        <tbody>{students.length === 0 && <tr><td colSpan="8" className="empty">No students yet.</td></tr>}
          {students.filter((s) => !q || (s.name + ' ' + (s.roll_no || '')).toLowerCase().includes(q.toLowerCase())).map((s) => {
            const mine = classes.filter((c) => c.student_id === s.id);
            return (<tr key={s.id}><td><span className="pk">{s.roll_no || '-'}</span></td><td><b>{s.name}</b></td><td><b>{s.num_classes || 1}</b><span className="sub">{mine.length} scheduled</span></td>
              <td>{mine.length ? mine.map((c) => { const t = byId(teachers, c.teacher_id), k = pkSlot(c.local_time, s.tz, c.weekdays); return <div className="line" key={c.id}><span className="tid">{t?.username}</span> {t?.full_name} — <span className="pk">{dayNames(k.days)} {k.time}</span>{isMgr && <button className="link" style={{ marginLeft: 8 }} onClick={() => openClass(c)}>edit</button>}</div>; }) : <span style={{ color: '#7a6d8a' }}>Not assigned</span>}</td>
              <td>{s.country}</td><td>{s.state}</td><td>{nowIn(s.tz)}</td>
              {isMgr && <td style={{ whiteSpace: 'nowrap' }}><button className="btn edit" onClick={() => openStudent(s)}>Edit</button><button className="btn sm" onClick={() => del('students', s.id, s.name)}>Delete</button></td>}</tr>); })}</tbody></table></div>}

    {tab === 'reports' && <div className="card">
      <div className="chead"><h3>Monthly lesson report</h3><button className="btn out" onClick={downloadReport}>Download CSV</button></div>
      <div className="filters form">
        <div><label>Month</label><input type="month" max={today.slice(0, 7)} value={repMonth} onChange={(e) => e.target.value && setRepMonth(e.target.value)} /></div>
        <div><label>Teacher</label><select value={repT} onChange={(e) => setRepT(e.target.value)}><option value="">All teachers</option>{teachers.map((t) => <option key={t.id} value={t.id}>{t.username} - {t.full_name}</option>)}</select></div>
        <div><label>Search student</label><input placeholder="Roll no or name" value={repQ} onChange={(e) => setRepQ(e.target.value)} /></div>
      </div>
      <div className="kpis small">
        <div className="kpi k4"><b>{sum('taken')}</b><span>Classes taken</span></div>
        <div className="kpi k5"><b>{sum('missed')}</b><span>Classes not taken</span></div>
        <div className="kpi k1"><b>{sum('ex')}</b><span>Excellent</span></div>
        <div className="kpi k3"><b>{sum('good')}</b><span>Good</span></div>
        <div className="kpi k6"><b>{sum('poor')}</b><span>Poor</span></div>
        <div className="kpi k2"><b>{sum('np')}</b><span>Not prepared</span></div>
      </div>
      <div style={{ overflowX: 'auto' }}><table><thead><tr><th>Roll No</th><th>Student</th><th>Teacher</th><th>Scheduled</th><th>Taken</th><th>Not taken</th><th>On leave</th><th>Excellent</th><th>Good</th><th>Poor</th><th>Not prepared</th><th></th></tr></thead>
        <tbody>{report.length === 0 && <tr><td colSpan="12" className="empty">No students found for this selection.</td></tr>}
          {report.map((r) => <tr key={r.st.id}><td><span className="pk">{r.st.roll_no || '-'}</span></td><td><b>{r.st.name}</b></td><td>{r.tids.map((id) => byId(teachers, id)?.username).filter(Boolean).join(', ')}</td>
            <td>{r.scheduled}</td><td><b>{r.taken}</b></td><td><b style={{ color: r.missed ? '#c0392b' : undefined }}>{r.missed}</b></td><td>{r.leave}</td>
            <td><span className="pill p-excellent">{r.ex}</span></td><td><span className="pill p-good">{r.good}</span></td><td><span className="pill p-poor">{r.poor}</span></td><td><span className="pill p-not_prepared">{r.np}</span></td>
            <td><button className="btn view" onClick={() => setHist({ title: 'Lesson sheets', roll: r.st.roll_no, name: r.st.name, showTeacher: true, list: [...r.lessons].sort((a, b) => b.lesson_date.localeCompare(a.lesson_date)) })}>View sheets</button></td></tr>)}</tbody></table></div>
      <div className="hint">Taken = days with a lesson sheet or a Joined mark. Not taken = scheduled class days up to today with neither. Scheduled days use Pakistan time. Lesson sheets, tests and attendance are kept for one month only. Last month&apos;s data is deleted automatically on the 4th, so download the CSV before then.</div>
    </div>}

    {tab === 'tests' && <div className="card">
      <div className="chead"><h3>Monthly test report</h3><button className="btn out" onClick={downloadTests}>Download CSV</button></div>
      <div className="filters form">
        <div><label>Month</label><input type="month" max={today.slice(0, 7)} value={repMonth} onChange={(e) => e.target.value && setRepMonth(e.target.value)} /></div>
        <div><label>Teacher</label><select value={repT} onChange={(e) => setRepT(e.target.value)}><option value="">All teachers</option>{teachers.map((t) => <option key={t.id} value={t.id}>{t.username} - {t.full_name}</option>)}</select></div>
        <div><label>Search student</label><input placeholder="Roll no or name" value={repQ} onChange={(e) => setRepQ(e.target.value)} /></div>
      </div>
      <div className="kpis small">
        <div className="kpi k4"><b>{testRep.filter((r) => r.status === 'good').length}</b><span>Good test</span></div>
        <div className="kpi k5"><b>{testRep.filter((r) => r.status === 'bad').length}</b><span>Bad test</span></div>
        <div className="kpi k3"><b>{testRep.filter((r) => r.status === 'none').length}</b><span>Test not taken</span></div>
        <div className="kpi k1"><b>{repTests.length}</b><span>Total tests</span></div>
      </div>
      <div className="tcols">{[['good', 'Good test'], ['bad', 'Bad test'], ['none', 'Test not taken']].map(([k, l]) => { const list = testRep.filter((r) => r.status === k); return (<div className={'tcol ' + k} key={k}><h4>{l} ({list.length})</h4>
        {list.length === 0 && <div className="hint">No students</div>}
        {list.map((r) => <div className="tchip" key={r.st.id}><div><b>Roll {r.st.roll_no || '-'} · {r.st.name}</b><span className="sub">{tnames(r.tids)}{r.last ? ` · ${r.last.lesson} · ${r.last.correct}/${r.last.total_q}` : ''}</span></div>
          {r.ts.length > 0 && <button className="btn view" onClick={() => setHist({ title: 'Test details', roll: r.st.roll_no, name: r.st.name, showTeacher: true, list: [], tests: r.ts })}>View</button>}</div>)}</div>); })}</div>
      <div className="hint">A student is listed as Good or Bad by the latest test in the month. Students with no test in the month are listed as Test not taken. Data is kept for one month only (last month&apos;s data is deleted on the 4th), so download the CSV before then.</div>
    </div>}

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
        <label>How many classes does the student take?</label><select value={f.nc} onChange={(e) => set('nc', e.target.value)}>{[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} {n === 1 ? 'class' : 'classes'}</option>)}</select>
        <button className="btn" onClick={addStudent}>Add student</button><div className="hint">30 min = 1 class, 1 hour = 2 classes. The teacher's class count goes up by this number. Time zone is set from the state.</div></div>
      <div className="panel form"><h3>3. Add class</h3>
        <label>Teacher</label><select value={f.ct} onChange={(e) => set('ct', e.target.value)}><option value="">Select teacher</option>{teachers.map((t) => <option key={t.id} value={t.id}>{t.username} - {t.full_name}</option>)}</select>
        <label>Student</label><select value={f.cs} onChange={(e) => set('cs', e.target.value)}><option value="">Select student</option>{students.map((s) => <option key={s.id} value={s.id}>{s.roll_no ? s.roll_no + ' - ' : ''}{s.name} ({s.state}, {s.country})</option>)}</select>
        {f.cs && <div className="hint">This student takes {byId(students, f.cs)?.num_classes || 1} class(es) in total (set in student details).</div>}
        <label>Class time (student&apos;s local time)</label><input type="time" value={f.time} onChange={(e) => set('time', e.target.value)} />
        <label>Days (student&apos;s local days)</label><div className="days">{DAYS.map((d, i) => <span key={d} className={'day' + (f.days.includes(i + 1) ? ' on' : '')} onClick={() => toggleDay(i + 1)}>{d}</span>)}</div>
        <button className="btn" onClick={addClass}>Add class</button><div className="hint">Pakistan day and time are calculated automatically.</div></div>
    </div>}
    {ed && isMgr && <div className="modal-bg" onClick={() => setEd(null)}><div className="modal form" onClick={(x) => x.stopPropagation()}>
      <h3>Edit {ed.kind}</h3>
      {ed.kind === 'student' && <>
        <label>Roll number</label><input value={ed.roll} onChange={(e) => setE('roll', e.target.value)} />
        <label>Student name</label><input value={ed.name} onChange={(e) => setE('name', e.target.value)} />
        <label>Country</label><select value={ed.country} onChange={(e) => setEd((o) => ({ ...o, country: e.target.value, state: Object.keys(COUNTRIES[e.target.value])[0] }))}>{COUNTRY_LIST.map((c) => <option key={c}>{c}</option>)}</select>
        <label>State / Region</label><select value={ed.state} onChange={(e) => setE('state', e.target.value)}>{Object.keys(COUNTRIES[ed.country]).map((st) => <option key={st}>{st}</option>)}</select>
        <label>How many classes does the student take?</label><select value={ed.nc} onChange={(e) => setE('nc', e.target.value)}>{[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} {n === 1 ? 'class' : 'classes'}</option>)}</select>
        <div className="hint">30 min = 1 class, 1 hour = 2 classes. The teacher&apos;s class count follows this number.</div></>}
      {ed.kind === 'teacher' && <>
        <label>Full name</label><input value={ed.name} onChange={(e) => setE('name', e.target.value)} />
        <label>Contact number</label><input value={ed.phone} onChange={(e) => setE('phone', e.target.value)} /></>}
      {ed.kind === 'class' && <>
        <label>Teacher</label><select value={ed.teacher} onChange={(e) => setE('teacher', e.target.value)}>{teachers.map((t) => <option key={t.id} value={t.id}>{t.username} - {t.full_name}</option>)}</select>
        <label>Student</label><select value={ed.student} onChange={(e) => setE('student', e.target.value)}>{students.map((st) => <option key={st.id} value={st.id}>{st.roll_no ? st.roll_no + ' - ' : ''}{st.name} ({st.state}, {st.country})</option>)}</select>
        <label>Class time (student&apos;s local time)</label><input type="time" value={ed.time} onChange={(e) => setE('time', e.target.value)} />
        <label>Days (student&apos;s local days)</label><div className="days">{DAYS.map((d, i) => <span key={d} className={'day' + (ed.days.includes(i + 1) ? ' on' : '')} onClick={() => setE('days', ed.days.includes(i + 1) ? ed.days.filter((x) => x !== i + 1) : [...ed.days, i + 1])}>{d}</span>)}</div></>}
      {edErr && <div className="err">{edErr}</div>}
      <div className="mrow"><button className="btn out" onClick={() => setEd(null)}>Cancel</button><button className="btn" onClick={saveEdit}>Save changes</button></div>
    </div></div>}
  </div></>);
}