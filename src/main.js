import { subscribe, getState, setClubs, setFiltered, setFilters } from "./state/store.js";
import { loadClubs } from "./data/clubsService.js";
import { initMap, fitToFiltered } from "./map/map.js";
import { initSidebar } from "./ui/sidebar.js";
import { initScrollNav } from './ui/scrollNav.js';
initScrollNav();
const mapApi = initMap();

// POSIELAME CALLBACK do sidebaru:
const sidebar = initSidebar({
  onFiltersChange: partial => {
    setFilters(partial);
    applyFilters();
  }
});

// 1) načítanie dát
loadClubs()
  .then(clubs => {
    console.log("Loaded clubs:", clubs.length);      // debug
    setClubs(clubs);
    mapApi.addMarkers(clubs);                         // zobraz aspoň niečo hneď
    applyFilters();                                   // a potom prefiltrovať + fit bounds
  })
  .catch(err => alert('Could not load clubs.json: ' + err.message));

// 2) render UI pri zmene stavu (BEZ volania applyFilters tu!)
subscribe(state => {
  sidebar.render(state);
});

function applyFilters(){
  const st = getState();
  const { q, region, ice } = st.filters;

  const filtered = st.clubs.filter(c => {
    const hay = `${c.name} ${c.city} ${c.country} ${c.region} ${c.notes||''}`.toLowerCase();
    const matchQ = !q || hay.includes(q);
    const matchR = !region || c.region === region;

    let matchI = true;
    if (ice){
      const count = c.venue?.sheets ?? 0;
      if (ice.startsWith('>=')) {
        const n = parseInt(ice.slice(2),10); matchI = count >= n;
      } else if (ice.startsWith('=')) {
        const n = parseInt(ice.slice(1),10); matchI = count === n;
      }
    }
    return matchQ && matchR && matchI;
  });

  console.log("Filtered:", filtered.length);          // debug
  setFiltered(filtered);
  mapApi.addMarkers(filtered);
  fitToFiltered(filtered);
}
