import { getState } from "../state/store.js";

export function initSidebar({ onFiltersChange }){
  const elSearch  = document.getElementById('search');
  const elRegion  = document.getElementById('region');
  const elIce     = document.getElementById('iceFilter');
  const elResults = document.getElementById('results');

  elSearch.addEventListener('input', () => onFiltersChange({ q: elSearch.value.toLowerCase() }));
  elRegion.addEventListener('change', () => onFiltersChange({ region: elRegion.value }));
  elIce.addEventListener('change', () => onFiltersChange({ ice: elIce.value }));

  // re-render pri výbere/bounds
  window.addEventListener('club:selected', () => render({ filtered: lastFiltered }));
  window.addEventListener('clubs:visibilitychange', () => render({ filtered: lastFiltered }));

  // delegované kliky: show/detail + len TURNAMENT „More/Less“
  elResults.addEventListener('click', (e)=>{
    const btn = e.target.closest('button, a');
    if(!btn) return;

    const action = btn.dataset.action;
    if (action === 'show') {
      window.focusMarker(btn.dataset.id);
    } else if (action === 'detail') {
      window.selectClub(btn.dataset.id);
    } else if (action === 'toggle-more' && btn.closest('[data-more-wrap="tournament"]')) {
      const wrap = btn.closest('[data-more-wrap="tournament"]');
      wrap.classList.toggle('is-expanded');
      btn.textContent = wrap.classList.contains('is-expanded') ? 'Less' : 'More';
      btn.setAttribute('aria-expanded', wrap.classList.contains('is-expanded') ? 'true' : 'false');
    }
  });

  return { render };
}

let lastFiltered = [];
export function render({ filtered }){
  lastFiltered = filtered;
  renderResults(filtered);
}

function renderResults(list){
  const elResults = document.getElementById('results');
  const elStats   = document.getElementById('stats');

  const { visibleIds, selectedId } = getState();
  const inView = list.filter(c => visibleIds.size ? visibleIds.has(c.id) : true);

  const total = getState().clubs.length;
  const continents = new Map();
  inView.forEach(c => continents.set(c.region, (continents.get(c.region)||0)+1));
  elStats.innerHTML = [
    chip(`${inView.length}/${total} visible`),
    ...[...continents.entries()].map(([k,v]) => chip(`${k||'Unknown'}: ${v}`))
  ].join('');

  if(!inView.length){
    elResults.innerHTML = '<div class="small">No clubs match the filters & current map view.</div>';
    return;
  }

  elResults.innerHTML = inView
    .sort((a,b)=>a.country.localeCompare(b.country)||a.city.localeCompare(b.city)||a.name.localeCompare(b.name))
    .map(c => card(c, c.id === selectedId)).join('');
}

function card(c, isActive){
  return `
    <div class="card ${isActive ? 'card--active' : ''}">
      <h3>${c.name}</h3>
      <div class="meta">${c.city}, ${c.country} • ${c.region||'–'}</div>
      <div class="detail">
        <strong>Facility:</strong> ${c.venue?.sheets ?? '?'} sheets ${c.venue?.indoor ? '(indoor)' : '(outdoor)'}
        ${c.website ? ` • <a href="${c.website}" target="_blank" rel="noopener">website</a>` : ''}
      </div>

      ${c.notes ? notesBlock(c.notes) : ''}

      ${isActive ? tournamentDetail(c) : ''}

      <div class="btn-row">
        <button class="btn" data-action="show" data-id="${c.id}">Show on map</button>
        <button class="btn" data-action="detail" data-id="${c.id}">Tournaments & detail</button>
      </div>
    </div>
  `;
}

/* === Notes bez „More“ – plný text === */
function notesBlock(text){
  return `
    <div class="more-block">
      <div class="more-title">Notes</div>
      <div class="small">${escapeHtml(text)}</div>
    </div>
  `;
}

/* === Tournaments section ===
   Očakáva pole v c.tournaments (alebo c.events) s prvkami ako:
   { name, start, end, city, url, level, notes/description }
*/
function tournamentDetail(c){
  const tournaments = Array.isArray(c.tournaments) ? c.tournaments
                     : Array.isArray(c.events) ? c.events
                     : [];

  if (!tournaments.length) return ''; // nič nerenderuj, ak nie sú dáta

  return `
    <div class="panel">
      <h4>Events & Tournaments</h4>
      <div class="panel-body">
        ${tournaments.map(renderTournamentItem).join('')}
      </div>
    </div>
  `;
}

function renderTournamentItem(t){
  const title = escapeHtml(t.name || 'Untitled event');
  const url   = t.url ? `<a href="${escapeAttr(t.url)}" target="_blank" rel="noopener">${title}</a>` : title;
  const date  = formatRange(t.start, t.end);
  const city  = t.city ? ` • ${escapeHtml(t.city)}` : '';
  const level = t.level ? ` • ${escapeHtml(t.level)}` : '';

  const desc  = t.description ?? t.notes ?? '';
  const descBlock = desc
    ? `
      <div class="more-block" data-more-wrap="tournament">
        <div class="more-text clamp-3" data-more-text>${escapeHtml(desc)}</div>
        <button class="linklike" data-action="toggle-more" aria-expanded="false">More</button>
      </div>
    `
    : '';

  return `
    <div class="tour-item" style="margin-bottom:10px">
      <div class="tour-title"><strong>${url}</strong></div>
      <div class="small tour-meta">${date}${city}${level}</div>
      ${descBlock}
    </div>
  `;
}

/* helpers */
function chip(text){ return `<span class="chip">${text}</span>`; }

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}
function escapeAttr(s){
  return String(s).replace(/"/g, '&quot;').replace(/</g,'&lt;');
}
function formatRange(a, b){
  const sa = fmtDate(a);
  const sb = fmtDate(b);
  if (sa && sb && sa !== sb) return `${sa} – ${sb}`;
  return sa || sb || '';
}
function fmtDate(d){
  if (!d) return '';
  // ak je to Date/string parsovateľný, urob YYYY-MM-DD
  try {
    const dt = typeof d === 'string' || typeof d === 'number' ? new Date(d) : d;
    if (Number.isNaN(dt.getTime())) return '';
    const y = dt.getFullYear();
    const m = String(dt.getMonth()+1).padStart(2,'0');
    const dd= String(dt.getDate()).padStart(2,'0');
    return `${y}-${m}-${dd}`;
  } catch { return ''; }
}

