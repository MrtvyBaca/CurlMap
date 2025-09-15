import { getState } from "../state/store.js";

export function initSidebar({ onFiltersChange }){
  const elSearch = document.getElementById('search');
  const elRegion = document.getElementById('region');
  const elIce    = document.getElementById('iceFilter');

  elSearch.addEventListener('input', () => {
    onFiltersChange({ q: elSearch.value.toLowerCase() });
  });
  elRegion.addEventListener('change', () => {
    onFiltersChange({ region: elRegion.value });
  });
  elIce.addEventListener('change', () => {
    onFiltersChange({ ice: elIce.value });
  });

  return { render };
}

export function render({ filtered }){
  renderResults(filtered);
}

function renderResults(list){
  const elResults = document.getElementById('results');
  const elStats   = document.getElementById('stats');

  const total = getState().clubs.length;
  const continents = new Map();
  list.forEach(c => continents.set(c.region, (continents.get(c.region)||0)+1));

  elStats.innerHTML = [
    chip(`${list.length}/${total} visible`),
    ...[...continents.entries()].map(([k,v]) => chip(`${k||'Unknown'}: ${v}`))
  ].join('');

  if(!list.length){
    elResults.innerHTML = '<div class="small">No clubs match the filters.</div>';
    return;
  }

  elResults.innerHTML = list
    .sort((a,b)=>a.country.localeCompare(b.country)||a.city.localeCompare(b.city)||a.name.localeCompare(b.name))
    .map(c => card(c)).join('');

  // kliky
  elResults.querySelectorAll('[data-action="show"]').forEach(btn=>{
    btn.addEventListener('click', () => window.focusMarker(btn.dataset.id));
  });
  elResults.querySelectorAll('[data-action="detail"]').forEach(btn=>{
    btn.addEventListener('click', () => window.selectClub(btn.dataset.id));
  });
}

function card(c){
  return `
    <div class="card">
      <h3>${c.name}</h3>
      <div class="meta">${c.city}, ${c.country} • ${c.region||'–'}</div>
      <div class="detail">
        <strong>Facility:</strong> ${c.venue?.sheets ?? '?'} sheets ${c.venue?.indoor ? '(indoor)' : '(outdoor)'}
        ${c.website ? ` • <a href="${c.website}" target="_blank" rel="noopener">website</a>` : ''}
        ${c.notes ? `<div class="small" style="margin-top:6px">${c.notes}</div>` : ''}
      </div>
      <div class="btn-row">
        <button class="btn" data-action="show" data-id="${c.id}">Show on map</button>
        <button class="btn" data-action="detail" data-id="${c.id}">Tournaments & detail</button>
      </div>
    </div>
  `;
}

function chip(text){ return `<span class="chip">${text}</span>`; }
