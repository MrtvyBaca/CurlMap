import { popupHTML } from "../ui/popup.js";
import { getState, setFiltered, setSelected, setVisibleIds } from "../state/store.js";
import { debounce } from '../utils/debounce.js';

let clusterGroup;
let map, markersById = new Map();
const debouncedUpdate = debounce(updateVisibleList, 160);

export function initMap(){
  map = L.map('map', { zoomControl: true }).setView([30,10], 2);
    // po malom odklade prepočítaj veľkosť (po prvom renderi layoutu)
  setTimeout(() => map.invalidateSize(), 0);
  setTimeout(() => map.invalidateSize(), 250);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
  map.on('moveend zoomend', debouncedUpdate);
  window.focusMarker = focusMarker;    // už voláš z UI
  window.selectClub  = selectClub;     // už voláš z UI
  // curling ikona
  const CurlingIcon = L.DivIcon.extend({
    options: {
      className: 'curling-icon',
      html: `<div style="width:26px;height:26px;border-radius:50%;background:#1b2a4a;border:2px solid #4da3ff;display:grid;place-items:center;box-shadow:0 0 0 2px rgba(77,163,255,.25)"><span style="font-size:14px">🥌</span></div>`,
      iconSize: [26,26], iconAnchor:[13,13], popupAnchor:[0,-10]
    }
  });

  clusterGroup = L.markerClusterGroup({ chunkedLoading:true, showCoverageOnHover:false, spiderfyOnMaxZoom:true, disableClusteringAtZoom:12 });

  // expose pár helperov do window (volajú ich popup/zoznam)
  window.selectClub  = selectClub;
  window.focusMarker = focusMarker;
  window.toggleClubPopup = toggleClubPopup;
  window.addTournament = addTournament;
  window.copyClubJSON = copyClubJSON;

  return { addMarkers: (data)=>addMarkers(data, CurlingIcon) };
}

export function addMarkers(clubs, IconCtor){
  markersById.clear();
  clubs.forEach(c=>{
    const m = L.marker([c.lat, c.lng], { icon:new IconCtor() })
      .bindPopup(popupHTML(c), {
        minWidth: 420,
        maxWidth: 800,
        className: 'curlmap-popup'
      })
      .addTo(map)
      .on('click', ()=> selectClub(c.id));

    // (voliteľné) ulož referenciu na dáta pre neskorší refresh popupu
    m._club = c;

    markersById.set(c.id, m);
  });
  updateVisibleList(); // prvotné naplnenie
}

function updateVisibleList(){
  const b = map.getBounds();
  const ids = [];
  getState().clubs.forEach(c=>{
    if (b.contains([c.lat, c.lng])) ids.push(c.id);
  });
  setVisibleIds(ids);
}

function focusMarker(id){
  const m = markersById.get(id);
  if(!m) return;

  // ak by si menil obsah popupu podľa výberu, môžeš ho refreshnúť:
  // m.setPopupContent(popupHTML(m._club));

  map.panTo(m.getLatLng(), { animate:true });
  m.openPopup(); // ↩️ teraz sa otvorí
}

function selectClub(id){
  setSelected(id);        // notifikuje UI cez 'club:selected'
  focusMarker(id);
}

function toggleClubPopup(id){
  const el = document.getElementById(`popup-detail-${id}`);
  if(!el) return;
  el.style.display = (el.style.display === 'none' || !el.style.display) ? 'block' : 'none';
}

function addTournament(id){
  const st = getState();
  const club = st.clubs.find(x=>x.id===id);
  if(!club) return;
  const title = prompt('Tournament title:'); if(!title) return;
  const start = prompt('Start date (YYYY-MM-DD):'); if(!start) return;
  const end   = prompt('End date (YYYY-MM-DD, optional):') || undefined;
  const url   = prompt('URL (optional):') || undefined;

  club.tournaments = club.tournaments || [];
  club.tournaments.push({ title, start, ...(end?{end}:{}) , ...(url?{url}:{}) });

  // refresh popup
  const m = markersById.get(id);
  if(m){ m.setPopupContent(popupHTML(club)); m.openPopup(); }
}

function copyClubJSON(id){
  const st = getState();
  const club = st.clubs.find(x=>x.id===id);
  if(!club) return;
  const text = JSON.stringify(club, null, 2);
  navigator.clipboard?.writeText(text);
  alert('Club JSON copied to clipboard.');
}

export function fitToFiltered(list){
  if(!list.length) return;
  const grp = new L.featureGroup(list.map(c => L.marker([c.lat, c.lng])));
  map.fitBounds(grp.getBounds(), { padding:[40,40] });
}
export function invalidateMap(){
  if (!map) return;
  map.invalidateSize();
}