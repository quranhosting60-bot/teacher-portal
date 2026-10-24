export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const dayNames = (a) => (a || []).map((d) => DAYS[d - 1]).join(', ');
const parts = (d, tz, o) => Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', ...o }).formatToParts(d).map((x) => [x.type, x.value]));
const YMD = { year: 'numeric', month: 'numeric', day: 'numeric' };
function offsetMs(ms, tz) {
  const p = parts(new Date(ms), tz, { ...YMD, hour: 'numeric', minute: 'numeric', second: 'numeric' });
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - ms;
}
// Student's local time + weekdays -> Pakistan time, Pakistan weekdays, minutes since midnight (PKT)
export function pkSlot(hhmm, tz, weekdays) {
  const [h, m] = hhmm.split(':').map(Number);
  const l = parts(new Date(), tz, YMD);
  const guess = Date.UTC(l.year, l.month - 1, l.day, h, m);
  const inst = guess - offsetMs(guess, tz);
  const k = parts(new Date(inst), 'Asia/Karachi', { ...YMD, hour: 'numeric', minute: 'numeric' });
  const shift = Math.round((Date.UTC(k.year, k.month - 1, k.day) - Date.UTC(l.year, l.month - 1, l.day)) / 864e5);
  const time = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(inst)).toUpperCase();
  const days = weekdays.map((d) => ((d - 1 + shift) % 7 + 7) % 7 + 1).sort((a, b) => a - b);
  return { time, days, mins: +k.hour * 60 + +k.minute };
}
export function pkNow() {
  const p = parts(new Date(), 'Asia/Karachi', { weekday: 'short', hour: 'numeric', minute: 'numeric' });
  return { day: DAYS.indexOf(p.weekday) + 1, mins: +p.hour * 60 + +p.minute };
}
export const nowIn = (tz) => new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date()).toUpperCase();
