// ui/viewSwitch.js
import { invalidateMap } from '../map/map.js'; // uprav cestu

const KEY = 'cw:view';

export function initViewSwitch(){
  const root = document.body;
  const buttons = Array.from(document.querySelectorAll('.view-switch .vs-btn'));

  // načítaj preferenciu
  const preferred = localStorage.getItem(KEY);
  setView(preferred || defaultView());

  // kliky
  buttons.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      setView(btn.dataset.view);
    });
  });

  // pri resize – ak je na mobile 'split', prepni na 'feed'
  window.addEventListener('resize', ()=>{
    const isMobile = window.matchMedia('(max-width: 900px)').matches;
    const cur = getView();
    if (isMobile && cur === 'split') setView('feed');
    // prepočítať mapu keď sa prepína layout
    if (cur === 'map' || cur === 'split') {
      requestAnimationFrame(()=> {
        invalidateMap();
        setTimeout(invalidateMap, 250);
      });
    }
  });

  function setView(view){
    root.classList.remove('view-feed','view-map','view-split');
    if (!['feed','map','split'].includes(view)) view = defaultView();
    root.classList.add(`view-${view}`);
    localStorage.setItem(KEY, view);

    // toggle active
    buttons.forEach(b=>{
      const active = b.dataset.view === view || (b.dataset.view==='split' && view==='split');
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    // keď sa objaví mapa, prepočítaj Leaflet
    if (view === 'map' || view === 'split') {
      requestAnimationFrame(()=> {
        invalidateMap();
        setTimeout(invalidateMap, 200);
      });
    }
  }

  function getView(){
    return ['feed','map','split'].find(v => root.classList.contains(`view-${v}`));
  }
  function defaultView(){
    return window.matchMedia('(max-width: 900px)').matches ? 'feed' : 'split';
  }

  return { setView };
}
