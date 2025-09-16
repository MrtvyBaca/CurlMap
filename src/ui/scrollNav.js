// ui/scrollNav.js
import { invalidateMap } from '../map/map.js'; // uprav cestu podľa projektu

export function initScrollNav(){
  const btnDown = document.getElementById('jumpToFeed');
  const btnUp   = document.getElementById('backToMap');
  const feed    = document.getElementById('feed');
  const mapEl   = document.getElementById('mapSection');

  btnDown?.addEventListener('click', ()=>{
    feed?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  btnUp?.addEventListener('click', ()=>{
    mapEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // keď sa mapa dostane do viewportu, prepočítaj Leaflet (istota proti "half-renderu")
    setTimeout(()=>{ invalidateMap(); }, 300);
  });

  // pri načítaní/resize invalidovať mapu (niekedy mobil schová adresný riadok)
  window.addEventListener('load', ()=>{
    requestAnimationFrame(()=>{ invalidateMap(); });
    setTimeout(()=>{ invalidateMap(); }, 250);
  });
  window.addEventListener('resize', ()=>{
    invalidateMap();
    setTimeout(()=>{ invalidateMap(); }, 250);
  });

  // bonus: po výbere klubu (klik marker / detail) automaticky skočiť do feedu na mobile
  const isMobile = () => window.matchMedia('(max-width: 900px)').matches;
  window.addEventListener('club:selected', ()=>{
    if (isMobile()){
      feed?.scrollIntoView({ behavior: 'smooth' });
    }
  });
}
