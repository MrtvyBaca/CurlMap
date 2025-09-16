export function fmtDate(s){
  try {
    const d = new Date(s);
    return d.toLocaleDateString('en-GB',{year:'numeric',month:'2-digit',day:'2-digit'});
  } catch { return s; }
}

export function splitTournaments(c){
  const ts = [...(c.tournaments||[])].sort((a,b)=>new Date(a.start)-new Date(b.start));
  const today = new Date();
  const upcoming = ts.filter(t => new Date(t.end||t.start) >= today);
  const past     = ts.filter(t => new Date(t.end||t.start) <  today).reverse();
  return { upcoming, past };
}

export const TRUNCATE_N = 50;

export function makeTruncateSpan(text, n = TRUNCATE_N){
  const t = (text||'').toString();
  const short = t.length>n ? t.slice(0,n)+'…' : t;
  // necháme jednoduché, bez dataset prepínania – ak chceš toggling, pridáme neskôr
  return short;
}
