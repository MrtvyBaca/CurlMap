// centrálne miesto pravdy
const state = {
  clubs: [],
  filtered: [],
  selectedId: null,
  filters: { q: "", region: "", ice: "" },
  visibleIds: new Set(),
};

const subs = new Set();
export function subscribe(fn){ subs.add(fn); return () => subs.delete(fn); }
function emit(){ subs.forEach(fn => fn(state)); }

// getters
export function getState(){ return state; }
export function setSelected(id){
  state.selectedId = id;
  window.dispatchEvent(new CustomEvent('club:selected', { detail:{ id } }));
}
export function setVisibleIds(ids){
  state.visibleIds = new Set(ids);
  window.dispatchEvent(new Event('clubs:visibilitychange'));
}
// mutácie
export function setClubs(clubs){ state.clubs = clubs; emit(); }
export function setFiltered(list){ state.filtered = list; emit(); }
export function setFilters(partial){ Object.assign(state.filters, partial); emit(); }
