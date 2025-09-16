// ui/mobile.js
import { invalidateMap } from '../map/map.js'; // uprav cestu podľa projektu

export function initMobileSidebar(){
  const btn = document.getElementById('btnSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const sidebar = document.querySelector('.sidebar');

  const open  = () => { document.body.classList.add('sidebar-open'); };
  const close = () => { document.body.classList.remove('sidebar-open'); };

  btn?.addEventListener('click', open);
  overlay?.addEventListener('click', close);
  window.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') close(); });

  // Po skončení animácie sidebaru prepočítať mapu
  sidebar?.addEventListener('transitionend', (e)=>{
    if (e.propertyName === 'transform') invalidateMap();
  });

  // Keď vyberieš klub (klik na marker alebo v zozname), na mobile sidebar schovaj a prepočítaj mapu
  window.addEventListener('club:selected', ()=>{
    close();
    setTimeout(invalidateMap, 200);
  });

  // Pri otočení/resize prepočítaj mapu
  window.addEventListener('resize', () => {
    invalidateMap();
    // drobný odklad pre iOS, keď sa schová/adresný bar
    setTimeout(invalidateMap, 300);
  });
  window.addEventListener('orientationchange', () => {
    setTimeout(invalidateMap, 300);
  });

  // po načítaní stránky ešte raz
  window.addEventListener('load', () => {
    setTimeout(invalidateMap, 0);
    setTimeout(invalidateMap, 250);
  });

  return { open, close };
}
